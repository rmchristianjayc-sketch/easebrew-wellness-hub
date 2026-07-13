---
name: easebrew-project-context
description: Loads business context for R&M EaseBrew Wellness Hub — a mobile-first PWA for Filipino seniors 50+ managing EaseBrew tea reorders, health tracking, and family wellness. Trigger whenever the user mentions "EaseBrew", "R&M", "wellness hub", "coach", "customer code", "senior app", "meal plan", "medical card", "BP log", or refers to this specific project. Establishes tier system (₱399–₱14,990 packs), free-tools-plus-paid-features model, admin/coach shared-login setup, Tagalog-first customer UX, and medical-accuracy rules (never claim treatment/cure). Use this before answering any product, business, or engineering question about the app.
---

# R&M EaseBrew Wellness Hub

You are helping the owner of R&M EaseBrew, a small Filipino business that sells anti-inflammation tea (COD delivery, no subscription) with a companion Progressive Web App for their senior customers (50+).

## Business at a glance

- **Product:** EaseBrew tea packs. Sold via Facebook/Messenger. Cash on Delivery only.
- **App purpose:** wellness companion so customers actually *use* the tea daily, log health data, and reorder when packs run out.
- **Revenue model:** every pack is a one-time purchase. Reorder rate = success.
- **Two surfaces:**
  - **Customer app** — mobile-first, Tagalog, senior-friendly (44px+ tap targets, large text toggle, one-tap check-ins). Installable PWA.
  - **Admin/Coach dashboard** — desktop, English/Tagalog mix. Shared logins (no per-person accounts).

## Tier system

| Price | Packs | Days | Unlocks |
|-------|-------|------|---------|
| ₱399 | 1 | 10 | Basic access + free tools (BP, Med, Medical Card, BMI, Report) |
| ₱999 | 3 | 30 | + Daily Health Tracker |
| ₱1,499 | 5 | 45 | + Meal Plan + Recipes |
| ₱2,998 | 10 | 75 | + Home Exercise Guide |
| ₱4,497 | 15 | 105 | + Complete Wellness Program |
| Up to ₱14,990 | 50 | 315 | All features |

**Free tools** always work for any active code. **Paid features** are tier-gated.

## Customer lifecycle

1. Order via Messenger → admin generates unique code `EASE-XXXX-XXXX`
2. Coach messages customer the auto-fill link: `easebrew.com/verify?code=EASE-XXXX-XXXX`
3. Customer taps link → device locked to code → app unlocked
4. Daily use: one-tap mood emoji, EaseBrew intake logs, customizable reminders
5. Near expiry (14 days) → app shows reorder card with pre-filled coach message
6. Reorder → new code issued, new session begins

## Technical stack

- **Framework:** Next.js 16.2.7 (App Router, Turbopack) with React 19
- **Backend:** Supabase (Postgres) via service-role client only (no RLS by design)
- **Auth:** JWT with `jose` (HS256), httpOnly cookies (`eb_session` customer, `eb_admin_token` admin)
- **PWA:** Service worker for reminders, expiry alerts, offline shell
- **Deploy:** Vercel (single app for both customer and admin surfaces)

## Critical rules

### Language and tone
- **Customer-facing strings: Tagalog only.** No English jargon ("screenshot" → "kumuha ng litrato ng screen").
- Casual, warm tone — talking to Nanay/Tatay, not to enterprise users.
- Never guilt-trip ("Miss ka namin!" instead of "You missed 3 days!").

### Medical accuracy
- **NEVER** claim EaseBrew "gagamot", "makakagaling", or is a treatment for any condition.
- **ALWAYS** include "Palaging magpakonsulta sa doctor" disclaimer on health tools.
- BP crisis threshold: ≥180/110 triggers emergency modal with tap-to-call.

### Device targets
- **Customer** = mobile phone (senior 50+). Style for one-hand thumb reach, large tap targets, no hover.
- **Admin/coach** = desktop PC. Sidebar layouts, denser info, mouse-friendly.
- Never mix — an admin form is not a mobile card, and vice versa.

### Never-do
- Do NOT commit `.env.local`, `cookies.txt`, or any file matching `.env*`.
- Do NOT update `PROJECT_CONTEXT.md` at the project root — legacy snapshot, kept for history.
- Do NOT invent database tables or API routes — check `supabase-schema.sql` and `app/api/` first.
- Do NOT bypass the tier gate in `lib/tierGates.ts` — it's the single source of truth.
- Do NOT expose the Supabase service role key to the browser bundle.

## Working style

- **Ask before large changes** — the owner is a solo founder, not an engineering team. Confirm scope.
- **Prefer editing existing files** over creating new ones. The project has strong single-source-of-truth files (`tierGates.ts`, `contentKeys.ts`, `price-config.ts`, `products.ts`, `exerciseProgram.ts`).
- **Batch commits** — one logical change per commit with a clear "why" in the message.
- **Verify in browser** for anything UI — dev server via `.claude/launch.json` name "dev".
- **Run `npx tsc --noEmit`** before every commit. Zero errors expected.

## Where to look

For deep context, ask the user to point you at `docs/PROJECT_BRAIN.md` in the project repo — it has 15 sections covering everything: architecture, database schema, feature inventory, UI system, engineering rules, troubleshooting.

For architecture decisions (why something is the way it is), `docs/DECISIONS.md` has the ADR log.

## Response defaults

- Match the user's language: usually Tagalog + English mix, casual.
- Keep responses tight — the user is running a business, not reading essays.
- When proposing options, rank by impact and recommend one clearly. Don't make them decide from a menu of equals.
- When implementing, show the diff intent (what will change and why), not the final code, until they say go.
