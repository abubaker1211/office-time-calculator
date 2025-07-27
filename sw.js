const CACHE_NAME = 'office-time-calculator-cache-v1';
// Un files ki list jinhe Service Worker cache karega
const urlsToCache = [
    '/',
    '/index.html',
    // Agar aapki CSS aur JS files alag-alag hain, toh unke paths yahan add karein
    // '/style.css', // Agar aapki CSS file alag hai
    // '/script.js', // Agar aapki JS file alag hai
    '/manifest.json',
    // Apne icons ke paths yahan add karein
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Install event: Jab Service Worker install hota hai, files ko cache karta hai
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Cache opened');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Service Worker: Failed to cache during install:', error);
            })
    );
});

// Fetch event: Network requests ko intercept karta hai
self.addEventListener('fetch', (event) => {
    // Yahan galti thi: 'respondoth' ko 'respondWith' kiya gaya hai
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Agar cache mein response milta hai, toh woh return karein
                if (response) {
                    console.log('Service Worker: Serving from cache:', event.request.url);
                    return response;
                }
                // Agar cache mein nahi milta, toh network se fetch karein
                console.log('Service Worker: Fetching from network:', event.request.url);
                return fetch(event.request);
            })
            .catch(error => {
                console.error('Service Worker: Fetch failed:', error);
                // Offline hone par fallback content provide kar sakte hain
                // return caches.match('/offline.html'); // Agar aapke paas offline page hai
            })
    );
});

// Activate event: Purane caches ko clean karta hai
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
