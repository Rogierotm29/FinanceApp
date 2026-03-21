const CACHE = "appfinanzas-v2";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);

  // Never cache HTML — always fetch fresh so deploys se ven inmediato
  if (e.request.headers.get("accept")?.includes("text/html") || url.pathname === "/") {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  // Cache-first para assets con hash (JS, CSS, fonts, images)
  // Vite genera hashes únicos por build, así que es seguro cachearlos
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached;
        return fetch(e.request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((cache) => cache.put(e.request, clone));
          }
          return res;
        });
      })
    );
  }
});
