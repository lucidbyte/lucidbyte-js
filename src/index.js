import auth0 from 'auth0-js';
import 'regenerator-runtime/runtime';

const apiOrigin = 'http://127.0.0.1:3001';
const endpoint = `${apiOrigin}/graphql`;

function handleAuthResult(auth0Instance, onSuccess = () => {}) {
  return (err, authResult) => {
    if (this.isAuthenticated()) {
      this.scheduleRenewal();
      return onSuccess();
    }
    if (authResult && authResult.accessToken && authResult.idToken) {
      this.setSession(authResult);
      // location.assign('/');
      onSuccess();
    } else if ('[handleAuthResult]', err) {
      console.log(err);
      location.assign('/');
    } else {
      onSuccess();
    }
  };
}

class AuthService {
  constructor({ clientID, audience, domain, redirectUri }, getDynamicConfig) {
    this.redirectUri = redirectUri;

    this.auth0 = new Promise(async (resolve, reject) => {
      let _clientID = clientID;
      let _redirectUri = redirectUri;
      try {
        console.log('[1]', { _clientID, _redirectUri });

        if (!clientID || !redirectUri) {
          const { clientID: clientIDFromApi, defaultRedirectUri } = await getDynamicConfig();
          _clientID = clientID || clientIDFromApi;
          _redirectUri = redirectUri || defaultRedirectUri;
          console.log('[2]', { _clientID, _redirectUri });
        }
      } catch(fetchErr) {
        reject({ fetchErr });
      }

      this.authParams = {
        clientID: _clientID,
        audience,
        scope: 'openid profile email update:note'
      };

      resolve(
        new auth0.WebAuth({
          domain,
          responseType: 'token id_token',
          redirectUri: _redirectUri,
          ...this.authParams
        })
      );
    });
  }

  login = async () => {
    (await this.auth0).authorize();
  }

  handleAuthentication() {
    if (this.parseHash) {
      return this.parseHash;
    }
    this.parseHash = new Promise(async (resolve) => {
      const auth0 = (await this.auth0);
      auth0.parseHash(handleAuthResult.call(this, auth0, () => {
        // we are authorized!
        resolve();
      }));
    });
    return this.parseHash;
  }

  onAuthenticated = () =>
    this.handleAuthentication()
      .then(() => this.isAuthenticated())

  setSession = (authResult) => {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);

    this.scheduleRenewal();
  }

  getSession() {
    return {
      expiresAt: localStorage.getItem('expires_at'),
      accessToken: localStorage.getItem('access_token'),
      idToken: localStorage.getItem('id_token')
    };
  }

  logout() {
    // Clear access token and ID token from local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    // navigate to logout url
    const logoutUrl = '/';
    location.assign(logoutUrl);
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

  scheduleRenewal(options = {}) {
    const { forceRenew } = options;
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    const delay = expiresAt - Date.now();
    if (delay > 0) {
      const timeoutDelay = forceRenew ? 2000 : (delay - 5000);
      this.tokenRenewalTimeout = setTimeout(async () => {
        (await this.auth0).checkSession({
          redirectUri: this.redirectUri,
          ...this.authParams,
        }, (err, authResult) => {
          if (authResult) {
            this.setSession(authResult);
          } else {
            console.log(err);
            alert(err);
          }
          // err if automatic parseHash fails
        });
        // renew a little before expiration
      }, timeoutDelay);
    }
  }
}

export default function AuthInstance({
  // auth0 stuff
  audience,
  domain,

  // (optional) we can get this from our api
  clientID,
  redirectUri,

  // noted-api config
  projectID
}) {
  if (!process.browser) {
    return {};
  }

  const axios = require('axios');

  const getDynamicConfig = async () => {
    const res = await axios.get(`${apiOrigin}/api/project-config/${projectID}`)
      .catch(err => {
        console.log({ err });
      });
    // console.log({ res });
    const { clientId: clientID, redirectUri: defaultRedirectUri } = res.data;
    const config = { clientID, defaultRedirectUri };
    return config;
  };

  const auth = new AuthService({
    audience,
    domain,
    clientID,
    redirectUri
  }, getDynamicConfig);

  const handlePromiseJSON = res => res.data;
  const handleJSONdata = json => {
    if (json.errors) {
      console.error('graphqlError: \n' + JSON.stringify(json.errors, null, 2));
    }
    return json.data;
  };

  const constructRequestHeaders = async () => {
    await auth.handleAuthentication();
    const accessToken = auth.getSession().accessToken;
    const headers = {
      // Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    if (auth.isAuthenticated()) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    return headers;
  };

  const constructApiUrl = (url) => {
    const apiUrl = url || `${endpoint}/${projectID}`;
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

  const handleBatchData = (json) => {
    return json.map(handleJSONdata);
  };
  // supports an array of queries
  gqlRequest.batch = async (queries = [], url) => {
    return axios({
      url: constructApiUrl(url),
      method: 'POST',
      headers: await constructRequestHeaders(),
      data: JSON.stringify({ queries, batch: true }),
    }).then(handlePromiseJSON)
      .then(handleBatchData);
  };

  return {
    auth,
    gqlRequest
  };
}
