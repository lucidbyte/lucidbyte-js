import 'regenerator-runtime/runtime';
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
  body: JSON.stringify(body)
});

export const request = async (
  query,
  variables,
  queryType = '', // Query | Mutation (for non-graphql requests)
  forEach,
  config = {},
  customRequest,
) => {
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

  const path = customPath || `/api/main/${queryType}/${projectID}`;
  const url = constructApiUrl(path, projectID, customOrigin);
  const body = {
    payload: query,
  };
  if (dev) {
    body.dev = 1;
  }
  const httpConfig = HttpConfig(body, accessToken);
  return new Promise((resolve, reject) => {
    const options = Object.create(httpConfig);
    options.url = url;
    const onComplete = (results) => resolve(flattenStreamResults(results));
    const onData = forEach
      ? (data) => {
        if (Array.isArray(data)) {
          return data.forEach(forEach);
        }
        forEach(data);
      }
      : noop;
    crossStream({
      options,
      onError: reject,
      onComplete,
      onData
    });
  });
};

const methodTypes = {
  update: 0,
  delete: 1
};

// limits
const maxContentSize = 1024 * 5000; // 5mb
const maxOpsPerRequest = 500;

export default (requestConfig) => {
  const { dev } = requestConfig;

  let operations = {};
  let opResponse;
  let opTimer;
  let promiseResolver;
  /*
    Cumulative JSON string payload. This is used to check if payload is too
    large.
   */
  let totalRequestContent = '';

  const batchDelay = 0;

  const flush = () => {
    const response = promiseResolver();
    clearTimeout(opTimer);
    operations = {};
    opResponse = null;
    opTimer = null;
    totalRequestContent = '';

    return response;
  };

  class Methods {
    constructor(collection) {
      this.collection = collection;
      this._filter = {};
    }

    set(_id, query, options, methodType = methodTypes.update) {
      const { collection } = this;
      const opsList = operations[collection] = operations[collection] || [];

      const maxOpsReached = opsList.length === maxOpsPerRequest;
      if (maxOpsReached) {
        flush();
      }

      const { _filter: filter } = this;
      if (
        typeof _id !== 'undefined'
        && _id !== null
      ) {
        filter._id = _id;
      }

      const op = query
        ? [methodType, filter, query]
        : [methodType, filter];
      if (options) {
        op.push(options);
      }

      if (dev) {
        const payloadString = JSON.stringify(op);
        const batchSizeTooLarge = totalRequestContent.length + payloadString.length >= maxContentSize;
        if (batchSizeTooLarge) {
          const error = `Payload exceeded max of ${maxContentSize}.\n` +
            `Try breaking up requests into smaller chunks with \`flush\` method.`;
          return Promise.reject({
            error,
            payloadSize: payloadString.length,
            payload: op
          });
        }
        totalRequestContent += payloadString;
      }

      opsList.push(op);
      opResponse = opResponse || new Promise((resolve, reject) => {
        promiseResolver = () => {
          request(operations, null, 'Mutation', null, requestConfig)
            .then(resolve)
            .catch(reject);
        };
      });
      opTimer = opTimer || setTimeout(flush, batchDelay);
      return opResponse.then(res => {
        return res[collection];
      });
    }

    update(_id, value, options) {
      return this.set(_id, { $set: value }, options);
    }

    get(filter, opts, forEach) {
      const options = opts || {};
      options.filter = filter || {};
      options.collection = this.collection;
      return request(options, null, 'Query', forEach, requestConfig);
    }

    delete(_id) {
      return this.set(_id, null, null, methodTypes.delete);
    }
  }

  const collection = (collection) => {
    return new Methods(collection);
  };

  return {
    collection,
    flush
  };
};
