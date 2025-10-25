// API helper functions
import BACKEND_URL from './backend';

export const apiCall = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_URL}${endpoint}`;
  return fetch(url, {
    credentials: 'include',
    ...options
  });
};

export default apiCall;
