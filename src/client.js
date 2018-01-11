import request from './request';

let checkTypes;
let PropTypes;

if (process.env.NODE_ENV === 'development') {
  PropTypes = require('prop-types');
  checkTypes = (propTypes, props, method) =>
    PropTypes.checkPropTypes(propTypes, props, 'argument', method);
}

const opTypes = {
  update: 0,
  delete: 1,
  upsert: 2,
  insert: 3
};

// limits
const limits = {
  maxContentSize: 1024 * 1024 * 1, // 1MB
  maxOpsPerRequest: 500
};

const promiseReturnSingleValue = res => res[0];

export default (requestConfig, clientOptions = {}) => {
  const {
    lengthLimit
  } = clientOptions;

  const maxLength = lengthLimit < limits.maxContentSize
    ? lengthLimit
    : limits.maxContentSize;

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

    set(_id, document, options, opType = opTypes.upsert) {
      if (process.env.NODE_ENV === 'development') {
        const types = {
          _id: PropTypes.string.isRequired,
          document: PropTypes.object.isRequired,
          options: PropTypes.object,
          opType: PropTypes.number
        };
        checkTypes(types, { _id, document, options }, 'get');
      }

      const { collection } = this;
      const opsList = operations[collection] = operations[collection] || [];

      const maxOpsReached = opsList.length === limits.maxOpsPerRequest;
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

      const op = document
        ? [opType, filter, document]
        : [opType, filter];
      if (options) {
        op.push(options);
      }

      if (process.env.NODE_ENV === 'development') {
        const payloadString = JSON.stringify(op);
        const batchSizeTooLarge = (totalRequestContent.length + payloadString.length) >= maxLength;
        totalRequestContent += payloadString;
        if (batchSizeTooLarge) {
          const error = `Combined payload size exceeded max of ${maxLength} characters.\n` +
            `You can break up requests into smaller batches with \`flush\` method.`;
          throw({
            error,
            combinedPayloadSize: totalRequestContent.length,
            payloadSize: payloadString.length,
            payload: op
          });
        }
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

    insert(value) {
      if (process.env.NODE_ENV === 'development') {
        const types = {
          value: PropTypes.object.isRequired
        };
        checkTypes(types, { value }, 'get');
      }

      return this.set(null, value, null, opTypes.insert);
    }

    update(_id, value) {
      if (process.env.NODE_ENV === 'development') {
        const types = {
          _id: PropTypes.string.isRequired,
          value: PropTypes.object
        };
        checkTypes(
          types,
          { _id, value },
          'get'
        );
      }

      return this.set(_id, { $set: value }, null, opTypes.update);
    }

    get(_id, options) {
      if (process.env.NODE_ENV === 'development') {
        const types = {
          _id: PropTypes.string.isRequired,
          options: PropTypes.object
        };
        checkTypes(
          types,
          { _id, options },
          'get'
        );
      }

      return this.query({ _id }, options).then(promiseReturnSingleValue);
    }

    delete(_id) {
      if (process.env.NODE_ENV === 'development') {
        const types = {
          _id: PropTypes.string.isRequired,
        };
        checkTypes(
          types,
          { _id },
          'delete'
        );
      }

      return this.set(_id, null, null, opTypes.delete);
    }

    query(filter, options, forEach, onError, onComplete) {
      if (process.env.NODE_ENV === 'development') {
        const types = {
          filter: PropTypes.object,
          options: PropTypes.object,
          forEach: PropTypes.func,
          onError: PropTypes.func,
          onComplete: PropTypes.func
        };
        checkTypes(
          types,
          { filter, options, forEach },
          'query'
        );
      }

      const query = [
        this.collection,
        filter || {},
        options || {},
      ];
      return request(query, null, 'Query', { forEach, onError, onComplete }, requestConfig);
    }

    aggregate(pipelineStages, options, forEach, onError, onComplete) {
      if (process.env.NODE_ENV === 'development') {
        const types = {
          pipelineStages: PropTypes.array,
          options: PropTypes.object,
          forEach: PropTypes.func,
          onError: PropTypes.func,
          onComplete: PropTypes.func
        };
        checkTypes(
          types,
          { pipelineStages, options, forEach },
          'query'
        );
      }

      const query = [
        this.collection,
        pipelineStages || [],
        options || {},
      ];
      return request(query, null, 'Aggregate', { forEach, onError, onComplete }, requestConfig);
    }

    createIndex(fields, options) {
      if (process.env.NODE_ENV === 'development') {
        const types = {
          fields: PropTypes.object.isRequired,
          options: PropTypes.object,
        };
        checkTypes(
          types,
          { fields, options },
          'query'
        );
      }

      const query = [
        this.collection,
        fields,
        options
      ];
      return request(query, null, 'CreateIndex', null, requestConfig);
    }

    getIndexes() {
      const query = [this.collection];
      return request(query, null, 'GetIndexes', null, requestConfig);
    }
  }

  const collection = (collection) => {
    if (process.env.NODE_ENV === 'development') {
      const types = { collection: PropTypes.string.isRequired };
      checkTypes(types, { collection }, 'collection');
    }

    return new Methods(collection);
  };

  return {
    collection,
    flush
  };
};
