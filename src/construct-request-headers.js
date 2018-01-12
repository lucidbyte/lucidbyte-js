import session from './session';

const getAccessToken = () => {
  return session.exists() && session.get().accessToken;
};

export default (accessToken = getAccessToken()) => {
  const headers = {
    // Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'accept': 'application/json, application/ndjson'
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
};
