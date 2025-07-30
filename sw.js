// ========= Office Time Calculator PWA – Service Worker ==========
// Version: v6
// Features: Cache core assets, clean old cache, network-first for HTML, cache-first for others

const CACHE_NAME = 'office-time-calculator-cache-v10';

const urlsToCache = [
    '/',                     // root
    '/index.html',
    '/install.html',
    '/about.html',
    '/contactus.html',
    '/privacy.html',
    '/terms.html',
    '/tips.html',
    '/manifest.json',
    '/maincss.css',
    '/script.js',
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
    self.skipWaiting(); // Immediate control
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
    self.clients.claim(); // Take control of clients
});

// ===== Fetch =====
self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const respClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, respClone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
    } else {
        event.respondWith(
            caches.match(event.request).then(cachedResp => {
                return cachedResp || fetch(event.request).then(networkResp => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResp.clone());
                        return networkResp;
                    });
                });
            })
        );
    }
});
