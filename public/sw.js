// Minimal Service Worker for ChurchSuite Ghana PWA
const CACHE_NAME = 'churchsuite-gh-v1';

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('PWA: Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('PWA: Cache opened');
        return cache.addAll([
          '/',
          '/manifest.webmanifest',
          '/pwa-192x192.png',
          '/pwa-512x512.png'
        ]);
      })
      .then(() => {
        console.log('PWA: Service Worker installed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('PWA: Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('PWA: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('PWA: Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

console.log('PWA: Service Worker loaded');
