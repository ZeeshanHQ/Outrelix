import axios from 'axios';
import BACKEND_URL from '../config/backend';

// Configure axios defaults
// Default: no credentials to avoid CORS preflight issues unless explicitly needed
axios.defaults.withCredentials = false;
axios.defaults.baseURL = BACKEND_URL;

// Add request interceptor for debugging and token injection
axios.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage (Supabase standard key)
    const supabaseKey = Object.keys(localStorage).find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
    if (supabaseKey) {
      try {
        const authData = JSON.parse(localStorage.getItem(supabaseKey));
        if (authData && authData.access_token) {
          config.headers.Authorization = `Bearer ${authData.access_token}`;
        }
      } catch (e) {
        console.error('[AXIOS] Failed to parse auth token:', e);
      }
    }

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