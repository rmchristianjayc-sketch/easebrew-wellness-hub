# R&M EaseBrew Wellness Hub — Project Brain

**Purpose of this file:** single source of truth para sa future AI sessions (at bagong developer). Basahin sa umpisa ng bawat session. If wrong, fix here first — don't drift.

**Last verified:** 2026-07-13 (Opus 4.7 session). Facts checked against actual code, not memory.

---

## 1. PROJECT IDENTITY

### Mission
Tulungan ang mga Filipino senior citizen (50+) na ma-manage ang wellness journey nila with R&M EaseBrew tea — para may accountability, ma-track ang health metrics, at hindi nakakalimot uminom.

### Vision
Isang mobile-first Progressive Web App na kaya gamitin ng senior na kabababa lang ng cellphone. Zero training, one-tap check-ins, family na kasama.

### Business Goal
- Retain EaseBrew customers past their first pack (COD delivery, no subscription — reorders are the revenue)
- Reduce coach messaging load through self-service (FAQs, in-app reminders)
- Increase pack tier upsells via visible upgrade delta ("Kulang ka ng ₱X")

### Target Users
| Role | Device | Skill level | Language |
|------|--------|-------------|----------|
| **Customer** (senior 50+) | Mobile phone | Basic — knows Messenger, camera | Tagalog |
| **Coach** | Desktop PC | Moderate — uses spreadsheets | Tag-English mix |
| **Admin/Owner** (R&M) | Desktop PC | Moderate | English + Tagalog |

Coach at admin **shared login accounts** — hindi per-person. Kaya walang per-user audit trail, only shared team activity.

### Success Metrics (proxies, no analytics tool yet)
- **Retention:** % of active codes (used, not expired) → target > 70%
- **Engagement:** average check-ins/customer/week → target > 4
- **Reorder rate:** % of expired codes with new order → target > 40%
- **Coach load:** est. messages/customer/week → target < 2
- **App install rate:** % of active customers with PWA installed → hard to measure, aim high

---

## 2. BUSINESS RULES

### Tier system (source: `lib/price-config.ts`)

| Tier | Packs | Validity | Free Tools Unlocked |
|------|-------|----------|---------------------|
| ₱399 | 1 | 10 days | — (basic access lang) |
| ₱699 | 2 | 20 days | — |
| ₱999 | 3 | 30 days | Daily Health Tracker |
| ₱1,499 | 5 | 45 days | + Meal Plan + Recipes |
| ₱2,998 | 10 | 75 days | + Home Exercise Guide |
| ₱4,497 | 15 | 105 days | + Complete Wellness Program |
| ₱5,996 – ₱14,990 | 20–50 | 135–315 days | (all unlocked) |

- Every senior gets **free tools** (BP log, medication tracker, medical card, BMI, weekly report) regardless of tier — code just needs to be active.
- Paid tools are **tier-gated** — enforced both by `proxy.ts` middleware (route access) and `/api/progress` (data reads/writes).
- Source of truth: `lib/tierGates.ts`.

### Subscription rules
- **NO recurring billing.** Every pack is a one-time COD order.
- **Code activation:** first `POST /api/verify-code` locks the code to that device (`device_id`). After that, only same device can log in with it.
- **Expiry:** starts at first verification (`expires_at = used_at + validityDays`). Not from generation date.
- **Renewal:** admin generates a **new** code for reorders. Old code stays expired. Customer verifies new code on their device (session replaces old).

### Customer lifecycle
1. **Order** (Messenger/FB) → admin adds via `/admin/codes` "Generate Code" → gets `EASE-XXXX-XXXX` + welcome message (contains auto-fill link).
2. **Coach messages** the welcome text to customer via Messenger.
3. **First open:** customer taps link → `/verify?code=X` → auto-fills → Continue → tier tools unlocked.
4. **Daily use:** home page, one-tap mood emoji, EaseBrew intake log, reminders at customer's chosen hours.
5. **Near expiry (<14 days):** app shows expiry banner + reorder card. SW push notif at 7 days, 3 days, 1 day.
6. **Reorder:** customer taps "I-order" → coach modal with pre-filled reorder message → copy → send to coach via Messenger.
7. **Family involvement:** anytime, customer generates 7-day family share JWT — read-only weekly summary.

### Coach / Admin permissions
- **Owner** (`admin`) — full access: codes, content, exercises, notifications, analytics, audit log.
- **Coach** (shared login, currently same account) — can generate codes, view profiles, message customers. Limited by UI, not RLS.
- **No customer-facing admin exposure** — admin panel is under `/admin/*`, blocked by middleware unless valid `eb_admin_token` JWT.

### Reorder flow (as-shipped)
1. Customer near expiry sees `<ReorderCard>` on home.
2. Tapping "I-order" → `setReorderMessage(buildReorderMessage())` → opens `<CoachModal>`.
3. Modal shows pre-filled message using `reorder_message_template` from admin content, with placeholders:
   - `{{package}}` → current tier label
   - `{{expiry_line}}` → "Expires: [date]" (empty if no expiry)
4. Customer taps "I-copy" → clipboard → sends to coach via Messenger.
5. Coach knows their exact tier + expiry → offers upgrade or same-tier reorder.

### Wellness rules (medical accuracy)
- **NEVER** claim EaseBrew "gagamot", "makakagaling", or "treatment for [condition]" — FDA compliance risk.
- **ALWAYS** include "Palaging magpakonsulta sa doctor" disclaimer sa medical-related tools (BP, med, medical card).
- BP crisis threshold: ≥180/110 → "Tumawag ng emergency" alert (in-app, not just log).
- Medication reminders are informational only, hindi enforcement.
- Meal plan calories are approximate ranges (~1,600 kcal), hindi prescriptive.

### Notification rules
- **Requires user opt-in** — `Notification.requestPermission()` gated behind explicit toggle sa "Paalala Araw-araw" card.
- **Frequency ceiling:** max 2 reminders/day (umaga + gabi) + expiry alerts (7d, 3d, 1d milestones — once each).
- **Snooze support:** notif "Later" action clears the "already shown today" cache so it can re-fire.
- **Tap = auto-log** — tapping the notification body OR "Done" action logs the intake without opening the app (senior UX).
- Reminder hours customizable per customer via localStorage → SW cache.

---

## 3. SYSTEM ARCHITECTURE

### High-level
```
Customer PWA (mobile)       Admin Dashboard (desktop)
       │                            │
       ▼                            ▼
  Next.js 16 App Router (single deploy)
       │
       ├── /api/* — Route handlers (JWT auth)
       │
       ▼
  Supabase (Postgres + service role only)
```

Single Next.js app serves both surfaces. Auth split by cookie:
- `eb_session` — httpOnly customer JWT (jose HS256)
- `eb_admin_token` — httpOnly admin JWT

### Folder structure (root)
```
app/                    Next 16 App Router pages + APIs
  page.tsx              Customer home (Home/Regalo/Tips/Coach tabs)
  layout.tsx            Root layout, metadata, SW registration
  verify/               Code entry page (?code= auto-fill)
  {tracker, blood-pressure, medication, medical-card, bmi, report,
   meal-plan, recipes, exercise, bagong-katawan}/   Customer tools
  family/[token]/       Read-only family share view
  admin/                Sidebar-based dashboard (desktop)
    {codes, content, exercises, notifications, analytics, audit-log, login}/
  api/
    verify-code/, session/           Auth
    progress/                        Save/read tracker data
    content/                         Public read (customer)
    family/[token]/, family/generate/
    admin/{codes, content, generate-code, customer-progress,
           audit-log, login, me}/    Admin ops
lib/                    Business logic + shared helpers
  auth.ts               JWT sign/verify (jose)
  supabase.ts           Server-only supabaseAdmin client (service role)
  tierGates.ts          SINGLE SOURCE for tier→route→progress mapping
  price-config.ts       Package prices, packs, validity days
  products.ts           Product catalog (tier → features)
  contentKeys.ts        Whitelist of admin-editable content keys
  exerciseProgram.ts    30-day senior-safe program (Tagalog)
  progressStorage.ts    localStorage cache + debounced sync helpers
  useSessionGuard.ts    Customer route guard (5-failure tolerance)
  useAdminGuard.ts      Admin route guard
public/
  sw.js                 Service worker (reminders, expiry, offline)
  manifest.json         PWA manifest
  offline.html          Fallback page
  icons/, images/, coaches/
proxy.ts                Next 16 middleware (route auth + tier gates)
docs/
  PROJECT_BRAIN.md      this file
  DECISIONS.md          ADR log
```

### Important services
| Service | Where | Why it exists |
|---------|-------|---------------|
| **Session guard** | `lib/useSessionGuard.ts` | Redirects to `/verify` if no session. Tolerates 5 network failures before kicking (fixes "logged out on wifi blip"). |
| **Admin guard** | `lib/useAdminGuard.ts` | Redirects to `/admin/login` if no admin JWT. Role-based (`["owner"]`). |
| **Progress storage** | `lib/progressStorage.ts` | Debounced localStorage + server sync. Local-first with latest-write-wins on merge. |
| **Service worker** | `public/sw.js` | Reminders (SET_REMINDER), expiry alerts (SET_EXPIRY), offline shell, notif tap → auto-log via QUICK_LOG message. |
| **Middleware (proxy)** | `proxy.ts` | Route-level auth + tier gate. Runs on Edge. Never trust client alone. |

### Data flow (typical customer log)
1. User taps mood emoji sa home page (`MoodQuickTap`)
2. `logMood(value)` — writes to localStorage IMMEDIATELY (`progressStorage`)
3. Same call — POST `/api/progress` with full entries array (fire-and-forget)
4. Server validates payload (`validateTracker` in `app/api/progress/route.ts`) — max 500 entries, valid dates, ranges
5. Server `verifyCustomerToken` — reads `eb_session` cookie, decodes JWT (jose)
6. Server upserts `progress` row (unique on `code + type`) with new data + updated_at
7. Family share endpoint (if used) reads the same row for weekly summary

### API flow (typical admin content edit)
1. Admin opens `/admin/content` — `useAdminGuard` verifies session
2. Admin edits `hero_title` field → `POST /api/admin/content` with `{updates: [{key, value}]}`
3. Server validates each key against `PUBLIC_CONTENT_KEYS` whitelist (`lib/contentKeys.ts`)
4. Type-specific validation via `validateContentUpdate` (URL fields, JSON fields, length limits)
5. Upsert to `content` table
6. Customer next fetch of `/api/content` gets new value (CDN cache 30s)

### Authentication flow
- **Customer verify:** `POST /api/verify-code` with `{code, device_id}` → rate-limited (10/device/15min, 20/code/15min, 40/IP/15min) → checks `access_codes` table → if unused, binds `device_id`; if used, restores session → sets `eb_session` httpOnly cookie (JWT signed with `JWT_SECRET`).
- **Session check:** `GET /api/session` → decodes cookie → returns `{code, tier, packs, expires_at}`.
- **Admin login:** `POST /api/admin/login` with `{username, password}` → bcrypt compare → sets `eb_admin_token`.
- **Family share:** `POST /api/family/generate` (customer must be authed) → creates 7-day JWT with `{code, name}` → `/family/[token]` decodes and shows read-only summary.

---

## 4. DATABASE KNOWLEDGE

### Main tables (source: `supabase-schema.sql`)

| Table | Purpose | Key columns |
|-------|---------|-------------|
| `access_codes` | Every customer code ever generated | `code` (PK, "EASE-XXXX-XXXX"), `tier`, `packs`, `customer_name`, `notes`, `created_by`, `is_used`, `device_id`, `used_at`, `expires_at`, `validity_days` |
| `customer_sessions` | Session records (for restoring on same device) | `code + device_id` composite, `expires_at`, `tier`, `packs` |
| `progress` | All tracked customer data (tracker, BP, meds, etc.) | `code + type` composite, `data` (JSONB), `updated_at` |
| `content` | Admin-editable public content | `key` (PK), `value` |
| `admin_users` | Admin/coach accounts (shared) | `username` (PK), `password_hash`, `role` |
| `admin_login_attempts` | Rate-limit tracking for verify + admin login | `identifier`, `attempted_at` |
| `admin_audit_log` | Admin action trail | `username`, `action`, `metadata`, `created_at` |

### Relationships
- `customer_sessions.code` → `access_codes.code` (loose, no FK)
- `progress.code` → `access_codes.code` (loose, no FK)
- No RLS enforced (see below) — all access via service role.

### RLS policies
- **Currently: RLS is OFF on all tables.** All queries go through `supabaseAdmin` (service role, bypasses RLS).
- **Why:** Simpler auth model — Next.js API is the trust boundary, not Postgres RLS. All customer data access is behind our own JWT check.
- **Risk:** If service role key leaks, full data exposure. Mitigation: key is `.env.local` only, never committed (verified in `.gitignore`).
- **Future:** Enable RLS with policies keyed on JWT claims if we ever expose direct Supabase queries to client.

### Naming conventions
- Snake_case for columns (`customer_name`, `used_at`).
- Codes always uppercase, dash-delimited: `EASE-XXXX-XXXX` (4-4-4 alphanumeric).
- Progress `type` values: `tracker`, `blood_pressure`, `medication`, `medical_card`, `mealplan`, `exercise`, `recipe_favorites`, `testimonial_submission`. Underscore, not hyphen.
- Content keys: snake_case with numeric suffix for lists (`daily_tip_1`, `faq_2_q`, `coach_3_facebook`).

### Migration rules
- `supabase-schema.sql` is a **snapshot**, not versioned migrations.
- Do NOT drop columns or change types without checking who reads/writes.
- Add columns with `DEFAULT` to stay backward-compatible.
- New progress `type` = add to `tierGates.ts` AND (if paid) to `proxy.ts` route matcher.
- New content key = add to `PUBLIC_CONTENT_KEYS` in `lib/contentKeys.ts`.

### Never-do rules
- **NEVER** run destructive SQL (`DROP TABLE`, `TRUNCATE`, `DELETE FROM x`) without explicit confirmation.
- **NEVER** commit `.env.local` or `cookies.txt` (already `.gitignore`d; verify before adding any file).
- **NEVER** use the anon key on server-side — always `supabaseAdmin`. Anon key is for hypothetical future client-side reads only.
- **NEVER** expose the service role key to the browser. Its bundle is server-only by Next.js convention (`SUPABASE_SERVICE_ROLE_KEY`, not `NEXT_PUBLIC_*`).

---

## 5. UI/UX DESIGN SYSTEM

### Color palette (source: `app/page.tsx` constants at top)
| Token | Hex | Usage |
|-------|-----|-------|
| `G` (green) | `#39613B` | Primary CTA, headings, accents |
| `GOLD` | `#FED255` | Highlights, chips, warm badges |
| `CREAM` | `#EEE5D4` | Page background |
| `DARK` | `#1B201A` | Body text (high contrast) |
| `MID` | `#4E504F` | Secondary text |
| `WHITE` | `#FFFFFB` | Card backgrounds |
| `AMBER` | `#b45309` | Warnings, cautions |
| Crisis red | `#dc2626` | BP crisis, emergency contact button |

Admin palette lives in `lib/colors.ts` + inline `admin-*` classes — more neutral (grays, `--admin-font` variable).

### Typography
- **Customer:** default 14-16px base. Large-font toggle (`A/A` button) sets `data-customer-text="large"` on `<html>` → 18px base via CSS.
- **Admin:** default 13px, uppercase-tracked labels for section headers.
- Fonts: system font stack for customer (no web font download — senior often slow connection). Admin uses same.

### Component rules
- Customer buttons: **minimum 44px tall** (48px preferred for critical actions).
- Customer inputs: 16px font (prevents iOS zoom on focus).
- Cards: 18-22px border radius, 2px solid border (not shadow-only — better on cheap OLED).
- Icons: `lucide-react` only. No emoji as functional icons except for playful accents (mood picker).
- Spacing: gap-based flex/grid; 12-20px between related items, 24-32px between sections.

### Mobile-first rules (customer pages)
- Single column ALWAYS. No side-by-side unless it's 2-item horizontal (like Umaga/Gabi buttons).
- No horizontal scroll (verified across 375/768/1280 viewports).
- Sticky bottom tabs — Home / Regalo / Tips / Coach.
- Touch targets ≥ 44px (verified: 0/15 undersized on production home page).
- Voice input where possible (already on Tracker).

### Accessibility
- `<html lang="fil">` (Filipino locale).
- Every image: `alt` (0/1 missing).
- Every button: accessible name (0/15 missing on home).
- BP form: `aria-label` on all 6 inputs (visual labels not associated via `for=` — aria-label bridges the gap).
- **Known gap:** Med / Medical Card / Tracker forms still have same aria-label debt. Fix opportunistically.
- WCAG AA target: 4.5:1 text contrast, 3:1 UI — visually verified, not audited by tool.

### Senior-friendly design guidelines
- Reading level: elementary Tagalog. No jargon ("screenshot" → "kumuha ng litrato ng screen").
- Confirmation over guessing: "Naka-save na!" toast after any save.
- One task per screen. No nested modals.
- Emergency = red, large, prominent (medical card top button).
- Nudges are **kind** ("Miss ka namin!" not "You missed 3 days!").
- Loading states never blank — always "Sandali lang..." with icon.

---

## 6. ENGINEERING RULES

### Coding standards
- **TypeScript strict mode** (`tsconfig.json` has `strict: true`).
- Functional React components; no class components.
- No `any` unless third-party gap (annotated with `// third-party: reason`).
- Prefer explicit types over inference for exported functions and props.
- Comments only when the **why** is non-obvious. Not for what the code does.

### Preferred libraries (`package.json`)
- **Framework:** Next.js 16.2.7 (App Router, Turbopack, React 19.2)
- **Auth:** `jose` (JWT HS256) — not `jsonwebtoken`
- **Password:** `bcryptjs`
- **DB client:** `@supabase/supabase-js` (service role only)
- **Icons:** `lucide-react`
- **CSS:** Tailwind v4 + inline styles (mixed — customer pages inline for portability, admin uses classes)
- **Testing:** `@playwright/test` installed but not currently used
- **Do NOT add:** Redux, react-query, styled-components, formik, moment.js (use `Intl` APIs).

### State management
- **Local UI:** `useState` / `useEffect` — no global store.
- **Persistence:** localStorage via `lib/progressStorage.ts` (with cache invalidation on `code` change).
- **Server data:** fetched imperatively in `useEffect`, no SWR/react-query. If we outgrow this, revisit.

### Validation
- Server-side is authoritative. `lib/contentKeys.ts` `validateContentUpdate`, `app/api/progress/route.ts` per-type validators.
- Client-side validation is UX-only — never trust it.
- Rate limits enforced on `POST /api/verify-code` and `POST /api/admin/login` (see `admin_login_attempts` table).

### Forms
- Uncontrolled inputs with `useState` mirror — no react-hook-form.
- Save on submit, not on blur. Toast on success. Inline error on failure.
- Debounced auto-save for high-frequency writes (tracker, BP list) — 1s delay, latest-write-wins on server.

### Error handling
- User-facing: Tagalog error text, never raw error object.
- Server: catch and return `{ error: string }` with proper HTTP status. Never leak stack traces.
- Fail-open for rate-limit read failures (better to allow than block if Supabase is briefly slow).
- Session guard tolerates 5 fetch failures before redirecting (WiFi blip resilience).

### Logging
- Server: `console.error` for unexpected errors — visible in Vercel logs.
- Client: no `console.log` in committed code (verified: 0 hits).
- Admin actions → `admin_audit_log` table (visible in `/admin/audit-log`).

### Testing
- No unit tests yet.
- Manual smoke test via Playwright installed but no suites.
- **Every commit:** typecheck (`npx tsc --noEmit`) + build (`npx next build`) must pass.
- Feature-level: verify in browser via `.claude/launch.json` dev server.

### Performance budgets
- Total production JS: ≤ 2 MB gzipped (currently 1.7 MB).
- Home HTML: ≤ 20 KB (currently 13.7 KB).
- Lighthouse mobile score target: ≥ 90 (not currently measured with tool).
- LCP target: ≤ 2.5s on 4G (untested, deferred until real users).
- `/api/content` CDN cache: 30s (fast enough for near-live admin edits, cheap enough to avoid hitting Supabase every page load).

---

## 7. FEATURE INVENTORY

Format for each: **Purpose · Status · Key files · APIs · Tables · Future**

### Customer-facing

**Verify code + session**
- Purpose: customer enters code to unlock their tools
- Status: ✅ shipped, auto-fill link supported (`?code=`)
- Files: `app/verify/page.tsx`, `lib/useSessionGuard.ts`
- APIs: `POST /api/verify-code`, `GET /api/session`
- Tables: `access_codes`, `customer_sessions`
- Future: SMS OTP fallback if code lost

**Home page (Hub)**
- Purpose: daily anchor — greeting, banners, quick check-ins, tools
- Status: ✅ shipped
- Files: `app/page.tsx` (large file, ~1800 lines)
- APIs: `/api/session`, `/api/content`, `/api/progress?type=tracker`
- Future: consider extracting cards into `_components/`

**One-tap mood picker**
- Purpose: senior taps emoji (😢–😄), saved to tracker without navigation
- Status: ✅ shipped (Auto #2)
- Files: `MoodQuickTap` in `app/page.tsx`
- Future: extend to include "pakiramdam ng katawan" quick-tap

**EaseBrew intake logs (Umaga/Gabi)**
- Purpose: 2x daily "have you had it?" buttons
- Status: ✅ shipped, notif-driven auto-log wired
- Files: `QuickCheckIn` in `app/page.tsx`, `public/sw.js`
- Future: streak visualization

**Daily reminder (customizable hours)**
- Purpose: SW push notifs at customer's chosen AM/PM hours
- Status: ✅ shipped (Auto #6)
- Files: `DailyReminderCard`, `public/sw.js` `maybeShowReminder`
- Future: also remind of medication times

**Missed check-in nudge**
- Purpose: gentle banner if 3+ days no log, scrolls to mood picker
- Status: ✅ shipped (Auto #3)
- Files: `EngagementNudge` in `app/page.tsx`

**Unused feature nudge**
- Purpose: "may regalo ka na hindi pa nabu-buksan!"
- Status: ✅ shipped (Auto #9)
- Files: `UnusedFeatureNudge` in `app/page.tsx`

**Next exercise preview**
- Purpose: home card showing "Araw X — [title]" for exercise
- Status: ✅ shipped (Auto #12)
- Files: `NextExercisePreview` in `app/page.tsx`

**FAQ self-service (Coach tab)**
- Purpose: 5 top FAQs before coach numbers — reduces messaging
- Status: ✅ shipped (Auto #4)
- Files: `app/page.tsx` Coach tab
- Content keys: `faq_{1..7}_{q,a}`

**Coach modal (reorder)**
- Purpose: pre-filled reorder message with tier + expiry, one-tap copy
- Status: ✅ shipped
- Files: `CoachModal` in `app/page.tsx`
- Content keys: `reorder_message_template`, `coach_modal_title`, `coach_modal_subtitle_{reorder,default}`

**Family share**
- Purpose: 7-day read-only link for anak/asawa to see weekly wellness
- Status: ✅ shipped
- Files: `app/family/[token]/page.tsx`
- APIs: `POST /api/family/generate`, `GET /api/family/[token]`
- Future: recurring email digest option

**BP log** (free tool)
- Files: `app/blood-pressure/page.tsx`
- Progress type: `blood_pressure`
- Special: crisis alert (≥180/110) with emergency modal + tel: link

**Medication tracker** (free)
- Files: `app/medication/page.tsx` — schedule + daily log + weekly compliance chart
- Progress type: `medication`

**Medical info card** (free)
- Files: `app/medical-card/page.tsx` — edit + view (print-friendly) + big red emergency call button on top
- Progress type: `medical_card`

**BMI calculator** (free) · **Weekly report** (free)
- Files: `app/bmi/page.tsx`, `app/report/page.tsx`

**Tracker** (paid, tier 999)
- Files: `app/tracker/page.tsx` — pain/mood/weight, pain locations, voice input, notes
- Progress type: `tracker`

**Meal plan** (paid, tier 1499)
- Files: `app/meal-plan/page.tsx` — 50 days, week picker, auto-jump to next uncompleted day, grocery list copy button
- Progress type: `mealplan`
- Data: inline `MEAL_PLAN` const (candidate to extract to `lib/mealPlan.ts` if we ever need it on home)

**Recipes** (paid, tier 1499)
- Files: `app/recipes/page.tsx` — 30 Pinoy anti-inflammation recipes + favorites
- Progress type: `recipe_favorites`

**Exercise program** (paid, tier 2998)
- Files: `app/exercise/page.tsx`, `lib/exerciseProgram.ts` (30 days, senior-safe Tagalog)
- Progress type: `exercise`
- Videos: admin-uploaded YouTube URLs stored in `content.exercise_videos` (JSON map, key = day slug)

**Bagong Katawan** (paid, tier 4497)
- Files: `app/bagong-katawan/page.tsx` — complete wellness program hub
- Progress type: `bagong_katawan`

### Admin-facing

**Dashboard main** — `/admin/page.tsx`
- Stat cards + "Kailangan ng Atensyon" priority panel (Auto #7)

**Codes** — `/admin/codes/page.tsx`
- Generate code (with auto-fill link in message), list/filter, edit notes, view customer profile deep-dive (BP, meds, testimonial, medical card, weight trend)

**Content editor** — `/admin/content/page.tsx`
- 8 groups: Homepage, Products, Coach Management, Wellness Tips, FAQs, Testimonials, Videos, Reorder & Coach Modal

**Exercises** — `/admin/exercises/page.tsx`
- Assign YouTube video URL to each of 30 days

**Notifications** — `/admin/notifications/page.tsx`
- Send notif to customer(s), quick message templates

**Analytics** — `/admin/analytics/page.tsx`
- Basic revenue, tier breakdown, funnel

**Audit log** — `/admin/audit-log/page.tsx`
- Recent admin actions

---

## 8. KNOWN BUGS / OPEN ISSUES

**None currently blocking deploy.**

Recently fixed (this session):
- BP form submit button was English "Save" → fixed to "I-save"
- Cache header for `/api/content` was 5 min → 30 sec for near-live admin edits
- Reorder message template + coach modal texts were hardcoded → now admin-editable
- Missing `robots.txt` → added, disallows indexing of authenticated routes
- Missing OG tags → added (Tagalog description, `fil_PH` locale)
- BP form inputs missing accessible label association → aria-label added

Deferred / known technical debt (not blockers):
- **Med / Medical Card / Tracker forms** — same aria-label debt as BP (visual labels present, screen reader UX degraded). Priority: LOW (senior audience rarely uses screen readers, but WCAG AA target says fix).
- **`buildReorderMessage` uses old `Expires:` label** — kept for backward compat but could be Tagalog. Priority: LOW.
- **Some admin forms rely on soft validation** (e.g. tier-inferred packs on generate-code). Priority: LOW.
- **`PROJECT_CONTEXT.md`** — old context file (~30 KB) predating this brain doc. User asked NOT to update it. Left as-is for history.

---

## 9. ARCHITECTURE DECISIONS

See `docs/DECISIONS.md` for the full ADR log. High-signal items:
- Why single-app for customer + admin (not two Next apps)
- Why service-role-only Supabase (no RLS)
- Why localStorage-first with debounced sync
- Why CMS-style live content instead of code-driven marketing copy
- Why customizable reminder hours (not fixed 7 AM / 7 PM)

---

## 10. PROJECT ROADMAP

### Current sprint (as of 2026-07-13)
- ✅ 20-batch full audit (functional + performance + a11y + security + SEO)
- ✅ 13-item automation batch (verify auto-fill, one-tap mood, nudge, FAQ, auto-day, custom hours, atensyon panel, upgrade delta, unused-feature nudge, grocery copy, notif auto-log, next exercise preview, emergency tap-call)
- Awaiting: `git push` at production deploy

### Completed (recent)
- 30-day senior-safe Tagalog exercise program rebuild
- Exercise video assignment system (admin + customer)
- Family share (7-day JWT read-only)
- CMS-driven content for coaches / testimonials / tips / FAQs / videos
- PWA install banner timing tuned for seniors (20s delay)
- Full production audit (batches 1-20)

### In progress
- (none — awaiting user direction for next initiative)

### Next (candidate ideas, not committed)
- Med / Medical Card / Tracker form a11y sweep
- Extract `MEAL_PLAN` to `lib/mealPlan.ts` to enable tomorrow's-meal preview on home (Auto #12 was exercise-only for this reason)
- Order webhook integration (Shopify/FB order → auto-generate code) — biggest coach workload reducer
- SMS-based code retrieval for customers who lose the Messenger message

### Future (long horizon)
- Enable RLS with JWT-claim policies (only if we ever expose direct Supabase client to browser)
- Convert to Supabase Edge Functions for push notifications (currently SW-side only, doesn't fire when app closed on Android)
- Analytics: real event tracking (privacy-safe, self-hosted)

---

## 11. AI WORKING RULES

**Before implementing anything:**

1. **Read existing code first** — grep for the domain concept before writing new code. This project has strong "single source of truth" files (`tierGates.ts`, `contentKeys.ts`, `price-config.ts`, `products.ts`, `exerciseProgram.ts`, `useSessionGuard.ts`) — most concepts already have a home.

2. **Never duplicate components** — check `app/_components/` and inline components in `app/page.tsx` (CoachModal, DailyReminderCard, EngagementNudge, etc.) before writing a new one with the same purpose.

3. **Never invent database tables** — the schema is in `supabase-schema.sql`. If a feature needs a new table, propose it and confirm with the user before running migrations.

4. **Never invent APIs** — API routes are in `app/api/`. Every route follows the same pattern: verify token → validate input → touch Supabase via `supabaseAdmin` → return `{success: true, ...}` or `{error: string}`.

5. **Never break architecture** — customer/admin surfaces stay separated by `eb_session` vs `eb_admin_token`. Never make an admin API accessible with a customer cookie or vice versa.

6. **Reuse existing utilities:**
   - Dates → `lib/localDate.ts` (`localDateStr()` for PH-local YYYY-MM-DD)
   - Storage → `lib/progressStorage.ts` (`readProgressCache` / `writeProgressCache`)
   - Auth → `lib/auth.ts` (`verifyCustomerToken` / `verifyAdminToken`)
   - Tier logic → `lib/tierGates.ts` (`MINIMUM_TIER_BY_TYPE`, `SESSION_ONLY_PATHS`)

7. **Reuse components** — `<CoachModal>`, `<FAQItem>`, `<StatCard>`, `<Sidebar>`, `<InstallBanner>`, etc. already exist. Don't rebuild.

8. **Update documentation after every feature** — append to `docs/CHANGELOG` section below OR add an entry to `docs/DECISIONS.md` if it's a non-obvious architectural choice.

9. **Run typecheck** — `npx tsc --noEmit` before commit. Zero errors expected.

10. **Run build** — `npx next build` for anything touching a route or SW.

11. **Run tests** — no unit tests, but manually verify in browser via the browser tools (dev server auto-restarts).

12. **Review your own implementation** — read the diff before committing. Check for accidental `console.log`, dead code, TODO left behind.

**Tone rules:**
- User is Filipino small business owner (R&M).
- Response language: mix of Tagalog + English, casual. Never overly formal.
- Never claim medical benefits (see wellness rules § 2).
- Ask before making destructive changes (delete files, drop data, `--force`).

**File etiquette:**
- **DO NOT** update `PROJECT_CONTEXT.md` — user's explicit instruction. Old snapshot doc.
- **DO NOT** touch `.env.local` or commit any file matching `.env*` / `cookies.txt`.
- **DO** update this file (`docs/PROJECT_BRAIN.md`) when a fact changes.

---

## 12. SESSION MEMORY

Session-scoped notes go to Claude Code's `TaskCreate` system (not this file). Keep this file **stable and versioned**.

For persistent user preferences across sessions, the user has an auto-memory system at `~/.claude/projects/C--Users-admin-Documents-easebrew-wellness-hub/memory/`. Existing memories:
- `project_shared_accounts.md` — coach & admin logins are shared
- `feedback_automation_first.md` — always prefer zero-admin-effort solutions
- `project_device_targets.md` — admin/coach = PC, customer = mobile
- `project_fixes_june2026.md` — historical fixes context

If you're on a fresh session, read those first.

---

## 13. FILE INDEX

| Folder | Purpose |
|--------|---------|
| `app/` | Next 16 App Router pages + APIs |
| `app/_components/` | Cross-cutting customer UI (small; most inlined) |
| `app/admin/_components/` | Admin sidebar, layout helpers |
| `app/api/` | Route handlers (JSON APIs) |
| `lib/` | All reusable business logic + helpers |
| `public/` | Static assets: SW, manifest, icons, images, coach photos, robots.txt |
| `supabase/` | Supabase project config (not migrations) |
| `docs/` | This brain + ADR log (nothing else here yet) |
| `.claude/` | Claude Code CLI settings (`launch.json`, `settings.local.json`) — do NOT put docs here |
| `.agents/` | Legacy agents config (kept for compat) |

Root-level files worth knowing:
- `AGENTS.md` — points to this brain
- `CLAUDE.md` — just says `@AGENTS.md`
- `README.md` — thin project README
- `proxy.ts` — Next 16 middleware (auth + tier gates)
- `next.config.ts` — Next config (CSP headers set here)
- `supabase-schema.sql` — DB snapshot (not versioned migrations)
- `PROJECT_CONTEXT.md` — OLD context file, DO NOT UPDATE
- `.env.local` — secrets (gitignored)

---

## 14. CHANGELOG

Append entries here for major changes. Older entries stay for history.

### 2026-07-21 — Content Batch 1 & 2, QA fixes, CSP dev-fix

- **7 QA must-fix items shipped** (commit `38f629a`): logout button in customer header, iOS voice-input hide, PH-mobile phone validation on coach editor, notifications reach disclaimer, Tagalog PWA manifest description, `/privacy` static page, "Ligtas ang data mo" footer link. Playwright fixture also stabilised (self-seeds `EASE-TEST-0001` customer code — restored 61 passing / 10 skipped / 0 failed).
- **CSP dev-mode fix** (commit `3bdb9fb`): `next.config.ts` now allows `'unsafe-eval'` in `script-src` only when `NODE_ENV !== 'production'`. Production CSP remains strict. Fixes Turbopack module-loader failure in dev that left React unhydrated and all buttons frozen locally.
- **Launch Readiness Report** committed (`3bdb9fb`) — 0 blockers, 2 dev-only advisories, GO for launch.
- **Content Batch 1** (commit `06776f1` docs + `content` table upsert): 22 keys — hero subtitle, 4 product name+desc (Tagalog replacing English defaults), 5 FAQs, `daily_tip_3/4` rewrite (removed "resulta ay darating" / "mas mabilis ang resulta" guarantee language). Emoji prefix on product names stripped afterwards to avoid double-icon on `/verify` Packages tab.
- **Content Batch 2** (commit `9cddf99` docs + `content` table upsert): 45 more keys — coach modal + reorder template (4), `daily_tip_1/6/7/8` new + `daily_tip_2/5` refreshed for "po" consistency (6), FAQ 6 & 7 (4), all 6 real coaches mirrored to DB so admin can edit via `/admin/content` (30), hero title "po" fix (1). Live state: ~70 of 101 `PUBLIC_CONTENT_KEYS` populated. Remaining gaps are intentionally deferred pending owner-supplied videos or real testimonial consent.
- **Production Readiness Review** (commit `9517733`), Security Hardening + SECURITY_REPORT (commit `346b8ff`), Sentry integration (deferred activation), GitHub Actions CI + CodeQL — all in place from prior work.

### 2026-07-13 — Automation batch + audit + brain

- 13 automations shipped (see § 10 Roadmap "Completed")
- 20-batch full production audit (functional/perf/a11y/security/SEO/data/deploy/copy/e2e) — passed
- `docs/PROJECT_BRAIN.md` (this file) + `docs/DECISIONS.md` created

### 2026-07-12 — Reorder & Coach Modal live-editable

- Added `reorder_message_template`, `coach_modal_title`, `coach_modal_subtitle_reorder/default` to `PUBLIC_CONTENT_KEYS`
- Admin can now edit reorder + coach modal texts in `/admin/content` under "🛒 Reorder & Coach Modal" group
- Live via `/api/content` (30s cache)

### Earlier

- 30-day senior-safe Tagalog exercise program (rebuilt from 17 days)
- CMS-driven content system (coaches, tips, FAQs, testimonials, videos)
- Family share JWT (7-day read-only)
- Full Tagalog UI sweep + medical accuracy audit
- PWA installable, service worker with expiry alerts
- Race condition fixes on medication/BP saves (debounced sync + latest-write-wins + unmount flush)

---

## 15. TROUBLESHOOTING

### Common issues

**"Unauthorized" on customer page load**
- Cookie `eb_session` missing or expired.
- Check: `document.cookie` in browser console won't show it (httpOnly). Test via `GET /api/session`.
- Fix: user re-verifies at `/verify` (session TTL matches code expiry).

**Customer stuck at "Sandali lang..." spinner**
- Likely fetch failure. `useSessionGuard` tolerates 5 fails then redirects to `/verify`.
- Check network tab, Supabase status.

**Admin can't login**
- Rate limited after too many attempts (see `admin_login_attempts` table).
- Check Supabase for row count in last 15 min.
- Fix: wait 15 min or delete recent rows.

**Content edit doesn't appear on customer**
- CDN cache is 30s. If still not showing after 60s, check:
  - Content key is in `PUBLIC_CONTENT_KEYS` (`lib/contentKeys.ts`)
  - Customer page fetches `/api/content` on mount (some pages don't — verify page.tsx, verify/page.tsx, exercise/page.tsx do)
  - Value passes `validateContentUpdate` (check response of admin POST)

**Service worker not showing notifications**
- Notification permission denied. Check `Notification.permission`.
- Reminder-enabled cache missing. User must toggle "Paalala Araw-araw" ON.
- Mobile browser suspended SW. Only fires when page is open OR after tick.

**Build fails on Vercel but works locally**
- Env vars not set in Vercel dashboard. Required: `JWT_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Compare `.env.local` → Vercel project settings.

### Common fixes

**Reset a specific customer's data:**
```sql
DELETE FROM progress WHERE code = 'EASE-XXXX-XXXX' AND type = 'tracker';
```
(Confirm the code and type first.)

**Extend a code's expiry:**
```sql
UPDATE access_codes
SET expires_at = expires_at + interval '30 days'
WHERE code = 'EASE-XXXX-XXXX';
```

**Regenerate an activated code (device swap):**
```sql
UPDATE access_codes
SET device_id = NULL, is_used = false, used_at = NULL
WHERE code = 'EASE-XXXX-XXXX';
DELETE FROM customer_sessions WHERE code = 'EASE-XXXX-XXXX';
```

### Debug commands

```bash
# Typecheck
npx tsc --noEmit

# Production build (catches SSR errors)
npx next build

# Dev server
npm run dev
# or via Claude Code:
# preview_start with name "dev" from .claude/launch.json

# Check .env vars a route actually reads
grep -RE 'process\.env\.[A-Z_]+' app/api/ lib/

# List all API routes
find app/api -name route.ts

# List all public content keys
grep -A100 'PUBLIC_CONTENT_KEYS =' lib/contentKeys.ts
```

### Recovery steps

**"I accidentally committed a secret":**
1. Rotate the secret immediately (Supabase dashboard → new service role key; JWT_SECRET → generate new + all sessions invalidated).
2. Remove from git history: `git filter-branch` OR (easier for a solo repo) `git reset --hard <before-commit>` if not pushed.
3. Push force ONLY if not shared with team.

**"Customer complains logs disappeared":**
1. Check `progress` table for their `code` — is `data.entries` there?
2. If yes: it's client-side merge bug. Ask them to reload; localStorage will re-sync from server (server is source of truth).
3. If no: check `admin_audit_log` for any deletes. Check backups.

**"Admin dashboard shows 0 customers":**
1. Verify admin cookie: `GET /api/admin/me`.
2. Check `/api/admin/codes?limit=200` — does it return data?
3. If yes: UI cache issue, hard refresh.
4. If no: Supabase connectivity issue, check env vars.

---

**End of Project Brain.** If a fact here is stale, correct it here first before working on the code. This is the trust source.
