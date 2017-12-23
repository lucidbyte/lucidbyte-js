import 'regenerator-runtime/runtime';

// const defaults = {
//   domain: 'synergy-apps.auth0.com',
//   audience: 'http://localhost:3001/graphql',
// };

const apiOrigin = 'http://localhost:3001';
const endpoint = `${apiOrigin}/graphql`;

const handlePromiseJSON = res => res.data;

const handleJSONdata = json => {
  if (json.errors) {
    console.error('graphqlError: \n' + JSON.stringify(json.errors, null, 2));
  }
  return json.data;
};

const getSession = () => {
  return {
    accessToken: localStorage.getItem('accessToken')
  };
};

const constructRequestHeaders = async () => {
  const accessToken = getSession().accessToken;
  const headers = {
    // Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
};

export default function AuthInstance({
  // noted-api config
  projectID
}) {
  if (!process.browser) {
    return {};
  }

  const axios = require('axios');

  const constructApiUrl = (url = '') => {
    const apiUrl = url ? `${apiOrigin}${url}` : `${endpoint}/${projectID}`;
    return apiUrl;
  };

  const gqlRequest = async (query, variables, url) => {
    return axios({
      url: constructApiUrl(url),
      method: 'POST',
      headers: await constructRequestHeaders(),
      data: {
        query,
        variables
      },
    }).then(handlePromiseJSON)
      .then(handleJSONdata);
  };

  gqlRequest.login = async (email, projectID) => {
    return axios({
      url: constructApiUrl(`/api/login`),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        email,
        projectID
      }
    }).then(res => {
      console.log(res);
    }).catch(err => {
      console.log(err);
    });
  };

  gqlRequest.logout = () => {
    localStorage.removeItem('accessToken');
  };

  gqlRequest.refreshToken = async () => {
    return axios({
      url: constructApiUrl(`/api/refresh-token`),
      headers: await constructRequestHeaders(),
      method: 'GET'
    }).then(res => {
      const { accessToken } = res.data;
      localStorage.setItem('accessToken', accessToken);
      return accessToken;
    });
  };

  gqlRequest.checkSession = async () => {
    return axios({
      url: constructApiUrl(`/api/is-token-expired`),
      headers: await constructRequestHeaders(),
      method: 'GET'
    });
  };

  return {
    gqlRequest,
  };
}
