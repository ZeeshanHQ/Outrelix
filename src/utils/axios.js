import axios from 'axios';
import BACKEND_URL from '../config/backend';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = BACKEND_URL;

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log(`[AXIOS] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[AXIOS] Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    console.log(`[AXIOS] Response ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[AXIOS] Response error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default axios; 