/* eslint-disable no-await-in-loop */
// const path = require('path');

const { getStatusInfo } = require('./get_status_info');
const { download } = require('./download');

const downloadEpisodes = async (data, token) => {
  for (let i = 0; i < data.episodes.length; i++) {
    for (let j = 0; j < data.episodes[i].episodes.length; j++) {
      const streamingUrl = await getStatusInfo({
        id: data.episodes[i].episodes[j].vId,
        token,
      });

      console.log(
        `${data.episodes[i].title} : ${data.episodes[i].episodes[j].title}`
      );

      await download({
        url: streamingUrl,
        path: `${data.name}/${data.episodes[i].title}`,
        fileName: data.episodes[i].episodes[j].title,
        number: j + 1,
      });
    }
  }
};

const downloadMovie = async (data, token) => {
  const streamingUrl = await getStatusInfo({
    id: data.movie.url,
    token,
  });
  console.log(`${data.movie.name}: `);
  await download({
    url: streamingUrl,
    path: `${data.movie.name}`,
    fileName: data.movie.name,
    number: null,
    token,
  });
};

module.exports = { downloadEpisodes, downloadMovie };
