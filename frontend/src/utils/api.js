import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
export const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: BACKEND_URL ? API : '/api',
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

// Separate instance for auth requests that don't need tokens
export const authApi = axios.create({
  baseURL: BACKEND_URL ? API : '/api',
  withCredentials: false,
});

authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Auth API Error:', error.message);
    return Promise.reject(error);
  }
);

export default api;
