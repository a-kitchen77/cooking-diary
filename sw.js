const CACHE_NAME = 'cooking-diary-v1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './icon.png'
];

// Install Service Worker
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activate Service Worker
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// Fetch Strategy: Network first, then cache
self.addEventListener('fetch', (e) => {
    // Skip cross-origin requests (like Gemini API)
    if (!e.request.url.startsWith(location.origin)) {
        return;
    }

    e.respondWith(
        fetch(e.request)
            .catch(() => {
                return caches.match(e.request);
            })
    );
});
