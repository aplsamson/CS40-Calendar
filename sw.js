const CACHE_NAME = 'cs40-calendar-v1';
const urlsToCache = [
  './index.html',
  './manifest.json',
  'https://www.aviatorgear.com/images/product/large/39950.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});