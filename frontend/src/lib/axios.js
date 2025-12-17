import axios from 'axios';

// Raw backend host from environment (e.g. https://backend-domain)
const RAW_API_HOST = import.meta.env.VITE_API_URL;

// Dev-only log of the configured API URL (once on module load)
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log(
    '[API] VITE_API_URL =',
    RAW_API_HOST || '(empty, using relative /api via Vite dev proxy)'
  );
}

// In production we require VITE_API_URL to be defined to avoid calling the frontend host
if (!RAW_API_HOST && import.meta.env.PROD) {
  throw new Error(
    '[API] VITE_API_URL is not defined. Set it to your backend base URL, e.g. https://backend-domain'
  );
}

// Normalize: ensure we don't end with a trailing slash
const API_HOST = RAW_API_HOST ? RAW_API_HOST.replace(/\/$/, '') : '';

// Base API path (host + /api) used by axios instance
// In dev without VITE_API_URL we fall back to relative /api (served via Vite proxy)
const API_BASE = API_HOST ? `${API_HOST}/api` : '/api';

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

export { API_BASE, API_HOST };
export default api;


