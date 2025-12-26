import axios from 'axios';

// HARDCODED PRODUCTION API BASE URL
// All API requests MUST go to this production backend
const API_BASE = 'https://les-rois-du-bois-back.2bj94x.easypanel.host/api';

// Log API base URL at runtime to confirm correctness
console.log('[API Client] API Base URL:', API_BASE);

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


