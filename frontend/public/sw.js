const CACHE_NAME = 'les-rois-du-bois-v1';
const urlsToCache = [
  '/',
  '/login',
  '/admin/dashboard',
  '/shop',
  '/logo.webp',
  '/logo-light.webp',
  '/logo-dark.webp'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Always bypass the service worker cache for:
  // 1. API requests
  // 2. Cross-origin requests (backend)
  // 3. Non-GET requests (POST, PUT, DELETE, etc. cannot be cached)
  if (
    url.pathname.startsWith('/api') || 
    url.origin !== self.location.origin ||
    event.request.method !== 'GET'
  ) {
    return; // Let the request go through without caching
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Cache miss - fetch from network
        return fetch(event.request).then(
          (response) => {
            // Check if valid response (only cache GET requests with 200 status)
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // Clone the response
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Only cache GET requests
                if (event.request.method === 'GET') {
                  cache.put(event.request, responseToCache);
                }
              });
            return response;
          }
        );
      })
      .catch((error) => {
        // If cache and network both fail, return error
        console.error('[Service Worker] Fetch error:', error);
        throw error;
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
