"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Global error boundary — catches unhandled errors in the root layout.
 * Reports to Sentry (if DSN configured) and shows a Tagalog fallback
 * so a senior customer isn't staring at a raw stack trace.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fil">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          margin: 0,
          padding: "40px 20px",
          background: "#EEE5D4",
          color: "#1B201A",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ fontSize: 22, marginBottom: 12, color: "#39613B" }}>
            May problema pansamantala
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 24, color: "#4E504F" }}>
            Sandali lang po, may mali sa app. Subukan mong i-tap ang button sa
            baba. Kung hindi pa rin gumagana, refresh mo ang page.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "#39613B",
              color: "white",
              border: "none",
              borderRadius: 12,
              padding: "14px 24px",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              minHeight: 48,
            }}
          >
            Subukan ulit
          </button>
        </div>
      </body>
    </html>
  );
}
