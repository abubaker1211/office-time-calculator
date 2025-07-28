
// ========= Office Time Calculator PWA – Service Worker v2 =========
// Changelog:
// - Cache name bumped to v2 to bust old cache
// - Added self.skipWaiting() during install for immediate activation
// - Added clients.claim() during activate to take control without reload
// - Clean old caches more robustly

const CACHE_NAME = 'office-time-calculator-cache-v6';

// URLs to cache – extend this list as you add pages/assets
const urlsToCache = [
    '/',
    '/index.html',
    '/install.html',
    '/about.html',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// ===== Install =====
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching core assets');
                return cache.addAll(urlsToCache);
            })
            .catch(err => console.error('[SW] Install cache error:', err))
    );
    // Force this SW to become active immediately
    self.skipWaiting();
});

// ===== Activate =====
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(name => {
                    if (name !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    }
                })
            );
        })
    );
    // Take control of clients ASAP
    self.clients.claim();
});

// ===== Fetch =====
self.addEventListener('fetch', (event) => {
    // Use network-first strategy for HTML pages to get latest UI
    if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Clone and store in cache
                    const respClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, respClone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // For other requests, try cache first
    event.respondWith(
        caches.match(event.request).then(cachedResp => {
            return cachedResp || fetch(event.request).then(networkResp => {
                // Cache the new resource
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResp.clone());
                    return networkResp;
                });
            });
        })
    );
});
