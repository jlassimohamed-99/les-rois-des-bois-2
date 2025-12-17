import { API_HOST } from './axios';

// Use the same backend host as the API client (without /api suffix)
const ASSET_BASE = API_HOST || '';

export const withBase = (path = '') => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${ASSET_BASE}${path}`;
};
