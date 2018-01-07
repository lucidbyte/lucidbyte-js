import request from './request';

const docUrl = (hash) => `https://test.remote.lelandkwong.com/docs#${hash}`;

const methodTypes = {
  update: 0,
  delete: 1
};

// limits
const maxContentSize = 1024 * 5000; // 5mb
const maxOpsPerRequest = 500;

export default (requestConfig) => {
  // batch scope
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
    }

    set(_id, documentObject, options, methodType = methodTypes.update) {
      const { collection } = this;
      const opsList = operations[collection] = operations[collection] || [];

      const maxOpsReached = opsList.length === maxOpsPerRequest;
      if (maxOpsReached) {
        flush();
      }

      const filter = {};
      if (
        typeof _id !== 'undefined'
        && _id !== null
      ) {
        filter._id = _id;
      }

      const op = documentObject
        ? [methodType, filter, documentObject]
        : [methodType, filter];
      if (options) {
        op.push(options);
      }

      if (process.env.NODE_ENV === 'development') {
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

    get(_id, opts) {
      if (process.env.NODE_ENV === 'development') {
        const isMissingId = typeof _id === 'undefined' || _id === null;
        if (isMissingId) {
          const error = `missing \`_id\` argument in \`get\` method.
  ${docUrl('get')}`;
          throw(error);
        }
      }
      return this.query({ _id }, opts);
    }

    delete(_id) {
      return this.set(_id, null, null, methodTypes.delete);
    }

    query(filter, options, forEach) {
      const query = [
        this.collection,
        filter || {},
        options || {},
      ];
      return request(query, null, 'Query', forEach, requestConfig);
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
