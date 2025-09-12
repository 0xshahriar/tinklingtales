const CACHE_NAME = "image-cache-v1";
const MAX_AGE = 60 * 60 * 1000; // 1 hour in ms

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  
  // Only cache images in /images/ path
  if (url.pathname.startsWith("/images/")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        
        if (cachedResponse) {
          // Check age
          const dateHeader = cachedResponse.headers.get("sw-cache-time");
          if (dateHeader && Date.now() - parseInt(dateHeader, 10) < MAX_AGE) {
            return cachedResponse;
          }
        }
        
        // Fetch fresh
        const response = await fetch(event.request);
        
        // Clone with custom header so we can track age
        const headers = new Headers(response.headers);
        headers.append("sw-cache-time", Date.now().toString());
        
        const cloned = new Response(await response.blob(), {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
        
        cache.put(event.request, cloned.clone());
        return cloned;
      })
    );
  }
});