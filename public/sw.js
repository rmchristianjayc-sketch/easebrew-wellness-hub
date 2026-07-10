const CACHE_NAME = 'eb-reminder-v1';
const OFFLINE_URL = '/offline.html';

// Pre-cache the offline page on install
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL))
  );
  // Do NOT call skipWaiting() — let the old SW finish before takeover
  // so active sessions aren't interrupted mid-request
});

self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// Fetch: pass through to network, serve offline page on failure
self.addEventListener('fetch', (event) => {
  // Only handle same-origin navigation requests for the offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }
  // All other requests: network only (API calls, assets)
  event.respondWith(fetch(event.request).catch(() => new Response('', { status: 503 })));
});

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

// ── Reminder logic ─────────────────────────────────────────────────────────────
async function maybeShowReminder() {
  if (!(await isReminderEnabled())) return;
  const now = new Date();
  const h = now.getHours();
  const today = now.toISOString().split('T')[0];

  if (h >= 7 && h < 9 && !(await wasShown(`shown-${today}-am`))) {
    await markShown(`shown-${today}-am`);
    await self.registration.showNotification('EaseBrew — Umaga!', {
      body: 'Inumin mo na ang EaseBrew mo para sa pinakamagandang resulta!',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: `eb-am-${today}`,
      renotify: false,
      data: { url: '/tracker', period: 'umaga' },
      actions: [
        { action: 'log-done', title: '✓ Done!' },
        { action: 'snooze',   title: '⏰ Later'      },
      ],
    });
  } else if (h >= 19 && h < 21 && !(await wasShown(`shown-${today}-pm`))) {
    await markShown(`shown-${today}-pm`);
    await self.registration.showNotification('EaseBrew — Gabi!', {
      body: 'Huwag kalimutang uminom ng EaseBrew bago matulog!',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: `eb-pm-${today}`,
      renotify: false,
      data: { url: '/tracker', period: 'gabi' },
      actions: [
        { action: 'log-done', title: '✓ Done!' },
        { action: 'snooze',   title: '⏰ Later'      },
      ],
    });
  }
}

// ── Expiry notification logic ────────────────────────────────────────────────
async function maybeShowExpiryReminder() {
  const cache = await caches.open(CACHE_NAME);
  const res = await cache.match('session-expiry');
  if (!res) return;
  const { code, expiresAt } = await res.json();
  if (!code || !expiresAt) return;

  const now = Date.now();
  const expiryMs = new Date(expiresAt).getTime();
  const daysLeft = Math.ceil((expiryMs - now) / 86400000);

  // Highest unshown milestone that's still ahead of the current day count.
  // If the SW never ticks on the exact day (very common on mobile), the
  // next tick still catches up so the customer doesn't miss the warning.
  const milestones = [7, 3, 1];
  let milestone = null;
  for (const m of milestones) {
    if (daysLeft > m) continue; // still further out than this milestone
    const t = `shown-expiry-${code}-${m}`;
    if (!(await wasShown(t))) { milestone = m; break; }
  }
  if (milestone === null || daysLeft < 0) return;
  await markShown(`shown-expiry-${code}-${milestone}`);
  const daysLeftLabel = daysLeft <= 0 ? 'ngayong araw'
                      : daysLeft === 1 ? 'bukas'
                      : `sa ${daysLeft} araw`;

  const bodyMap = {
    7: `Mag-e-expire ang access mo ${daysLeftLabel}. Mag-order na para tuloy-tuloy ang wellness journey mo!`,
    3: `${daysLeft} araw na lang bago mag-expire ang access mo. I-order na para hindi maputol!`,
    1: `Mag-e-expire ang access mo ${daysLeftLabel}! Mag-order kaagad para hindi mawala.`,
  };
  const chosenBody = bodyMap[milestone];
  await self.registration.showNotification('EaseBrew — Reminder', {
    body: chosenBody,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: `eb-expiry-${code}-${milestone}`,
    renotify: false,
    data: { url: '/?reorder=1' },
    requireInteraction: milestone <= 3,
  });
}

// ── Reliable reminder scheduling via message from page ────────────────────────
// setInterval in a SW is unreliable on mobile (browser suspends the SW).
// Instead, the page sends a TICK message every 30 minutes while it's open,
// and we also check on every notificationclick (user interaction keeps SW alive).
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

  if (event.data?.type === 'SET_EXPIRY') {
    const cache = await caches.open(CACHE_NAME);
    if (event.data.code && event.data.expiresAt) {
      await cache.put('session-expiry', new Response(JSON.stringify({ code: event.data.code, expiresAt: event.data.expiresAt })));
      maybeShowExpiryReminder();
    } else {
      await cache.delete('session-expiry');
    }
  }

  if (event.data?.type === 'REMINDER_TICK') {
    maybeShowReminder();
    maybeShowExpiryReminder();
  }
});

// ── Web Push (server-sent — future) ──────────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || '☕ EaseBrew', {
      body: data.body || 'You have a new message!',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: data.url || '/', period: data.period },
      actions: [
        { action: 'log-done', title: '✓ Done!' },
        { action: 'snooze',   title: '⏰ Later'      },
      ],
    })
  );
});

// ── Notification tap / action ─────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const period = event.notification.data?.period;

  // Also check reminders on user interaction — keeps SW alive on mobile
  maybeShowReminder();

  if (event.action === 'log-done' && period) {
    const target = `/?quick_log=${period}`;
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
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
    const today = new Date().toISOString().split('T')[0];
    const tag   = period === 'umaga' ? `shown-${today}-am` : `shown-${today}-pm`;
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.delete(tag))
    );
    return;
  }

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
