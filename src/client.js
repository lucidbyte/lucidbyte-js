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

  class Operators {
    constructor(collection, filter) {
      this.collection = collection;
      this.filter = filter;
    }

    set(query, actionType = 0) {
      const { filter } = this;
      const op = query
        ? [actionType, filter, query]
        : [actionType, filter];

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

      const { collection } = this;
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
    }

    setMany(query) {
      return this.set(query, 3);
    }

    get(query = {}) {
      query.filter = this.filter;
      query.collection = this.collection;
      return request(query, null, 'allNotes', 'Query');
    }

    delete() {
      return this.set(null, 1);
    }

    deleteMany = () => {
      return this.set(null, 2);
    }
  }

  request.collection = (collection) => {
    const filter = (filters = {}) => {
      return new Operators(collection, filters);
    };

    return {
      filter
    };
  };

  request.flush = flush;
  request.dev = dev;

  return request;
};
