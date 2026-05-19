import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../services/api';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  let registration = await navigator.serviceWorker.getRegistration('/');
  if (!registration) {
    registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  }
  return navigator.serviceWorker.ready;
}

export function usePushNotifications() {
  const { token } = useAuth();
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const refreshSubscriptionState = useCallback(async () => {
    if (!supported) return;
    try {
      const registration = await navigator.serviceWorker.getRegistration('/');
      const sub = await registration?.pushManager.getSubscription();
      setSubscribed(!!sub);
    } catch {
      setSubscribed(false);
    }
  }, [supported]);

  useEffect(() => {
    const ok =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    setSupported(ok);
  }, []);

  useEffect(() => {
    refreshSubscriptionState();
  }, [refreshSubscriptionState, token]);

  const subscribe = useCallback(async () => {
    if (!token || !supported) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError('Notification permission denied in browser settings');
        return;
      }

      const { publicKey } = await api.getVapidPublicKey();
      const registration = await getServiceWorkerRegistration();

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
        });
      }

      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error('Invalid push subscription');
      }

      await api.subscribePush(token, {
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      });

      setSubscribed(true);
      setSuccess('Push enabled. Try “Send test notification”.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to enable push');
    } finally {
      setLoading(false);
    }
  }, [token, supported]);

  const unsubscribe = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const registration = await navigator.serviceWorker.getRegistration('/');
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await api.unsubscribePush(token, subscription.endpoint);
        await subscription.unsubscribe();
      }
      setSubscribed(false);
      setSuccess('Push notifications disabled');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable push');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const sendTest = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.testPush(token);
      setSuccess('Test sent — check your system notifications (top-right on Mac).');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Test push failed');
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    supported,
    subscribed,
    loading,
    error,
    success,
    subscribe,
    unsubscribe,
    sendTest,
  };
}
