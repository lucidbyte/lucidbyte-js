import constructApiUrl from './construct-api-url';
import constructRequestHeaders from './construct-request-headers';
import axios from 'axios';

let devEnabled = false;
const dev = (arg) => {
  if (arg) {
    const { enabled } = arg;
    devEnabled = enabled;
  }
  return devEnabled;
};

const handlePromiseJSON = res => res.data;

const handleJSONdata = json => {
  if (json.errors) {
    console.error('graphqlError: \n' + JSON.stringify(json.errors, null, 2));
  }
  return json.data;
};

const maxContentSize = 1024 * 1000; // 1mb

export default ({
  projectID,
  // the following props are only for testing purposes
  origin: customOrigin,
  path = `/graphql/${projectID}`
}) => {
  const request = async (
    query,
    variables,
    action = null,
    type = null // Query | Mutation
  ) => {
    const body = action
      ? {
        query,
        action,
        type
      }
      : {
        query,
        variables,
      };
    const response = axios({
      url: constructApiUrl(path, projectID, customOrigin),
      method: 'POST',
      headers: await constructRequestHeaders(),
      data: body,
    });
    const isGraphql = typeof query === 'string';
    if (isGraphql) {
      return response.then(handlePromiseJSON)
        .then(handleJSONdata);
    }
    return response;
  };
  let operations = {};
  let opResponse;
  let opTimer;
  let promiseResolver;
  let filtersScope;
  /*
    Cumulative JSON string payload. This is used to check if payload is too large
    or when to flush the current batch.
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

  request.collection = (collection) => {

    const set = (query, actionType = 0) => {
      const op = query
        ? [actionType, filtersScope, query]
        : [actionType, filtersScope];

      if (dev()) {
        const payloadString = JSON.stringify(op);
        const batchSizeTooLarge = totalRequestContent.length + payloadString.length >= maxContentSize;
        if (batchSizeTooLarge) {
          const error =
      `Payload exceeded max of ${maxContentSize}.\n
      Try breaking up requests into smaller chunks with \`flush\` method.
      `;
          return Promise.reject({
            error,
            payloadSize: payloadString.length,
            payload: op
          });
        }
        totalRequestContent += payloadString;
      }

      operations[collection] = operations[collection] || [];
      operations[collection].push(op);
      const batchPromise = opResponse =
        opResponse || new Promise((resolve, reject) => {
          promiseResolver = () => {
            request(operations, null, 'updateNote', 'Mutation')
              .then(resolve)
              .catch(reject);
          };
        });
      opTimer = opTimer || setTimeout(flush, batchDelay);
      return batchPromise.then(res => {
        const newRes = Object.create(res);
        newRes.data = res.data[collection];
        return newRes;
      }).catch(err => {
        console.error(err);
      });
    };

    const setMany = (query) => {
      return set(query, 3);
    };

    const get = (query = {}) => {
      query.collection = collection;
      return request(query, null, 'allNotes', 'Query');
    };

    const del = () => {
      return set(null, 1);
    };

    const deleteMany = () => {
      return set(null, 2);
    };

    const methods = { get, set, delete: del, deleteMany, setMany };

    const filter = (filters = {}) => {
      filtersScope = filters;
      return methods;
    };

    return {
      filter
    };
  };

  request.flush = flush;
  request.dev = dev;

  return request;
};
