import request from '../request';

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
        require('./check-types').set({ _id: {}, document, options, opType });
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
        require('./check-types').insert({ value });
      }

      return this.set(null, value, null, opTypes.insert);
    }

    update(_id, value) {
      if (process.env.NODE_ENV === 'development') {
        require('./check-types').update({ _id, value });
      }

      return this.set(_id, { $set: value }, null, opTypes.update);
    }

    get(_id, options) {
      if (process.env.NODE_ENV === 'development') {
        require('./check-types').get({ _id, options });
      }

      return this.query({ _id }, options).then(promiseReturnSingleValue);
    }

    delete(_id) {
      if (process.env.NODE_ENV === 'development') {
        require('./check-types').del({ _id });
      }

      return this.set(_id, null, null, opTypes.delete);
    }

    query(filter, options, forEach, onError, onComplete) {
      if (process.env.NODE_ENV === 'development') {
        require('./check-types')
          .query({ filter, options, forEach, onError, onComplete });
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
        require('./check-types').aggregate({
          pipelineStages, options, forEach, onError, onComplete
        });
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
        require('./check-types').createIndex({ fields, options });
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

    has(_id) {
      return this.get(_id, { countOnly: 1 })
        .then(res => !!res.count);
    }
  }

  const collection = (collection) => {
    if (process.env.NODE_ENV === 'development') {
      require('./check-types').collection({ collection });
    }

    return new Methods(collection);
  };

  return {
    collection,
    flush
  };
};
