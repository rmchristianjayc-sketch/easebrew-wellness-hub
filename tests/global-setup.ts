import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "node:path";

/**
 * Global setup — runs once before ALL tests.
 * Clears rate-limit counters so test runs don't fight yesterday's leftovers.
 */
export default async function globalSetup() {
  // Load .env.local so SUPABASE_SERVICE_ROLE_KEY is available.
  config({ path: path.resolve(process.cwd(), ".env.local") });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn("[global-setup] Supabase env missing — skipping rate-limit reset");
    return;
  }
  const admin = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await admin
    .from("admin_login_attempts")
    .delete()
    .gt("attempted_at", "1970-01-01");
  if (error) {
    console.warn("[global-setup] rate-limit reset failed:", error.message);
  } else {
    console.log("[global-setup] cleared admin_login_attempts");
  }
}
