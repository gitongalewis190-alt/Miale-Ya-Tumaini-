/* Miale ya Tumaini · service worker
   Precaches the shell and serves offline.html for navigations when offline.
   Bump CACHE_NAME whenever a shell file changes. */
const CACHE_NAME = 'miale-shell-v5';
const SHELL = ['./', './index.html', './styles.css', './config.js', './supabase-client.js', './app.js', './ux.js', './admin.js', './offline.html',
  './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/logo.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('./offline.html')));
    return;
  }
  event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
