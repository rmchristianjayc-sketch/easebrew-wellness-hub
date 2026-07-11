"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "owner" | "coach";

type CachedAuth = {
  username: string;
  role: Role;
  expiry: number;
};

const CACHE_KEY = "eb_admin_auth";
const CACHE_TTL = 2 * 60 * 1000;       // 2 minutes client-side cache
const REVALIDATE_MS = 2 * 60 * 1000;   // re-check server every 2 minutes

function readCache(): CachedAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedAuth;
    if (Date.now() > parsed.expiry) { sessionStorage.removeItem(CACHE_KEY); return null; }
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(username: string, role: Role) {
  try {
    const payload: CachedAuth = { username, role, expiry: Date.now() + CACHE_TTL };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {}
}

export function clearAdminAuthCache() {
  if (typeof window === "undefined") return;
  try { sessionStorage.removeItem(CACHE_KEY); } catch {}
}

export function useAdminGuard(allowedRoles: Role[] = ["owner", "coach"]) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let active = true;

    async function verifyWithServer(skipRedirectOnCacheHit = false) {
      let res: Response;
      try {
        res = await fetch("/api/admin/me");
      } catch {
        // Transient network error — keep whatever cache we have; don't
        // dump the admin/coach back to the login screen mid-task.
        return;
      }
      if (!res.ok) {
        // Confirmed 401/403 — cookie is invalid.
        clearAdminAuthCache();
        if (intervalRef.current) clearInterval(intervalRef.current);
        router.replace("/admin/login");
        return;
      }
      const data = await res.json().catch(() => null);
      if (!active || !data) return;

      const r = data.role as Role;
      const u = data.username as string;

      if (!allowedRoles.includes(r)) {
        clearAdminAuthCache();
        router.replace(r === "coach" ? "/admin/codes" : "/admin");
        return;
      }

      writeCache(u, r);
      if (!skipRedirectOnCacheHit) {
        setUsername(u);
        setRole(r);
        setChecking(false);
      } else {
        setUsername(u);
        setRole(r);
      }
    }

    async function check() {
      const cached = readCache();
      if (cached && allowedRoles.includes(cached.role)) {
        if (!active) return;
        setUsername(cached.username);
        setRole(cached.role);
        setChecking(false);
        // Still verify with server in background to catch deactivated accounts
        verifyWithServer(true);
        return;
      }

      await verifyWithServer(false);
    }

    check();

    intervalRef.current = setInterval(() => verifyWithServer(true), REVALIDATE_MS);

    return () => {
      active = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { checking, username, role };
}
