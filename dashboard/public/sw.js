// Service Worker oficial de Blackbox F1 PWA
const CACHE_NAME = 'blackbox-f1-v1';
const PRECACHE_ASSETS = ['/', '/favicon.png', '/manifest.json'];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(PRECACHE_ASSETS).catch(() => {});
		})
	);
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames
					.filter((name) => name !== CACHE_NAME)
					.map((name) => caches.delete(name))
			);
		})
	);
	self.clients.claim();
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
		return;
	}

	event.respondWith(
		fetch(event.request)
			.then((response) => {
				return response;
			})
			.catch(() => {
				return caches.match(event.request).then((cachedResponse) => {
					if (cachedResponse) {
						return cachedResponse;
					}
					if (event.request.mode === 'navigate') {
						return caches.match('/');
					}
					return new Response('Sin conexión a Internet', {
						status: 503,
						statusText: 'Service Unavailable',
						headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' }),
					});
				});
			})
	);
});

// Sincronización en segundo plano (Background Sync)
self.addEventListener('sync', (event) => {
	// Mantiene sincronizada la sesión en segundo plano
});

// Sincronización periódica (Periodic Background Sync)
self.addEventListener('periodicsync', (event) => {
	// Verificación periódica de estados
});

// Notificaciones Push (Push Notifications)
self.addEventListener('push', (event) => {
	if (event.data) {
		const data = event.data.json();
		self.registration.showNotification(data.title || 'Blackbox F1', {
			body: data.body || 'Alerta de carrera en vivo',
			icon: '/icons/icon-192x192.png',
		});
	}
});
