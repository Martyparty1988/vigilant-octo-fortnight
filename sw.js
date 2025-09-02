const CACHE_NAME = 'fofr-pedro-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.css',
  '/index.tsx',
  'https://fonts.googleapis.com/css2?family=Teko:wght@500&family=Share+Tech+Mono&display=swap',
  'https://fonts.gstatic.com/s/teko/v20/Gg8vN4-ekbnmjA-ORmo.woff2',
  'https://fonts.gstatic.com/s/sharetechmono/v15/Jwc5Vnp1iV6_isZZpcV_Ik5-QkOd7g.woff2',
  '/assets/icons/icon-192x192.svg',
  '/assets/icons/icon-512x512.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});