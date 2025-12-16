const API_BASE = import.meta.env.VITE_API_URL || '';

export const withBase = (path = '') => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
};
