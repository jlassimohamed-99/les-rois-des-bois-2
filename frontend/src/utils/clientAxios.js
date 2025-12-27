import axios from 'axios';
import { API_BASE } from './axios';

// Client-facing API base (e.g. https://backend/api/client)
// Uses API_BASE from axios.js which reads from VITE_API_URL environment variable
const clientApi = axios.create({
  baseURL: `${API_BASE}/client`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Log client API base URL at runtime to confirm correctness
console.log('🌐 [CLIENT API] Base URL:', `${API_BASE}/client`);

// Request interceptor with detailed logging
clientApi.interceptors.request.use(
  (config) => {
    const timestamp = new Date().toISOString();
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request details
    console.log(`📤 [CLIENT API REQUEST] [${timestamp}] ${config.method?.toUpperCase()} ${config.url || config.baseURL}`);
    console.log(`📤 [CLIENT API REQUEST] Full URL:`, `${config.baseURL}${config.url}`);
    console.log(`📤 [CLIENT API REQUEST] Headers:`, {
      'Content-Type': config.headers['Content-Type'],
      'Authorization': config.headers.Authorization ? 'Bearer ***' : 'Not set',
      'withCredentials': config.withCredentials,
    });
    
    if (config.params && Object.keys(config.params).length > 0) {
      console.log(`📤 [CLIENT API REQUEST] Query params:`, config.params);
    }
    
    if (config.data) {
      if (config.headers['Content-Type']?.includes('multipart/form-data')) {
        console.log(`📤 [CLIENT API REQUEST] Body: [FormData - ${Object.keys(config.data).length} fields]`);
      } else {
        const dataPreview = typeof config.data === 'string' 
          ? config.data.substring(0, 200) 
          : JSON.stringify(config.data).substring(0, 200);
        console.log(`📤 [CLIENT API REQUEST] Body preview:`, dataPreview);
      }
    }

    return config;
  },
  (error) => {
    const timestamp = new Date().toISOString();
    console.error(`❌ [CLIENT API REQUEST ERROR] [${timestamp}]`, {
      message: error.message,
      config: error.config ? {
        method: error.config.method,
        url: error.config.url,
        baseURL: error.config.baseURL,
      } : null,
    });
    return Promise.reject(error);
  }
);

// Response interceptor with detailed logging
clientApi.interceptors.response.use(
  (response) => {
    const timestamp = new Date().toISOString();
    console.log(`📥 [CLIENT API RESPONSE] [${timestamp}] ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log(`📥 [CLIENT API RESPONSE] Status:`, response.status, response.statusText);
    console.log(`📥 [CLIENT API RESPONSE] Headers:`, {
      'content-type': response.headers['content-type'],
      'content-length': response.headers['content-length'],
    });
    
    if (response.data) {
      if (response.headers['content-type']?.includes('application/json')) {
        const dataPreview = JSON.stringify(response.data).substring(0, 300);
        console.log(`📥 [CLIENT API RESPONSE] Data preview:`, dataPreview);
      } else {
        console.log(`📥 [CLIENT API RESPONSE] Data type:`, typeof response.data, `(${response.data?.length || 'N/A'} bytes)`);
      }
    }

    return response;
  },
  (error) => {
    const timestamp = new Date().toISOString();
    
    if (error.response) {
      // Server responded with error status
      console.error(`❌ [CLIENT API RESPONSE ERROR] [${timestamp}] ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      console.error(`❌ [CLIENT API RESPONSE ERROR] Status:`, error.response.status, error.response.statusText);
      console.error(`❌ [CLIENT API RESPONSE ERROR] Headers:`, error.response.headers);
      
      if (error.response.data) {
        const errorDataPreview = typeof error.response.data === 'string'
          ? error.response.data.substring(0, 300)
          : JSON.stringify(error.response.data).substring(0, 300);
        console.error(`❌ [CLIENT API RESPONSE ERROR] Error data:`, errorDataPreview);
      }

      // Handle 401 Unauthorized (don't redirect automatically for client API)
      if (error.response.status === 401) {
        console.warn('⚠️ [CLIENT API RESPONSE ERROR] 401 Unauthorized - Removing token (no auto-redirect)');
        localStorage.removeItem('token');
        // Don't redirect automatically - let the component handle it
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error(`❌ [CLIENT API NETWORK ERROR] [${timestamp}] ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      console.error(`❌ [CLIENT API NETWORK ERROR] No response received:`, {
        message: error.message,
        code: error.code,
        config: error.config ? {
          baseURL: error.config.baseURL,
          url: error.config.url,
        } : null,
      });
    } else {
      // Error setting up the request
      console.error(`❌ [CLIENT API SETUP ERROR] [${timestamp}]`, {
        message: error.message,
        stack: error.stack,
      });
    }

    return Promise.reject(error);
  }
);

export default clientApi;

