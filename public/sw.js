// Aufraeum-Service-Worker: ersetzt den alten PWA-Service-Worker auf Geraeten,
// auf denen er noch installiert ist. Er loescht alle Caches, meldet sich ab
// und laedt die App einmal neu. Danach wird kein Service Worker mehr benoetigt.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((c) => c.navigate(c.url));
  })());
});
