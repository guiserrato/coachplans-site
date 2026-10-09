const CACHE = "coachplans-golden-warriors-4ccb2a0299eb942c";
const FILES = ["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png","./payload.json","./content/team-logo.json","./content/9602eaa2761266042a47af2c.json"];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) =>
    cache.addAll(FILES.map((file) => new Request(file, { cache: "reload" }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((key) => key.startsWith("coachplans-golden-warriors-") && key !== CACHE)
      .map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || !request.url.startsWith(self.registration.scope)) return;
  if (request.mode === "navigate") {
    event.respondWith(caches.match("./index.html").then((cached) => cached || fetch(request)));
    return;
  }
  event.respondWith(caches.match(request).then(async (cached) => {
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok && new URL(request.url).pathname.endsWith(".json")) {
      event.waitUntil(caches.open(CACHE).then((cache) =>
        cache.put(request, response.clone())).catch((error) =>
        console.error("Unable to save encrypted plan offline:", error)));
    }
    return response;
  }));
});
