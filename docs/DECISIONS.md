# Architecture Decisions (ADRs)

Append-only log. Never edit or delete past entries — mark them **SUPERSEDED** with a link to the newer decision instead. Each entry answers: what changed, why, alternatives considered, tradeoffs accepted.

Format:
```
## ADR-NNN: Title
Date · Status (Accepted / Superseded by ADR-XXX)
Context. Decision. Consequences.
```

---

## ADR-001: Single Next.js app for both customer and admin
**Date:** 2026-06 (retroactive) · **Status:** Accepted

**Context.** The app has two very different user surfaces — customer (mobile, Tagalog, seniors) and admin (desktop, English, R&M owner/coaches). Common pattern would be to split into two Next projects deployed separately.

**Decision.** Keep them in one Next.js repo. Customer routes at `/`, admin routes under `/admin/*`. Same Supabase, same JWT secret, different cookies (`eb_session` vs `eb_admin_token`).

**Alternatives considered.**
- Two Next apps in a monorepo (Turborepo). Rejected — one repo owner (R&M), no CI complexity yet, doubles Vercel project count.
- Subdomain routing (`admin.easebrew.com`). Rejected — extra DNS, CORS, no clear benefit for a solo business.

**Consequences.**
- ✅ Single deploy, single env config, code sharing (`lib/`) for free.
- ✅ Middleware (`proxy.ts`) can enforce both customer + admin auth from one place.
- ⚠️ Bundle contains both surfaces — mitigated by App Router code splitting (admin pages only load when admin routes hit).
- ⚠️ If admin surface grows large, revisit.

---

## ADR-002: Service-role-only Supabase access (no RLS)
**Date:** 2026-06 · **Status:** Accepted

**Context.** Supabase supports Row-Level Security tied to Postgres claims. Alternative is trusting the app-layer JWT and using service role for all queries.

**Decision.** RLS is OFF on all tables. All queries go through `supabaseAdmin` (service role client). Auth boundary is our Next.js JWT verification, not Postgres.

**Rationale.**
- Simpler mental model: one auth check (JWT) per request.
- No JWT-to-Postgres-claim translation needed.
- Small business — no third-party integrations directly hitting Supabase.
- Service role key is server-only (never in client bundle by Next.js convention).

**Risks.**
- If service role key leaks → full data exposure. Mitigated by `.env*` in `.gitignore`, no key in code, no key in commits (verified).
- If we ever expose Supabase queries directly to the browser → we must enable RLS first.

**Reconsider if:** we ship a Supabase JS SDK to the client, add third-party partners with direct DB access, or need per-row audit.

---

## ADR-003: localStorage-first with debounced server sync
**Date:** 2026-06 · **Status:** Accepted

**Context.** Customer flows (tracker, BP, med) involve rapid successive writes (fill-then-save-then-edit). Naive per-keystroke POSTs = slow UX + server load.

**Decision.** All progress writes go to localStorage IMMEDIATELY (`lib/progressStorage.ts`). A debounced (~1s) POST to `/api/progress` syncs to server. Latest-write-wins on merge (server data replaces local only on cold fetch).

**Consequences.**
- ✅ Instant UI feedback even on slow 4G.
- ✅ Offline resilience — writes queue and sync on reconnect.
- ⚠️ Race window between local write and server confirmation (~1s). Acceptable for wellness data (not banking).
- ⚠️ localStorage size cap (~5 MB per origin). Progress payloads are small; not a concern.
- Special case: unmount flush ensures pending writes fire before navigation.

**Reconsider if:** we support multi-device simultaneous writes (currently forbidden by device_id binding).

---

## ADR-004: CMS-driven marketing content (`/api/content`)
**Date:** 2026-06 · **Status:** Accepted

**Context.** R&M wants to change promo banners, coach names, testimonials, FAQs, etc. WITHOUT a code deploy. Marketing copy iterates fast.

**Decision.** Whitelisted content keys (`lib/contentKeys.ts` `PUBLIC_CONTENT_KEYS`) live in a `content` table. Admin edits at `/admin/content`. Customer app fetches `/api/content` on mount and merges over hardcoded defaults.

**Consequences.**
- ✅ R&M edits in 30 seconds without engineer involvement.
- ✅ Whitelist prevents customer-side leakage of admin-only keys.
- ⚠️ Two-tier truth: hardcoded default + admin override. Devs must remember the default is a fallback, not the source of truth.
- ⚠️ CDN cache of 30 sec adds slight delay for edits to appear. Acceptable per user preference.

**Reconsider if:** the number of editable keys explodes past ~100 (currently ~70). Split into groups or introduce a proper CMS.

---

## ADR-005: Reminder hours are customer-configurable
**Date:** 2026-07-13 · **Status:** Accepted

**Context.** Original reminder was fixed at 7 AM / 7 PM. Filipino seniors have varied routines — some eat merienda at 3 PM, some drink coffee at 6 AM.

**Decision.** Customer picks AM hour (5-11) and PM hour (3-10 PM) from dropdowns on the "Paalala Araw-araw" card. Choice persists in localStorage and syncs to the SW via `SET_REMINDER {amHour, pmHour}`.

**Alternatives considered.**
- **Learn from usage pattern** (ML). Rejected — overkill for a small app, hard to debug, seniors can't understand "why did the app decide 6 AM?".
- **Server-side per-customer setting.** Rejected — localStorage is sufficient (reminder is a device-level UX feature, not a shared setting).

**Consequences.**
- ✅ Respects individual routines.
- ✅ Transparent — customer sees exactly when reminders fire.
- ⚠️ Each device has its own hours (no cross-device sync). Acceptable — most seniors use one phone.

---

## ADR-006: Auto-fill verify link (`/verify?code=XXX`)
**Date:** 2026-07-13 · **Status:** Accepted

**Context.** Senior customers were failing to enter the 12-character code manually — typos, uppercase confusion, dashes missing. This was the #1 onboarding friction.

**Decision.** `/verify` page reads `?code=` query param on mount, formats it, and pre-fills the input. Admin's welcome message template now embeds `${origin}/verify?code=${newCode}` so the coach's Messenger message becomes a tap-to-verify link.

**Consequences.**
- ✅ Zero typing for first-time customers.
- ✅ No security regression — code alone is still not sufficient; must complete verify (which binds device_id).
- ⚠️ If Messenger link previews strip query params (some do), fallback: code is also visible in plain text below the link.

---

## ADR-007: Notification body tap auto-logs intake
**Date:** 2026-07-13 · **Status:** Accepted

**Context.** Previously only the "✓ Done" action button on the reminder notif logged the intake. Tapping the notif body opened `/tracker` and required the senior to tap "Umaga" again — 2 more taps than expected.

**Decision.** In the SW `notificationclick` handler, any tap on a reminder notification (regardless of `action`) that carries a `period` in `data` triggers `QUICK_LOG` — same auto-log flow as the "Done" action.

**Consequences.**
- ✅ Senior UX matches expectation: tap = "yes I did it".
- ✅ "Later" (snooze) action still works — it explicitly names its action.
- ⚠️ If a customer wanted to just "open the app" from a reminder notif, that behavior is gone. Acceptable — they can open the app any other way.

---

## ADR-008: Docs live in `docs/`, not `.claude/`
**Date:** 2026-07-13 · **Status:** Accepted

**Context.** ChatGPT suggested putting 14 markdown files under `.claude/` for a "project brain". `.claude/` is the Claude Code CLI settings folder — currently holds `launch.json` and `settings.local.json`.

**Decision.** Documentation lives in `docs/`. Root `AGENTS.md` points to it. `.claude/` is reserved for CLI settings only.

**Rationale.**
- Avoids future collision if the CLI adds features under `.claude/`.
- `docs/` is the conventional location any developer expects.
- Consolidated to 2 docs (`PROJECT_BRAIN.md`, `DECISIONS.md`) instead of 14 files — fewer places to drift out of sync.

**Reconsider if:** the brain file exceeds ~1500 lines (split into topic files).

---
