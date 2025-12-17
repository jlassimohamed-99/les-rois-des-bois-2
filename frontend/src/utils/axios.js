import axios from 'axios';

// Base backend URL host (ex: https://api.mondomaine.com).
// In dev, you can leave VITE_API_URL empty and rely on Vite proxy + /api.
const API_HOST = import.meta.env.VITE_API_URL || '';

// Ensure we don't end with a trailing slash before adding /api
const API_BASE = `${API_HOST.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { API_BASE };
export default api;

