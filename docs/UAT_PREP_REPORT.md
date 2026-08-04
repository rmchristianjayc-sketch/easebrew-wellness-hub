# UAT Prep Report

**Date:** 2026-08-04
**Scope:** All docs in `docs/uat/` cross-referenced against actual app code post Commits #1-5 (Senior UX phase)
**Method:** Read every checklist item, verify against `app/` and `lib/` source
**Verdict summary:** 5 items **Needs Update**, 1 file **Remove**, everything else **Valid**

---

## Findings — per-file matrix

### `docs/uat/tester-checklist.md` — the OLDER file

| UAT Item | Status | Reason | Suggested Fix |
|---|---|---|---|
| Entire file | **REMOVE** | Superseded by `customer-checklist.md` (newer, post-UX, more detailed). Keeping both risks R&M sending the wrong one to testers. | Delete `tester-checklist.md`. Only ship `customer-checklist.md`. |

### `docs/uat/customer-checklist.md` — the current customer checklist

Walked each Araw item; **all VALID.**

| UAT Item | Status | Reason |
|---|---|---|
| Onboarding welcome check (Day 1) | **Valid** | `OnboardingModal` present in `app/page.tsx:1169` |
| "Yes! I-install" prompt | **Valid** | Exact copy at `app/page.tsx:944` |
| Emoji mood taps (☺ 😐 😴 😷) | **Valid** | `MoodQuickTap` present in Home |
| "Umagang EaseBrew" / "Gabing EaseBrew" tap | **Valid** | `QuickCheckIn` labels intact |
| BP Log entry + reload persistence | **Valid** | Free tool unchanged this phase |
| Tracker "isang malaking button" + sticky Save | **Valid** | After Commit #3; verified in regression audit |
| Meal Plan **NGAYONG ARAW hero** with 4 meals | **Valid** | After Commit #2 |
| "Tingnan Lahat ng Meal Plan" toggle | **Valid** | Verified |
| Recipes favorite persistence | **Valid** | Unchanged |
| Exercise "Basahin muna: Safety Guide" + "Naintindihan ko" | **Valid** | After Commit #4 |
| Video plays without related-videos overlay | **Valid** | YouTube params applied in `lib/exerciseVideos.ts` |
| Checkbox-only complete (card body inert) | **Valid** | After Commit #4 |
| Coach tab: Call + Facebook | **Valid** | Coach cards unchanged in Coach tab |
| "Ipakita sa Pamilya" card on Coach tab | **Valid** | Moved in Commit #1 |
| One-tap "I-share sa Pamilya" | **Valid** | After Commit #5 |
| Green ✓ "Naibahagi na sa Pamilya" persistence | **Valid** | localStorage `eb_family_share_v1` hydrates on mount |

### `docs/uat/coach-checklist.md`

Found **3 stale references** that will confuse coaches during testing.

| UAT Item | Status | Reason | Suggested Fix |
|---|---|---|---|
| Test 1: "click '**Bumuo ng Code**'" button | **Needs Update** | Actual admin UI button says "**Generate Code**" (English) at `app/admin/codes/page.tsx:748`. Coach will look for a Tagalog label that doesn't exist. | Change coach-checklist wording to "Generate Code" OR change the admin button label to Tagalog (bigger scope). Recommend wording change. |
| Test 2: edit "**`hero_greeting_title`**" | **Needs Update** | Key does not exist in `PUBLIC_CONTENT_KEYS`. Actual keys are `hero_title` + `hero_subtitle`. Coach editing a non-existent key gets no error but no effect. | Change reference to `hero_title`. |
| Test 3 & 4: navigate to "**`/admin/customers`**" | **Needs Update** | No such route exists. Admin has: analytics, audit-log, codes, content, exercises, notifications. Customer search happens via `/admin/codes`. | Change route reference to `/admin/codes` and describe customer lookup via the code table. |
| Test 4: "'**Kopyahin**' action" in /admin/codes | **Needs Update** | Actual grep of `app/admin/codes/page.tsx` shows no "Kopyahin" label — copy interaction happens via clicking the code cell (auto-copies) OR via context menu. Coach will hunt for a button that doesn't exist. | Reword to "i-tap ang code para ma-copy" or capture actual UX. |
| Test 5: "Kailangan ng Atensyon" panel | **Valid** | Confirmed in `/admin/page.tsx` (Auto #7) |
| Test 6: `coach_1_name` edit | **Valid** | Key exists |
| Test 7: `/admin/exercises` | **Valid** | Route exists |

### `docs/uat/admin-checklist.md`

Found **1 stale reference**.

| UAT Item | Status | Reason | Suggested Fix |
|---|---|---|---|
| Section C: "sa `/admin/customers`" | **Needs Update** | Same as coach — no such route | Change to `/admin/codes` (customer detail via code row) |
| Section C: "unlock device_id at re-issue via `/admin/customers`" | **Needs Update** | This flow happens via `/admin/codes` — clicking the code row to see device_id | Redirect to `/admin/codes` |
| Section D: `/admin/analytics` "kung available" | **Valid** | Route exists — good, the "kung available" hedge is appropriate |
| Section E security items (JWT, backups, Sentry, pg_cron) | **Valid** | All items are checkable from ops dashboards |
| Section F PWA + push | **Valid** | All items testable |

### `docs/uat/feedback-form.md`

No stale references. All 20 questions map to real UX in the shipped app.

| UAT Item | Status |
|---|---|
| All 20 questions | **Valid** |

### `docs/uat/bug-severity-matrix.md`

No stale references. Severity examples match current implementation.

| UAT Item | Status |
|---|---|
| Critical / High / Medium / Low taxonomy | **Valid** |
| Triage template | **Valid** |
| Common false positives (font toggle, Regalo tab, meal variance, install prompt) | **Valid** — all still correct |

### `docs/uat/go-no-go-checklist.md`

| UAT Item | Status | Reason |
|---|---|---|
| Section 1 — Product quality | **Valid** | All items testable |
| Section 2 — Content | **Needs Update** | "All PUBLIC_CONTENT_KEYS have production values" — see `CONTENT_READINESS_REPORT.md`; 29 of 100 keys currently missing. Should call out testimonials + videos specifically. |
| Section 3 — Business ops | **Valid** | |
| Section 4 — Infra | **Valid** | |
| Section 5 — Monitoring | **Valid** | |
| Section 6 — Communication | **Valid** | |

### `docs/uat/bug-intake.md`

| UAT Item | Status |
|---|---|
| Reporting template | **Valid** |
| Severity coding by emoji | **Valid** |

### `docs/uat/recruit-brief.md`

| UAT Item | Status |
|---|---|
| Tester profile | **Valid** |
| Pitch script | **Valid** |

### `docs/uat/tester-guide-tagalog.md`

| UAT Item | Status |
|---|---|
| Install + code entry flow | **Valid** |

### `docs/uat/README.md`

| UAT Item | Status |
|---|---|
| Index of files | **Needs Update** — `tester-checklist.md` should be removed from the index once the old file is deleted. |
| Recommended 5-tester process | **Valid** |
| Launch criteria | **Valid** (defers to go-no-go-checklist) |

---

## Consolidated action list (in priority order)

| # | Fix | File | Effort |
|---|---|---|---|
| 1 | Delete stale `tester-checklist.md` | `docs/uat/tester-checklist.md` | 1 min |
| 2 | Update README index to drop the deleted file | `docs/uat/README.md` | 1 min |
| 3 | Change "Bumuo ng Code" → "Generate Code" in coach-checklist Test 1 | `docs/uat/coach-checklist.md` | 1 min |
| 4 | Change `hero_greeting_title` → `hero_title` in coach-checklist Test 2 | `docs/uat/coach-checklist.md` | 1 min |
| 5 | Change `/admin/customers` → `/admin/codes` (+ describe customer lookup via code table) in coach Test 3 & 4 | `docs/uat/coach-checklist.md` | 2 min |
| 6 | Change "Kopyahin" action reference to actual UX | `docs/uat/coach-checklist.md` | 1 min |
| 7 | Same `/admin/customers` fix in admin-checklist.md Section C | `docs/uat/admin-checklist.md` | 2 min |
| 8 | Update go-no-go § 2 to explicitly list testimonials + videos as pending content OR mark them "not required for soft launch" | `docs/uat/go-no-go-checklist.md` | 3 min |

**Total effort:** ~15 min. Pure documentation fixes. No code.

---

## Summary

| Metric | Value |
|---|---|
| Files audited | 11 |
| Total items reviewed | ~140 |
| Valid | ~135 |
| Needs Update | 5 |
| Remove | 1 (whole file) |
| Blockers for UAT | **0** — every item that has a mismatch can still be tested; the fix just prevents tester confusion |

The UAT pack is **usable as-is** for the customer testers (customer-checklist.md is clean). The 5 fixes prevent friction on the COACH and ADMIN side. Recommend applying all 8 fixes above before handing docs to R&M.
