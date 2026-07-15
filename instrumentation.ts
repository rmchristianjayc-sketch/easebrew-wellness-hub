/**
 * Next.js instrumentation entrypoint.
 *
 * Runs once per runtime (node / edge) on server start-up. Delegates to the
 * corresponding sentry.*.config file so Sentry init is scoped to each runtime.
 * Runs before any route handler code, so errors during handler execution are
 * captured with correct context.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Bubble unhandled request errors to Sentry with the correct route context.
// Signature matches Next.js's expected onRequestError contract.
export async function onRequestError(
  ...args: Parameters<typeof import("@sentry/nextjs").captureRequestError>
) {
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(...args);
}
