const axios = require('axios');

const queryString = {
  deviceType: 'web_browser',
  contentConsumption: 'web',
};

const apiUrl = 'https://prod-api.viewlift.com/entitlement/video/status';

const getStatusInfo = async ({ id, token }) => {
  const options = {
    headers: { authorization: token },
    params: {
      ...queryString,
      id,
    },
    json: true,
  };

  const response = await axios.get(apiUrl, options);
  return response.data.video.streamingInfo.videoAssets.widevine.url;
};

module.exports = { getStatusInfo };
