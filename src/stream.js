const makeRequest = require('basic-browser-request');

const STATE = '__state__';
const noop = () => {};

// [spec](http://ndjson.org/)
const isNdjson = (data) =>
  data.slice(-1) === '\n';

const parseChunk = chunk => JSON.parse(chunk);

function handleNdjsonChunk(data) {
  const ndjsonChunks = data.trim().split('\n');
  return ndjsonChunks.map(parseChunk);
}

function emitData(parsedChunks) {
  const { originalOnData } = this;
  const { parsedChunks: parsedChunksState, hasOnComplete } = this[STATE];
  // emit the data once per ndjson chunk
  for (let i = 0; i < parsedChunks.length; i++) {
    const chunk = parsedChunks[i];
    originalOnData(chunk);
    if (hasOnComplete) {
      parsedChunksState.push(chunk);
    }
  }
}

function handleChunk(data) {
  const _s = this[STATE];
  const pChunk = _s.partialChunk += data;
  /*
    Its possible that we get partial json, so we need to check if its valid
    ndjson by checking for a newline at the end.
   */
  const isParsableNdjson = isNdjson(pChunk);
  if (isParsableNdjson) {
    const parsedChunks = handleNdjsonChunk(pChunk);
    emitData.call(this, parsedChunks);
    _s.lastParsedIndex += pChunk.length;
    _s.partialChunk = '';
  }
}

function Options(opts, onData = noop, hasOnComplete) {
  opts[STATE] = {
    lastParsedIndex: 0,
    partialChunk: '',
    parsedChunks: [],
    hasOnComplete,
  };
  opts.originalOnData = onData;
  /*
    This is called from 'basic-browser-request' module whenever xhr.onreadystate
    is called.
   */
  opts.onData = handleChunk;
  return opts;
}

export const requiredCallbackError = `must provide at least 'onData' or 'onComplete' callback`;
export const requiredErrorCallbackError = `must provide 'onError' callback`;

const missingRequiredCallback = (onError, onData, onComplete) => {
  const hasOneRequiredCallback = onData || (onComplete !== noop);
  if (!hasOneRequiredCallback) {
    return requiredCallbackError;
  }

  if (!onError) {
    return requiredErrorCallbackError;
  }

  return false;
};

export default function crossStream(config) {
  const {
    options,
    onError, // called on xhr error
    /*
      Called with final parsed JSON payload. If this function is omitted, then
      it'll effectively be a noop and spend no cpu resources.
     */
    onComplete = noop,
    onCancel = noop,
    /*
      Called on each new ndjson chunk. If this function is omitted, then
      it'll effectively be a noop and spend no cpu resources.
     */
    onData
  } = config;

  const missingCallbackError = missingRequiredCallback(onError, onData, onComplete);
  if (missingCallbackError) {
    throw missingCallbackError;
  }

  const opts = Options(options, onData, onComplete !== noop);

  function done(error, response, text) {
    const _s = opts[STATE];
    const { lastParsedIndex } = opts[STATE];

    const isCancelled = !arguments.length;
    if (isCancelled) {
      return onCancel();
    }

    if (error) {
      return onError(error);
    }

    const remainingChunk = text.substr(lastParsedIndex);
    if (!remainingChunk.length) {
      onComplete(_s.parsedChunks);
    // handle remainingChunk
    } else {
      const parsedChunks = isNdjson(remainingChunk)
        ? handleNdjsonChunk(remainingChunk)
        : JSON.parse(remainingChunk);

      // emit remaining data objects
      emitData.call(opts, parsedChunks);
      onComplete(_s.parsedChunks);
    }
  }

  return makeRequest(opts, done);
}
