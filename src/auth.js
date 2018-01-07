import 'regenerator-runtime/runtime';
import session from './session';
import constructApiUrl from './construct-api-url';
import constructRequestHeaders from './construct-request-headers';

let hasExpired = false;
let refreshTokenTimer = null;

// callbacks are global since there should only
// be one instance of authentication happening at any given time
const authStateChangeCallbacks = [];

const authStateObject = (userID) => ({
  loggedIn: session.exists(),
  userId: userID || null
});

const authStateChangeFn = (userID) => {
  authStateChangeCallbacks
    .forEach(cb => cb(authStateObject(userID)));
};
const onAuthStateChange = (callback) => {
  authStateChangeCallbacks.push(callback);
  // call the callback immediately the first time
  callback(authStateObject(session.get().userId));
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
    }).catch(err => {
      console.error(err);
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
      }).catch(err => {
        console.error(err);
      });
  };

  const getRefreshToken = async () => {
    const url = constructApiUrl(`/api/refresh-token`, null, customOrigin);
    return fetch(url, {
      headers: await constructRequestHeaders(),
      method: 'GET',
    }).then(res => res.json())
      .then(res => {
        const { accessToken, expiresAt } = res;
        session.set({ accessToken, expiresAt, userId: session.get().userId });
        return accessToken;
      }).catch(err => {
        console.error(err);
      });
  };

  const scheduleTokenRefresh = () => {
    if (refreshTokenTimer) {
      return;
    }
    const delay =  1000 * 60 * 60 * 2; // refresh every 2 hours
    hasExpired = delay <= 0;
    if (!hasExpired) {
      refreshTokenTimer = setTimeout(() => {
        getRefreshToken()
          .then(scheduleTokenRefresh);
        refreshTokenTimer = null;
      }, delay);
    } else {
      logout();
    }
  };

  onAuthStateChange(({ loggedIn }) => {
    if (loggedIn) {
      scheduleTokenRefresh();
    }
  });


  return {
    getAccessToken,
    login,
    logout,
    onAuthStateChange,
  };
};

export default AuthInstance;
