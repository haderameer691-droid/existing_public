const CACHE = 'school-portal-v1'; // غيّري الرقم عند كل تحديث للملفات
const FILES = [
  './',
  './index.html',
  './results.html',
  './results56.html',
  './resolution.html',
  './%D9%86%D8%AA%D8%A7%D8%A6%D8%AC.html', // نتائج.html
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      // تخزين كل ملف على حدة حتى لا يفشل الكل إذا كان أحدها غير موجود
      Promise.allSettled(FILES.map(f => cache.add(f)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// الملفات المخزّنة أولاً، وتُحدَّث من النت في الخلفية عند توفره
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
