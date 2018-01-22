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

const promiseReturnSingleValue = res => {
  const val = res[0];
  return typeof val === 'undefined' ? null : val;
};
const batchDelay = 0;
const maxLength = limits.maxContentSize;

const noop = () => {};

function set(_id, document, options, opType = opTypes.upsert) {
  if (DEVELOPMENT) {
    const errors = require('./check-types')
      .set({ _id, document, options, opType });
    if (errors) throw errors;
  }

  const { collection, batch, options: { batchEnabled } } = this;
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

  const requestSuccessHandler = res => {
    const scopedResult =  res[collection];
    if (!scopedResult.ok) {
      return Promise.reject(scopedResult);
    }
    return scopedResult;
  };

  if (!batchEnabled) {
    batch.promiseResolver = noop;
    const res = request(operations, null, 'Mutation', null, this.requestConfig)
      .then(requestSuccessHandler);
    batch.flush();
    return res;
  }

  batch.opResponse = batch.opResponse || new Promise((resolve, reject) => {
    batch.promiseResolver = () => {
      request(operations, null, 'Mutation', null, this.requestConfig)
        .then(resolve)
        .catch(reject);
    };
  });
  batch.opTimer = batch.opTimer
    || setTimeout(() => batch.flush(), batchDelay);
  return batch.opResponse.then(requestSuccessHandler);
}

function query(filter, options, forEach, onError, onComplete) {
  if (DEVELOPMENT) {
    const errors = require('./check-types')
      .query({ filter, options, forEach, onError, onComplete });
    if (errors) throw errors;
  }

  const query = [
    this.collection,
    filter || {},
    options || {},
  ];
  return request(query, null, 'Query', { forEach, onError, onComplete }, this.requestConfig);
}

class Methods {
  constructor(collection, batch, options, requestConfig) {
    this.collection = collection;
    this.batch = batch;
    this.requestConfig = requestConfig;
    this.options = options;
  }

  insert(value) {
    if (DEVELOPMENT) {
      const errors = require('./check-types').insert({ value });
      if (errors) throw errors;
    }

    return set.call(this, null, value, null, opTypes.insert)
      .then(res => ({
        _id: res.insertedIds.shift(),
        ok: 1
      }));
  }

  update(_id, value) {
    if (DEVELOPMENT) {
      const errors = require('./check-types').update({ _id, value });
      if (errors) throw errors;
    }

    return set.call(this, _id, { $set: value }, null, opTypes.update);
  }

  get(_id, options) {
    if (DEVELOPMENT) {
      const errors = require('./check-types').get({ _id, options });
      if (errors) throw errors;
    }

    return query.call(this, { _id }, options)
      .then(promiseReturnSingleValue);
  }

  delete(_id) {
    if (DEVELOPMENT) {
      const errors = require('./check-types').del({ _id });
      if (errors) throw errors;
    }

    return set.call(this, _id, null, null, opTypes.delete);
  }

  aggregate(pipelineStages, options, forEach, onError, onComplete) {
    if (DEVELOPMENT) {
      const errors = require('./check-types').aggregate({
        pipelineStages, options, forEach, onError, onComplete
      });
      if (errors) throw errors;
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
      const errors = require('./check-types').createIndex({ fields, options });
      if (errors) throw errors;
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

Object.assign(Methods.prototype, {
  query, set
});

// executes the request and clears the scope state
function flush() {
  const response = this.promiseResolver();
  clearTimeout(this.opTimer);
  this.operations = {};
  this.opResponse = null;
  this.opTimer = null;
  this.totalRequestContent = '';
  this.request = null;

  return response;
}

/**
 * [creates a reference to a project]
 * @param  { Object } config [an object of options]
 * @param { String } config.projectId
 * @param { Boolean } config.batchEnabled [default = true]
 * @return { Object }
 */
export default (config) => {
  // This state is per project, so requests to different collections
  // are combined.
  const batch = {
    operations: {},
    opResponse: null,
    opTimer: null,
    promiseResolver: null,
    request: null,
    /*
      Cumulative JSON string payload. This is used to check if payload is too
      large.
     */
    totalRequestContent: '',

    flush
  };

  const {
    batchEnabled = true,
    middleware,
    ...requestConfig
  } = config;
  const options = { batchEnabled };

  let MethodsProxy;
  // proxy methods so we can do some introspection
  if (DEVELOPMENT && middleware) {
    const props = Object.getOwnPropertyNames(Methods.prototype)
      .filter(p => p !== 'constructor');
    MethodsProxy = class extends Methods {};
    props.forEach(methodName => {
      const proto = MethodsProxy.prototype;
      const oFn = proto[methodName];
      proto[methodName] = function() {
        const ret = oFn.call(this, ...arguments);
        middleware(this.collection, methodName, arguments, ret);
        return ret;
      };
    });
  }

  const collection = (collection) => {
    if (DEVELOPMENT) {
      require('./check-types').collection({ collection });
    }

    const constructorFn = MethodsProxy || Methods;
    return new constructorFn(collection, batch, options, requestConfig);
  };

  return {
    collection,
    flush: () => batch.flush()
  };
};
