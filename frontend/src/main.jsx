import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Application startup logging
console.log('='.repeat(50));
console.log('🚀 FRONTEND APPLICATION STARTING');
console.log('='.repeat(50));
console.log('📅 Started at:', new Date().toISOString());
console.log('🌐 Environment:', import.meta.env.MODE || 'development');
console.log('🌐 API URL:', import.meta.env.VITE_API_URL || 'Not set (using fallback)');
console.log('🌐 Base URL:', window.location.origin);
console.log('🌐 User Agent:', navigator.userAgent.substring(0, 80));
console.log('🌐 Window Size:', `${window.innerWidth}x${window.innerHeight}`);
console.log('='.repeat(50));

// Global error handler
window.addEventListener('error', (event) => {
  console.error('❌ [GLOBAL ERROR]', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    timestamp: new Date().toISOString(),
  });
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ [UNHANDLED PROMISE REJECTION]', {
    reason: event.reason,
    promise: event.promise,
    timestamp: new Date().toISOString(),
  });
});

// Log when app is mounted
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

console.log('✅ [APP] React app mounted successfully');
console.log('📱 [APP] Strict Mode: Enabled');

