import axios from 'axios';

// API Base URL from environment variable
// Set VITE_API_URL in your .env file (e.g., VITE_API_URL=https://les-rois-du-bois-backend.2bj94x.easypanel.host/api)
// Falls back to production URL if not set
const API_BASE = import.meta.env.VITE_API_URL || 'https://les-rois-du-bois-backend.2bj94x.easypanel.host/api';

// Log API base URL at runtime to confirm correctness
console.log('🌐 [API CLIENT] API Base URL:', API_BASE);
if (!import.meta.env.VITE_API_URL) {
  console.warn('⚠️ [API CLIENT] VITE_API_URL not set in environment, using fallback URL');
}

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor with detailed logging
api.interceptors.request.use(
  (config) => {
    const timestamp = new Date().toISOString();
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request details
    console.log(`📤 [API REQUEST] [${timestamp}] ${config.method?.toUpperCase()} ${config.url || config.baseURL}`);
    console.log(`📤 [API REQUEST] Full URL:`, `${config.baseURL}${config.url}`);
    console.log(`📤 [API REQUEST] Headers:`, {
      'Content-Type': config.headers['Content-Type'],
      'Authorization': config.headers.Authorization ? 'Bearer ***' : 'Not set',
      'withCredentials': config.withCredentials,
    });
    
    if (config.params && Object.keys(config.params).length > 0) {
      console.log(`📤 [API REQUEST] Query params:`, config.params);
    }
    
    if (config.data) {
      if (config.headers['Content-Type']?.includes('multipart/form-data')) {
        console.log(`📤 [API REQUEST] Body: [FormData - ${Object.keys(config.data).length} fields]`);
      } else {
        const dataPreview = typeof config.data === 'string' 
          ? config.data.substring(0, 200) 
          : JSON.stringify(config.data).substring(0, 200);
        console.log(`📤 [API REQUEST] Body preview:`, dataPreview);
      }
    }

    return config;
  },
  (error) => {
    const timestamp = new Date().toISOString();
    console.error(`❌ [API REQUEST ERROR] [${timestamp}]`, {
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
api.interceptors.response.use(
  (response) => {
    const timestamp = new Date().toISOString();
    console.log(`📥 [API RESPONSE] [${timestamp}] ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log(`📥 [API RESPONSE] Status:`, response.status, response.statusText);
    console.log(`📥 [API RESPONSE] Headers:`, {
      'content-type': response.headers['content-type'],
      'content-length': response.headers['content-length'],
    });
    
    if (response.data) {
      if (response.headers['content-type']?.includes('application/json')) {
        const dataPreview = JSON.stringify(response.data).substring(0, 300);
        console.log(`📥 [API RESPONSE] Data preview:`, dataPreview);
      } else {
        console.log(`📥 [API RESPONSE] Data type:`, typeof response.data, `(${response.data?.length || 'N/A'} bytes)`);
      }
    }

    return response;
  },
  (error) => {
    const timestamp = new Date().toISOString();
    
    if (error.response) {
      // Server responded with error status
      console.error(`❌ [API RESPONSE ERROR] [${timestamp}] ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      console.error(`❌ [API RESPONSE ERROR] Status:`, error.response.status, error.response.statusText);
      console.error(`❌ [API RESPONSE ERROR] Headers:`, error.response.headers);
      
      if (error.response.data) {
        const errorDataPreview = typeof error.response.data === 'string'
          ? error.response.data.substring(0, 300)
          : JSON.stringify(error.response.data).substring(0, 300);
        console.error(`❌ [API RESPONSE ERROR] Error data:`, errorDataPreview);
      }

      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.warn('⚠️ [API RESPONSE ERROR] 401 Unauthorized - Removing token and redirecting to login');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error(`❌ [API NETWORK ERROR] [${timestamp}] ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      console.error(`❌ [API NETWORK ERROR] No response received:`, {
        message: error.message,
        code: error.code,
        config: error.config ? {
          baseURL: error.config.baseURL,
          url: error.config.url,
        } : null,
      });
    } else {
      // Error setting up the request
      console.error(`❌ [API SETUP ERROR] [${timestamp}]`, {
        message: error.message,
        stack: error.stack,
      });
    }

    return Promise.reject(error);
  }
);

export { API_BASE };
export default api;


