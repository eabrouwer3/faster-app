// Minimal service worker: enables installability and web push notifications.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});

self.addEventListener('push', (event) => {
	let data = { title: 'FASTER Scale', body: 'Time for a check-in.', url: '/app/check-in' };
	try {
		if (event.data) data = { ...data, ...event.data.json() };
	} catch {}
	event.waitUntil(
		self.registration.showNotification(data.title, {
			body: data.body,
			icon: '/icon-192.png',
			badge: '/icon-192.png',
			data: { url: data.url }
		})
	);
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const url = event.notification.data?.url || '/app';
	event.waitUntil(
		self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
			for (const c of list) {
				if ('focus' in c) {
					c.navigate(url);
					return c.focus();
				}
			}
			return self.clients.openWindow(url);
		})
	);
});
