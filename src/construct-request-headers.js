import session from './session';

export default async () => {
  const accessToken = session.get().accessToken;
  const headers = {
    // Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
};
