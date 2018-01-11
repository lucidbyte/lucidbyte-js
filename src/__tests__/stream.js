/* global test */

import stream, { requiredCallbackError } from '../stream';
import { mockItems } from 'basic-browser-request';

describe('stream test', () => {
  test('chunked', () => {
    const options = {
      url: '/chunked'
    };
    const onComplete = jest.fn();
    const onData = jest.fn();
    const onError = jest.fn();
    stream({
      options,
      onError,
      onData,
      onComplete
    });
    expect(onData.mock.calls.length).toBe(6);
    const result = mockItems();
    expect(onComplete.mock.calls[0][0])
      .toEqual(result);
  });

  test('partial json chunked (json fragments)', () => {
    const options = {
      url: '/partialChunked'
    };
    const onComplete = jest.fn();
    const onData = jest.fn();
    const onError = jest.fn();
    stream({
      options,
      onError,
      onData,
      onComplete
    });
    expect(onData.mock.calls.length).toBe(6);
    expect(onComplete.mock.calls[0][0]).toEqual(mockItems());
  });

  test('non-chunked request', () => {
    const options = {
      url: '/nonChunked'
    };
    const onComplete = jest.fn();
    const onData = jest.fn();
    const onError = jest.fn();
    stream({
      options,
      onError,
      onData,
      onComplete
    });
    expect(onData.mock.calls.length).toBe(6);
    expect(onComplete.mock.calls[0][0]).toEqual(mockItems());
  });

  test('throws an error for missing onData or onComplete callback', () => {
    expect(() => {
      stream({
        options: {
          url: '/error'
        }
      });
    }).toThrowError(requiredCallbackError);
  });
});
