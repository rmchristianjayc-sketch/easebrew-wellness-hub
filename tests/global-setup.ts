import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "node:path";

export const TEST_SEED_CODE = "EASE-TEST-0001";
export const TEST_SEED_DEVICE_ID = "dev_" + "t".repeat(32);
export const TEST_SEED_TIER = 4497;
export const TEST_SEED_PACKS = 3;

/**
 * Global setup — runs once before ALL tests.
 * 1) Clears rate-limit counters so runs don't fight yesterday's leftovers.
 * 2) Ensures a known active customer code exists for the auth fixture to consume
 *    (tests are otherwise hermetic — no dependency on hand-seeded prod data).
 */
export default async function globalSetup() {
  // Load .env.local so SUPABASE_SERVICE_ROLE_KEY is available.
  config({ path: path.resolve(process.cwd(), ".env.local") });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn("[global-setup] Supabase env missing — skipping setup");
    return;
  }
  const admin = createClient(url, key, { auth: { persistSession: false } });

  const { error: rateErr } = await admin
    .from("admin_login_attempts")
    .delete()
    .gt("attempted_at", "1970-01-01");
  if (rateErr) {
    console.warn("[global-setup] rate-limit reset failed:", rateErr.message);
  } else {
    console.log("[global-setup] cleared admin_login_attempts");
  }

  const nowIso = new Date().toISOString();
  const expiresIso = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  const { error: seedErr } = await admin
    .from("access_codes")
    .upsert(
      {
        code: TEST_SEED_CODE,
        tier: TEST_SEED_TIER,
        packs: TEST_SEED_PACKS,
        validity_days: 90,
        is_used: true,
        used_at: nowIso,
        expires_at: expiresIso,
        device_id: TEST_SEED_DEVICE_ID,
        created_by: "playwright-global-setup",
        customer_name: "Playwright Test Customer",
        notes: "Auto-seeded by tests/global-setup.ts — safe to delete outside test runs.",
      },
      { onConflict: "code" }
    );
  if (seedErr) {
    console.warn("[global-setup] seed customer code failed:", seedErr.message);
  } else {
    console.log(`[global-setup] seeded test customer code ${TEST_SEED_CODE}`);
  }
}
