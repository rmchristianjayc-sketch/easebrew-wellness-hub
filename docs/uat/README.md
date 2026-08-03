# UAT Coordinator Playbook

**For:** R&M (project owner)
**Audience for testing materials:** Filipino seniors 50+ (customers)
**Goal:** Catch real-device bugs and confusing UX before public launch.
**Timeline:** 5–7 days from first code sent to final report.

---

## Step-by-step

### 1. Recruit 3–5 testers (see `recruit-brief.md`)
- Family + close friends OK. This is a pilot, not a public beta.
- Mix of Android + iPhone.
- Mix of ages 45–70+.

### 2. Generate one code per tester at the assigned tier
Log in to `/admin/codes` in your desktop browser, click **"Bumuo ng Code"**, pick a price:

| Tester | Tier | Price | Why |
|---|---|---|---|
| Tester A | 399 | ₱399 | Sees Basic experience only — validates free tools |
| Tester B | 1499 | ₱1,499 | Sees Meal Plan + Recipes — mid-tier gate check |
| Tester C | 4497 | ₱4,497 | Sees Bagong Katawan (all features) |
| Tester D | 4497 | ₱4,497 | Second full-tier tester for cross-device compare |
| Tester E | 4497 | ₱4,497 | Third full-tier — bonus for coverage |

**Do NOT reuse the same code for two testers** — first device to verify locks it.

### 3. Send the tester their code + instructions
Copy-paste from `tester-guide-tagalog.md` into Messenger. Attach `tester-checklist.md` as PDF or as a follow-up message.

### 4. Set up the bug intake channel
Create a private Messenger group chat named **"EaseBrew UAT — Bug Reports"**. Add all testers. Pin the intake template from `bug-intake.md`.

### 5. Monitor Sentry + Supabase during UAT
- Sentry dashboard: check for any new errors daily.
- Supabase `codes` table: confirm each tester's device_id got locked (proof they logged in successfully).

### 6. Daily check-in (5 min)
Ping each tester once/day: *"Kumusta po? May problem ba nakita?"* Sometimes issues surface only after re-opening the app the next day.

### 7. Collect + triage
After 5 days, review every reported bug. Classify:
- **BLOCKER** — blocks launch (can't verify, data lost, app crash)
- **HIGH** — annoying but launchable (wrong text, minor layout issue)
- **NICE-TO-HAVE** — cosmetic, batch later

Hand blockers back to me for immediate fix. HIGH and below go into a post-launch queue.

### 8. Go/no-go decision
When zero BLOCKER bugs remain and testers report the app "feels okay," we're launch-ready.

---

## Files in this folder

| File | Send to | Purpose |
|---|---|---|
| `README.md` | You (R&M) | This playbook |
| `recruit-brief.md` | You | Who to invite + pitch script |
| `tester-guide-tagalog.md` | Each tester (Messenger) | Welcome + how to install |
| `tester-checklist.md` | Each tester (Messenger) | Step-by-step tasks (~15 min) |
| `bug-intake.md` | Group chat pin | How testers report bugs |

---

## What tests are NOT covering
- Actual purchase / payment flow (that's still manual via Messenger)
- Push notifications when app closed on Android (known SW limitation)
- Coach-side workflow (desktop, coaches already trained separately)
- Family share link (test it yourself if you have time — send yourself a link)

---

## After UAT is done

Send me:
1. The list of bugs (any format, even Messenger screenshots)
2. Any tester quote you thought was useful ("nahirapan ako dito" / "gusto ko ito")

I'll turn that into the final launch-readiness commit and a post-launch backlog.
