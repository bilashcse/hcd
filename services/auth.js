const axios = require('axios');

const config = require('../configs/config.json');

const getToken = async () => {
  const tokenconfig = {
    method: 'post',
    url: `https://prod-api.viewlift.com/identity/signin?site=hoichoitv&deviceId=hoi-choi-un-official-a-p-i-${config.randomString}`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify({ email: config.email, password: config.password }),
  };

  try {
    const res = await axios(tokenconfig);
    return {
      token: res.data.authorizationToken,
      message: null,
    };
  } catch (e) {
    if (
      e.response.status === 401 &&
      e.response.data.code === 'DEVICE_LIMIT_EXCEEDED'
    ) {
      return {
        token: null,
        message: 'exce',
      };
    }
    return {
      token: null,
      message: 'token_err',
    };
  }
};

module.exports = { getToken };
