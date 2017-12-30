import { baseApiUrl } from './config';

export default (apiRoute = '', projectID, customOrigin) => {
  const apiOrigin = customOrigin
    || baseApiUrl;

  const endpoint = `${apiOrigin}/graphql`;

  const apiUrl = apiRoute ? `${apiOrigin}${apiRoute}` : `${endpoint}/${projectID}`;
  return apiUrl;
};
