"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export type EbSession = {
  code: string;
  tier: number;
  expires_at: string;
};

// ✅ FIXED — local na ito ngayon, hindi na nag-i-import mula sa
// lib/supabase.ts. Ang lib/supabase.ts ay naglalaman ng `supabaseAdmin`
// na gumagamit ng SUPABASE_SERVICE_ROLE_KEY (server-only env var, walang
// NEXT_PUBLIC_ prefix). Dahil ang useSessionGuard.ts ay client component
// ("use client"), kapag in-import ito mula sa lib/supabase.ts, sinusubukan
// ng bundler na i-bundle ang BUONG file papunta sa browser — kasama na
// ang supabaseAdmin initialization. Sa browser, undefined ang
// SUPABASE_SERVICE_ROLE_KEY, kaya nagfa-fail ang createClient() doon
// ng "supabaseKey is required" error.
function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("eb_device_id");
  if (!id) {
    id = "dev_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("eb_device_id", id);
  }
  return id;
}

/**
 * Shared session guard — ginagamit sa lahat ng customer pages
 * (recipes, meal-plan, tracker, bagong-katawan, exercise, home).
 *
 * - Walang `eb_session` cookie              → redirect sa /verify?from=<current page>
 * - May cookie pero walang `code` field      → redirect (malformed session)
 * - May cookie pero corrupted/unparseable    → redirect
 * - I-revalidate sa server (/api/verify-code) sa tuwing nag-mount — para
 *   kapag na-deactivate ng admin/coach ang code, agad na mareflect sa
 *   customer side imbes na umasa lang sa stale na expires_at sa cookie.
 * - Habang `checking === true`, dapat magpakita ang page ng loading state
 *   (huwag pang i-render ang protected content)
 *
 * Ang `?from=` ay automatic na batay sa kasalukuyang URL — para kapag
 * na-redirect sa /verify, pwedeng ibalik ang user sa eksaktong page
 * kung saan siya galing (kung ginagamit ito ng /verify page).
 *
 * Usage:
 *   const { checking, session } = useSessionGuard();
 *   if (checking) return <LoadingScreen />;
 *   // session.code, session.tier available na rito kung kailangan
 */
export function useSessionGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [session, setSession] = useState<EbSession | null>(null);

  useEffect(() => {
    let active = true;

    const clearSessionCookie = () => {
      document.cookie = "eb_session=; path=/; max-age=0";
    };

    const redirectToVerify = () => {
      clearSessionCookie();
      router.replace(`/verify?from=${encodeURIComponent(pathname)}`);
    };

    async function checkSession() {
      const match = document.cookie.split(";").find(c => c.trim().startsWith("eb_session="));
      if (!match) {
        redirectToVerify();
        return;
      }

      let localSession: EbSession;
      try {
        localSession = JSON.parse(decodeURIComponent(match.split("=").slice(1).join("="))) as EbSession;
        if (!localSession?.code || !localSession?.expires_at) {
          redirectToVerify();
          return;
        }
      } catch {
        redirectToVerify();
        return;
      }

      // ✅ FIXED — tamang path na: /api/verify-code (dati ay /api/verify
      // na walang kaukulang route.ts, kaya 404 ang nangyayari).
      // Server-side re-validation — i-check ulit kung valid pa talaga ang
      // code (hindi na-deactivate, hindi expired sa DB).
      try {
        const res = await fetch("/api/verify-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: localSession.code, device_id: getDeviceId() }),
        });
        const data = await res.json();

        if (!active) return;

        if (!res.ok || !data?.session) {
          redirectToVerify();
          return;
        }

        // I-sync ang cookie gamit ang latest na data mula sa server
        // (kapag na-reactivate, may bagong expires_at na dapat masave)
        const fresh: EbSession = {
          code: data.session.code,
          tier: data.session.tier,
          expires_at: data.session.expires_at,
        };
        document.cookie = `eb_session=${encodeURIComponent(JSON.stringify(fresh))}; path=/; max-age=${60 * 60 * 24 * 365}`;

        setSession(fresh);
        setChecking(false);
      } catch {
        if (!active) return;
        redirectToVerify();
      }
    }

    checkSession();

    return () => { active = false; };
  }, [router, pathname]);

  return { checking, session };
}