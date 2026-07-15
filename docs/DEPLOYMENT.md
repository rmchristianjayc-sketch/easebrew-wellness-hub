# Deployment Guide — R&M EaseBrew Wellness Hub

Covers CI/CD, environment configuration, and the shipping flow for both preview and production.

---

## 1. Environments

| Environment | Where | Auth | Purpose |
|-------------|-------|------|---------|
| **Local dev** | your machine | `.env.local` | day-to-day development |
| **CI** | GitHub Actions | repo secrets | lint + typecheck + build + Playwright |
| **Preview** | Vercel per-PR (if enabled) | Vercel env → Preview | reviewing PRs in a real browser |
| **Production** | Vercel `master` | Vercel env → Production | live app that customers use |

All environments use the **same Supabase project** unless you deliberately create a separate staging DB. For a small business this is normal — the risk is manageable because tests never mutate real customer rows (see `docs/TESTING.md` § Best practices).

---

## 2. Environment variables

Required in every environment:

| Var | Notes |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public Supabase project URL. Safe to expose. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only.** Never commit. Never prefix with `NEXT_PUBLIC_`. |
| `JWT_SECRET` | 64-char hex. Used to sign/verify session JWTs. Rotate = every session invalidates. |

Optional:

| Var | Default | Purpose |
|-----|---------|---------|
| `NODE_ENV` | `production` in prod | Toggles `Secure` on cookies |
| `TEST_ADMIN_USERNAME` / `TEST_ADMIN_PASSWORD` | `admin` / `marioandmaria` | Only used by tests |

### Where to set them

- **Local:** `.env.local` at repo root (already gitignored)
- **Vercel:** Project → Settings → Environment Variables (add for Production + Preview + Development scopes as needed)
- **GitHub Actions:** Repo → Settings → Secrets and variables → Actions → New repository secret

The CI workflow (`.github/workflows/ci.yml`) reads them via `${{ secrets.<NAME> }}` — the names must match exactly.

---

## 3. CI/CD flow

`.github/workflows/ci.yml` triggers on:

- **Push** to `master` / `main`
- **Pull request** targeting `master` / `main`

Each run does, in order:

1. Checkout + install Node 20 + `npm ci`
2. Cache and install Playwright chromium
3. `npm run lint`
4. `npm run typecheck`
5. `npm run build`
6. `npm test` (full Playwright suite, ~15 s)
7. On failure: upload `playwright-report/` as an artifact (kept 14 days)

Concurrency is scoped per-ref — pushing a new commit cancels the previous run on the same branch.

### First-time setup (do once)

1. **Add secrets to the GitHub repo:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`

2. **Enable branch protection on `master`** (Repo → Settings → Branches → Add rule):
   - Require status check: `Lint · Typecheck · Build · E2E`
   - Require PR reviews (optional for solo owner)
   - Require branches to be up to date before merging (recommended)

3. **Push a trivial commit** and confirm the green check appears in Actions tab.

If CI fails on the first real run, most likely cause is a missing secret — the job logs will make it obvious.

---

## 4. Dependabot

`.github/dependabot.yml` opens weekly PRs for npm + monthly for GitHub Actions.

Minor/patch npm bumps are grouped into a single PR. Major bumps get their own PR so they can be reviewed carefully (Next.js, React, Supabase-js, jose).

Review flow:
1. CI runs automatically on the Dependabot PR
2. Look at the changelog links Dependabot includes in the PR body
3. If tests are green and no breaking change is called out, merge
4. If tests fail, either pin to the previous version or adjust code — never disable failing tests

---

## 5. Vercel deploy

If GitHub → Vercel integration is connected:

- **Push to `master`** → automatic production deploy
- **Push to any other branch or open a PR** → preview deploy at `<hash>.vercel.app`

Preview URLs are safe to hand off to the coach for manual QA before merging.

### Manual deploy (fallback)

If the integration breaks, from the repo root:

```
npm ci
npm run build
vercel deploy --prod
```

---

## 6. Custom domain + SSL

Managed via Vercel — Domains tab in the project. SSL is auto-issued via Let's Encrypt. DNS: point `A`/`CNAME` per Vercel's instructions.

For emails to Filipino customers where the app URL is shared via Messenger, keep the domain short and typeable (senior audience often types by hand).

---

## 7. Rollback

- **Bad deploy?** In Vercel, click the previous successful deploy → Promote to Production. Rollback is one click, ~30 s.
- **Bad commit merged?** `git revert <sha>` and push. CI will re-run and Vercel will re-deploy on green.
- **Bad DB migration?** Restore the affected table(s) from Supabase daily backup. See `docs/RUNBOOK.md` (Phase 10 deliverable) for details.

---

## 8. Monitoring (post-Phase 3)

Once Phase 3 (Sentry) lands, production errors alert automatically. Until then, the operator must periodically check:

- Vercel → Logs (server errors, HTTP 5xx)
- Supabase → Logs (DB errors)
- `/admin/audit-log` (business-level actions)

---

## 9. Runbooks referenced from this doc

- `docs/TESTING.md` — how to add / run tests
- `docs/RUNBOOK.md` — incident response *(Phase 10 — pending)*
- `docs/PROJECT_BRAIN.md` § 15 — troubleshooting recipes for common customer issues
