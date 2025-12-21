import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  const config = {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Build output to ../dist (root level)
    build: {
      outDir: '../dist',
      emptyOutDir: true,
    },
  };

  if (isDev) {
    config.server = {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
        // Proxy uploads in development so that frontend can use relative /uploads URLs
        '/uploads': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    };
  }

  return config;
});

