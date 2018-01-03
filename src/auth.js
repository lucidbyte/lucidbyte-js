import 'regenerator-runtime/runtime';
import session from './session';
import constructApiUrl from './construct-api-url';
import constructRequestHeaders from './construct-request-headers';

const isLoggedIn = () => {
  return session.exists();
};

// callbacks are global since there should only
// be one instance of authentication happening at any given time
const authStateChangeCallbacks = [];

const authStateChangeFn = (userID) => {
  authStateChangeCallbacks
    .forEach(cb => cb({
      loggedIn: session.exists(),
      userId: userID || null
    }));
};
const onAuthStateChange = (callback) => {
  authStateChangeCallbacks.push(callback);
  authStateChangeFn(session.get().userId);
};

const logout = () => {
  session.end();
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
    const url = constructApiUrl(`/api/login`, projectID, customOrigin);
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        projectID
      })
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
          session.end();
          return json;
        }
        session.set({ accessToken, expiresAt, userId: userID });
        authStateChangeFn(userID);
        return json;
      });
  };

  const getRefreshToken = async () => {
    const url = constructApiUrl(`/api/refresh-token/${projectID}`, null, customOrigin);
    return fetch(url, {
      headers: await constructRequestHeaders(),
      method: 'GET',
    }).then(res => {
      const { accessToken, expiresAt } = res.data;
      session.set({ accessToken, expiresAt, userId: session.get().userId });
      return accessToken;
    });
  };

  let hasExpired = false;

  const scheduleTokenRefresh = () => {
    const { expiresAt } = session.get();
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

export default AuthInstance;
