import session from './session';
import constructApiUrl from './construct-api-url';
import constructRequestHeaders from './construct-request-headers';

let hasExpired = false;
let refreshTokenTimer = null;

// callbacks are global since there should only
// be one instance of authentication happening at any given time
const authStateChangeCallbacks = [];

const authStateObject = () => ({
  loggedIn: !session.isExpired(),
  userId: session.get().userId || null
});

const authStateChangeFn = () => {
  authStateChangeCallbacks
    .forEach(cb => cb(authStateObject()));
};
const onAuthStateChange = (callback) => {
  authStateChangeCallbacks.push(callback);
  // call the callback immediately the first time
  callback(authStateObject());
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

  const login = (email) => {
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

  const getRefreshToken = () => {
    const url = constructApiUrl(`/api/refresh-token`, null, customOrigin);
    return fetch(url, {
      headers: constructRequestHeaders(),
      method: 'GET',
    }).then(res => res.json())
      .then(res => {
        const { accessToken, expiresAt } = res;
        session.set({ accessToken, expiresAt, userId: session.get().userId });
        return res;
      }).catch(err => {
        console.error(err);
      });
  };

  const scheduleTokenRefresh = ({ expiresAt }) => {
    if (refreshTokenTimer) {
      return;
    }
    const refreshRate =  1000 * 60 * 60 * 2; // refresh every 2 hours
    const expiresIn = expiresAt - new Date().getTime();
    const delay = expiresIn < refreshRate ? 0 : refreshRate;
    hasExpired = delay <= 0;
    if (!hasExpired) {
      refreshTokenTimer = setTimeout(() => {
        getRefreshToken()
          .then(scheduleTokenRefresh);
      }, delay);
    } else {
      refreshTokenTimer = null;
      logout();
    }
  };

  onAuthStateChange(({ loggedIn }) => {
    if (loggedIn) {
      scheduleTokenRefresh({ expiresAt: session.get().expiresAt });
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
