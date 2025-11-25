import axios from 'axios';

const clientApi = axios.create({
  baseURL: '/api/client',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
clientApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clientToken');
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
      localStorage.removeItem('clientToken');
      // Don't redirect automatically - let the component handle it
    }
    return Promise.reject(error);
  }
);

export default clientApi;

