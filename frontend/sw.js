/**
 * Service Worker: CMS Manager LHK (PWA)
 * Versi Cache: v1.0.0
 */

const CACHE_NAME = 'lhk-cms-v2.7';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/style.css',
  '/css/mobile-first.css',
  '/css/cms-desktop.css',
  '/js/dialog.js',
  '/js/api.js',
  '/js/auth.js',
  '/js/cms-router.js',
  '/js/dashboard.js',
  '/js/wizard.js',
  '/js/riwayat.js',
  '/js/dokumen.js',
  '/js/cptp.js',
  '/js/admin.js',
  '/js/subscription.js',
  '/js/image-compressor.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/favicon.png'
];

// 1. Install Event: Cache Asset Statis
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Bersihkan Cache Lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Network-First untuk API, Cache-First untuk Aset Statis
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Jangan cache panggilan API backend (harus selalu data terbaru)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({
          sukses: false,
          pesan: 'Koneksi internet terputus. Silakan periksa jaringan Anda.'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Untuk aset CDN eksternal (Bootstrap, Google Fonts, Heic2any)
  if (url.origin !== location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse);
      })
    );
    return;
  }

  // Untuk file aplikasi lokal: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((err) => {
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});

