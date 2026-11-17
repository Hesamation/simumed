const VERSION = "simumed-v2";
const SHELL = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

async function precache() {
  const cache = await caches.open(VERSION);
  await cache.addAll(SHELL);
  try {
    // Discover hashed build assets from the app shell and cache them too,
    // because the service worker activates only after the first visit.
    const html = await fetch("/", { cache: "no-store" }).then((r) => r.text());
    const urls = [
      ...new Set(html.match(/\/_next\/static\/[^"'\s<>)]+/g) ?? []),
    ];
    await Promise.allSettled(
      urls.map(async (u) => {
        if (await cache.match(u)) return;
        const res = await fetch(u);
        if (res.ok) await cache.put(new Request(u), res.clone());
      }),
    );
  } catch {
    // Offline install: shell-only cache still serves the app.
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Immutable hashed assets and fonts: cache-first.
  const immutable =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff");
  if (immutable) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ??
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(VERSION).then((cache) => cache.put(req, copy));
            return res;
          }),
      ),
    );
    return;
  }

  // Navigations: network-first, fall back to the cached shell offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put("/", copy));
          return res;
        })
        .catch(() =>
          caches.match("/").then((hit) => hit ?? Response.error()),
        ),
    );
    return;
  }

  // Everything else: network-first with cache fallback.
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((cache) => cache.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit ?? Response.error())),
  );
});
