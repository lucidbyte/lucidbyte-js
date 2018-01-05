import 'regenerator-runtime/runtime';
import constructApiUrl from './construct-api-url';
import constructRequestHeaders from './construct-request-headers';
import session from './session';
import crossStream from './stream';

const handlePromiseJSON = res => {
  return res.json();
};

const handleJSONdata = json => {
  if (json.errors) {
    console.error('graphqlError: \n' + JSON.stringify(json.errors, null, 2));
  }
  return json.data;
};

const maxContentSize = 1024 * 1000; // 1mb

const flattenStreamResults = (results) => {
  if (!Array.isArray(results[0])) {
    return results;
  }
  return results.reduce((a, b) => a.concat(b), []);
};

const noop = () => {};

export default ({
  projectID,
  dev = false,
  // the following props are only for testing purposes
  origin: customOrigin,
  path: customPath
}) => {
  const request = async (
    query,
    variables,
    queryType = '', // Query | Mutation (for non-graphql requests)
    forEach
  ) => {
    const isGraphql = !!variables;
    const body = isGraphql
      ? {
        query,
        variables,
      }
      : {
        payload: query,
      };
    if (dev) {
      body.dev = 1;
    }
    const path = customPath
      || (
        isGraphql
          ? `/api/graphql/${projectID}`
          : `/api/main/${queryType}/${projectID}`
      );
    const accessToken = session.get().accessToken;
    const url = constructApiUrl(path, projectID, customOrigin);
    const config = {
      method: 'POST',
      headers: await constructRequestHeaders(accessToken),
      body: JSON.stringify(body),
    };
    if (isGraphql) {
      const response = fetch(url, config).then(handlePromiseJSON);
      return response.then(handleJSONdata);
    }
    return new Promise((resolve, reject) => {
      const options = Object.create(config);
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

    set(query, options, methodType = 0) {
      const { _filter: filter } = this;
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

      const { collection } = this;
      const opsList = operations[collection] = operations[collection] || [];
      opsList.push(op);
      const batchPromise = opResponse = opResponse
        || new Promise((resolve, reject) => {
          promiseResolver = () => {
            request(operations, null, 'Mutation')
              .then(res => {
                const newRes = Object.create(res);
                newRes.data = res[collection];
                resolve(newRes);
              }).catch(reject);
          };
        });
      opTimer = opTimer || setTimeout(flush, batchDelay);
      return batchPromise;
    }

    setMany(query) {
      return this.set(query, null, 3);
    }

    get(query, forEach) {
      const normalizedQuery = query || {};
      normalizedQuery.filter = this._filter;
      normalizedQuery.collection = this.collection;
      return request(normalizedQuery, null, 'Query', forEach);
    }

    delete() {
      return this.set(null, null, 1);
    }

    deleteMany() {
      return this.set(null, null, 2);
    }

    filter(filter) {
      const props = {
        _filter: {
          writable: false,
          value: filter
        }
      };
      return Object.create(this, props);
    }
  }

  request.collection = (collection) => {
    return new Methods(collection);
  };

  request.flush = flush;
  request.dev = dev;

  return request;
};
