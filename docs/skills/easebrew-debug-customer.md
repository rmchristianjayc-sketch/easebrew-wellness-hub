---
name: easebrew-debug-customer
description: Systematic troubleshooting for R&M EaseBrew customer issues. Trigger when the user says "customer complains", "hindi maka-login", "hindi gumagana", "problema si [customer]", "nag-message si Nanay/Tatay", "expired ba yung code", "device swap", "nawala data", or otherwise reports a specific customer having trouble. Walks through the common failure modes (device binding, expired code, rate limit, notification permission, cache staleness) in order of likelihood and gives the exact SQL or admin action to fix each one.
---

# Debug an EaseBrew customer issue

Systematic triage. Do NOT guess — ask clarifying questions first, then check in order.

## Step 1 — Gather the report

Ask (short):

1. **Sino yung customer?** — name or code (`EASE-XXXX-XXXX`)
2. **Ano ang sinabi niya?** — exact complaint (quote if possible)
3. **Kailan nangyari?** — today, yesterday, ilang araw na
4. **Anong device?** — cellphone, tablet, umilit ba ng phone

## Step 2 — Match to common failure modes

Based on symptoms, walk through in this order:

### A. "Hindi ako maka-login" / "invalid code"

Most likely causes (ranked):

1. **Typo in code** — the customer typed manually instead of tapping the link.
   → Fix: send them the auto-fill link: `[domain]/verify?code=EASE-XXXX-XXXX`

2. **Different device now** — code is bound to their old phone.
   → Fix (admin needs to unbind):
   ```sql
   UPDATE access_codes
   SET device_id = NULL, is_used = false, used_at = NULL
   WHERE code = 'EASE-XXXX-XXXX';
   DELETE FROM customer_sessions WHERE code = 'EASE-XXXX-XXXX';
   ```
   Then send them the auto-fill link again.

3. **Rate-limited** — too many failed attempts in last 15 min.
   → Fix: wait 15 minutes, OR clear their attempts:
   ```sql
   DELETE FROM admin_login_attempts
   WHERE identifier LIKE '%EASE-XXXX-XXXX%'
      OR identifier LIKE 'verify:device:dev_%';
   ```

4. **Code expired** — check in admin:
   ```sql
   SELECT code, is_used, expires_at, used_at
   FROM access_codes
   WHERE code = 'EASE-XXXX-XXXX';
   ```
   If `expires_at < now`, they need to reorder (generate new code).

### B. "Nawala yung data ko" / "lost my logs"

1. **Client-side cache stale** — data still on server, just not showing.
   → Fix: ask customer to hard-reload the page. Server is source of truth; localStorage will re-sync.

2. **Wrong device** — logged in on a different phone/browser (data doesn't cross-device).
   → Check with them which device they used before.

3. **Actual data loss** — check the `progress` table:
   ```sql
   SELECT type, jsonb_array_length(data->'entries') as count, updated_at
   FROM progress WHERE code = 'EASE-XXXX-XXXX';
   ```
   If missing entries, check `admin_audit_log` for any deletes.

### C. "Hindi ako natatawag ng reminder"

1. **Notification permission denied** — check `Notification.permission` in their browser.
   → Fix: they need to enable in phone settings → browser → notifications.

2. **Reminder not toggled ON** — the "Paalala Araw-araw" card must show green ON state.
   → Fix: guide them to toggle it in-app.

3. **App not opened for days** — service worker suspended.
   → Fix: they need to open the app once; SW re-registers.

4. **Reminder hours don't match their routine** — hardcoded to 7 AM/7 PM was fixed 2026-07-13; now customizable.
   → Fix: they change hours in the reminder card dropdown.

### D. "Nag-crisis yung BP ko" / "high blood alert nag-appear"

1. **Real crisis (≥180/110)** — app is doing its job. Encourage them to call their doctor or go to ER.
2. **Wrong entry (typo)** — help them delete the entry via BP page → "Tanggalin" button.

### E. "Coach hindi ako nasasagot"

1. **Point them to the FAQ card on Coach tab** first — 5 common Qs answered without messaging.
2. **Check if coach info is correct** in `/admin/content` → Coach Management.
3. **Check the reorder message template** — should include the customer's tier + expiry.

## Step 3 — Confirm the fix

After applying, ask the owner to have the customer test:
- Login → home page loads → session cookie set (test: `GET /api/session` returns 200)
- Data visible → previous logs show up
- Reminders → toggle off/on to reset

## Step 4 — Record in the audit log

If you touched the database directly (unbinding, clearing rate limits), that's audit-worthy. Suggest the owner add a note in `/admin/audit-log` context or in the customer's notes field for future reference.

## Never do

- Do not run `DELETE FROM access_codes WHERE ...` without confirming the code first.
- Do not update `password_hash` in `admin_users` without the owner explicitly asking.
- Do not send test messages to the customer via anyone's real Messenger without the coach's OK.
