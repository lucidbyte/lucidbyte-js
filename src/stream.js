const makeRequest = require('basic-browser-request');

const STATE = '__state__';
const noop = () => {};

function emitData(chunk) {
  const { originalOnData } = this;
  const {
    parsedChunks: parsedChunksState,
    hasOnComplete,
  } = this[STATE];
  originalOnData(chunk);
  if (hasOnComplete) {
    parsedChunksState.push(chunk);
  }
}

function handleChunk(data) {
  const _s = this[STATE];
  // total accumulated unparsed chunk
  const tChunk = _s.partialChunk + data;
  const lastNewlineIdx = tChunk.lastIndexOf('\n');
  // [spec](http://ndjson.org/)
  const hasNdjson = lastNewlineIdx !== -1;
  const sliceEnd = lastNewlineIdx + 1;

  if (hasNdjson) {
    let i = -1;
    let ndjson = '';
    while(i++ < sliceEnd) {
      const char = tChunk[i];
      ndjson += char;
      const isNewline = char === '\n';
      if (isNewline) {
        emitData.call(this, JSON.parse(ndjson));
        _s.lastParsedIndex += ndjson.length;
        ndjson = '';
      }
    }
    _s.partialChunk = tChunk.substr(sliceEnd);
  } else {
    _s.partialChunk = tChunk;
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

export default function crossStream(config) {
  const {
    options,
    onError = noop, // called on xhr error
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

  const hasOnComplete = onComplete !== noop;

  if (process.env.NODE_ENV === 'development') {
    const missingRequiredCallback = (onError, onData) => {
      const hasOneRequiredCallback = !!onData || hasOnComplete;
      if (!hasOneRequiredCallback) {
        return requiredCallbackError;
      }

      if (!onError) {
        return requiredErrorCallbackError;
      }

      return false;
    };

    const missingCallbackError = missingRequiredCallback(onError, onData, hasOnComplete);
    if (missingCallbackError) {
      throw missingCallbackError;
    }
  }

  const opts = Options(options, onData, onComplete);

  function done(
    error,
    response,
    text
  ) {
    const _s = opts[STATE];
    const { lastParsedIndex } = opts[STATE];

    const isCancelled = !arguments.length;
    if (isCancelled) {
      return onCancel();
    }

    if (error) {
      return onError(error);
    }

    const contentType = response.xhr.getResponseHeader('Content-Type');
    const isNdjson = contentType.indexOf('application/ndjson') !== -1;
    try {
      if (isNdjson) {
        if (!_s.parsedChunks.length) {
          _s.partialChunk = '';
          handleChunk.call(opts, text);
          // handle remaining text response
        } else {
          _s.partialChunk = '';
          handleChunk.call(opts, text.substr(lastParsedIndex));
        }
        onComplete(_s.parsedChunks);
      } else {
        const jsonResponse = JSON.parse(text);
        emitData.call(opts, jsonResponse);
        onComplete(jsonResponse);
      }
    } catch(err) {
      onError(err);
    }
  }

  return makeRequest(opts, done);
}
