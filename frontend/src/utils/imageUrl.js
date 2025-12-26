// Get backend URL for images
// In production, frontend and backend are on different domains
// So we need to use the full backend URL for images
const getBackendUrl = () => {
  // Check if we have VITE_API_URL set (which includes /api)
  const apiUrl = import.meta.env.VITE_API_URL || 'https://les-rois-du-bois-back.2bj94x.easypanel.host/api';
  // Remove /api to get base backend URL
  return apiUrl.replace('/api', '');
};

export const withBase = (path = '') => {
  if (!path) return '';
  // If already a full URL, return as-is
  if (path.startsWith('http')) return path;
  // In production, use full backend URL
  // In development, relative paths work because of proxy
  const backendUrl = getBackendUrl();
  return `${backendUrl}${path}`;
};
