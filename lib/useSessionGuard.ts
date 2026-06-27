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

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const response = await fetch("/api/session", { cache: "no-store" });
        const data = await response.json();
        if (!active) return;

        if (!response.ok || !data?.session) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          router.replace(`/verify?from=${encodeURIComponent(pathname)}`);
          return;
        }

        setSession(data.session);
        setChecking(false);
      } catch {
        if (active) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          router.replace(`/verify?from=${encodeURIComponent(pathname)}`);
        }
      }
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
