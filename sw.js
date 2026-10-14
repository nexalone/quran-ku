const CACHE_NAME = 'alquran-digital-v1';
const ASSETS = [
  './',
  './AL QURAN.html',
  './manifest.json',
  './icon.svg'
];

// Install - cache file statis
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Cache terbuka');
        return cache.addAll(ASSETS).catch(err => {
          console.warn('Cache gagal:', err);
        });
      })
  );
  self.skipWaiting();
});

// Activate - hapus cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch - network first, fallback ke cache
self.addEventListener('fetch', event => {
  // Untuk API, gunakan network-first
  if (event.request.url.includes('equran.id') || 
      event.request.url.includes('aladhan.com') ||
      event.request.url.includes('everyayah.com')) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // File statis: cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return res;
      });
    })
  );
});
