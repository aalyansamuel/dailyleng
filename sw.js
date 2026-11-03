/* DailyLeng · Service Worker. Cambia V en cada versión para que salga el aviso «Hay una versión nueva». */
const V = 'dailyleng-v28';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png',
  'data/fr.js', 'data/ru.js', 'data/en.js', 'data/de.js', 'data/it.js', 'data/pt.js'];

self.addEventListener('install', e => {
  /* no se activa sola: espera a que la página pulse «Actualizar» (mensaje SKIP_WAITING) */
  e.waitUntil(caches.open(V).then(c => Promise.all(FILES.map(f => c.add(new Request(f, { cache: 'reload' }))))));
});
self.addEventListener('message', e => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  if (r.mode === 'navigate') {
    /* la página: primero la red (para recibir versiones nuevas) y sin conexión la copia guardada */
    e.respondWith(fetch(r).catch(() => caches.match('index.html', { ignoreSearch: true })));
    return;
  }
  /* datos e iconos: primero la caché (data/xx.js?v=28 se busca sin la consulta) */
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(m => m || fetch(r).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
    return res;
  })));
});
