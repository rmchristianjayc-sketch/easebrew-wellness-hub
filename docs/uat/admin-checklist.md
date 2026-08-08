# UAT Checklist — Admin (Owner)

**Audience:** R&M owner (Mario / Maria)
**Time commitment:** 45–60 minutes, one sitting
**Language:** English/Tagalog mix
**Device:** Desktop with Chrome. Use full screen — dashboard is not mobile-optimized.
**Access:** Owner-level admin account.

*This checklist is for the OWNER — validates high-privilege ops and business rules end-to-end.*

---

## Setup + auth

- [ ] Login sa `/admin` gamit ang owner credentials
- [ ] I-confirm ang role sa `/admin/me` — dapat "owner"
- [ ] Logout at re-login to confirm session persistence works

## Section A — Code lifecycle (10 min)

- [ ] Bumuo ng test code (₱399 tier — cheapest)
- [ ] I-verify sa test phone (mag-log in as customer)
- [ ] Sa `/admin/codes`, i-confirm:
  - is_used = true
  - device_id = populated
  - used_at = timestamp
  - expires_at = today + 10 days (per PRICE_CONFIG)
- [ ] Deactivate the code (kung available yung action)
- [ ] Sa customer app, try to open — dapat kicked out to /verify
- [ ] Re-activate (kung reversible)
- [ ] Test bawat tier: 399, 999, 1499, 2998, 4497
- [ ] I-check na tama ang packs at validity_days sa bawat tier
- [ ] Test upgrade path — bumili ng bagong code sa higher tier at i-migrate ang customer

## Section B — Content Management (15 min)

- [ ] Sa `/admin/content`, i-scroll ang lahat ng editable keys — dapat organized by group
- [ ] I-edit ang `hero_greeting_title` — dapat immediately reflected sa customer app (may 30s cache)
- [ ] I-edit ang isang coach entry (name, phone, facebook) — dapat na-update
- [ ] I-edit ang `daily_tip_1` — dapat na-update sa Tips tab
- [ ] I-edit ang `promo_text` at set `promo_enabled = true` — dapat lumabas ang banner sa Home
- [ ] I-set `promo_enabled = false` — dapat nawala
- [ ] I-test ang notification banner (title + message + timing)
- [ ] Test ang audit log — sino nag-edit, kailan, ano ang na-change
- [ ] I-verify na hindi kayo nakakapag-set ng invalid values (URL sa non-URL field, atbp.)

## Section C — Customer support scenarios (10 min)

Simulate common support tickets:

- [ ] **"Nawala yung code ko"** → search by name, copy code back to customer
- [ ] **"Bagong phone ako, hindi ma-log in"** → sa admin, hanapin ang code sa `/admin/codes`, unlock device_id at re-issue (each code row is 1:1 with a customer)
- [ ] **"Expired na, gusto ko mag-order ulit"** → generate new code, mark old as retired
- [ ] **"Mali ang tier ko"** → confirm price config, escalate if genuine issue
- [ ] **"Family shared link ko hindi umandar"** → confirm the customer's code hasn't expired; token also expires with code

## Section D — Business analytics (5 min)

- [ ] `/admin/analytics` (kung available) — daily/weekly stats
- [ ] Number of active codes
- [ ] Number of unused codes
- [ ] Average customer streak
- [ ] Testimonial submission queue

## Section E — Security + backup (5 min)

- [ ] Verify JWT_SECRET is set sa production env (do NOT expose value)
- [ ] Verify Supabase service key not exposed sa client bundle
- [ ] Check GitHub Actions CI — dapat green sa recent commits
- [ ] Sentry dashboard — check for any customer-side errors sa last 24h
- [ ] Supabase backups — enabled? Retention period appropriate?
- [ ] pg_cron prune migration — running as scheduled?

## Section F — PWA + service worker (5 min)

- [ ] Install customer app sa iPhone (Safari → Add to Home Screen)
- [ ] Install customer app sa Android (Chrome → Install)
- [ ] Test offline mode — buksan ang app na naka-airplane mode → dapat may cached shell
- [ ] Test push notifications — pag naka-enable, tumatanggap ba ng daily reminder?
- [ ] Test "Done" notification action — pag na-tap sa notification, auto-logs EaseBrew?

---

## Owner sign-off criteria

Bago mag soft-launch, all these MUST be true:

- [ ] Zero unresolved BLOCKER bugs mula sa UAT customer testers
- [ ] All 5 customer testers reported "usable" or "easy to use"
- [ ] All coaches have been onboarded sa admin panel
- [ ] Content is 100% populated (or documented gaps are acceptable)
- [ ] Sentry is quiet (no new customer-side errors in 48h)
- [ ] Supabase backups are running
- [ ] Emergency rollback plan documented (git tag of previous known-good commit)

Kung meron kahit isang unchecked item: **DEFER LAUNCH.**
