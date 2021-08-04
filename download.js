const rp = require('request-promise');
const fs = require('fs');
const path = require('path');
const got = require('got');
const { createWriteStream } = require('fs');
const stream = require('stream');
const { promisify } = require('util');
const cliProgress = require('cli-progress');

const pipeline = promisify(stream.pipeline);
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

const downloadVideoFronSteam = async ({ url, fileName, path, number }) => {
  let currentPercentage = 0;
  // const fileNameWithExt = `${path}/${fileName}_series.mp4`;
  const fileNameWithExt = `./downloads/${path}/${number}_${fileName.replace(
    ' ',
    '_'
  )}.mp4`;
  const downloadStream = got.stream(url);
  const fileWriterStream = createWriteStream(fileNameWithExt);
  bar.start(100, 0);
  downloadStream.on('downloadProgress', ({ transferred, total, percent }) => {
    const percentage = Math.round(percent * 100);
    if (currentPercentage !== percentage) {
      currentPercentage = percentage;
      bar.update(percentage);
    }
  });
  await pipeline(downloadStream, fileWriterStream);
  bar.stop();
};

const getDetails = async (path) => {
  const queryString = {
    site: 'hoichoitv',
    includeContent: true,
    moduleOffset: 0,
    moduleLimit: 4,
    languageCode: 'en',
    countryCode: 'US',
  };
  const options = {
    uri: 'https://prod-api-cached-2.viewlift.com/content/pages',
    qs: { path, ...queryString },
    headers: {
      'x-api-key': 'dtGKRIAd7y3mwmuXGk63u3MI3Azl1iYX8w9kaeg3',
    },
    json: true,
  };
  const response = await rp(options);
  return response;
};

const formatSeriesDetails = (data) => {
  const contentData = data.modules.filter((p) => p.contentData !== null)[0]
    .contentData[0];

  return {
    id: data.id,
    name: data.metadataMap.title,
    moduleIds: data.moduleIds,
    episodes: contentData.seasons.map((p) => {
      return {
        id: p.id,
        title: p.title,
        episodes: p.episodes.map((o) => {
          return {
            id: o.id,
            vId: o.gist.id,
            title: o.title,
          };
        }),
      };
    }),
  };
};

const createNewFolder = async (dirPath) =>
  new Promise((resolve, reject) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdir(dirPath, { recursive: true }, (err) => {
        if (err) reject(err);
        resolve();
      });
    }
    resolve();
  });

const createFolders = async (data) => {
  const baseUrl = path.join(__dirname, 'downloads');
  await createNewFolder(`${baseUrl}/${data.name}`);
  for (let i = 0; i < data.episodes.length; i++) {
    await createNewFolder(`${baseUrl}/${data.name}/${data.episodes[i].title}`);
  }
};

const getStatusInfo = async (id) => {
  const authorization = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI0MTAxNTQ1ZTQxNjA2MGM3MGZlNmM2ZDA2ZDc1NDQ2NjBhZTcwZjgwNmFlYmU2NzRiZTk5YThjOGIzOWU5Y2Q5Iiwic2l0ZSI6ImhvaWNob2l0diIsInNpdGVJZCI6IjdmYTBlYTlhLTk3OTktNDQxNy05OWY1LWNiYjUzNDNjNTUxZCIsImVtYWlsIjoiYmlsYXNoLmNvbW1vbkBnbWFpbC5jb20iLCJpcGFkZHJlc3NlcyI6IjEwMy4yMTguMjQuMjM4LCAxMC4xMjAuNS4xNTksIDM0LjIwNS4xMzcuMjA0LCAxMzAuMTc2Ljk4LjEzNSIsImNvdW50cnlDb2RlIjoiQkQiLCJwb3N0YWxjb2RlIjoiMTIxMiIsInByb3ZpZGVyIjoidmlld2xpZnQiLCJkZXZpY2VJZCI6ImJyb3dzZXItMTZiNTE3NDQtNzY4Mi0xNjJkLTJlOTEtMzA1YmEyNjczZDM5IiwiaWQiOiI0MTAxNTQ1ZTQxNjA2MGM3MGZlNmM2ZDA2ZDc1NDQ2NjBhZTcwZjgwNmFlYmU2NzRiZTk5YThjOGIzOWU5Y2Q5IiwiaWF0IjoxNjAzNDU3NDQ1LCJleHAiOjE2MDQwNjIyNDV9.eGVhZ4bElK38BtrR32J-lgOfmZ0vrDwAqYK44Fl9Uuc`;
  const queryString = {
    //   id: 'e3c9beab-60b8-4a47-a2c1-9897373fa264',
    deviceType: 'web_browser',
    contentConsumption: 'web',
  };
  const options = {
    uri: 'https://prod-api.viewlift.com/entitlement/video/status',
    qs: { ...queryString, id },
    headers: {
      authorization,
    },
    json: true,
  };
  const response = await rp(options);
  return response.video.streamingInfo.videoAssets.mpeg[2].url;
};

const downloadEpisodes = async (data) => {
  const baseUrl = path.join(__dirname, '..', 'downloads');
  for (let i = 0; i < data.episodes.length; i++) {
    for (let j = 0; j < data.episodes[i].episodes.length; j++) {
      const streamingUrl = await getStatusInfo(
        data.episodes[i].episodes[j].vId
      );
      console.log(
        `${data.episodes[i].title} : ${data.episodes[i].episodes[j].title}`
      );
      await downloadVideoFronSteam({
        url: streamingUrl,
        // path: `${baseUrl}/${data.name}/${data.episodes[i].title}`,
        path: `${data.name}/${data.episodes[i].title}`,
        fileName: data.episodes[i].episodes[j].title,
        number: j + 1,
      });
    }
  }
};

(async () => {
  try {
    const series_name = process.argv[2].split('hoichoi.tv')[1];
    if (!series_name) {
      console.error('Series name or path is undefined');
    }
    const seriesDetails = await getDetails(series_name);
    const data = formatSeriesDetails(seriesDetails);
    await createFolders(data);
    await downloadEpisodes(data);
  } catch (error) {
    console.error(`Something went wrong. ${error.message}`);
  }
})();
