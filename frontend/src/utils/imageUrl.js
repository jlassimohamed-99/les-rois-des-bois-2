// Use relative path for uploads - same origin, no CORS needed
// Uploads are served at /uploads/* by Express
const ASSET_BASE = '';

export const withBase = (path = '') => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${ASSET_BASE}${path}`;
};
