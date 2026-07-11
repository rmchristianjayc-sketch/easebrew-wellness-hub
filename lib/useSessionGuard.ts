"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export type EbSession = {
  code: string;
  tier: number;
  packs: number;
  expires_at: string;
  device_id: string;
  activated_at?: string;
};

const REVALIDATE_INTERVAL_MS = 60_000; // re-check session every 60 seconds

export function useSessionGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [session, setSession] = useState<EbSession | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const networkFailuresRef = useRef(0);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      let response: Response;
      try {
        response = await fetch("/api/session", { cache: "no-store" });
      } catch {
        // Network error (mobile signal drop, offline). Don't kick the user
        // out — keep the current session in memory. Only bounce after
        // several consecutive failures, so a brief signal blip is tolerated.
        networkFailuresRef.current += 1;
        if (active && networkFailuresRef.current >= 5) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          router.replace(`/verify?from=${encodeURIComponent(pathname)}`);
        }
        return;
      }
      networkFailuresRef.current = 0;

      const data = await response.json().catch(() => null);
      if (!active) return;

      // A confirmed 401 (or any error status) means the cookie is gone
      // or the code was deactivated — bounce immediately.
      if (!response.ok || !data?.session) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        router.replace(`/verify?from=${encodeURIComponent(pathname)}`);
        return;
      }

      setSession(data.session);
      setChecking(false);
    }

    checkSession();

    intervalRef.current = setInterval(checkSession, REVALIDATE_INTERVAL_MS);

    return () => {
      active = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pathname, router]);

  return { checking, session };
}
