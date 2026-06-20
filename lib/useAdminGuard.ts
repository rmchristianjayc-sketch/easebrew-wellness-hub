"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ============================================================
// ADMIN GUARD — client-side auth check para sa admin pages
//
// Dati, ang useEffect(() => fetch('/api/admin/me')...) pattern
// ay copy-pasted sa 5 pages: AnalyticsPage, CodesPage,
// ContentPage, NotificationsPage, AdminDashboard — magkaiba-iba
// ang redirect behavior nila (Bug #14: NotificationsPage walang
// redirect kapag coach, samantalang ibang pages may redirect
// papuntang /admin/codes).
//
// Mirror ito sa existing na useSessionGuard() pattern (customer
// side) — pareho ang shape: { checking, ... }.
//
// Usage:
//   const { checking, username, role } = useAdminGuard(['owner']);
//   if (checking) return <LoadingScreen />;
//   // dito na safe gamitin ang username/role
//
// Default na allowedRoles = ['owner', 'coach'] — ibig sabihin
// kung walang ipasa, parehong roles ay papayagan (gaya ng
// CodesPage na shared ng owner at coach, kahit magkaiba ang
// view nila).
// ============================================================

type Role = "owner" | "coach";

export function useAdminGuard(allowedRoles: Role[] = ["owner", "coach"]) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<Role | "">("");

  useEffect(() => {
    let active = true;

    async function check() {
      try {
        const res = await fetch("/api/admin/me");
        if (!res.ok) {
          router.replace("/admin/login");
          return;
        }
        const data = await res.json();
        const r = data.role as Role;
        const u = data.username as string;

        if (!active) return;

        if (!allowedRoles.includes(r)) {
          // ✅ FIX (Bug #14) — consistent na redirect target.
          // Kung coach pero hindi allowed sa page na ito, palaging
          // papuntahin sa /admin/codes (ang isang page na talagang
          // accessible ng coach). Kung owner pero hindi allowed
          // (theoretically posible sa future kung gagawa ng
          // owner-only-exclude rule), bumalik sa /admin.
          router.replace(r === "coach" ? "/admin/codes" : "/admin");
          return;
        }

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