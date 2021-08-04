const axios = require('axios');

const queryString = {
  site: 'hoichoitv',
  includeContent: true,
  moduleOffset: 0,
  moduleLimit: 4,
  languageCode: 'en',
  countryCode: 'US',
};

const apiUrl = 'https://prod-api-cached-2.viewlift.com/content/pages';

const getDetails = async (path) => {
  const options = {
    params: { path, ...queryString },
    json: true,
  };
  const response = await axios.get(apiUrl, options);
  return response.data;
};

module.exports = { getDetails };
