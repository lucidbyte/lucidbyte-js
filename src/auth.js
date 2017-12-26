import 'regenerator-runtime/runtime';
import axios from 'axios';
import { baseApiUrl } from './config';

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
    expiresAt,
    userId
  } = sessionParams;
  return {
    accessToken: localStorage[`${method}Item`]('accessToken', accessToken),
    expiresAt: localStorage[`${method}Item`]('expiresAt', expiresAt),
    userId: localStorage[`${method}Item`]('userId', userId),
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

const constructApiUrl = (apiRoute = '', projectID, customOrigin) => {
  const apiOrigin = customOrigin
    || baseApiUrl;

  const endpoint = `${apiOrigin}/graphql`;

  const apiUrl = apiRoute ? `${apiOrigin}${apiRoute}` : `${endpoint}/${projectID}`;
  return apiUrl;
};

const client = ({ projectID, origin: customOrigin }) =>
  async (query, variables, url) => {
    return axios({
      url: constructApiUrl(url, projectID, customOrigin),
      method: 'POST',
      headers: await constructRequestHeaders(),
      data: {
        query,
        variables
      },
    }).then(handlePromiseJSON)
      .then(handleJSONdata);
  };

const anonymousProject = ({
  query,
  variables,
  apiOrigin = baseApiUrl
}) => {
  const projectID = `anon`;
  const url = `${apiOrigin}/graphql/${projectID}`;
  return axios({
    url,
    method: 'POST',
    data: {
      query,
      variables
    }
  });
};

const isLoggedIn = () => {
  return hasSession();
};

// callbacks are global since there should only
// be one instance of authentication happening at any given time
const authStateChangeCallbacks = [];

const authStateChangeFn = (userID) => {
  authStateChangeCallbacks
    .forEach(cb => cb({
      loggedIn: hasSession(),
      userId: userID || null
    }));
};
const onAuthStateChange = (callback) => {
  authStateChangeCallbacks.push(callback);
  authStateChangeFn(getSession().userId);
};

const logout = () => {
  endSession();
  authStateChangeFn();
};

const AuthInstance = ({
  // this is for testing purposes only, normally the origin
  // should be pointing the the production server
  origin: customOrigin,
  projectID
}) => {
  if (typeof document === 'undefined') {
    return {};
  }

  const login = async (email) => {
    return axios({
      url: constructApiUrl(`/api/login`, projectID, customOrigin),
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

  const getAccessToken = (loginCode) => {
    const url = constructApiUrl(`/api/access-token/${loginCode}`, projectID, customOrigin);
    return fetch(url, {
      method: 'GET',
    }).then(res => res.json())
      .then(json => {
        const { accessToken, expiresAt, userID } = json;
        if (json.error) {
          endSession();
          return json;
        }
        setSession({ accessToken, expiresAt, userId: userID });
        authStateChangeFn(userID);
        return json;
      });
  };

  const getRefreshToken = async () => {
    return axios({
      url: constructApiUrl(`/api/refresh-token/${projectID}`, null, customOrigin),
      headers: await constructRequestHeaders(),
      method: 'GET',
    }).then(res => {
      const { accessToken, expiresAt } = res.data;
      setSession({ accessToken, expiresAt, userId: getSession().userId });
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
    getAccessToken,
    login,
    logout,
    onAuthStateChange,
  };
};

export default {
  auth: AuthInstance,
  client,
  anonymousProject
};
