import { typeCheck } from 'type-check';

const type = (type) => {
  return {
    isRequired: {
      type,
      required: true
    },
    type
  };
};

const validateTypes = (types, args = {}, methodName) => {
  for (const key in types) {
    const val = args[key];
    const { type, required } = types[key];
    const isUndefined = typeof val === 'undefined';
    if (required && isUndefined) {
      return `Argument '${key}' is required in method 'get'.`;
    }
    if (!isUndefined && !typeCheck(type, val)) {
      return `Expected argument '${key}' to be of type '${type}' in method '${methodName}'. Received ${val}.`;
    }
  }
};

export const collection = (props) => {
  const types = { collection: type('String').isRequired };
  return validateTypes(types, props, 'collection');
};

export const set = (props) => {
  const types = {
    _id: type('String | Null'),
    document: type('Object | Null'),
    options: type('Object | Null'),
    opType: type('Number'),
  };
  return validateTypes(types, props, 'set');
};

export const get = (args) => {
  const types = {
    _id: type('String').isRequired,
    options: type('Object')
  };
  return validateTypes(types, args, 'get');
};

export const del = (props) => {
  const types = {
    _id: type('String').isRequired,
  };
  return validateTypes(types, props, 'delete');
};

export const update = (props) => {
  const types = {
    _id: type('String').isRequired,
    value: type('Object')
  };
  return validateTypes(types, props, 'update');
};

export const query = (props) => {
  const types = {
    filter: type('Object'),
    options: type('Object'),
    forEach: type('Function'),
    onError: type('Function'),
    onComplete: type('Function')
  };
  return validateTypes(types, props, 'query');
};

export const aggregate = (props) => {
  const types = {
    pipelineStages: type('Array').isRequired,
    options: type('Object'),
    forEach: type('Function'),
    onError: type('Function'),
    onComplete: type('Function')
  };
  return validateTypes(types, props, 'aggregate');
};

export const insert = (props) => {
  const types = {
    value: type('Object').isRequired
  };
  return validateTypes(types, props, 'insert');
};

export const createIndex = (props) => {
  const types = {
    fields: type('Object').isRequired,
    options: type('Object'),
  };
  return validateTypes(types, props, 'query');
};
