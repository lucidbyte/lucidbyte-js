import 'regenerator-runtime/runtime';

const isDev = process.env.NODE_ENV === 'development';

const handlePromiseJSON = res => res.data;

const handleJSONdata = json => {
  if (json.errors) {
    console.error('graphqlError: \n' + JSON.stringify(json.errors, null, 2));
  }
  return json.data;
};

const session = (
  method, sessionParams = {}
) => {
  const {
    accessToken,
    expiresAt
  } = sessionParams;
  return {
    accessToken: localStorage[`${method}Item`]('accessToken', accessToken),
    expiresAt: localStorage[`${method}Item`]('expiresAt', expiresAt)
  };
};

const getSession = () => session('get');
const endSession = () => session('remove');
const setSession = (sessionParams) => session('set', sessionParams);
const hasSession = () => !!session('get').accessToken;

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
  origin: customOrigin,
  // noted-api config
  projectID
}) {
  if (typeof document === 'undefined') {
    return {};
  }

  const apiOrigin = customOrigin
    || (
      isDev
        ? 'http://localhost:3000'
        : 'https://test.lelandkwong.com'
    );
  const endpoint = `${apiOrigin}/graphql`;

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

  const isLoggedIn = () => {
    return hasSession();
  };

  const callbacks = [];
  const authStateChangeFn = () => {
    callbacks.forEach(cb => cb({ loggedIn: hasSession() }));
  };
  const onAuthStateChange = (callback) => {
    callbacks.push(callback);
    authStateChangeFn();
  };

  const logout = () => {
    endSession();
    authStateChangeFn();
  };

  const login = async (email, projectID) => {
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
    });
  };

  gqlRequest.getAccessToken = (loginCode) => {
    return fetch(`/api/access-token/${loginCode}`, {
      method: 'GET',
    }).then(res => res.json())
      .then(json => {
        console.log(json);
        setSession(json);
        authStateChangeFn();
        return json;
      });
  };

  const getRefreshToken = async () => {
    return axios({
      url: constructApiUrl(`/api/refresh-token`),
      headers: await constructRequestHeaders(),
      method: 'GET'
    }).then(res => {
      const { accessToken, expiresAt } = res.data;
      setSession({ accessToken, expiresAt });
      return accessToken;
    });
  };

  let hasExpired = false;

  const scheduleTokenRefresh = () => {
    const { expiresAt } = getSession();
    const padding = 1000 * 60 * 60;
    const delay =  expiresAt - new Date().getTime() - padding;
    hasExpired = delay <= 0;
    if (!hasExpired) {
      setTimeout(() => {
        getRefreshToken()
          .then(scheduleTokenRefresh);
      }, delay);
    } else {
      logout();
    }
  };

  if (isLoggedIn()) {
    scheduleTokenRefresh();
  }

  return {
    gqlRequest,
    login,
    logout,
    onAuthStateChange,
  };
}
