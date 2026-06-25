"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "owner" | "coach";

type CachedAuth = {
  username: string;
  role: Role;
  expiry: number;
};

const CACHE_KEY = "eb_admin_auth";
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

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

  useEffect(() => {
    let active = true;

    async function check() {
      // Use cache if still valid — eliminates flicker on tab switches
      const cached = readCache();
      if (cached && allowedRoles.includes(cached.role)) {
        if (!active) return;
        setUsername(cached.username);
        setRole(cached.role);
        setChecking(false);
        return;
      }

      try {
        const res = await fetch("/api/admin/me");
        if (!res.ok) { router.replace("/admin/login"); return; }
        const data = await res.json();
        const r = data.role as Role;
        const u = data.username as string;

        if (!active) return;

        if (!allowedRoles.includes(r)) {
          router.replace(r === "coach" ? "/admin/codes" : "/admin");
          return;
        }

        writeCache(u, r);
        setUsername(u);
        setRole(r);
        setChecking(false);
      } catch {
        if (!active) return;
        router.replace("/admin/login");
      }
    }

    check();

    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { checking, username, role };
}
