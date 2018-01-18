/* global DEVELOPMENT */

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
const batchDelay = 0;
const maxLength = limits.maxContentSize;

class Methods {
  constructor(collection, batch, requestConfig) {
    this.collection = collection;
    this.batch = batch;
    this.requestConfig = requestConfig;
  }

  set(_id, document, options, opType = opTypes.upsert) {
    if (DEVELOPMENT) {
      require('./check-types').set({ _id, document, options, opType });
    }

    const { collection, batch } = this;
    const { operations } = batch;
    const opsList = operations[collection] = operations[collection] || [];

    const maxOpsReached = opsList.length === limits.maxOpsPerRequest;
    if (maxOpsReached) {
      batch.flush();
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

    if (DEVELOPMENT) {
      const payloadString = JSON.stringify(op);
      const batchSizeTooLarge = (batch.totalRequestContent.length + payloadString.length) >= maxLength;
      batch.totalRequestContent += payloadString;
      if (batchSizeTooLarge) {
        const error = `Combined payload size exceeded max of ${maxLength} characters.\n` +
          `You can break up requests into smaller batches with \`flush\` method.`;
        throw({
          error,
          combinedPayloadSize: batch.totalRequestContent.length,
          payloadSize: payloadString.length,
          payload: op
        });
      }
    }

    opsList.push(op);
    batch.opResponse = batch.opResponse || new Promise((resolve, reject) => {
      batch.promiseResolver = () => {
        request(operations, null, 'Mutation', null, this.requestConfig)
          .then(resolve)
          .catch(reject);
      };
    });
    batch.opTimer = batch.opTimer
      || setTimeout(() => batch.flush(), batchDelay);
    return batch.opResponse.then(res => {
      return res[collection];
    });
  }

  insert(value) {
    if (DEVELOPMENT) {
      require('./check-types').insert({ value });
    }

    return this.set(null, value, null, opTypes.insert);
  }

  update(_id, value) {
    if (DEVELOPMENT) {
      require('./check-types').update({ _id, value });
    }

    return this.set(_id, { $set: value }, null, opTypes.update);
  }

  get(_id, options) {
    if (DEVELOPMENT) {
      require('./check-types').get({ _id, options });
    }

    return this.query({ _id }, options)
      .then(promiseReturnSingleValue);
  }

  delete(_id) {
    if (DEVELOPMENT) {
      require('./check-types').del({ _id });
    }

    return this.set(_id, null, null, opTypes.delete);
  }

  query(filter, options, forEach, onError, onComplete) {
    if (DEVELOPMENT) {
      require('./check-types')
        .query({ filter, options, forEach, onError, onComplete });
    }

    const query = [
      this.collection,
      filter || {},
      options || {},
    ];
    return request(query, null, 'Query', { forEach, onError, onComplete }, this.requestConfig);
  }

  aggregate(pipelineStages, options, forEach, onError, onComplete) {
    if (DEVELOPMENT) {
      require('./check-types').aggregate({
        pipelineStages, options, forEach, onError, onComplete
      });
    }

    const query = [
      this.collection,
      pipelineStages || [],
      options || {},
    ];
    return request(query, null, 'Aggregate', { forEach, onError, onComplete }, this.requestConfig);
  }

  createIndex(fields, options) {
    if (DEVELOPMENT) {
      require('./check-types').createIndex({ fields, options });
    }

    const query = [
      this.collection,
      fields,
      options
    ];
    return request(query, null, 'CreateIndex', null, this.requestConfig);
  }

  getIndexes() {
    const query = [this.collection];
    return request(query, null, 'GetIndexes', null, this.requestConfig);
  }
}

// executes the request and clears the scope state
function flush() {
  const response = this.promiseResolver();
  clearTimeout(this.opTimer);
  this.operations = {};
  this.opResponse = null;
  this.opTimer = null;
  this.totalRequestContent = '';

  return response;
}

export default (requestConfig) => {
  // This state is per project, so requests to different collections
  // are combined.
  const batch = {
    operations: {},
    opResponse: null,
    opTimer: null,
    promiseResolver: null,
    /*
      Cumulative JSON string payload. This is used to check if payload is too
      large.
     */
    totalRequestContent: '',

    flush
  };

  const collection = (collection) => {
    if (DEVELOPMENT) {
      require('./check-types').collection({ collection });
    }

    return new Methods(collection, batch, requestConfig);
  };

  return {
    collection,
    flush: () => batch.flush()
  };
};
