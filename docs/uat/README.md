# UAT Coordinator Playbook

**For:** R&M (project owner)
**Audience for testing materials:** Filipino seniors 50+ (customers), coaches, and admin owner
**Goal:** Catch real-device bugs and confusing UX before soft launch.
**Timeline:** 5–7 days from first code sent to final go/no-go.

---

## What's in this folder

| File | Send to | When |
|---|---|---|
| [README.md](README.md) | Keep for yourself | This coordinator playbook |
| [recruit-brief.md](recruit-brief.md) | Keep for yourself | How to find + invite testers |
| [tester-guide-tagalog.md](tester-guide-tagalog.md) | Each customer tester (Messenger) | Welcome + install instructions |
| [customer-checklist.md](customer-checklist.md) | Each customer tester (Messenger) | 5-day, ~15-min-total senior tasks (this is the current customer checklist — do NOT use any older `tester-checklist.md` if you see it referenced elsewhere) |
| [coach-checklist.md](coach-checklist.md) | Assigned coach(es) — 1-2 people | One 20–30 min sitting on desktop |
| [admin-checklist.md](admin-checklist.md) | R&M owner | One 45–60 min sitting on desktop |
| [feedback-form.md](feedback-form.md) | Customer testers after Day 5 | Google Form or Messenger checklist |
| [bug-severity-matrix.md](bug-severity-matrix.md) | Triage log reference | When routing bugs |
| [go-no-go-checklist.md](go-no-go-checklist.md) | R&M owner | Launch-day decision |
| [bug-intake.md](bug-intake.md) | Pin sa UAT group chat | Bug reporting template |

---

## Step-by-step

### 1. Recruit 3–5 customer testers ([recruit-brief.md](recruit-brief.md))
- Family + close friends OK. This is a pilot, not a public beta.
- Mix of Android + iPhone.
- Mix of ages 50–75.
- Willing to give honest feedback.

### 2. Generate codes per tester at assigned tier
Log in sa `/admin/codes` at your desktop, click "Bumuo ng Code," pick a price:

| Tester | Tier | Price | Why |
|---|---|---|---|
| Tester A | 399 | ₱399 | Sees Basic experience only |
| Tester B | 1499 | ₱1,499 | Meal Plan + Recipes unlocked |
| Tester C | 4497 | ₱4,497 | Full Bagong Katawan program |
| Tester D | 4497 | ₱4,497 | Second full-tier for device diversity |
| Tester E | 4497 | ₱4,497 | Third full-tier — coverage |

### 3. Send materials via Messenger

**To each customer tester:**
1. Copy [tester-guide-tagalog.md](tester-guide-tagalog.md) into a Messenger message. Replace `[CODE]` at `[LINK]`.
2. Send [customer-checklist.md](customer-checklist.md) as a follow-up message.
3. Add them to the UAT group chat (see step 4).

**To coaches:** send [coach-checklist.md](coach-checklist.md).
**To yourself:** work through [admin-checklist.md](admin-checklist.md) at your own pace.

### 4. Create group chat "EaseBrew UAT — Bug Reports"
- Add all customer testers
- Pin [bug-intake.md](bug-intake.md) template

### 5. Monitor daily
- **Sentry dashboard:** check any new errors sa customer side
- **Supabase codes table:** confirm each tester's device_id got locked (proof they logged in)
- **Group chat:** ping each tester once/day — "kumusta po?"

### 6. Triage every bug using [bug-severity-matrix.md](bug-severity-matrix.md)
- 🔴 CRITICAL → page engineer within 1 hour
- 🟠 HIGH → report same day, fix within 24-48h
- 🟡 MEDIUM → discuss at end of UAT
- 🟢 LOW → post-launch backlog

### 7. After 5 days
- Send [feedback-form.md](feedback-form.md) to every customer tester
- Aggregate results
- Fill in [go-no-go-checklist.md](go-no-go-checklist.md) with R&M

### 8. Decide: go or no-go
- **All 6 sections GO** → soft launch. Announce to ~50 real customers.
- **Any section NO-GO** → defer. Set next review date.

---

## Final recommendation — 5 UAT users + 5-day sprint

### What to prioritize testing (in order)

1. **Login / install flow** (Day 1) — critical friction point per prior audit
2. **Home + primary daily actions** (Day 1-2) — QuickCheckIn EaseBrew AM/PM is the ONE business-critical daily action
3. **Meal Plan Today Hero** (Day 3) — new UX; confirm seniors immediately see today's meals
4. **Tracker sticky Save + expander** (Day 2, 4) — validate the fast path <10s
5. **Exercise video + safety guide** (Day 4) — new YouTube params + acknowledge flow
6. **Coach tab + Family Share** (Day 5) — new location + one-tap flow

### What NOT to prioritize (defer to post-launch)

- Bagong Katawan (unchanged this phase; already stable)
- Free health tools (BP, BMI, Medical Card — unchanged)
- Recipes (unchanged; existing photo policy stays)
- Admin analytics dashboard

### Duration: **5 days minimum, 7 days maximum**

- < 5 days: not enough to catch cross-session bugs (data persistence, session expiry)
- > 7 days: testers lose momentum; results plateau

### Launch criteria (from [go-no-go-checklist.md](go-no-go-checklist.md))

Before soft launch, ALL of these must be true:

- ✅ 0 open 🔴 CRITICAL bugs
- ✅ 0 open 🟠 HIGH bugs (or all have accepted workarounds)
- ✅ 4-of-5 testers report score ≥ 7/10 "usable / easy"
- ✅ 100% of PUBLIC_CONTENT_KEYS populated in production
- ✅ 2+ coaches trained on admin panel
- ✅ Sentry quiet for 48 hours
- ✅ Rollback plan documented (git tag of last known-good commit)
- ✅ Payment / support ops running

If any of these fails: **DEFER LAUNCH**. Fix, verify, run go/no-go again.

---

## What's NOT included in this UAT phase

- Public marketing launch (that's a separate motion after soft launch signal is positive)
- Load testing (small pilot doesn't stress-test infra)
- Payment integration testing (still manual via Messenger)
- Analytics dashboard training (comes after launch)

Everything else is covered by the checklists above.
