// This runs in the background, separately from your React app — even when the tab is closed.

self.addEventListener('push', (event) => {
  let data = { title: 'ExpiryIQ', body: 'You have a new alert.', url: '/' };

  try {
    data = event.data.json();
  } catch (e) {
    // If the payload isn't JSON for some reason, fall back to the default above
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',   // optional — add this file to /public if you want a custom icon
      badge: '/icon-192.png',
      data: { url: data.url || '/' }
    })
  );
});

// Clicking the notification focuses/opens the app to the relevant page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
