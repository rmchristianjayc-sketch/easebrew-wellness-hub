# Roadmap — Operational Excellence

**Purpose:** Turn the R&M EaseBrew Wellness Hub from a functionally complete small-business app into a production-grade system with proper CI/CD, monitoring, testing, and operational hygiene.

**Guardrails (from user directive):**
- Never rewrite working code just because we prefer another implementation.
- Never introduce breaking changes.
- Never refactor unless there is a measurable benefit.
- Preserve all existing functionality.

**Ground truth:** [PROJECT_AUDIT.md](PROJECT_AUDIT.md) — baseline ratings we're improving from.

**Overall approach:** Each phase is **additive** (adds capability, doesn't rewrite what works). Each phase ends with lint + typecheck + build passing. Playwright tests run once they exist (Phase 1).

---

## Phase overview

| # | Phase | Complexity | Risk | Est. time | Blocker for later? |
|---|-------|:----------:|:----:|:---------:|:------------------:|
| 1 | Production testing (Playwright) | Medium | Low | 4-6 h | Yes — CI needs tests |
| 2 | CI/CD pipeline (GitHub Actions) | Low | Low | 1-2 h | Yes — everything else assumes CI |
| 3 | Error tracking (Sentry) | Low | Low | 1 h | No |
| 4 | Structured logging + request IDs | Medium | Low | 2-3 h | No |
| 5 | Uptime + analytics (external) | Low | None | 30 m in-repo | No |
| 6 | Versioned DB migrations | Medium | Medium | 3 h | Recommended before Phase 7 |
| 7 | Cleanup jobs (`admin_login_attempts`, `activity_logs`) | Low | Low | 1 h | No |
| 8 | Dependency scanning (Dependabot + npm audit) | Low | Low | 30 m | No |
| 9 | Performance budgets + Lighthouse CI | Medium | Low | 2 h | No |
| 10 | Documentation (RUNBOOK + TESTING + DEPLOYMENT) | Low | None | 3 h | No |
| 11 | Component extraction (`app/page.tsx`) | Medium | Medium | 4-6 h | No — optional cleanup |
| 12 | Advanced security (CSP nonces, security.txt) | High | Medium | 1-2 d | No — future |

**Total for Phases 1-10 (production baseline): ~20 hours.**

---

## Phase 1 — Production Testing

**Goal.** Automated coverage of the golden paths so we can safely refactor and deploy without manual clicking through every flow.

**Scope.**
- Playwright config (`playwright.config.ts`) — HTML reporter, screenshots + traces on failure, chromium project, mobile + desktop viewports
- Test folder structure: `tests/e2e/{customer,admin,api}/*.spec.ts`, `tests/fixtures/`, `tests/pages/` (page objects), `tests/helpers/`
- Global setup — seed a known test customer code + admin account against a scratch Supabase (or reuse dev)
- Coverage:
  - **Customer:** verify code (valid + invalid + expired + rate-limited), home renders, mood tap saves, BP save round-trip, session persists, session expiry, logout via cookie clear
  - **Admin:** login (valid + invalid + rate-limited), dashboard renders, generate code, edit content, notifications page, analytics page, audit log page
  - **API:** unauthorized 401, malformed JSON 400, out-of-range values 400, rate limit 429, tier-gated 401
- One-command run: `npm test`
- Add `test`, `test:ui`, `test:headed`, `test:report` scripts to `package.json`

**Complexity.** Medium — many specs to write, but each is short. Playwright already installed.

**Risk.** Low — tests are read-only against dev DB. Cleanup fixture removes test data after each run.

**Estimated time.** 4-6 hours.

**Verification.**
- `npm test` runs green
- `npm run test:report` opens HTML report
- Fail intentional (change a label, re-run) → failure captured with screenshot + trace
- CI (Phase 2) picks it up

**Documentation deliverable.** `docs/TESTING.md` — how to run, folder structure, how to add specs, best practices, debugging traces.

---

## Phase 2 — CI/CD

**Goal.** Every push to `main` and every PR runs lint + typecheck + build + Playwright tests. No red PR gets merged.

**Scope.**
- `.github/workflows/ci.yml`
  - Trigger on `push: main` and `pull_request`
  - Node 20 setup, npm cache, install
  - Run `npm run lint`
  - Run `npx tsc --noEmit`
  - Run `npm run build`
  - Run `npx playwright test` (chromium only, headless)
  - Upload Playwright HTML report as artifact on failure
- Environment secrets: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET` set in GitHub Actions secrets
- Branch protection rule on `main` (documented in RUNBOOK — GitHub UI setup, no code)

**Complexity.** Low — standard Next.js CI recipe.

**Risk.** Low — CI is read-only against the codebase; only reads secrets, never writes.

**Estimated time.** 1-2 hours.

**Verification.**
- Push a trivial change → workflow runs green
- Push a change that breaks typecheck → workflow fails with the type error visible
- Playwright artifact downloads correctly on failure

**Documentation deliverable.** Section in `docs/DEPLOYMENT.md` explaining CI flow and how to interpret failures.

---

## Phase 3 — Error Tracking

**Goal.** When a customer hits a 500 or a client-side crash, we know immediately with a stack trace and user context (code + tier, no PII).

**Scope.**
- Add `@sentry/nextjs` (or `glitchtip` if preferring self-hosted / free)
- Configure `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- Set DSN via env var `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN`
- Tag every event with `customer_code` (last 4 chars only for privacy) and tier
- Ignore: expected 4xx (401, 404, 429) so we're not flooded with normal user errors
- Add error boundaries around top-level layouts (customer + admin)
- Test: trigger an intentional throw in a dev branch, confirm Sentry receives it

**Complexity.** Low — well-trodden Next.js integration.

**Risk.** Low — Sentry is passive observation.

**Estimated time.** 1 hour.

**Verification.**
- Trigger a manual `throw new Error("sentry-test")` in a debug endpoint → appears in Sentry
- 401 does NOT appear
- Build size increase: measured, documented (<20 KB gzip typical)

**Documentation deliverable.** Section in `docs/RUNBOOK.md` — how to triage a Sentry alert.

---

## Phase 4 — Structured Logging

**Goal.** Replace ad-hoc `console.error` with structured JSON logs including a request ID. In Vercel, these become searchable + filterable.

**Scope.**
- Add `pino` (edge-compatible) or use `console.log` with JSON strings if we want zero-dep
- Middleware attaches a `x-request-id` header (crypto.randomUUID) to every request
- Wrap API handlers to log request start + end + duration
- Fields: `{ ts, level, msg, requestId, route, method, status, durationMs, customerCode?, adminUsername? }`
- Never log passwords, tokens, JSON bodies, or PII
- Docs: how to search Vercel logs by requestId

**Complexity.** Medium — needs a wrapper util for API handlers to avoid boilerplate in each route.

**Risk.** Low — logs don't affect user experience; only Vercel log volume increases.

**Estimated time.** 2-3 hours.

**Verification.**
- Make 3 test requests, grep Vercel logs by requestId → 3 lines with matching IDs
- Trigger an error → error log has the same requestId as the request start log

**Documentation deliverable.** Section in `docs/RUNBOOK.md` — log format + how to grep by requestId.

---

## Phase 5 — Uptime + Analytics (External Services)

**Goal.** Know when the app is down. Know which features get used.

**Scope.**
- **Uptime:** UptimeRobot or Better Stack free tier. Ping `/api/session` every 5 minutes. Alerts to owner's email. Zero code — pure configuration.
- **Analytics:** Plausible (paid, ~$9/mo) or Umami (self-hosted or ~$5/mo). Privacy-safe, no cookies, no consent banner needed. Script added to `app/layout.tsx` with domain filter to skip localhost.
- Set up: probably 30 min in-repo (just adding the script tag) + 15 min external config.

**Complexity.** Low.

**Risk.** None — external services, easy rollback.

**Estimated time.** 30 min in-repo + external service setup.

**Verification.**
- Visit `/tracker` → shows in Plausible/Umami dashboard within a minute
- Kill dev server → UptimeRobot alerts within 5 min

**Documentation deliverable.** Section in `docs/DEPLOYMENT.md` — dashboards + credentials location.

---

## Phase 6 — Versioned DB Migrations

**Goal.** Never lose track of what's in prod DB vs what's in code. Every schema change is a named, reversible migration.

**Scope.**
- Create `supabase/migrations/` folder
- First migration: `20260713000000_initial_schema.sql` — full contents of `supabase-schema.sql` verified against actual prod
- Second migration example: `20260713000001_add_activity_logs_cleanup_job.sql`
- Use Supabase CLI or plain SQL files with a timestamped naming convention
- Update `docs/PROJECT_BRAIN.md` § 4 to point at migrations folder as source of truth
- Retire `supabase-schema.sql` (leave file with a "moved to `supabase/migrations/`" note)

**Complexity.** Medium — need to verify current prod schema matches file before writing migration #1.

**Risk.** Medium — if prod schema has drifted from `supabase-schema.sql`, migration #1 could be wrong. Mitigation: dump prod schema first via Supabase CLI, diff, reconcile.

**Estimated time.** 3 hours.

**Verification.**
- Run migration #1 against a fresh Supabase project → schema matches prod
- Run all migrations idempotently → no errors, no changes on second run

**Documentation deliverable.** Section in `docs/DEPLOYMENT.md` — migration flow + rollback strategy.

---

## Phase 7 — Cleanup Jobs

**Goal.** Bounded growth on `admin_login_attempts` and `activity_logs`.

**Scope.**
- Activate pg_cron in Supabase (may need Supabase paid tier — verify)
- Job: delete `admin_login_attempts` rows older than 24 hours (retain 24h > 15m rate-limit window for audit)
- Job: delete `activity_logs` rows older than 90 days (adjust based on business needs)
- Add as migration under Phase 6's structure

**Complexity.** Low.

**Risk.** Low — deleting expired rows only. Reversible by disabling the cron.

**Estimated time.** 1 hour.

**Verification.**
- Insert a row with `attempted_at = now() - interval '2 days'`, run cron manually → row deleted
- Insert a row with `attempted_at = now()` → row remains

**Documentation deliverable.** Note in `docs/RUNBOOK.md`.

---

## Phase 8 — Dependency Scanning

**Goal.** Automatic PRs for security patches. Awareness of CVEs.

**Scope.**
- `.github/dependabot.yml` — weekly checks for npm + GitHub Actions
- CI job addition: `npm audit --audit-level=high` (soft warning at first, hard fail once clean)
- Verify **lucide-react v1.21.0** (flagged in audit as suspicious) — investigate, downgrade to real `0.475.x` if needed. This may be a bug or a real supply-chain concern.

**Complexity.** Low.

**Risk.** Low — Dependabot PRs are gated by CI.

**Estimated time.** 30 minutes (excluding lucide-react investigation).

**Verification.**
- Merge a Dependabot PR → CI passes, no regressions
- `npm audit` in CI runs

**Documentation deliverable.** Section in `docs/RUNBOOK.md` — how to review Dependabot PRs.

---

## Phase 9 — Performance Budgets

**Goal.** Bundle size and page performance can't silently regress.

**Scope.**
- `@next/bundle-analyzer` — one-shot report on demand: `npm run analyze`
- Lighthouse CI (`@lhci/cli`) in the CI workflow — runs against a preview URL, fails PR if scores drop below thresholds
- Budgets: Performance ≥85 mobile, ≥90 desktop, LCP ≤2.5s, CLS ≤0.1, TBT ≤200ms
- Document current baseline in `docs/PERFORMANCE.md`

**Complexity.** Medium — Lighthouse CI setup + preview URL from Vercel.

**Risk.** Low — budgets are advisory at first, then enforced.

**Estimated time.** 2 hours.

**Verification.**
- Merge a trivial change → Lighthouse CI runs green
- Add 500 KB of unused code → CI fails on bundle-size budget

**Documentation deliverable.** `docs/PERFORMANCE.md` — baselines + how to interpret Lighthouse CI failures.

---

## Phase 10 — Documentation

**Goal.** Anyone (including future-Claude, future engineer, or the owner) can operate this system without archaeology.

**Scope — new docs:**
- `docs/DEPLOYMENT.md` — Vercel setup, env vars, DNS, SSL, first-deploy checklist
- `docs/RUNBOOK.md` — incident response (app down, slow, data issue, security incident, secrets rotation), oncall procedure, escalation
- `docs/TESTING.md` — already produced in Phase 1, but referenced here
- `docs/SECURITY.md` — threat model, security controls, disclosure policy, `security.txt`
- `docs/CONTRIBUTING.md` — code style, PR flow, review requirements

Update `docs/PROJECT_BRAIN.md` § 14 Changelog + § 8 Known Bugs after each phase completes.

**Complexity.** Low.

**Risk.** None.

**Estimated time.** 3 hours (spread across other phases as they're implemented).

**Verification.** Docs review — every doc has a clear owner, up-to-date date, and links to code where relevant.

---

## Phase 11 — Component Extraction (optional)

**Goal.** Reduce `app/page.tsx` from ~1900 lines to a thin orchestrator that composes extracted components.

**Scope.**
- Extract to `app/_components/home/`:
  - `CoachModal.tsx`, `EngagementNudge.tsx`, `MoodQuickTap.tsx`, `UnusedFeatureNudge.tsx`, `NextExercisePreview.tsx`, `DailyReminderCard.tsx`, `WeeklySummaryCard.tsx`, `InstallBanner.tsx`, `TodaysSummaryCard.tsx`, `QuickCheckIn.tsx`, `ReferralCard.tsx`, `TestimonialSubmissionCard.tsx`, `FamilyShareCard.tsx`, `ReorderCard.tsx`, `HeroBanner.tsx`, etc.
- Extract `MEAL_PLAN` const to `lib/mealPlan.ts` (unlocks reuse for home preview + testing)
- Zero behavior change — pure code motion

**Complexity.** Medium — many files, need careful `git mv` to preserve history.

**Risk.** Medium — refactor without new features has some risk of accidentally changing behavior. Playwright suite from Phase 1 mitigates.

**Estimated time.** 4-6 hours.

**Verification.**
- All Playwright tests still green after extraction
- Manual smoke: home page, tap mood, open coach modal, all working identically

**Only do this phase after Phase 1 (tests) is landed.** Without tests, the risk is too high.

---

## Phase 12 — Advanced Security (future)

**Goal.** Reach 9-10/10 security rating.

**Scope.**
- **CSP nonce migration** — replace `'unsafe-inline'` script/style with per-request nonces. Non-trivial for Next.js App Router; requires middleware nonce generation + injection into all script/style tags. ~1 day.
- **`security.txt`** at `/.well-known/security.txt` — responsible disclosure email + PGP key. ~30 min.
- **CSRF tokens** on admin state-changing routes (defense in depth on top of same-origin + httpOnly). ~2 hours.
- **JWT_SECRET rotation runbook + implementation** — dual-secret validation during rotation window. ~3 hours.
- **HTTP request signing** for family-share tokens (in case a family member forwards the URL — currently anyone with the URL can view). ~2 hours.

**Complexity.** High.

**Risk.** Medium — security changes can break flows if not carefully tested.

**Estimated time.** 1-2 days total.

**Only do this phase if we identify a specific threat or compliance requirement that justifies it.** Current controls are sufficient for a small business.

---

## Sequencing recommendation

**Best order to execute:**

1. **Phase 1 (Testing)** first — everything else is safer with tests.
2. **Phase 2 (CI/CD)** second — every subsequent phase piggybacks on CI to verify.
3. **Phase 3 (Sentry)** third — cheap, high-value observability.
4. **Phase 8 (Dependency scanning)** fourth — set-and-forget Dependabot.
5. **Phase 5 (Uptime + Analytics)** fifth — external, no interference.
6. **Phase 4 (Structured logging)** sixth — starts paying dividends once Sentry surfaces issues.
7. **Phase 10 (Documentation)** in parallel throughout.
8. **Phase 6 + 7 (Migrations + cleanup jobs)** together.
9. **Phase 9 (Performance budgets)** once CI is stable.
10. **Phase 11 (Component extraction)** once tests give safety.
11. **Phase 12 (Advanced security)** only if justified.

**Total realistic timeline:** 3-4 focused days of engineering work to complete Phases 1-10.

---

## Non-goals for this roadmap

Deliberately excluded (out of scope, deferred, or explicitly not desired):

- **New user-facing features** — user directive: "wag mag add ng new feature"
- **Framework upgrade** (Next.js is already latest)
- **Rewrite to different stack** — no measurable benefit, high risk
- **Multi-region deployment** — traffic doesn't justify complexity
- **GraphQL / tRPC migration** — REST is fine at current scale
- **Redis / caching layer** — CDN cache + JSONB reads are fast enough
- **Kubernetes / self-hosted** — Vercel is the right tier for this size

---

## Gate before implementation

**This roadmap requires user approval before Phase 1 execution begins.**

The user should review, adjust priorities, and explicitly say "start Phase N" (or "start all in order") before any code is touched.

Standard output format for each executed phase:

1. **Summary** — what changed
2. **Files changed** — with rationale per file
3. **Reason** — why now
4. **Verification** — lint + typecheck + build + tests + manual check evidence
5. **Risk** — remaining risk + rollback path
6. **Next recommendation** — natural follow-on
