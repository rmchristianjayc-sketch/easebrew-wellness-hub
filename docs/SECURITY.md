# Security Policy — R&M EaseBrew Wellness Hub

This document is the standing policy: how we handle vulnerabilities, what controls we run, and what a security-minded contributor should know before landing changes.

The point-in-time audit lives in [`SECURITY_REPORT.md`](../SECURITY_REPORT.md).

---

## 1. Reporting a vulnerability

If you find a security issue, **do not open a public GitHub issue**. Contact us privately:

- **Email:** rochambeaufrantortola@gmail.com
- **Response SLA:** best-effort within 3 business days
- **Preferred languages:** English, Filipino

We commit to:
- Acknowledging the report
- Investigating in good faith
- Providing a timeline for a fix
- Crediting you (with permission) once patched

The machine-readable version is at `/.well-known/security.txt` (auto-served from `public/.well-known/security.txt`).

---

## 2. Threat model

**Who we defend against:**
- Opportunistic attackers scanning the internet for common vulns
- Malicious customers trying to escalate to another customer's data
- Malicious former staff trying to access the admin panel post-departure
- Family members mis-using a shared family-link (bounded by intent)

**Who we do NOT defend against (out of scope):**
- Nation-state actors
- Physical access to admin's laptop
- Social engineering the R&M owner into leaking credentials
- Supply-chain compromise of `next`, `react`, or `@supabase/supabase-js`

**Value at risk:**
- Customer wellness data (BP readings, medications, self-reported pain scores) — sensitive but not regulated PHI under Philippine law
- Access codes worth ₱399–₱14,990 each
- Admin credentials that can generate free codes or view all customers

---

## 3. Controls in place

### Transport
- HTTPS enforced via Vercel + HSTS (2-year, includeSubDomains, preload) — see `next.config.ts`
- SSL certificate auto-issued and rotated by Vercel/Let's Encrypt

### Authentication
- **Customer:** JWT (jose HS256) in `eb_session` cookie, bound to a device_id on first verify
- **Admin/Coach:** JWT in `eb_admin_token` cookie, bcryptjs cost-10 password hashing, shared logins with role scoping (`owner` / `coach`)
- **Family share:** 7-day JWT with `kind: 'family_share'` — bearer credential in URL, deliberately short-lived and read-only

All cookies: `httpOnly`, `sameSite=Strict`, `Secure` in production. See `lib/auth.ts`.

### Rate limits (see `app/api/{verify-code,admin/login}/route.ts`)
- Verify-code: 10 attempts/device, 20/code, 40/IP per 15 minutes
- Admin login: 8 attempts/(ip+username) per 15 minutes
- Constant-time bcrypt compare against a dummy hash to prevent user-enumeration timing attacks
- Backend fails open on Supabase read errors — trading a small window of missing limits for availability

### Authorization
- Every `/api/admin/*` route calls `verifyToken(req)` before touching data
- Every `/api/progress` route calls `getAuthorizedSession(req, type)` which checks JWT AND that `session.tier >= MINIMUM_TIER_BY_TYPE[type]`
- Middleware (`proxy.ts`) enforces route-level auth + tier gates BEFORE the handler runs
- Coach role can only view `/admin/codes`; owner has full access

### Input validation
- Whitelist for `content` keys (`lib/contentKeys.ts` `PUBLIC_CONTENT_KEYS` + `validateContentUpdate`)
- Per-type validators for progress payloads (`app/api/progress/route.ts` — max entries, valid dates, numeric ranges)
- Code format regex: `^EASE[A-Z0-9]{8}$`
- Device ID regex: `^dev_[0-9a-f]{32}$`
- Explicit JSON.parse try/catch on every request body — malformed payloads return 400, never 500

### XSS
- React auto-escapes all rendered content
- Only one `dangerouslySetInnerHTML` in the codebase (`app/layout.tsx:52`), containing a static string literal for FOUC prevention — no user input flows into it
- CSP restricts script-src to `'self' 'unsafe-inline'` (unsafe-inline required for Next.js hydration; nonce-based CSP is a future hardening pass)

### SQL injection
- All Supabase queries use the JS client (parameterized). No raw SQL, no query concatenation
- No `.rpc(...)` calls with user-provided function names

### CSRF
- Not explicitly guarded with a token
- Mitigations: httpOnly cookies (JS on other origins can't read them) + sameSite=Strict (browsers don't send them on cross-site nav) + same-origin-only fetches in the app
- Adequate for the threat model; a token-based defense is Phase 12 (advanced hardening)

### Open redirect
- `/verify?from=` accepts only paths starting with `/` and not `//` (blocks `//evil.com`, `javascript:`, `http://evil.com`)
- No other redirect endpoints

### Supabase
- **All queries via service-role key server-only** (`lib/supabase.ts`)
- RLS enabled on every table with explicit deny-all policies for `anon` and `authenticated` roles (belt-and-braces — the app never uses those roles)
- Anon key exists in `.env.local` for compatibility but is unused in the codebase

### Secret management
- Every secret (`SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`) is in `.env.local` (gitignored) locally
- In production: Vercel Environment Variables (Production + Preview scopes)
- In CI: GitHub Actions Repository Secrets
- Nothing checked into git — verified in `SECURITY_REPORT.md`

### File uploads
- **No file-upload endpoints in the app.** Content is text-only. If we ever add file uploads (e.g. profile photos), review this doc first.

### Error handling
- Server catches unhandled exceptions and returns `{ error: string }` with proper status codes
- Never leaks stack traces to the client
- Sentry integration in place but DSN not configured (deliberate — see `docs/MONITORING.md`); will activate closer to production launch

---

## 4. Development-time controls

- **CodeQL** — GitHub-native SAST, runs on every push + weekly baseline (`.github/workflows/codeql.yml`)
- **Dependabot** — weekly npm updates (grouped patch/minor), monthly GitHub Actions bumps (`.github/dependabot.yml`)
- **Secret scanning** — enabled by default on public GitHub repos; if you make the repo private, enable via Settings → Code security → Secret scanning
- **Push protection** — recommended: Settings → Code security → Secret scanning → "Push protection" toggles ON, blocks commits containing known secret formats
- **Playwright E2E** — covers auth boundaries, input validation, rate limits (opt-in via `RUN_RATE_LIMIT_TESTS=1`), open-redirect behavior, security-header presence

---

## 5. Contributor rules

Before merging a PR, verify:

1. `npm run lint` clean (0 errors)
2. `npm run typecheck` clean
3. `npm run build` succeeds
4. `npm test` — all E2E tests green
5. `npm audit` — no NEW high/critical vulnerabilities you introduced (transitive advisories from framework deps are triaged separately)

Never:
- Log request bodies, cookies, or auth tokens
- Introduce `eval`, `new Function`, or dynamic imports of user-supplied paths
- Bypass `verifyToken`/`verifyCustomerToken` in any API route
- Add a new client-exposed env var (`NEXT_PUBLIC_*`) without confirming it contains no secret

---

## 6. Incident response (short version)

Full runbook is Phase 10. Interim minimum:

| Incident | First action |
|----------|--------------|
| Suspected credential leak | Rotate `JWT_SECRET` in Vercel + GitHub Actions immediately. This invalidates every existing session (customers must re-verify their codes; admin/coach must re-login). |
| Suspected DB leak | Rotate `SUPABASE_SERVICE_ROLE_KEY` in Supabase dashboard → update Vercel + GitHub Actions env vars → redeploy. |
| Compromised admin password | Reset the row in `admin_users` with a new bcrypt hash. All existing admin sessions remain valid until they expire — pair with a JWT_SECRET rotation if the concern is severe. |
| Sudden burst of 5xx errors | Check Vercel logs → Sentry (when configured) → Supabase status page. Roll back the last deploy in Vercel if the errors correlate with the deploy time. |
| Suspected malicious customer | Delete the code row (`access_codes.code = 'EASE-...'`) — cascades to `customer_sessions` — and log the reason in `admin_audit_log`. |

---

## 7. Future work

Tracked in `ROADMAP.md`. Security-adjacent items:

- **Phase 12 — Advanced security:** CSP nonce migration, CSRF tokens on admin mutations, JWT_SECRET rotation runbook with dual-secret validation, family-share URL signing
- **Post-launch:** enable Sentry with a production DSN (currently placeholder)
- **When user count grows:** consider WAF rules on the Vercel edge; audit `admin_login_attempts` retention job

Nothing in this list is a currently exploitable weakness — they are hardening improvements that reduce blast radius or add defense in depth.
