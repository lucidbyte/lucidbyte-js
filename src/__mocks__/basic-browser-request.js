// mock module for stream.js
const mockItems = () => new Array(6).fill(0).map((_, i) => {
  return {
    message: `foo ${i}`
  };
});

jest.useFakeTimers();

module.exports = function(opts, done) {
  console.log(opts.url);
  const path = opts.url.slice(1);
  const mockResponseObject = {};
  ({
    chunked() {
      const items = mockItems();
      let totalResponseText = '';
      items.forEach((response) => {
        const ndjsonResponse = JSON.stringify(response) + '\n';
        totalResponseText += ndjsonResponse;
        opts.onData(ndjsonResponse);
      });
      done(null, mockResponseObject, totalResponseText);
    },

    partialChunked() {
      const items = mockItems();
      let totalResponseText = '';
      items.forEach((response) => {
        const ndjsonResponse = JSON.stringify(response) + '\n';
        totalResponseText += ndjsonResponse;

        const fragmentSize = 2;
        for (let j = 0; j < ndjsonResponse.length; j += fragmentSize) {
          const fragment = ndjsonResponse.substr(j, fragmentSize);
          opts.onData(fragment);
        }
      });
      done(null, mockResponseObject, totalResponseText);
    },

    nonChunked() {
      const items = mockItems();
      const totalResponseText = JSON.stringify(items);
      opts.onData(totalResponseText);
      done(null, mockResponseObject, totalResponseText);
    }
  })[path]();
};

module.exports.mockItems = mockItems;
