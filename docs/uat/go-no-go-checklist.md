# Soft Launch — Go / No-Go Checklist

*Run this checklist on the day you plan to invite the first ~50 real customers.*

Each item is BINARY. **All GO required for launch.**

---

## Section 1 — Product quality (must-have)

- [ ] 0 open 🔴 CRITICAL bugs
- [ ] 0 open 🟠 HIGH bugs — OR each has a documented workaround acceptable to R&M
- [ ] All 5 UAT customer testers completed at least Days 1–3 of the checklist
- [ ] ≥4 of 5 testers reported "usable" or "easy to use" (score ≥7/10)
- [ ] Coach checklist completed by at least 2 coaches
- [ ] Owner checklist completed sign-off from R&M owner
- [ ] Playwright responsive suite green sa 5 viewports (320, 360, 375, 390, 414)
- [ ] Typecheck, lint, build all green on `master` branch
- [ ] Manual smoke test on 1 iPhone + 1 Android + 1 iPad done today

## Section 2 — Content (must-have)

- [ ] All PUBLIC_CONTENT_KEYS have production values (not empty / placeholder)
- [ ] All 6 coach entries populated (name, photo, phone, facebook)
- [ ] Daily tips filled — at least 7 unique tips so it doesn't repeat weekly
- [ ] FAQs answered — at least 8 common questions
- [ ] Testimonials populated — at least 3 real customer stories (with consent)
- [ ] Promo banner text ready OR promo disabled
- [ ] Medical disclaimer visible on all health-tool pages

## Section 3 — Business ops (must-have)

- [ ] Payment / order flow documented (Shopify or manual Messenger)
- [ ] Coach team scheduled to be online for launch day
- [ ] Coach team knows how to generate + share codes
- [ ] Coach team knows how to handle common support scenarios (see admin-checklist.md § C)
- [ ] Contact number sa Facebook page updated to a monitored number
- [ ] Return / refund policy on Privacy page current

## Section 4 — Technical infrastructure (must-have)

- [ ] Production deploy is on the same commit as UAT verified commit
- [ ] Environment variables set in production (JWT_SECRET, Supabase keys, etc.)
- [ ] Supabase RLS / service key not exposed sa client bundle (verify via DevTools Network tab)
- [ ] Sentry error tracking active + team has access to dashboard
- [ ] Push notification subscription flow works on Android Chrome
- [ ] PWA install works on Safari (iOS) + Chrome (Android)
- [ ] Service worker registered + cached shell delivers offline fallback
- [ ] CDN / hosting has sufficient capacity for expected traffic
- [ ] SSL certificate valid and not expiring within 30 days
- [ ] Custom domain DNS pointing correctly

## Section 5 — Monitoring + rollback (must-have)

- [ ] Sentry dashboard bookmarked + team can access
- [ ] Supabase dashboard bookmarked + backups enabled
- [ ] Git tag for launch commit created (e.g. `v1.0.0-soft-launch`)
- [ ] Rollback plan documented: "revert to tag `X` if we see error spike >Y%"
- [ ] Someone assigned to watch Sentry the first 48 hours
- [ ] Someone assigned to monitor Messenger support queue first 48 hours

## Section 6 — Communication (must-have)

- [ ] Launch announcement drafted (Facebook page + existing customer list)
- [ ] Onboarding instructions ready (senior-friendly Tagalog)
- [ ] Test the announcement link on a fresh incognito browser
- [ ] FAQ / knowledge base link ready in launch post

---

## Nice-to-haves (not blocking)

- [ ] SMS-based code retrieval for customers who lose Messenger
- [ ] Recipe photos filled sa lahat ng 30 recipes
- [ ] Exercise videos populated sa lahat ng 30 days
- [ ] Analytics dashboard fully wired
- [ ] Per-day time estimates accurate (currently rough heuristic)

---

## Go / No-Go decision

**Filled by:** ______  **Date:** ______

Section 1 — Product quality:  ☐ ALL GO  ☐ NO-GO — reason: ______
Section 2 — Content:           ☐ ALL GO  ☐ NO-GO — reason: ______
Section 3 — Business ops:      ☐ ALL GO  ☐ NO-GO — reason: ______
Section 4 — Infra:             ☐ ALL GO  ☐ NO-GO — reason: ______
Section 5 — Monitoring:        ☐ ALL GO  ☐ NO-GO — reason: ______
Section 6 — Communication:     ☐ ALL GO  ☐ NO-GO — reason: ______

**Final decision:**  ☐ **GO** (launch today)  ☐ **NO-GO** (defer, next review date: ______)

Notes:
_______________________________________________
_______________________________________________
