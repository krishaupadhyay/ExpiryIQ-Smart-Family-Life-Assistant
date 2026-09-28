import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../services/api'

// Converts the VAPID public key (base64url string) into the Uint8Array format
// the Push API's subscribe() call expects.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

type PushStatus = 'unsupported' | 'default' | 'denied' | 'subscribed' | 'not-subscribed'

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>('default')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window

  const refreshStatus = useCallback(async () => {
    if (!isSupported) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setStatus('denied')
      return
    }
    const registration = await navigator.serviceWorker.getRegistration()
    const existing = await registration?.pushManager.getSubscription()
    setStatus(existing ? 'subscribed' : 'not-subscribed')
  }, [isSupported])

  useEffect(() => {
    refreshStatus()
  }, [refreshStatus])

  async function ensureServiceWorker(): Promise<ServiceWorkerRegistration> {
    const registration = await navigator.serviceWorker.register('/service-worker.js')
    await navigator.serviceWorker.ready
    return registration
  }

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser.')
      return
    }

    setError('')
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'denied' : 'not-subscribed')
        return
      }

      const registration = await ensureServiceWorker()

      const { publicKey } = await apiRequest('/push/public-key', { method: 'GET' })
      if (!publicKey) throw new Error('Push is not configured on the server (missing VAPID public key).')

      let subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        })
      }

      const raw = subscription.toJSON()
      await apiRequest('/push/subscribe', {
        method: 'POST',
        body: JSON.stringify({ endpoint: raw.endpoint, keys: raw.keys })
      })

      setStatus('subscribed')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not enable push notifications.')
    } finally {
      setLoading(false)
    }
  }, [isSupported])

  const unsubscribe = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      const subscription = await registration?.pushManager.getSubscription()

      if (subscription) {
        await apiRequest('/push/unsubscribe', {
          method: 'POST',
          body: JSON.stringify({ endpoint: subscription.endpoint })
        })
        await subscription.unsubscribe()
      }

      setStatus('not-subscribed')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not disable push notifications.')
    } finally {
      setLoading(false)
    }
  }, [])

  return { status, loading, error, subscribe, unsubscribe, isSupported }
}
