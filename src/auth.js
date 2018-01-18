import session from './session';
import constructApiUrl from './construct-api-url';
import constructRequestHeaders from './construct-request-headers';

let hasExpired = false;
let refreshTokenTimer = null;

const msPerHour = 1000 * 60 * 60;
const hoursToMS = (hours) =>
  msPerHour * hours;
const durationFromExpiration = (expiration) =>
  expiration - new Date().getTime();

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

const defaults = {
  tokenRefreshRate: hoursToMS(2)
};

const handleError = (data) => Promise.reject(data);

const handleFetch = (res) => {
  const isError = res.status >= 400;
  if (isError) {
    return res.json()
      .then(handleError);
  }
  return res;
};

const AuthInstance = ({
  // this is for testing purposes only, normally the origin
  // should be pointing the the production server
  origin: customOrigin,
  projectID,
  options = {}
}) => {
  const mergedOptions = Object.assign({}, defaults, options);
  const {
    tokenRefreshRate
  } = mergedOptions;

  if (process.env.NODE_ENV === 'development') {
    if (tokenRefreshRate < defaults.tokenRefreshRate) {
      throw 'token refresh rate must be at least 2 hours';
    }
  }

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
    });
  };

  const getAccessToken = (loginCode) => {
    const url = constructApiUrl(`/api/access-token/${loginCode}`, projectID, customOrigin);
    return fetch(url, {
      method: 'GET',
    }).then(handleFetch)
      .then(res => res.json())
      .then(json => {
        const { expiresAt, userID } = json;
        if (json.error) {
          session.end();
          return json;
        }
        session.set({
          ...json,
          duration: durationFromExpiration(expiresAt)
        });
        authStateChangeFn(userID);
        return json;
      });
  };

  const getRefreshToken = () => {
    const url = constructApiUrl(`/api/refresh-token`, null, customOrigin);
    return fetch(url, {
      headers: constructRequestHeaders(),
      method: 'GET',
    }).then(res => res.json())
      .then(res => {
        const { expiresAt } = res;
        session.set({
          ...res,
          duration: durationFromExpiration(expiresAt),
          userId: session.get().userId
        });
        return res;
      });
  };

  const scheduleTokenRefresh = ({ expiresAt }) => {
    if (refreshTokenTimer) {
      return;
    }
    const tokenDuration = session.get().duration;
    const expiresIn = expiresAt - new Date().getTime();
    /*
      Refresh 2 hours from last refresh. This allows us to keep the session fresher
      as long as the user is continuously using it.
     */
    const delay = expiresIn - tokenDuration + tokenRefreshRate;

    hasExpired = expiresIn <= 0;
    if (!hasExpired) {

      // log session duration info
      if (process.env.NODE_ENV === 'development') {
        const MSToHours = (ms) =>
          Number((ms / msPerHour).toFixed(2));

        console.log({
          refreshIn: MSToHours(delay) + 'hrs',
          expiresIn: MSToHours(expiresIn),
          expiresAt: new Date(expiresAt)
        });
      }

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
