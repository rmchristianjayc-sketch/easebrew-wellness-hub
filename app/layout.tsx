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
  description: "Ang iyong personal na wellness companion. Para sa mas malusog na katawan.",
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
    <html lang="fil">
      <head>
        {/* ✅ apple-touch-icon stays here — next/head handles this correctly */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        {/* ❌ REMOVED: duplicate manifest link — Next.js auto-adds this from metadata above */}
      </head>
      <body>
        {children}
        {/* ✅ FIXED: next/script guarantees service worker registers after page load */}
        <Script src="/register-sw.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
