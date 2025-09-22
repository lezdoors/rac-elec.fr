/**
 * Service Worker for Core Web Vitals Optimization
 * Aggressive caching for static assets and API responses
 */

const CACHE_NAME = 'portail-electricite-v2025.9.22';
const STATIC_CACHE = 'static-v2025.9.22';
const API_CACHE = 'api-v2025.9.22';

// Assets to cache immediately (Core Web Vitals critical resources)
const CRITICAL_ASSETS = [
  '/',
  '/src/main.tsx',
  '/performance-optimizer.js',
  '/fonts/inter-latin-400-normal.woff2',
  '/fonts/inter-latin-600-normal.woff2',
  '/fonts/inter-latin-700-normal.woff2',
  '/favicon-new.svg',
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('✅ SW: Caching critical assets for LCP optimization');
        return cache.addAll(CRITICAL_ASSETS);
      })
    ])
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => 
            cacheName !== STATIC_CACHE && 
            cacheName !== API_CACHE &&
            cacheName !== CACHE_NAME
          )
          .map((cacheName) => {
            console.log('🗑️ SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - advanced caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-http requests
  if (!url.protocol.startsWith('http')) return;

  // API requests - cache with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        try {
          // Try network first for fresh data
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            // Cache successful responses
            cache.put(request, networkResponse.clone());
            return networkResponse;
          }
        } catch (error) {
          // Network failed, try cache
          console.log('📱 SW: Network failed, serving from cache');
        }
        
        // Fallback to cache
        const cachedResponse = await cache.match(request);
        if (cachedResponse) return cachedResponse;
        
        // No cache available
        throw new Error('No cached response available');
      })
    );
    return;
  }

  // Static assets - cache-first strategy for performance
  if (
    url.pathname.includes('/fonts/') ||
    url.pathname.includes('/assets/') ||
    url.pathname.includes('.js') ||
    url.pathname.includes('.css') ||
    url.pathname.includes('.woff2') ||
    url.pathname.includes('.svg')
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        // Check cache first for static assets
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          // Update cache in background
          fetch(request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
          }).catch(() => {
            // Network error, but we have cached version
          });
          return cachedResponse;
        }

        // Not in cache, fetch from network
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          }
        } catch (error) {
          console.log('📱 SW: Failed to fetch static asset:', request.url);
        }

        // Return a basic fallback for missing assets
        return new Response('Asset not available', { status: 404 });
      })
    );
    return;
  }

  // HTML pages - network-first with cache fallback
  if (request.mode === 'navigate' || 
      (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'))) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        try {
          // Try network first for fresh HTML
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          }
        } catch (error) {
          console.log('📱 SW: Network failed for HTML, trying cache');
        }

        // Fallback to cache
        const cachedResponse = await cache.match(request);
        if (cachedResponse) return cachedResponse;

        // Fallback to index.html for SPA routing
        const indexResponse = await cache.match('/');
        if (indexResponse) return indexResponse;

        // Ultimate fallback
        return new Response('Page not available offline', { 
          status: 503,
          headers: { 'Content-Type': 'text/html' }
        });
      })
    );
    return;
  }

  // All other requests - default behavior
  event.respondWith(fetch(request));
});

// Background sync for performance metrics
self.addEventListener('sync', (event) => {
  if (event.tag === 'performance-metrics') {
    event.waitUntil(
      // Send performance metrics when back online
      console.log('📊 SW: Syncing performance metrics')
    );
  }
});

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log('📬 SW: Push notification received:', data);
  }
});