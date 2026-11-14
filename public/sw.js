const C = "ocop-v7";
self.addEventListener("install", (e) =>
  e.waitUntil(caches.open(C).then((cache) => cache.add("/offline.html")).then(() => self.skipWaiting()))
);
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((k) => Promise.all(k.filter((x) => x.startsWith("ocop-v") && x !== C).map((x) => caches.delete(x))))
      .then(() => self.clients.claim())
  )
);
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (
    r.method !== "GET" ||
    new URL(r.url).origin !== location.origin ||
    r.url.includes("/api/") ||
    r.url.includes("/_next/")
  )
    return;
  e.respondWith(
    fetch(r)
      .then((x) => {
        if (x.ok && x.type === "basic" && !x.headers.get("Cache-Control")?.includes("no-store")) {
          const c = x.clone();
          e.waitUntil(caches.open(C).then((h) => h.put(r, c)).catch(() => {}));
        }
        return x;
      })
      .catch(async () => {
        const cache = await caches.open(C);
        const cachedPage = await cache.match(r);
        if (cachedPage) return cachedPage;
        if (r.mode === "navigate") {
          const offlinePage = await cache.match("/offline.html");
          if (offlinePage) return offlinePage;
        }
        return Response.error();
      })
  );
});
