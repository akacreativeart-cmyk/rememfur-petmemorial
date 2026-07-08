/* Rememfur service worker — minimal app-shell cache + network-first for data. */
const VERSION = "rememfur-v1";
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;
const OFFLINE_URL = "/offline.html";
const SHELL_URLS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL).then((c) => c.addAll(SHELL_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((n) => n !== SHELL && n !== RUNTIME).map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

function isDataRequest(url) {
  // Never serve stale user/api data.
  return (
    url.pathname.startsWith("/_serverFn/") ||
    url.pathname.startsWith("/api/") ||
    url.hostname.endsWith(".supabase.co") ||
    url.hostname.endsWith(".supabase.in")
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin && !isDataRequest(url)) return;

  // Network-first for API/data — never cache.
  if (isDataRequest(url)) {
    event.respondWith(fetch(req).catch(() => new Response("", { status: 503 })));
    return;
  }

  // HTML navigations: network-first, offline fallback.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req);
        } catch {
          const cache = await caches.open(SHELL);
          return (await cache.match(OFFLINE_URL)) || Response.error();
        }
      })()
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  event.respondWith(
    (async () => {
      const cache = await caches.open(RUNTIME);
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res.ok && res.type === "basic") cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })()
  );
});
