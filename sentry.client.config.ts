import * as Sentry from "@sentry/nextjs";

/**
 * Client-side Sentry init.
 *
 * Loaded on every customer + admin browser page. If NEXT_PUBLIC_SENTRY_DSN
 * is missing (local dev, CI, first-time contributors), Sentry is a no-op —
 * no data is sent and no errors are thrown.
 */

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENV ?? process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

    // 10% of sessions/transactions sampled. Bump to 1.0 during an incident.
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,

    // Expected user-facing 4xx responses aren't crashes — don't page us.
    ignoreErrors: [
      // Playwright + bots throw these on hydration mismatches
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      "Non-Error promise rejection captured",
      // App-level "expected" states
      /^Unauthorized/i,
      /^Too many attempts/i,
    ],

    // Never send obvious PII. We only tag the last 4 chars of the customer
    // code (see instrumentation) and never the full session cookie.
    beforeSend(event) {
      // Strip cookies + auth headers from any request context Sentry captured.
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers["cookie"];
          delete event.request.headers["authorization"];
        }
      }
      return event;
    },
  });
}
