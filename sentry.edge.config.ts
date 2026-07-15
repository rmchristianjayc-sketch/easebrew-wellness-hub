import * as Sentry from "@sentry/nextjs";

/**
 * Edge runtime Sentry init (Next.js middleware `proxy.ts`, edge routes).
 *
 * Runs on Vercel Edge Runtime (V8 isolates, no Node APIs). Keep this file
 * tiny — pulling heavy dependencies here breaks the edge bundle size.
 */

const DSN = process.env.SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: process.env.SENTRY_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    ignoreErrors: [
      /^Unauthorized/i,
      "NEXT_REDIRECT",
      "NEXT_NOT_FOUND",
    ],
  });
}
