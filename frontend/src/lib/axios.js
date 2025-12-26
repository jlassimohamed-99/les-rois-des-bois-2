import axios from 'axios';

// API Base URL from environment variable
// Set VITE_API_URL in your .env file (e.g., VITE_API_URL=https://les-rois-du-bois-back.2bj94x.easypanel.host/api)
// Falls back to production URL if not set
const API_BASE = import.meta.env.VITE_API_URL || 'https://les-rois-du-bois-back.2bj94x.easypanel.host/api';

// Log API base URL at runtime to confirm correctness
console.log('[API Client] API Base URL:', API_BASE);
if (!import.meta.env.VITE_API_URL) {
  console.warn('[API Client] VITE_API_URL not set in environment, using fallback URL');
}

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
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


