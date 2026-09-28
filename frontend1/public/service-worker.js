// public/service-worker.js
// Must live at the site root (e.g. /public/service-worker.js in a Vite/CRA app)
// so its scope covers the whole origin.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Fired when the backend sends a push via web-push (push.controller.js -> sendPushToUser)
self.addEventListener('push', (event) => {
  let payload = { title: 'ExpiryIQ', body: 'You have a new reminder.', url: '/' }

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() }
    } catch {
      payload.body = event.data.text()
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icon-192.png',   // swap for your real app icon, or remove this line
      badge: '/icon-192.png',
      data: { url: payload.url || '/' }
    })
  )
})

// Fired when the user taps/clicks the notification — focuses an open tab or opens a new one
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        const clientUrl = new URL(client.url)
        if (clientUrl.pathname === targetUrl && 'focus' in client) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})
