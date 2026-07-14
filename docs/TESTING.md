# Testing Guide — R&M EaseBrew Wellness Hub

This project uses **Playwright** for end-to-end tests across the customer app, admin dashboard, and API surface.

- **Runner:** `@playwright/test`
- **Browser:** Chromium (mobile-emulation for customer, desktop for admin)
- **Config:** `playwright.config.ts`
- **Global setup:** `tests/global-setup.ts` — clears the `admin_login_attempts` table before every run so leftover rate-limit counters don't fail auth fixtures.

---

## Folder structure

```
tests/
├── global-setup.ts              Cleans rate-limit table before all tests
├── fixtures/
│   └── auth.fixture.ts          Worker-scoped auth (signs JWTs directly with JWT_SECRET
│                                — never touches rate-limited /api/verify-code or /admin/login)
├── helpers/
│   ├── api.ts                   adminLogin, getActiveCustomerCode, makeDeviceId
│   └── jwt.ts                   Direct HS256 signing for customer + admin cookies
├── pages/                       Page Object Models
│   ├── verify.page.ts
│   └── admin-login.page.ts
└── e2e/
    ├── customer/                Mobile-emulated tests (Pixel 5)
    │   ├── auth.spec.ts
    │   ├── dashboard.spec.ts
    │   ├── exercise.spec.ts
    │   ├── logout.spec.ts
    │   ├── notifications.spec.ts
    │   ├── profile.spec.ts
    │   └── tracker.spec.ts
    ├── admin/                   Desktop tests
    │   ├── auth.spec.ts
    │   ├── codes.spec.ts
    │   ├── content.spec.ts
    │   ├── dashboard.spec.ts
    │   └── pages.spec.ts
    └── api/                     Pure HTTP tests (no browser)
        ├── auth.spec.ts
        ├── rate-limit.spec.ts   Only runs when RUN_RATE_LIMIT_TESTS=1
        ├── status-codes.spec.ts
        └── validation.spec.ts
```

---

## How to run

Prereqs: install browsers once — `npm run test:install`.

| Command | Purpose |
|---------|---------|
| `npm test` | Run every test suite (customer + admin + API) |
| `npm run test:ui` | Open Playwright UI runner (interactive) |
| `npm run test:headed` | Watch tests run in a real browser window |
| `npm run test:report` | Open the last HTML report |
| `RUN_RATE_LIMIT_TESTS=1 npm test` | Include rate-limit tests (they exhaust the /api/verify-code counter for 15 min — off by default) |
| `PLAYWRIGHT_BASE_URL=https://staging.example.com PLAYWRIGHT_SKIP_WEB_SERVER=1 npm test` | Point tests at a remote environment |

Failures capture **screenshots + traces** automatically. View a trace with:

```
npx playwright show-trace test-results/<test-dir>/trace.zip
```

The HTML report includes network waterfall, console output, and step-by-step DOM snapshots.

---

## Authentication strategy

Both customer and admin auth are done ONCE PER WORKER by **signing JWTs directly** using the `JWT_SECRET` from `.env.local`. This avoids:

- Consuming the `/api/verify-code` rate limit (10/device, 20/code, 40/IP per 15 min)
- Consuming the `/admin/login` rate limit (8/username per 15 min)
- Repeated bcrypt round-trips

The signed cookie shape exactly matches what `lib/auth.ts` produces, so the app accepts it as a real session.

Real login endpoints are still tested end-to-end in `tests/e2e/admin/auth.spec.ts` and `tests/e2e/api/auth.spec.ts`.

---

## Fixture cheat sheet

```ts
import { test, expect } from "../../fixtures/auth.fixture";

test("...", async ({
  customerPage,        // browser page pre-authed as customer
  adminPage,           // browser page pre-authed as admin (owner role)
  customerRequest,     // APIRequestContext pre-authed as customer
  adminRequest,        // APIRequestContext pre-authed as admin
  customerCode,        // string — the code the fixture picked
  customerTier,        // number — that customer's tier (999, 1499, 2998, ...)
  customerCodeInfo,    // { code, device_id, tier, packs, expires_at }
}) => { /* ... */ });
```

For unauthenticated tests (rate-limit boundaries, invalid-cookie behavior), use raw `test` + `request` from `@playwright/test`.

---

## Adding future tests

1. **API test?** Drop `foo.spec.ts` into `tests/e2e/api/`. It runs under the `api` project (no browser).
2. **Customer UI test?** Drop into `tests/e2e/customer/`. Runs mobile-emulated. Use the `customerPage` fixture.
3. **Admin UI test?** Drop into `tests/e2e/admin/`. Runs desktop-emulated. Use the `adminPage` fixture.
4. **New page interaction?** Add a Page Object Model under `tests/pages/` and import it.

### Do

- Use existing fixtures. Don't call `/api/verify-code` or `/admin/login` directly in test bodies — you'll blow the rate limit.
- Assert on URLs and API responses (fast, deterministic).
- Use `expect(...).toHaveURL(...)` — it retries automatically.
- Prefer `data-testid` or `aria-label` over CSS class selectors.

### Don't

- Don't `waitForTimeout` more than 1500 ms — usually a sign of a race.
- Don't rely on the client-side `useSessionGuard` finishing quickly in the dev-server + Playwright combination — assert on URL or API responses instead (see "Known limitations" below).
- Don't add tests that mutate shared production data. If a test writes, it should clean up after itself.

---

## Known limitations

**Client-side `useSessionGuard` hydration timing.**
The customer app renders `Sandali lang...` while `useSessionGuard` fetches `/api/session` from the browser. Inside Playwright's Chromium mobile emulation the fetch has been observed to stall past 45s during full-suite runs, even though:
- The session cookie is present (verified with `context.cookies()`)
- `page.request.get("/api/session")` returns 200 instantly with the same cookie
- Real browsers show no such stall

Tests that assert on **content strings** (e.g. `toContainText(/Kamusta/)`) inside this loading state are marked `test.fixme(...)` with an inline comment. Tests that assert on **URL** or **API responses** pass reliably.

If you can reproduce the stall, please dig into whether it's an interaction with Playwright's request routing, tier-gate middleware, or React 19 hydration under emulated viewport.

**Service worker.**
The customer browser context blocks service workers (`serviceWorkers: "block"`) so background caching doesn't interfere with API calls. The SW file itself is verified via `GET /sw.js` in `notifications.spec.ts`.

**Rate limit tests.**
`tests/e2e/api/rate-limit.spec.ts` intentionally exhausts the verify-code + admin-login counters. It's skipped by default; set `RUN_RATE_LIMIT_TESTS=1` to run it and expect the next test invocation to hit rate-limit errors for ~15 minutes.

---

## Best practices

- **Verify before shipping**: run `npm test` locally after any change to `app/` or `lib/`. CI (Phase 2) will enforce this.
- **Fix flakiness aggressively**: flaky tests train the team to ignore red. If a test flakes twice in one week, either fix the root cause or delete it.
- **Prefer API assertions**: they're 10x faster and 10x more deterministic than DOM assertions.
- **Trace on failure**: always inspect the trace zip before declaring "flaky" — the failure is usually a race or selector issue you can fix.

---

## Env vars used by tests

| Var | Purpose | Default |
|-----|---------|---------|
| `PLAYWRIGHT_BASE_URL` | Target URL for all requests | `http://127.0.0.1:3000` |
| `PLAYWRIGHT_SKIP_WEB_SERVER` | Skip auto-starting `npm run dev` (use when server is already running) | unset |
| `JWT_SECRET` | Required for direct JWT signing (matches server) | from `.env.local` |
| `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | For global-setup rate-limit reset | from `.env.local` |
| `TEST_ADMIN_USERNAME` / `TEST_ADMIN_PASSWORD` | Override admin creds | `admin` / `marioandmaria` |
| `RUN_RATE_LIMIT_TESTS` | Enable rate-limit specs (skipped by default) | unset |
| `CI` | Set by CI environment — enables retries, forbids `.only`, uses 1 worker | unset locally |
