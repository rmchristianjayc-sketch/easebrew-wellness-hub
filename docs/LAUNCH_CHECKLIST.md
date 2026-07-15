# Launch Checklist — R&M EaseBrew Wellness Hub

Print this. Tick each box before, during, and after go-live. Never skip in the interest of speed — every entry exists because *not* doing it caused an incident somewhere in the past.

---

## T-7 days: pre-launch preparation

### Application
- [ ] `master` branch is green in CI (Lint + Typecheck + Build + E2E + CodeQL)
- [ ] `npm audit` — no NEW high/critical since the last release
- [ ] Playwright E2E: 61+ passing locally (`npm test`)
- [ ] `PROJECT_BRAIN.md` is current (facts match code)
- [ ] `PROJECT_AUDIT.md`, `SECURITY_REPORT.md` reviewed by owner

### Environment
- [ ] Vercel Production env vars set: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`
- [ ] Vercel Preview env vars set (same names)
- [ ] GitHub Actions Repository Secrets set (same names)
- [ ] `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_DSN` + `SENTRY_ENV` set in Vercel (Sentry activated per `docs/MONITORING.md`)
- [ ] Supabase database backup verified accessible (Dashboard → Database → Backups)

### Repository controls (GitHub UI)
- [ ] Branch protection on `master` requires CI status check
- [ ] Secret scanning enabled (Settings → Code security)
- [ ] Push protection enabled (blocks known secret formats at push)
- [ ] Private vulnerability reporting enabled

### External services
- [ ] Custom domain configured in Vercel + SSL certificate issued (Vercel handles both)
- [ ] DNS `A`/`CNAME` records propagated (verify with `dig` or `nslookup`)
- [ ] Uptime monitor pointed at `/api/session` — Better Stack, UptimeRobot, or similar (5-min interval, alert owner email)
- [ ] Analytics installed (Plausible / Umami / equivalent — optional)

### Content
- [ ] Coach names + phone numbers + Facebook links current in `/admin/content` → Coach Management
- [ ] Testimonials current
- [ ] Wellness tips reviewed for medical accuracy (no "gagamot" / "makakagaling" claims)
- [ ] FAQ list reviewed
- [ ] Promo banner off unless there's an active promo

---

## T-1 day: dry run

### Manual smoke test (production URL, real browser)
- [ ] `/verify` renders
- [ ] Verify with a real code → lands on `/`
- [ ] Home page loads with greeting + tabs + coach modal
- [ ] Tap mood emoji → check `/admin/codes` → progress data appears for that customer
- [ ] BP page → add reading → toast + list update → data appears in admin
- [ ] Log out (clear cookie) → protected routes redirect to `/verify`
- [ ] Admin login (`admin`/`marioandmaria` or rotated password) → dashboard loads
- [ ] Admin generates a code → welcome message contains auto-fill link
- [ ] Content edit in admin → visible on customer home within 30 seconds

### PWA install
- [ ] Open production URL on real Android phone
- [ ] Wait for install prompt (20 s delay is intentional per Auto #1 config)
- [ ] Install → home screen icon appears with correct name + theme colour
- [ ] Open from home screen → runs standalone (no browser chrome)
- [ ] Turn off Wi-Fi → offline page renders

### Backups
- [ ] Trigger a manual Supabase backup (Dashboard → Database → Backups)
- [ ] Verify backup completes and is downloadable
- [ ] Document the location + timestamp in ops journal

---

## T-0: launch day

### Deploy
- [ ] `git checkout master && git pull` — confirm you're on the exact commit you tested
- [ ] Verify commit SHA in Vercel matches (Deployments tab)
- [ ] If auto-deploy is off: `vercel deploy --prod`
- [ ] Wait for green ✓ in Vercel dashboard
- [ ] Verify `curl -sI https://your-domain.com/` returns 200 + all security headers

### Immediate post-deploy smoke (production URL)
- [ ] Visit `/verify` — loads clean
- [ ] Visit `/` without session — redirects to `/verify`
- [ ] Verify with a real live-customer code → home renders
- [ ] Coach modal opens with real coach numbers
- [ ] Family share generate → 7-day JWT returned

### Communications
- [ ] Send test welcome message via Messenger using auto-fill link → verify link works from Messenger preview
- [ ] Notify coaches: "Live na tayo. If any customer reports an issue, DM me."
- [ ] Post live announcement (Facebook Page / group)

### Watch window (first 2 hours)
- [ ] Vercel logs: no unexpected 5xx
- [ ] Sentry: no new issue groups (or "expected" ones only)
- [ ] Uptime monitor: green
- [ ] Supabase → Database → Reports: query rate normal

---

## T+24 hours: post-launch review

- [ ] Sentry issue count = 0 blocking / few informational
- [ ] `/admin/audit-log` shows expected admin activity
- [ ] `/admin/codes` shows real customer verifications happening
- [ ] Uptime = 100 % (or documented outage explained)
- [ ] Owner receives no more than 2 "app broken" DMs (target: 0)

---

## Rollback

If something goes wrong post-launch:

### Broken deploy (customers can't load the app)
1. Vercel Dashboard → Deployments → previous successful deploy → **Promote to Production**
2. Confirm reverted (curl the homepage)
3. Post-mortem in `docs/RUNBOOK.md`'s incident log

### Data corruption on a single customer
1. Supabase → SQL Editor →
   ```sql
   -- Snapshot bad state first
   select * from progress where code = 'EASE-XXXX-XXXX';
   -- Then reset to last-known-good — usually just delete + let customer re-log
   delete from progress where code = 'EASE-XXXX-XXXX' and type = 'tracker';
   ```
2. Log the incident with the customer's consent

### Suspected secret leak
1. **JWT_SECRET:** rotate in Vercel + GitHub Actions immediately (every session invalidates, customers re-verify)
2. **SUPABASE_SERVICE_ROLE_KEY:** rotate in Supabase → update Vercel + GitHub Actions → redeploy
3. Notify affected customers if data may have been exposed

### Total outage
1. Check Vercel status page (`vercel-status.com`)
2. Check Supabase status page (`status.supabase.com`)
3. If both are green, our deploy is at fault → rollback per above
4. If Vercel is down: nothing we can do; customers see Vercel's default error page
5. If Supabase is down: our app returns 500 on data operations; static pages still load

---

## Monitoring: what "healthy" looks like

| Signal | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Vercel 5xx rate | < 0.1 % | 0.1–1 % | > 1 % |
| Sentry unique issues / hour | ≤ 3 | 4–10 | > 10 |
| Uptime | 100 % | ≥ 99.9 % | < 99.9 % |
| Supabase daily query count | usual ± 30 % | ± 30–100 % | > 2× usual |
| `admin_login_attempts` row count | < 1 000 | 1 000–10 000 | > 10 000 (possible brute-force) |
| Playwright CI runs | 100 % green | occasional flake | consistent red |

---

## Backup schedule

- **Supabase automatic backups:** free tier = daily, retained 7 days (verify in Dashboard → Database → Backups). Pro tier = point-in-time recovery.
- **Manual backup before any risky operation:** SQL Editor → run the dump script in `docs/RUNBOOK.md` § Backup procedure
- **Restore drill:** run a full restore on a scratch project every 6 months. Document the elapsed time.

---

## Sign-off

Once every box above is ticked:

- [ ] Owner (R&M) confirms in writing (Messenger / email) that it's ready to go live
- [ ] Engineer confirms `PROJECT_BRAIN.md` § 14 Changelog updated with the launch line
- [ ] Tag the release: `git tag v1.0.0 && git push --tags`

Ship it.
