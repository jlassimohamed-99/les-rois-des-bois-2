import axios from 'axios';
import { API_BASE } from './axios';

// Client-facing API base (e.g. https://backend/api/client)
// Uses API_BASE from axios.js which is hardcoded to production URL
const clientApi = axios.create({
  baseURL: `${API_BASE}/client`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Log client API base URL at runtime to confirm correctness
console.log('[Client API] Base URL:', `${API_BASE}/client`);

// Request interceptor
clientApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
clientApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Don't redirect automatically - let the component handle it
    }
    return Promise.reject(error);
  }
);

export default clientApi;

