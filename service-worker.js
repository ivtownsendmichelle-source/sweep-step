const CACHE_NAME = 'sweepstep-v4';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/style.css',
  '/js/app.js',
  '/js/pip.js',
  '/js/inventory.js',
  '/js/fears.js',
  '/js/sex-inventory.js',
  '/js/steps.js',
  '/js/community.js',
  '/js/me.js',
  '/js/quotes.js',
  '/js/storage.js',
  '/js/patterns.js',
  '/js/promises.js',
  '/js/beliefs.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('docs.google.com') || event.request.url.includes('spreadsheets.google.com')) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      if (event.request.destination === 'document') {
        return caches.match('/index.html');
      }
    })
  );
});
