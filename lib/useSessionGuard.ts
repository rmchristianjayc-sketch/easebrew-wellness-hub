"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getDeviceId } from "@/lib/supabase";

export type EbSession = {
  code: string;
  tier: number;
  expires_at: string;
};

/**
 * Shared session guard — ginagamit sa lahat ng customer pages
 * (recipes, meal-plan, tracker, bagong-katawan, exercise).
 *
 * - Walang `eb_session` cookie              → redirect sa /verify?from=<current page>
 * - May cookie pero walang `code` field      → redirect (malformed session)
 * - May cookie pero corrupted/unparseable    → redirect
 * - ✅ BAGO: I-revalidate sa server (/api/verify) sa tuwing nag-mount —
 *   para kapag na-deactivate ng admin/coach ang code, agad na mareflect
 *   sa customer side imbes na umasa lang sa stale na expires_at sa cookie.
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

      // ✅ Server-side re-validation — i-check ulit sa /api/verify kung
      // valid pa talaga ang code (hindi na-deactivate, hindi expired sa DB).
      // Ang /api/verify ay nagchecheck na ng access_codes.expires_at,
      // kaya kapag na-deactivate, agad itong magreturn ng error dito.
      try {
        const res = await fetch("/api/verify", {
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