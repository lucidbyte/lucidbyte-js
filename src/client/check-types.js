const PropTypes = require('prop-types');
const checkTypes = (propTypes, props, method) =>
  PropTypes.checkPropTypes(propTypes, props, 'argument', method);

export const collection = (props) => {
  const types = { collection: PropTypes.string.isRequired };
  checkTypes(types, props, 'collection');
};

export const set = (props) => {
  const types = {
    _id: PropTypes.string,
    document: PropTypes.object,
    options: PropTypes.object,
    opType: PropTypes.number
  };
  checkTypes(types, props, 'set');
};

export const get = (props) => {
  const types = {
    _id: PropTypes.string.isRequired,
    options: PropTypes.object
  };
  checkTypes(types, props, 'get');
};

export const del = (props) => {
  const types = {
    _id: PropTypes.string.isRequired,
  };
  checkTypes(types, props, 'delete');
};

export const update = (props) => {
  const types = {
    _id: PropTypes.string.isRequired,
    value: PropTypes.object
  };
  checkTypes(types, props, 'update');
};

export const query = (props) => {
  const types = {
    filter: PropTypes.object,
    options: PropTypes.object,
    forEach: PropTypes.func,
    onError: PropTypes.func,
    onComplete: PropTypes.func
  };
  checkTypes(types, props, 'query');
};

export const aggregate = (props) => {
  const types = {
    pipelineStages: PropTypes.array,
    options: PropTypes.object,
    forEach: PropTypes.func,
    onError: PropTypes.func,
    onComplete: PropTypes.func
  };
  checkTypes(types, props, 'query');
};

export const insert = (props) => {
  const types = {
    value: PropTypes.object.isRequired
  };
  checkTypes(types, props, 'insert');
};

export const createIndex = (props) => {
  const types = {
    fields: PropTypes.object.isRequired,
    options: PropTypes.object,
  };
  checkTypes(
    types,
    props,
    'query'
  );
};
