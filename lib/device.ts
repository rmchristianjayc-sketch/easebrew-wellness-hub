// ============================================================
// DEVICE ID — client-safe helper
//
// Bakit hiwalay na file ito (hindi sa lib/supabase.ts):
// Ang lib/supabase.ts ay nag-iinitialize ng `supabaseAdmin` sa
// MODULE SCOPE gamit ang SUPABASE_SERVICE_ROLE_KEY (server-only,
// walang NEXT_PUBLIC_ prefix). Kapag may client component
// ("use client") na nag-import ng kahit anong bagay mula sa
// lib/supabase.ts — kasama ang getDeviceId — sinusubukan ng
// bundler na i-bundle ang BUONG file papunta sa browser, at
// nagfa-fail ang createClient() doon dahil undefined ang
// service role key sa browser ("supabaseKey is required" error).
//
// Dahil dito, ang getDeviceId() ay nilipat dito sa sarili niyang
// file na walang anumang Supabase import — ligtas itong i-import
// kahit saang client component.
//
// Ginagamit sa: lib/useSessionGuard.ts, app/verify/page.tsx,
// app/bagong-katawan/page.tsx
// ============================================================

export function getDeviceId(): string {
    if (typeof window === "undefined") return "";
    let id = localStorage.getItem("eb_device_id");
    if (!id) {
      const bytes = new Uint8Array(16);
      window.crypto.getRandomValues(bytes);
      id = "dev_" + Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
      localStorage.setItem("eb_device_id", id);
    }
    return id;
  }