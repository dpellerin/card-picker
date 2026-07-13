const CACHE_NAME = 'card-picker-v1'
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace']
const suits = ['clubs', 'diamonds', 'hearts', 'spades']
const cardAssets = ranks.flatMap((rank) =>
  suits.map((suit) => `cards/${rank}_of_${suit}.svg`),
)
const staticAssets = [
  'index.html',
  'site.webmanifest',
  'card-back.png',
  'apple-touch-icon.png',
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'android-chrome-192x192.png',
  'android-chrome-512x512.png',
  ...cardAssets,
]

function appUrl(path = './') {
  return new URL(path, self.registration.scope).href
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME)
    const homeResponse = await fetch(appUrl(), { cache: 'reload' })

    if (!homeResponse.ok) throw new Error('Unable to cache the app shell')

    const html = await homeResponse.clone().text()
    const builtAssets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
      .map((match) => new URL(match[1], appUrl()).href)
      .filter((url) => url.startsWith(self.registration.scope))

    await cache.put(appUrl(), homeResponse)
    await cache.addAll([...new Set([...staticAssets.map(appUrl), ...builtAssets])])
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys()
    await Promise.all(
      cacheNames
        .filter((name) => name.startsWith('card-picker-') && name !== CACHE_NAME)
        .map((name) => caches.delete(name)),
    )
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request)
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME)
          await cache.put(appUrl(), response.clone())
        }
        return response
      } catch {
        return (await caches.match(request)) ?? caches.match(appUrl())
      }
    })())
    return
  }

  event.respondWith((async () => {
    const cachedResponse = await caches.match(request)
    const networkResponse = fetch(request).then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME)
        await cache.put(request, response.clone())
      }
      return response
    })

    if (cachedResponse) {
      event.waitUntil(networkResponse.catch(() => undefined))
      return cachedResponse
    }

    return networkResponse
  })())
})
