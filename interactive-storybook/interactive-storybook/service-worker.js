/**
 * service-worker.js
 * Caches the app shell so the storybook keeps working offline / when
 * re-opened from the home screen. Paths are resolved relative to this
 * file's own location so the project works from any subpath
 * (e.g. username.github.io/storybook/).
 */

const CACHE_VERSION = "storybook-v1";

const SHELL_FILES = [
  "",
  "index.html",
  "style.css",
  "script.js",
  "story.js",
  "manifest.json",
  "assets/cover/cover-art.svg",
  "assets/illustrations/ch1-window.svg",
  "assets/illustrations/ch2-letter.svg",
  "assets/illustrations/ch3-forest.svg",
  "assets/illustrations/ch4-house.svg",
  "assets/illustrations/ch5-truth.svg",
  "assets/illustrations/ch6-morning.svg",
  "icons/icon.svg",
  "icons/icon-192.svg",
  "icons/icon-512.svg"
];

function resolveUrls(list) {
  return list.map((p) => new URL(p, self.location).href);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(resolveUrls(SHELL_FILES)))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Network-first for the two CDN-hosted resources (fonts, three.js) so
  // updates arrive when online, falling back to cache when offline.
  const isCrossOrigin = new URL(event.request.url).origin !== self.location.origin;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);

      if (isCrossOrigin) return fetchPromise;
      return cached || fetchPromise;
    })
  );
});
