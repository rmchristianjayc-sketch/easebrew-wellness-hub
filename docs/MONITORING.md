# Monitoring — R&M EaseBrew Wellness Hub

Covers error tracking (Sentry) and how to triage production issues.

---

## 1. Sentry

Sentry captures unhandled exceptions from client (browser), server (API routes, RSC), and edge (middleware) runtimes.

### Setup (one-time)

1. Create a free Sentry account at https://sentry.io
2. Create a new project — select "Next.js" as the platform
3. Copy the DSN Sentry gives you (looks like `https://xxx@xxx.ingest.sentry.io/123456`)
4. Add these env vars in **Vercel** (Production + Preview scopes):

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SENTRY_DSN` | the DSN from step 3 |
   | `SENTRY_DSN` | same DSN (server-side) |
   | `SENTRY_ENV` | `production` (or `preview`) |
   | `NEXT_PUBLIC_SENTRY_ENV` | same as `SENTRY_ENV` |

5. Optional — for source-map upload (better stack traces in Sentry):

   | Name | Value |
   |------|-------|
   | `SENTRY_ORG` | your Sentry org slug |
   | `SENTRY_PROJECT` | your Sentry project slug |
   | `SENTRY_AUTH_TOKEN` | a Sentry auth token with `project:write` scope |

6. Also add the same secrets to GitHub Actions if you want CI to upload sourcemaps too. Not required — CI will build fine without them.

### Behavior

- **No DSN set:** Sentry is a full no-op. Local dev, CI, and any deploy without the env var work exactly as before.
- **DSN set:** unhandled errors + unhandled promise rejections are reported. React error boundaries are triggered by `app/global-error.tsx`.

### What is captured

- Server errors from `/api/*` routes (any thrown/uncaught exception)
- Client errors during React render/hydrate
- Middleware errors in `proxy.ts`
- Unhandled promise rejections
- Custom `Sentry.captureException(err)` and `Sentry.captureMessage(msg)` calls

### What is NOT captured (intentional ignoreErrors list)

- `Unauthorized` — normal 401 responses when session expires
- `Too many attempts` — normal 429 responses when rate limit hit
- `NEXT_REDIRECT` / `NEXT_NOT_FOUND` — Next.js internal control flow, not real errors
- `ResizeObserver loop limit exceeded` — hydration noise, harmless
- `Non-Error promise rejection captured` — usually browser extensions

These would flood the inbox otherwise. If a real bug ever hides behind one of them, add the specific case to `sentry.*.config.ts`'s `beforeSend` instead of removing the filter.

### PII filtering

`beforeSend` in every config strips `Cookie` and `Authorization` headers from every event. The customer session JWT never reaches Sentry.

If we ever add breadcrumbs that could contain PII (customer name, address, health data), extend `beforeSend` to redact those fields before returning the event.

### Tunneling

`next.config.ts` sets `tunnelRoute: "/monitoring"` — Sentry events are proxied through our own domain instead of hitting `sentry.io` directly. This survives ad-blockers (uBlock Origin blocks `*.sentry.io` by default) and keeps the CSP simple (no `sentry.io` allowlist needed).

---

## 2. Triage flow

When Sentry alerts you (email/Slack, whatever integrations you set up):

1. Open the event. Look at:
   - **Message** — the error string
   - **Stack trace** — file + line (map to source if sourcemaps uploaded)
   - **Request** — URL, method, status (no cookies — see above)
   - **Tags** — `environment`, `release`, `browser`, `os`
   - **Breadcrumbs** — the last N user actions before the crash

2. Check `git log` or the Sentry release marker to see which deploy introduced it.

3. If it's blocking customers:
   - Roll back the offending deploy in Vercel (Deployments → previous → "Promote to Production")
   - Investigate offline

4. If it's a paper cut (one-off, or specific to a rare code path):
   - Open a task with the Sentry event URL
   - Fix in the next PR
   - Verify Sentry stops seeing it after deploy

### When to add breadcrumbs

If a user reports a bug that Sentry didn't catch (or caught with no useful context), add a `Sentry.addBreadcrumb({...})` call around the suspected code path. Deploy. Wait for the next occurrence.

---

## 3. Uptime (external, Phase 5)

Sentry catches things that happen — not things that don't happen. For "is the app up?" checks, use an external uptime monitor (Better Stack, UptimeRobot). See Phase 5 in `ROADMAP.md`.

---

## 4. Analytics (external, Phase 5)

Sentry is for errors, not usage metrics. For "how many customers used the tracker this week?" use Plausible/Umami. See Phase 5 in `ROADMAP.md`.

---

## 5. Cost / rate limits

Sentry free tier includes:
- 5,000 errors/month
- 10,000 performance events/month
- 500 replays/month
- 1 team member

Our sampling config (`tracesSampleRate: 0.1`) keeps performance events at ~10% of traffic. At current traffic (hundreds of daily requests), this should stay under the free-tier ceiling.

If we blow through it, either:
- Lower `tracesSampleRate` toward 0.01
- Upgrade to a paid Sentry plan (~$26/mo)
- Self-host with Glitchtip (free, Docker)
