import * as Sentry from "@sentry/nextjs";

/**
 * Server-side Sentry init (Node runtime — API routes, middleware, RSC).
 *
 * Uses SENTRY_DSN (server-only). Same "no DSN → no-op" behavior as client.
 */

const DSN = process.env.SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: process.env.SENTRY_ENV ?? process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE,

    tracesSampleRate: 0.1,

    // Same expected-4xx filter as client + server-specific noise.
    ignoreErrors: [
      /^Unauthorized/i,
      /^Too many attempts/i,
      // Next.js internal cancellation errors
      "NEXT_REDIRECT",
      "NEXT_NOT_FOUND",
    ],

    beforeSend(event) {
      // Never leak cookies/auth in server-captured request context.
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
