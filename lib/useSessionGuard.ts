"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

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
 * - May cookie pero expired na               → redirect
 * - May cookie pero corrupted/unparseable    → redirect
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
    const redirectToVerify = () => {
      router.replace(`/verify?from=${encodeURIComponent(pathname)}`);
    };

    const match = document.cookie.split(";").find(c => c.trim().startsWith("eb_session="));
    if (!match) {
      redirectToVerify();
      return;
    }
    try {
      const s = JSON.parse(decodeURIComponent(match.split("=").slice(1).join("="))) as EbSession;
      if (!s?.code || !s?.expires_at || new Date(s.expires_at) < new Date()) {
        redirectToVerify();
        return;
      }
      setSession(s);
      setChecking(false);
    } catch {
      redirectToVerify();
    }
  }, [router, pathname]);

  return { checking, session };
}