const C = "ocop-v6";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((k) => Promise.all(k.map((x) => caches.delete(x))))
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
        const c = x.clone();
        caches.open(C).then((h) => h.put(r, c));
        return x;
      })
      .catch(() => caches.match(r).then((m) => m || caches.match("/diary")))
  );
});
