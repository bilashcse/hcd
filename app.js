const { getDetails } = require('./services/series_details');
const { formatSeriesDetails } = require('./services/format_data');
const { initFolderStructure } = require('./services/folder');
const {
  downloadEpisodes,
  downloadMovie,
} = require('./services/download_videos');
const { getToken } = require('./services/auth');

const configs = require('./configs/config.json');

(async () => {
  try {
    const seriesName = process.argv[2].split('hoichoi.tv')[1];
    if (!seriesName) {
      console.error('Series name or path is undefined');
    }

    const seriesDetails = await getDetails(seriesName);

    const data = formatSeriesDetails(seriesDetails);
    console.log(`Current Series / Movie Name: ${data.name}`);
    await initFolderStructure(data);
    const { token } = configs.authorization
      ? { token: configs.authorization }
      : await getToken();

    if (!token) {
      console.error('Sorry, Error occurred to get token');
    }

    if (data.movie && data.movie.url) {
      await downloadMovie(data, token);
    } else {
      await downloadEpisodes(data, token);
    }
    console.log('Download complete');
  } catch (error) {
    console.error(`Something went wrong. ${error.message}`);
  }
})();
