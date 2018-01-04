import session from './session';

const getAccessToken = () => {
  return session.exists() && session.get().accessToken;
};

export default async (accessToken = getAccessToken()) => {
  const headers = {
    // Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
};
