import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#39613B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "R&M EaseBrew Wellness Hub",
  description: "Your personal wellness companion. For a healthier body.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "R&M EaseBrew",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fil" suppressHydrationWarning>
      <head>
        {/* ✅ apple-touch-icon stays here — next/head handles this correctly */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        {/* ❌ REMOVED: duplicate manifest link — Next.js auto-adds this from metadata above */}
        {/* Font-size preference: applied before hydration to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try { if (localStorage.getItem('eb_large_font') === '1') document.documentElement.setAttribute('data-customer-text', 'large'); } catch {}`,
          }}
        />
      </head>
      <body>
        {children}
        {/* ✅ FIXED: next/script guarantees service worker registers after page load */}
        <Script src="/register-sw.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
