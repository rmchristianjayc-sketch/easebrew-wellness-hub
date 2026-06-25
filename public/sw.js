const CACHE_NAME = 'eb-reminder-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});

// ── Background reminder scheduler ────────────────────────────────────────────
// Checks every 30 minutes. Works even when app tab is in background/minimized.
// Requires browser to be open; does NOT fire when browser is fully closed.
const INTERVAL_MS = 30 * 60 * 1000;

async function isReminderEnabled() {
  const cache = await caches.open(CACHE_NAME);
  const res = await cache.match('reminder-enabled');
  if (!res) return false;
  return (await res.text()) === '1';
}

async function markShown(tag) {
  const cache = await caches.open(CACHE_NAME);
  await cache.put(tag, new Response('1'));
}

async function wasShown(tag) {
  const cache = await caches.open(CACHE_NAME);
  const res = await cache.match(tag);
  return !!res;
}

async function maybeShowReminder() {
  if (!(await isReminderEnabled())) return;

  const now = new Date();
  const h = now.getHours();
  const today = now.toISOString().split('T')[0];

  const amTag = `shown-${today}-am`;
  const pmTag = `shown-${today}-pm`;

  if (h >= 7 && h <= 9 && !(await wasShown(amTag))) {
    await markShown(amTag);
    await self.registration.showNotification('☕ EaseBrew — Umaga!', {
      body: 'Inumin na ang EaseBrew mo para sa pinakamabilis na resulta!',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: amTag,
      renotify: false,
      data: { url: '/tracker' },
    });
  } else if (h >= 19 && h <= 21 && !(await wasShown(pmTag))) {
    await markShown(pmTag);
    await self.registration.showNotification('🌙 EaseBrew — Gabi!', {
      body: 'Huwag kalimutang inumin ang EaseBrew bago matulog!',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: pmTag,
      renotify: false,
      data: { url: '/tracker' },
    });
  }
}

setInterval(maybeShowReminder, INTERVAL_MS);

// ── Message from page (enable/disable reminder) ───────────────────────────────
self.addEventListener('message', async (event) => {
  if (event.data?.type === 'SET_REMINDER') {
    const cache = await caches.open(CACHE_NAME);
    if (event.data.enabled) {
      await cache.put('reminder-enabled', new Response('1'));
      // Immediately check if we should show one now
      maybeShowReminder();
    } else {
      await cache.delete('reminder-enabled');
    }
  }
});

// ── Web Push (for future server-sent notifications) ───────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || '☕ EaseBrew', {
      body: data.body || 'May mensahe para sa inyo!',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: data.url || '/' },
    })
  );
});

// ── Open app on notification tap ──────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(self.location.origin));
      if (existing) {
        existing.navigate(url);
        return existing.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
