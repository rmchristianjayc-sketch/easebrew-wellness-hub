# Bug Severity Matrix

*Use this when triaging every incoming bug report during UAT.*

---

## Severity levels

### 🔴 **CRITICAL** — Block launch. Fix same day.

- App crashes or shows the "May problema pansamantala" error boundary
- Cannot log in with a valid code
- Data loss (Save button appears to work but data is gone next visit)
- Wrong tier granted (e.g., ₱399 customer sees paid features)
- Cross-customer data leak (Family Share of A shows B's data, etc.)
- Cannot tap the primary CTA on a critical flow (e.g., "I-save ang Record")
- Sensitive info exposed (API keys in client, JWT_SECRET leaked)
- Security bypass (unauthenticated user reaches protected route)
- Coach or Admin panel completely inaccessible

**Rule of thumb:** if a senior tester can't complete their intended task at all, it's CRITICAL.

### 🟠 **HIGH** — Launch-blocking unless workaround is trivial. Fix within 24-48 hours.

- Layout broken on real device (button overflows card, text unreadable)
- Video won't play on Android Chrome (Xiaomi, Samsung)
- Family Share link doesn't open on recipient's phone
- Push notifications never fire when app is closed on Android
- Session lost prematurely (before code expiry)
- Wrong Tagalog text in a primary CTA
- Duplicate data written (double-log of EaseBrew)
- Coach cannot generate a code for a paying customer
- Admin cannot edit content that customer sees

**Rule of thumb:** if the senior CAN complete the task but the experience is materially degraded, it's HIGH.

### 🟡 **MEDIUM** — Should fix before soft launch, but launchable if backlog is empty.

- Cosmetic overflow at 320px (rare screen)
- Long name / long label wraps awkwardly
- Toast auto-dismisses too fast for slow readers
- Missing loading spinner (only "Sandali lang..." text)
- Icon looks slightly off on iOS vs Android
- Non-critical text has a typo
- Onboarding modal fires twice on same session
- FAQ answer is out of date
- Video loops but audio doesn't
- Coach FAB button covers a card edge on iPad landscape

**Rule of thumb:** annoying but doesn't block the senior from finishing their task.

### 🟢 **LOW** — Nice-to-have. Batch into a post-launch cleanup sprint.

- Micro-copy improvements ("I-tap para markahan" → "I-tap ang box para markahan")
- Additional icons for delight
- Feature requests ("dagdag pa sana ng blood sugar tracker")
- Analytics polish (dashboard refresh delay)
- Emoji-to-lucide sweep completeness
- Deprecated code cleanup
- Accessibility polish beyond WCAG AA baseline
- Copywriting tone tweaks

**Rule of thumb:** if it's opinion or "would be nice," it's LOW.

---

## Triage template

For every bug reported, fill this in the triage log:

```
Bug #___
────────────────────────────────
Reporter:      _______ (tester name / Sentry auto)
Date received: _______
Device:        _______ (phone model)
OS + version:  _______ (iOS 17.5 / Android 14 / etc.)
App version:   _______ (git commit hash)
Page:          _______ (/tracker, Coach tab, etc.)

What happened:
_______________________________________________
_______________________________________________

Expected:
_______________________________________________

Steps to reproduce:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

Screenshot:    ✓ / ✗
Reproducible:  Always / Sometimes / Once only / Cannot reproduce

Severity:      🔴 Critical  /  🟠 High  /  🟡 Medium  /  🟢 Low
Assigned:      _______
Status:        Open / In progress / Fixed / Verified / Won't fix
Commit fixed:  _______________
Verified by:   _______  on _______
```

---

## Escalation rules

- 🔴 CRITICAL: page R&M immediately + text engineer within 1 hour
- 🟠 HIGH: report in group chat within same day + engineer replies within 24h
- 🟡 MEDIUM: log in triage doc, discuss at end-of-UAT sync
- 🟢 LOW: batch into post-launch sprint (no engineer paging)

---

## Common false positives (do not escalate)

- "Ang liit ng text sa akin" → app already has "A A" font toggle in the header — teach the tester, not a bug
- "Wala akong nakita sa Regalo tab" → correct — Regalo tab only shows unlocked products (customer at Basic tier has none by design)
- "Bakit iba ang meal ngayon vs kahapon?" → correct — 50-day plan varies daily; not a bug
- "Nawala ang install prompt" → correct — 20s delayed and once-dismissed hides for 3 days
- "Video doesn't play" without checking network — first check the tester's connection

## Common misclassifications (correct these)

- "I don't like the color" → LOW, not HIGH
- "Two testers reported the same bug" → still same severity (not upgraded just because of count; the impact is what matters)
- "Would be nice to have X feature" → LOW / out-of-scope, not a bug at all
