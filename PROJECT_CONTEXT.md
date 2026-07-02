# PROJECT_CONTEXT.md — EaseBrew Wellness Hub

> Reference doc for AI assistants working on this codebase. Written so an assistant with zero prior context can understand the whole system.

---

## 1. What This App Is

**R&M EaseBrew Wellness Hub** — a Progressive Web App (PWA) that serves as the digital wellness companion for customers who buy R&M EaseBrew (a herbal joint-pain product, sold offline via coaches / Facebook). Each physical order comes with a **printed access code**; the customer enters the code in the app to unlock digital wellness tools (pain tracker, meal plans, exercise guides, recipes, a 90-day program).

- **Primary language:** Tagalog (Filipino). English used only in code + admin UI.
- **Target users:** Filipino adults 40+, mostly with joint pain / arthritis / rayuma.
- **Business model:** Digital products are gated by *tier* (how many packs the customer bought). Bigger orders → more unlocks + longer validity.
- **Company:** R&M Digital Trading. Product line: R&M EaseBrew.

---

## 2. Tech Stack

| Layer          | Tech                                                                    |
| -------------- | ----------------------------------------------------------------------- |
| Framework      | Next.js **16.2.7** (App Router, React 19.2.4)                           |
| Language       | TypeScript 5                                                            |
| Styling        | Tailwind CSS v4 (via `@tailwindcss/postcss`) — but most pages use **inline styles** on purpose (see §11) |
| DB / Backend   | Supabase (Postgres + service-role key on server; anon key on client)    |
| Auth (custom)  | Signed JWTs in httpOnly cookies via `jose`; passwords hashed with `bcryptjs` |
| Icons          | `lucide-react`                                                          |
| Deployment     | Vercel (see `vercel.json`, currently empty `{}`)                        |
| PWA            | Service worker at `public/sw.js`, registered via `public/register-sw.js` |
| Testing        | `@playwright/test` installed but no test files committed                |

> ⚠️ **`AGENTS.md` warning:** "This is NOT the Next.js you know — read `node_modules/next/dist/docs/` before writing code." Next 16 has breaking changes from the training-data 14/15 you likely know. Notably: this repo puts middleware in `proxy.ts` at the root, not `middleware.ts` (see §11).

---

## 3. Folder Structure

```
easebrew-wellness-hub/
├── app/                       # Next.js App Router
│   ├── layout.tsx             # Root layout — brand metadata, manifest, viewport
│   ├── globals.css            # Tailwind + @theme brand tokens
│   ├── page.tsx               # / — customer hub (home, tips, gifts, coaches)
│   ├── verify/page.tsx        # /verify — enter access code
│   ├── tracker/page.tsx       # Pain / mood / Easebrew intake tracker
│   ├── meal-plan/page.tsx     # 50-day meal plan
│   ├── exercise/page.tsx      # Exercise routines
│   ├── recipes/page.tsx       # Recipe book + favorites
│   ├── bagong-katawan/page.tsx# 90-day "New Body" program
│   ├── water/page.tsx         # Water-glasses log
│   ├── bmi/page.tsx           # BMI calculator (no gate)
│   ├── report/page.tsx        # Weekly summary
│   ├── _components/           # (empty at time of writing)
│   ├── admin/                 # Admin panel (owner + coach)
│   │   ├── page.tsx           # Dashboard (stats)
│   │   ├── codes/page.tsx     # Codes CRUD, customer profile drawer
│   │   ├── content/page.tsx   # Owner-only content CMS
│   │   ├── analytics/page.tsx # Owner-only usage stats
│   │   ├── notifications/page.tsx # Messenger templates + push tools
│   │   ├── audit-log/page.tsx # Owner-only audit trail
│   │   ├── login/page.tsx     # Admin login
│   │   └── _components/Sidebar.tsx
│   └── api/                   # Route handlers
│       ├── verify-code/route.ts   # POST — activate code on device
│       ├── session/route.ts       # GET/DELETE — customer session
│       ├── progress/route.ts      # GET/POST — per-type progress
│       ├── content/route.ts       # GET — public content (whitelist)
│       └── admin/
│           ├── login/route.ts         # POST/DELETE
│           ├── me/route.ts            # GET
│           ├── generate-code/route.ts # POST
│           ├── codes/route.ts         # GET/PATCH/DELETE
│           ├── content/route.ts       # GET/POST/DELETE
│           ├── audit-log/route.ts     # GET
│           └── customer-progress/route.ts # GET
├── lib/                       # Shared helpers (see §4)
├── supabase/migrations/       # 10 migrations committed (see §5)
├── public/                    # Icons, coach photos, manifest, sw.js
├── proxy.ts                   # ⚠️ Middleware, but named `proxy.ts` (see §11)
├── next.config.ts             # Security headers + CSP
├── package.json
└── AGENTS.md / CLAUDE.md      # Warns about Next 16 breaking changes
```

---

## 4. `lib/` — Shared Modules

| File                  | Purpose                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------- |
| `supabase.ts`         | Exports `supabase` (anon client) and `supabaseAdmin` (service-role — **server only**). Also exports DB row types (`AccessCode`, `CustomerSession`, `Content`, `AdminUser`, `PushSubscription`). |
| `auth.ts`             | JWT sign/verify + cookie set/clear for both admin and customer sessions. Uses `jose` (HS256). Also re-checks admin `is_active` on every request. |
| `device.ts`           | `getDeviceId()` — client-safe. Reads/creates 32-hex-char device id in `localStorage`. **Isolated from `supabase.ts`** so client bundles don't try to instantiate the server client (see comment in file). |
| `price-config.ts`     | **Single source of truth** for tier → packs → validityDays → label. See §7. |
| `products.ts`         | Tier → digital-product mapping + helpers (`splitByTier`, `getGiftsForTier`, `applyContentOverrides`). |
| `coaches.ts`          | Default coach list + `buildCoaches(content, defaults)` to merge with admin-edited overrides. |
| `coachLabel.ts`       | Stores the currently-selected coach display name for shared admin accounts (see §6). |
| `contentKeys.ts`      | Whitelist of **public** editable content keys + `validateContentUpdate()` (URL/photo path safety checks). |
| `useAdminGuard.ts`    | Client-side hook: 2-min session-cache + 2-min server revalidation via `/api/admin/me`. Redirects to `/admin/login` if unauthorized. |
| `useSessionGuard.ts`  | Customer equivalent: polls `/api/session` every 60s; redirects to `/verify?from=…`. |
| `progressStorage.ts`  | `localStorage` helpers scoped by session code (`progressStorageKey(base, code)`) — for offline-first caching of tracker data. |
| `audit.ts`            | `writeAuditLog()` — fire-and-forget insert into `admin_audit_log`. |
| `colors.ts`           | JS-side brand color constants (`G`, `GOLD`, `AMBER`, etc.) — mirror of CSS `@theme` tokens. |
| `brand.ts`            | Company/product identity + tagline strings. |

---

## 5. Database Schema (Supabase)

### 5.1 Committed migrations

Ten migrations checked into `supabase/migrations/`, ordered by timestamp:

1. **`202606010001_create_access_codes.sql`** — base `access_codes` table + indexes.
2. **`202606010002_create_customer_sessions.sql`** — session records w/ FK to `access_codes`.
3. **`202606010003_create_progress.sql`** — per-code per-type jsonb progress w/ composite PK.
4. **`202606010004_create_content.sql`** — admin-editable copy w/ UNIQUE key.
5. **`202606010005_create_activity_logs.sql`** — customer-side telemetry.
6. **`202606010006_create_push_subscriptions.sql`** — Web Push subscription store.
7. **`202606200001_add_access_codes_code_unique.sql`** — adds `UNIQUE` on `access_codes.code`.
8. **`202606210001_create_admin_users.sql`** — creates `admin_users` + `set_updated_at()` trigger.
9. **`202606260001_create_admin_audit_log.sql`** — creates `admin_audit_log` with indexes.
10. **`202607020001_create_admin_login_attempts.sql`** — rate-limit table for admin login (replaces the old in-memory Map).

> ⚠️ **Gotcha:** Migrations 1–6 were **backfilled** from `lib/supabase.ts` types + API route SQL usage. The tables already existed in production (created via Supabase dashboard). Applying these against prod is safe because they use `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`, but the RLS `DROP POLICY / CREATE POLICY` blocks will replace any hand-created policies. Diff against the live schema before applying.

### 5.2 Tables (derived from code)

#### `access_codes` (customer-facing codes)
```
id             uuid PK
code           text UNIQUE          -- format: EASE-XXXX-XXXX (12 chars from a
                                    --  no-confusion alphabet: ABCDEFGHJKLMNPQRSTUVWXYZ23456789)
tier           int                  -- price tier in ₱, matches PRICE_CONFIG key
packs          int                  -- how many packs this tier unlocks
validity_days  int                  -- days from activation until expiry
is_used        bool                 -- flipped true on first successful verify
used_at        timestamptz | null
expires_at     timestamptz | null   -- set = used_at + validity_days on activation
device_id      text        | null   -- binds code to one phone
created_by     text                 -- admin username
customer_name  text        | null
notes          text        | null
created_at     timestamptz
```
Access pattern: one code, one device, one activation. Reactivation clears `is_used/used_at/expires_at/device_id`.

#### `customer_sessions` (materialized session rows for analytics + restore)
```
id           uuid PK
code_id      uuid FK → access_codes(id)
code         text
device_id    text
tier         int
packs        int
activated_at timestamptz
expires_at   timestamptz
last_seen_at timestamptz
```
> Note: the JWT cookie is the *actual* session; this table is a durable record used to restore sessions on same-device re-verify + to power the coach dashboard's "last seen" and analytics views.

#### `progress` (per-code per-type wellness data)
```
code        text
type        text     -- one of: tracker, mealplan, exercise, recipe_favorites,
                     --         bagong_katawan, water
data        jsonb    -- opaque per-type shape, capped at 100_000 bytes
updated_at  timestamptz
PRIMARY KEY (code, type)
```
Upserted via `onConflict: 'code,type'`.

#### `content` (admin-editable strings)
```
id          uuid PK
key         text UNIQUE    -- must be in PUBLIC_CONTENT_KEYS whitelist
value       text           -- up to 10_000 chars
updated_at  timestamptz
updated_by  text
```
`GET /api/content` returns only whitelisted keys, cached 5 min at the edge (`s-maxage=300, stale-while-revalidate=3600`).

#### `admin_users`
```
id                    uuid PK
username              text
username_normalized   text  GENERATED lower(btrim(username))  UNIQUE
role                  text  CHECK IN ('owner','coach')
password_hash         text            -- bcryptjs hash
is_active             bool  DEFAULT true
created_at, updated_at timestamptz
```
Trigger `set_updated_at()` bumps `updated_at` on update.

#### `admin_audit_log`
```
id             uuid PK
admin_username text
action         text  -- generate_code | deactivate_code | reactivate_code |
                     --  delete_code | update_code_notes | update_content |
                     --  delete_content | admin_login | admin_login_failed
target_id      text | null
target_code    text | null
metadata       jsonb | null
created_at     timestamptz
```
Indexes: by `admin_username`, by `created_at DESC`, partial by `target_code WHERE NOT NULL`.

#### `admin_login_attempts` (rate-limit backing store)

```
id           uuid PK
identifier   text        -- "<ip>:<username_normalized>"
attempted_at timestamptz DEFAULT now()
```

Index: `(identifier, attempted_at DESC)`. One row per attempt is inserted **before** the bcrypt check. Rows are deleted on successful login. Count within a 15-min window ≥ 8 → 429. Rows are safe to prune after 1 hour.

#### `activity_logs` (customer telemetry)
```
device_id  text
action     text        -- e.g. 'code_verified'
metadata   jsonb
```
Written from `/api/verify-code` on successful first activation.

#### `push_subscriptions` (type only — usage not fully wired)
```
id                 uuid PK
device_id          text
subscription_json  jsonb
tier               int | null
created_at         timestamptz
```
Type is exported but the admin `notifications` page is currently a **template library** (Messenger copy-paste helpers), not a live push sender. Treat as future work.

### 5.3 RLS policies

Every table with a committed migration has RLS **enabled** with a single policy allowing only `service_role`:

```sql
using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
```

This is the pattern for all tables in the project: **all DB writes go through server-side API routes** using `supabaseAdmin` (service-role key). The client's anon-key `supabase` export exists in `lib/supabase.ts` but is not used anywhere at time of writing.

---

## 6. Auth Flow

### 6.1 Customer flow

1. Customer receives a printed code with their EaseBrew order (`EASE-XXXX-XXXX`).
2. They open the app, land on `/verify` (redirected there by `proxy.ts` if unauthenticated).
3. Client generates or reads a `device_id` from `localStorage` via `getDeviceId()`.
4. `POST /api/verify-code` with `{ code, device_id }`. Server:
   - Normalizes code (strips spaces/hyphens, uppercases, re-inserts hyphens).
   - Fetches the `access_codes` row.
   - If **already used on another device** → 403.
   - If **expired** (`expires_at <= now`) → 403, plus delete matching `customer_sessions` row.
   - If **already used on THIS device** → restore session (upsert `customer_sessions.last_seen_at`), issue new JWT cookie.
   - If **unused** → atomic claim: `UPDATE ... WHERE is_used=false` (race-safe against concurrent activations on different devices). On success, compute `expires_at = now + validity_days`, insert into `customer_sessions`, write `activity_logs` row, issue JWT.
5. JWT `eb_session` cookie is signed with `JWT_SECRET`, httpOnly, `sameSite=strict`, expires at `expires_at`.
6. Every ~60s the client hits `GET /api/session`, which re-checks against the DB (so a coach can deactivate a code in real time by setting `expires_at = now()`).

### 6.2 Admin flow

1. Admin visits `/admin/login`. POST username + password to `/api/admin/login`.
2. Supabase-backed rate limiter (per IP + username): counts rows in `admin_login_attempts` where `identifier='<ip>:<username>'` and `attempted_at > now() - interval '15 minutes'`. Insert happens **before** the bcrypt check (so brute-forcing can't burn attempts without them counting). On success, all rows for the identifier are deleted. Shared across all Vercel instances.
3. Lookup `admin_users` by `username_normalized`. `bcrypt.compare()` password.
4. Success → issue `eb_admin_token` JWT (24h), redirect based on role.
5. `useAdminGuard()` in every admin page checks a 2-min sessionStorage cache, then re-verifies against `/api/admin/me` every 2 min. `/api/admin/me` re-reads `admin_users` each time and rejects if `is_active=false` (so deactivating a coach kicks them out within 2 min).
6. Middleware (`proxy.ts`) also gates `/admin/*` routes: coaches can only access `/admin`, `/admin/codes`, `/admin/codes/*`.

### 6.3 Shared accounts (important context — from memory)

> Coach and admin accounts are **shared logins**, not per-person. Multiple staff members share one `admin_users` row. `coachLabel.ts` stores a per-browser display name (in localStorage) so the UI can show "Logged in as Coach Nina" without needing separate accounts. Don't design features assuming 1 user = 1 login.

---

## 7. Business Logic — Tier / Validity Rules

### 7.1 `PRICE_CONFIG` (single source of truth — `lib/price-config.ts`)

| Tier (₱) | Packs | Validity (days) | Label              |
| -------- | ----- | --------------- | ------------------ |
| 399      | 1     | 10              | 1 Pack — ₱399      |
| 699      | 2     | 20              | 2 Packs — ₱699     |
| 999      | 3     | 30              | 3 Packs — ₱999     |
| 1499     | 5     | 45              | 5 Packs — ₱1,499   |
| 2998     | 10    | 75              | 10 Packs — ₱2,998  |
| 4497     | 15    | 105             | 15 Packs — ₱4,497  |
| 5996     | 20    | 135             | 20 Packs — ₱5,996  |
| 7499     | 25    | 165             | 25 Packs — ₱7,499  |
| 8994     | 30    | 195             | 30 Packs — ₱8,994  |
| 11992    | 40    | 255             | 40 Packs — ₱11,992 |
| 14990    | 50    | 315             | 50 Packs — ₱14,990 |

Rule of thumb: validity ≈ 10 days per pack, with a small bonus at higher tiers.

### 7.2 Product unlock thresholds (`lib/products.ts`)

| Product                                    | Min tier | Route              |
| ------------------------------------------ | -------- | ------------------ |
| 📊 Body Pain Tracker + Journal             | 999      | `/tracker`         |
| 💧 Water Log                               | 999      | `/water`           |
| 🥗 50-Day Anti-Inflammation Meal Plan      | 1499     | `/meal-plan`       |
| 💪 30-Day Home Exercise Guide              | 1499     | `/exercise`        |
| 📖 Pinoy Anti-Inflammation Recipe Book     | 2998     | `/recipes`         |
| 🏆 Bagong Katawan 90-Day Program           | 4497     | `/bagong-katawan`  |
| 🌿 VIP Wellness Bundle                     | 5996     | `/bagong-katawan`  |

These are enforced in **three** independent places (kept in sync manually):

1. **Middleware `proxy.ts`** — hard route gate (`MINIMUM_TIER_BY_PATH`).
2. **`/api/progress` route** — data gate (`MINIMUM_TIER_BY_TYPE`).
3. **`app/page.tsx` and `app/verify/page.tsx` UI** — visual unlock/lock state via `splitByTier()` / `getGiftsForTier()`.

> **Consistency note:** `/tracker` and `/water` were previously mismatched (middleware required 999, `/api/progress` only 399). Both `MINIMUM_TIER_BY_TYPE` and `MINIMUM_TIER_BY_PATH` are now aligned at **999** for tracker + water. If you add a new product, remember to update *all three* layers above.

### 7.3 Code lifecycle

- **Generate** (owner + coach): random 8-char body (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789` — omits confusing `I/O/0/1`) → formatted `EASE-XXXX-XXXX`. Retries up to 10 times on `UNIQUE` violation (`23505`).
- **Activate**: on first `verify-code` POST, atomic `UPDATE ... WHERE is_used=false` sets `is_used=true, used_at=now, expires_at=now+validity_days, device_id=<claimed>`.
- **Deactivate** (owner + coach; coach only for own codes): sets `expires_at = now()`. Session re-check in `/api/session` will then invalidate the cookie within 60s. **Coaches cannot reactivate** — owner only.
- **Delete** (owner only): cascades — deletes `customer_sessions` (FK), then `progress` rows matching code string, then the `access_codes` row itself.
- **Notes**: coach can edit their own code's notes (max 500 chars); owner can edit any.

---

## 8. API Routes — Shapes

### Public / customer

#### `POST /api/verify-code`
```ts
Req:  { code: string; device_id: string }
Res:  { success: true; session: CustomerSession } | { error: string }
Sets: eb_session cookie (JWT, httpOnly, expires at expires_at)
Codes: 400 bad input | 404 unknown code | 403 expired/other-device |
       409 race (claimed elsewhere) | 500 internal
```

#### `GET /api/session`
Re-validates the JWT against the DB every call. Refreshes cookie on success.
```ts
Res:  { success: true; session: CustomerSession } | { error: string }
Codes: 401 no/invalid token or code deactivated
```

#### `DELETE /api/session`
Clears the cookie.

#### `GET /api/progress?type=<type>`
```ts
Type ∈ { tracker, mealplan, exercise, recipe_favorites, bagong_katawan, water }
Res:  { success: true; data: unknown | null; updated_at: string | null }
```

#### `POST /api/progress`
```ts
Req:  { type: string; data: unknown }  // JSON.stringify(data).length ≤ 100_000
Res:  { success: true } | { error: string }
Codes: 401 unauth (bad tier / expired) | 400 missing data | 413 too large
```

#### `GET /api/content`
Public — no auth. Whitelist from `PUBLIC_CONTENT_KEYS`. Edge-cached 5min.
```ts
Res:  { success: true; content: Record<string, string> }
```

### Admin (all require valid `eb_admin_token`)

| Method + Path                          | Role   | Purpose                                  |
| -------------------------------------- | ------ | ---------------------------------------- |
| `POST /api/admin/login`                | —      | Login + rate-limit. Sets `eb_admin_token`. |
| `DELETE /api/admin/login`              | —      | Clear cookie.                             |
| `GET /api/admin/me`                    | any    | `{ username, role }` if active.           |
| `POST /api/admin/generate-code`        | any    | Generate code. Body: `{ tier, customer_name, notes }`. |
| `GET /api/admin/codes?filter=&limit=`  | any    | List codes. Coaches see only own. `filter ∈ used|unused|all`. Enriched w/ `last_active_at` from `progress[type=tracker]`. |
| `PATCH /api/admin/codes`               | any    | Body: `{ id, action }`. Actions: `deactivate`, `reactivate` (owner-only), `update_notes`. Coach can only touch own codes. |
| `DELETE /api/admin/codes`              | owner  | Body: `{ id }`. Cascade delete.           |
| `GET /api/admin/content`               | owner  | Full editable content map.                |
| `POST /api/admin/content`              | owner  | Body: `{ updates: {key,value}[] }`. Validates via `validateContentUpdate`. |
| `DELETE /api/admin/content`            | owner  | Body: `{ key }`. Row deletion → fallback to defaults. |
| `GET /api/admin/audit-log?limit=`      | owner  | Recent audit entries (max 200).           |
| `GET /api/admin/customer-progress?code=` | any  | Full progress dump for a code. Coach only own codes. |

---

## 9. Admin Panel Features

### 9.1 Dashboard (`/admin`)
Stats: total codes, active/expired/unused counts, revenue estimate, recently active customers. Uses `useAdminGuard(['owner','coach'])`.

### 9.2 Codes (`/admin/codes`) — the main workhorse
- Search + filter (used/unused/all).
- **Generate code** modal — pick tier + enter customer name + optional notes.
- **Bulk export** — CSV download.
- **QR code** display per code.
- **Copy Messenger message** — pre-templated Tagalog message with the code embedded.
- **Customer profile drawer** — fetches `/api/admin/customer-progress?code=…` and shows tracker history, water log, meal-plan progress, etc.
- **Deactivate / Reactivate / Delete / Edit notes** actions (RBAC per §7.3).

### 9.3 Content CMS (`/admin/content`) — owner only
Edits every `PUBLIC_CONTENT_KEYS` entry with typed field metadata (grouped by section: Promo, Homepage, Products, Coaches, Tips, FAQs, Testimonials, Videos, Order URLs). URL and photo-path fields are validated server-side.

### 9.4 Analytics (`/admin/analytics`) — owner only
Aggregate stats (revenue, top tiers, activity trends).

### 9.5 Notifications (`/admin/notifications`)
**Currently a template library**, not a push sender. Provides copy-paste Messenger scripts and quick-message templates for coaches. The `push_subscriptions` table + type exists but no send route is wired.

### 9.6 Audit log (`/admin/audit-log`) — owner only
Last 50–200 audit entries with icons + colored action tags.

### 9.7 Sidebar (`app/admin/_components/Sidebar.tsx`)
Role-aware nav. Coaches see only Dashboard + Codes; owners see everything.

---

## 10. Environment Variables

Names only — set these in Vercel / `.env.local`:

| Variable                          | Where used                            |
| --------------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Client + server (`lib/supabase.ts`)   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Client + server (`lib/supabase.ts`)   |
| `SUPABASE_SERVICE_ROLE_KEY`       | **Server only** (`supabaseAdmin`)     |
| `JWT_SECRET`                      | **Server only** (`lib/auth.ts`) — signs both admin and customer cookies |

All four are asserted at module load — the app will throw immediately if any are missing.

---

## 11. Non-Obvious Patterns & Gotchas

1. **Middleware file is named `proxy.ts`, not `middleware.ts`.** This is a Next.js 16 change referenced in `AGENTS.md` (the file exports `proxy` and a `config.matcher`). If you touch routing, look here, not for `middleware.ts`.

2. **`AGENTS.md` warning:** "This is NOT the Next.js you know." Next 16 has breaking changes. Consult `node_modules/next/dist/docs/` before writing code that touches routing, caching, or React server components.

3. **`lib/device.ts` is deliberately isolated from `lib/supabase.ts`.** If you import `getDeviceId` from `supabase.ts`, the browser bundle will try to instantiate `supabaseAdmin` and blow up with "supabaseKey is required." Always import device helpers from `lib/device.ts`.

4. **Inline styles everywhere.** Multiple recent commits ("convert all admin pages from CSS classes to inline styles", "replace CSS class styles with inline styles on admin dashboard") show the team deliberately migrated away from Tailwind classes on some pages. Tailwind is still configured, and `globals.css` has `@theme` tokens, but assume most page code uses `style={{ ... }}` with constants from `lib/colors.ts`.

5. **Brand color duplication is intentional.** `lib/colors.ts` (JS) mirrors the `@theme` block in `globals.css` (CSS). Change both when adjusting brand colors.

6. **`applyContentOverrides` pattern.** Fallback defaults live in code (`DEFAULT_PRODUCTS`, `DEFAULT_COACHES`, `DEFAULT_VIDEOS`, etc.); admin edits are merged in via `/api/content` at render time. Deleting a `content` row returns the default — this is by design (`DELETE /api/admin/content`).

7. **Shared accounts (from memory).** Coach and admin accounts are logins shared across multiple people. Don't build "who created X" flows expecting per-person attribution — `created_by` is the username of the shared account, not the individual. `lib/coachLabel.ts` provides a per-browser display override.

8. **Automation-first (from memory / feedback).** The team strongly prefers self-service, zero-admin-effort solutions over manual admin workflows. When suggesting a feature, default to in-app / automatic over admin-managed.

9. **Rate limiter is Supabase-backed (`admin_login_attempts`).** Every login attempt inserts a row *before* the bcrypt check; successful logins delete all rows for the identifier. Shared across serverless instances. **Fail-open** if Supabase is unreachable (returns "not rate-limited") — matches the previous in-memory behavior on cold boot. No automatic pruning yet; run `DELETE WHERE attempted_at < now() - interval '1 hour'` via `pg_cron` if the table grows.

10. **Progress size limit is 100KB per row.** `JSON.stringify(data).length > 100_000 → 413`. Tracker entries accumulate; if you add long text fields (e.g., journal notes) plan for archival or paging.

11. **Session revalidation is aggressive.** Customer session polls every 60s (`useSessionGuard`); admin session revalidates every 2 min (`useAdminGuard`). Both hit the DB on every check — deactivating a code / coach reliably kicks users out within one interval. Be aware if you add read-heavy tables — this is DB request pressure on every open tab.

12. **Progress `type` values are hardcoded strings.** No enum. Add a new type → update **both** `MINIMUM_TIER_BY_TYPE` in `app/api/progress/route.ts` and the client callers. Consider consolidating into a shared const.

13. **Access-code alphabet omits `IO01`.** Prevents customer read errors on printed codes.

14. **CSP is strict.** `next.config.ts` sets a CSP that restricts `connect-src` to `'self'` + `*.supabase.co`. Adding a third-party API (analytics, Sentry, etc.) requires updating this.

15. **Service worker (`public/sw.js`) is unversioned in this doc.** PWA offline behavior is a feature — inspect `sw.js` before shipping caching changes so you don't break offline `/verify` or `/tracker`.

16. **No test suite committed.** Playwright is installed but there are no `*.spec.ts` files. Manual verification is the current QA loop.

17. **Migrations are complete but backfilled.** All 6 base tables (`access_codes`, `customer_sessions`, `progress`, `content`, `activity_logs`, `push_subscriptions`) now have committed migrations, reverse-engineered from the types in `lib/supabase.ts` + API SQL usage. Applying to a fresh DB is safe; applying to prod is safe (uses `IF NOT EXISTS`) but will replace any hand-created RLS policies with the standard service-role-only policy — diff before applying.

18. **Progress data shapes are opaque `jsonb`.** Each page defines its own type locally (e.g., `DayEntry`, `QuickEntry`, `Measurements`) and stores it whole. No server-side validation of `data` beyond size. Client trust boundary — corrupted data on one device won't crash others, but be defensive when reading.

---

## 12. Where to Look First

- **Change tier prices / validity** → `lib/price-config.ts` (single source of truth). Also update middleware + progress route if adding NEW tiers with different unlocks.
- **Add a new digital product / gate** → `lib/products.ts` + `proxy.ts` + `app/api/progress/route.ts` + `app/page.tsx` (Gifts tab).
- **Change admin capabilities** → `proxy.ts` (route gate) + individual `/api/admin/*` route (data gate). Don't rely on only one layer.
- **Edit customer-facing copy** → `/admin/content` (runtime) or `DEFAULT_*` constants (fallback).
- **Add an admin action to audit log** → extend `AuditAction` union in `lib/audit.ts` and call `writeAuditLog(...)` from the route.
- **PWA / offline behavior** → `public/sw.js`, `public/register-sw.js`, `public/manifest.json`.
- **Coach vs owner UI split** → `app/admin/_components/Sidebar.tsx` + `useAdminGuard([...allowedRoles])` at page top.

---

*End of PROJECT_CONTEXT.md*
