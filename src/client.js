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

// limits
const maxContentSize = 1024 * 5000; // 5mb
const maxOpsPerRequest = 500;

const flattenStreamResults = (results) => {
  if (!Array.isArray(results[0])) {
    return results;
  }
  return results.reduce((a, b) => a.concat(b), []);
};

const noop = () => {};

function filter(filter) {
  const props = {
    _filter: {
      writable: false,
      value: filter
    }
  };
  return Object.create(this, props);
}

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
      const { collection } = this;
      const opsList = operations[collection] = operations[collection] || [];

      if (opsList.length === maxOpsPerRequest) {
        flush();
      }

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

      opsList.push(op);
      opResponse = opResponse || new Promise((resolve, reject) => {
        promiseResolver = () => {
          request(operations, null, 'Mutation')
            .then(resolve)
            .catch(reject);
        };
      });
      opTimer = opTimer || setTimeout(flush, batchDelay);
      return opResponse.then(res => {
        return res[collection];
      });
    }

    get(filter, opts, forEach) {
      const options = opts || {};
      options.filter = filter || {};
      options.collection = this.collection;
      return request(options, null, 'Query', forEach);
    }

    delete() {
      return this.set(null, null, 1);
    }

    id(_id) {
      return filter.call(this, { _id });
    }
  }

  request.collection = (collection) => {
    return new Methods(collection);
  };

  request.flush = flush;

  return request;
};
