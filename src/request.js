import constructApiUrl from './construct-api-url';
import constructRequestHeaders from './construct-request-headers';
import session from './session';
import crossStream from './stream';

const flattenArrays = (a, b) => a.concat(b);
const flattenStreamResults = (results) => {
  const isFromStream = Array.isArray(results[0]);
  return isFromStream
    ? results.reduce(flattenArrays, [])
    : results;
};

const noop = () => {};

const HttpConfig = (body, accessToken) => ({
  method: 'POST',
  headers: constructRequestHeaders(accessToken),
  body: typeof body === 'object' ? JSON.stringify(body) : body
});

export default (
  query,
  variables,
  queryType = '', // Query | Mutation
  callbacks = {},
  config = {},
  customRequest,
) => {
  const { forEach, onError, onComplete } = callbacks;
  const {
    projectID,
    dev = false,
    // the following props are only for testing purposes
    origin: customOrigin,
    path: customPath
  } = config;

  const accessToken = session.get().accessToken;

  if (customRequest) {
    const body = { query, variables };
    const httpConfig = HttpConfig(body, accessToken);
    const url = constructApiUrl(customPath, projectID, customOrigin);
    return customRequest({ url, httpConfig });
  }

  const path = customPath || `/api/main/${projectID}`;
  const url = constructApiUrl(path, projectID, customOrigin);
  const body = {
    payload: query,
    type: queryType
  };
  if (dev) {
    body.dev = 1;
  }
  const requestBody = JSON.stringify(body);
  const httpConfig = HttpConfig(
    requestBody,
    accessToken
  );
  const options = Object.create(httpConfig);
  options.url = url;

  const onData = forEach
    ? (data) => {
      if (Array.isArray(data)) {
        return data.forEach(forEach);
      }
      forEach(data);
    }
    : noop;

  if (forEach) {
    return crossStream({
      options,
      onData,
      onError,
      onComplete
    });
  }

  return new Promise((resolve, reject) => {
    const onComplete = (results) =>
      resolve(flattenStreamResults(results));

    crossStream({
      options,
      onData,
      onError: reject,
      onComplete,
    });
  });
};
