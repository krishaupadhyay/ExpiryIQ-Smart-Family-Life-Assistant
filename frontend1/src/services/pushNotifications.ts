import { apiRequest } from './api'

// Converts the VAPID public key from base64 to the Uint8Array format the Push API needs
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window
}

export async function getPushPermissionState(): Promise<NotificationPermission | 'unsupported'> {
  if (!(await isPushSupported())) return 'unsupported'
  return Notification.permission
}

// Registers the service worker, asks for permission, subscribes, and saves the subscription on the backend.
export async function enableBrowserNotifications() {
  if (!(await isPushSupported())) {
    throw new Error('Browser notifications are not supported on this browser/device.')
  }

  const registration = await navigator.serviceWorker.register('/sw.js')

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.')
  }

  const { publicKey } = await apiRequest('/push/public-key', { method: 'GET' })

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey)
  })

  await apiRequest('/push/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription.toJSON())
  })

  return true
}

export async function disableBrowserNotifications() {
  if (!(await isPushSupported())) return

  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration?.pushManager.getSubscription()

  if (subscription) {
    await apiRequest('/push/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ endpoint: subscription.endpoint })
    })
    await subscription.unsubscribe()
  }
}
