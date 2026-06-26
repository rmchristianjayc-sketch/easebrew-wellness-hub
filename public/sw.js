const CACHE_NAME = 'eb-reminder-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => event.respondWith(fetch(event.request)));

// ── Preference helpers (Cache API — localStorage not available in SW) ─────────
async function isReminderEnabled() {
  const cache = await caches.open(CACHE_NAME);
  const res = await cache.match('reminder-enabled');
  return res ? (await res.text()) === '1' : false;
}
async function markShown(tag) {
  const cache = await caches.open(CACHE_NAME);
  await cache.put(tag, new Response('1'));
}
async function wasShown(tag) {
  const cache = await caches.open(CACHE_NAME);
  return !!(await cache.match(tag));
}

// ── Background reminder scheduler (every 30 min while browser open) ──────────
async function maybeShowReminder() {
  if (!(await isReminderEnabled())) return;
  const now = new Date();
  const h = now.getHours();
  const today = now.toISOString().split('T')[0];

  if (h >= 7 && h < 9 && !(await wasShown(`shown-${today}-am`))) {
    await markShown(`shown-${today}-am`);
    await self.registration.showNotification('☕ EaseBrew — Umaga!', {
      body: 'Inumin na ang EaseBrew mo para sa pinakamabilis na resulta!',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: `eb-am-${today}`,
      renotify: false,
      data: { url: '/tracker', period: 'umaga' },
      actions: [
        { action: 'log-done', title: '✓ Naiinom Na!' },
        { action: 'snooze',   title: '⏰ Mamaya'      },
      ],
    });
  } else if (h >= 19 && h < 21 && !(await wasShown(`shown-${today}-pm`))) {
    await markShown(`shown-${today}-pm`);
    await self.registration.showNotification('🌙 EaseBrew — Gabi!', {
      body: 'Huwag kalimutang inumin ang EaseBrew bago matulog!',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: `eb-pm-${today}`,
      renotify: false,
      data: { url: '/tracker', period: 'gabi' },
      actions: [
        { action: 'log-done', title: '✓ Naiinom Na!' },
        { action: 'snooze',   title: '⏰ Mamaya'      },
      ],
    });
  }
}

setInterval(maybeShowReminder, 30 * 60 * 1000);

// ── Message from page ─────────────────────────────────────────────────────────
self.addEventListener('message', async (event) => {
  if (event.data?.type === 'SET_REMINDER') {
    const cache = await caches.open(CACHE_NAME);
    if (event.data.enabled) {
      await cache.put('reminder-enabled', new Response('1'));
      maybeShowReminder();
    } else {
      await cache.delete('reminder-enabled');
    }
  }
});

// ── Web Push (server-sent — future) ──────────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || '☕ EaseBrew', {
      body: data.body || 'May mensahe para sa inyo!',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: data.url || '/', period: data.period },
      actions: [
        { action: 'log-done', title: '✓ Naiinom Na!' },
        { action: 'snooze',   title: '⏰ Mamaya'      },
      ],
    })
  );
});

// ── Notification tap / action ─────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const period = event.notification.data?.period;

  if (event.action === 'log-done' && period) {
    // Open app with quick_log param so the home page auto-logs the intake
    const target = `/?quick_log=${period}`;
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        // If app already open, post a message to it
        const existing = clients.find((c) => c.url.includes(self.location.origin));
        if (existing) {
          existing.postMessage({ type: 'QUICK_LOG', period });
          return existing.focus();
        }
        return self.clients.openWindow(target);
      })
    );
    return;
  }

  if (event.action === 'snooze') {
    // Snooze: clear the "shown" flag for this period so it fires again in 1h
    const today = new Date().toISOString().split('T')[0];
    const tag   = period === 'umaga' ? `shown-${today}-am` : `shown-${today}-pm`;
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.delete(tag))
    );
    return;
  }

  // Default tap — open tracker
  const url = event.notification.data?.url || '/tracker';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(self.location.origin));
      if (existing) {
        existing.postMessage({ type: 'NAVIGATE', url });
        return existing.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
