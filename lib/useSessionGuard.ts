"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export type EbSession = {
  code: string;
  tier: number;
  packs: number;
  expires_at: string;
  device_id: string;
};

export function useSessionGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [session, setSession] = useState<EbSession | null>(null);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const response = await fetch("/api/session", { cache: "no-store" });
        const data = await response.json();
        if (!active) return;

        if (!response.ok || !data?.session) {
          router.replace(`/verify?from=${encodeURIComponent(pathname)}`);
          return;
        }

        setSession(data.session);
        setChecking(false);
      } catch {
        if (active) {
          router.replace(`/verify?from=${encodeURIComponent(pathname)}`);
        }
      }
    }

    checkSession();
    return () => {
      active = false;
    };
  }, [pathname, router]);

  return { checking, session };
}
