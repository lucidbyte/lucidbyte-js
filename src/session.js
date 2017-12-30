const session = (
  method,
  sessionParams = {}
) => {
  const {
    accessToken,
    expiresAt,
    userId
  } = sessionParams;
  return {
    accessToken: localStorage[`${method}Item`]('accessToken', accessToken),
    expiresAt: localStorage[`${method}Item`]('expiresAt', expiresAt),
    userId: localStorage[`${method}Item`]('userId', userId),
  };
};

Object.assign(session, {
  get: () => session('get'),
  end: () => session('remove'),
  set: (sessionParams) => session('set', sessionParams),
  exists: () => !!session('get').accessToken,
});

export default session;
