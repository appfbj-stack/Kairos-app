// Service worker DESATIVADO - desinstala qualquer versao antiga cacheada
// Resolve problema de cache do navegador mostrando PWA antigo apos deploys.
self.addEventListener("install", (e) => { self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil(
    self.registration.unregister().then(() => self.clients.matchAll()).then((clients) => {
      clients.forEach((c) => c.navigate(c.url));
    })
  );
});
