const makeRequest = require('basic-browser-request');

function isNdjson(data) {
  return data.length &&
    (data.lastIndexOf('\n') === (data.length - 1));
}

function handleNdjsonChunk(data) {
  const ndjsonChunks = data.trim().split('\n');
  return ndjsonChunks.map(chunk => {
    return JSON.parse(chunk);
  });
}

function flattenChunks(parsedChunks) {
  return parsedChunks.reduce((a, b) => a.concat(b), []);
}

function handleChunk(data) {
  const { __state } = this;
  __state.eventCount++;
  __state.lastReadIndex += data.length;
  __state.partialChunk += data;
  /*
    Its possible that we get partial json, so we need to check if its valid
    ndjson by checking for a newline at the end.
   */
  const isParsable = isNdjson(__state.partialChunk);
  if (isParsable) {
    const json = handleNdjsonChunk(__state.partialChunk);
    __state.parsedChunks.push(json);
    this.__onData(json);
    // console.log(json);
    __state.partialChunk = '';
  }
}

function noop() {}

function Options(opts, onData = noop) {
  opts.__state = {
    lastReadIndex: 0,
    eventCount: 0,
    partialChunk: '',
    parsedChunks: []
  };
  const isNoop = onData === noop;
  opts.__onData = isNoop ? noop : onData;
  opts.onData = isNoop ? noop : handleChunk;
  return opts;
}

export default function crossStream(config) {
  const {
    options,
    onError, // called on xhr error
    onComplete = noop, // called with final parsed JSON payload
    onData // called on each new data chunk
  } = config;
  const opts = Options(options, onData);

  function done(error, response, text) {
    const { lastReadIndex, eventCount, parsedChunks } = opts.__state;

    if (error) {
      onError(error);
    } else if (text) {
      const isSingleEvent = eventCount === 1;
      /*
        A single event may happen because its a non-chunked response or because
        the stream came through too quickly
       */
      if (isSingleEvent) {
        const result = parsedChunks.length
          ? parsedChunks
          : handleNdjsonChunk(text);
        return onComplete(result);
      }
      const unreadChunk = text.substr(lastReadIndex);
      if (!unreadChunk.length) {
        return onComplete(
          flattenChunks(
            parsedChunks
          )
        );
      }
      const json = isNdjson(unreadChunk)
        ? handleNdjsonChunk(unreadChunk)
        : JSON.parse(unreadChunk);

      // send one last `onData` event
      onData(json);

      // send final payload
      parsedChunks.push(json);
      onComplete(
        flattenChunks(
          parsedChunks
        )
      );
    } else {
      onComplete({ cancelled: true });
      console.log('cancelled');
    }
  }

  makeRequest(opts, done);
}
