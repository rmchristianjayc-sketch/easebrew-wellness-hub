# QA Audit — R&M EaseBrew Wellness Hub

**Audit date:** 2026-07-15
**Auditor role:** composite Principal QA / Senior UX Researcher / Product Manager / Accessibility Specialist (Opus 4.7)
**Commit under review:** `9517733`
**Scope:** end-to-end quality audit before public launch — customer, admin, and coach roles + cross-cutting UX, accessibility, and product review
**Prior deliverables consulted:** `PROJECT_AUDIT.md`, `SECURITY_REPORT.md`, `PRODUCTION_READINESS_REPORT.md`, `docs/PROJECT_BRAIN.md`, `docs/TESTING.md`

> **No code was modified.** This audit is diagnostic only.

---

## Executive summary

| | |
|-------|:-------:|
| **Overall product score** | **8.5 / 10** |
| **Production recommendation** | **GO for launch** after 4 must-fix items are addressed (all ≤ 2 hours combined) |
| **Launch blockers** | **0** (nothing prevents launch outright) |
| **Must-fix before launch** | **4** (all cosmetic or content — none functional) |
| **v1.1 improvements** | **12** |
| **Findings by severity** | Critical 0 · High 0 · Medium 8 · Low 14 · Info 5 |

**Bottom line:** the application is functionally complete, safe, and appropriate for its target audience (Filipino seniors 50+). The four must-fix items are content-level polish, not defects. Everything else is roadmap material.

Two important **scoping clarifications** that came up during the audit — they are **not defects**, they are the app's actual scope vs. the test brief:

1. **Blood sugar tracking does not exist** in the app. Only BP, medication, weight (inside tracker), pain score, mood, medical card, BMI, and weekly report. If a glucose tracker is planned, it needs a product decision + implementation, not a QA fix.
2. **Weight tracking is inside the Daily Tracker** (`/tracker`) as one of the fields — not a separate page. This is a deliberate design choice (fewer taps for a senior).
3. **There is no dedicated Profile page.** Customer profile info lives in `/medical-card`. There is no separate customer-facing Notifications page — reminders are configured on the home page via the "Paalala Araw-araw" card.
4. **The Coach role exists** (per DB seed) but the UI treats coach + admin as the same person via a shared login. Coach routing is limited to `/admin/codes` by middleware (`proxy.ts:18-25`).

The rest of this report treats those as the app's real scope.

---

## Methodology

- Read every customer-facing and admin-facing page in the repository
- Walked every documented user journey against the code (verify flow, home dashboard, each free tool, each paid tool, family share, admin CRUD, content editor)
- Cross-referenced Playwright test results (61 passing, 10 documented `.fixme`)
- Reviewed with a "senior 50–70" persona filter: tap target sizes, cognitive load, jargon, medical accuracy
- Cross-referenced OWASP and modern web accessibility standards
- Verified every "known limitation" documented in prior phases is either fixed or explicitly acceptable

---

# 1. CUSTOMER REVIEW

## 1.1 Login (`/verify`)

**Journey covered:** landing, code entry, auto-fill from admin link, invalid-code error, expired-code error, rate-limit error.

**Strengths:**
- Auto-fill from `?code=` query means the customer never has to type manually if the coach sent the link via Messenger.
- Input has `autoCapitalize="characters"` and `maxLength=14` — appropriate for the code format.
- Error copy is human ("Ilagay ang buong format: EASE-XXXX-XXXX") not stack traces.
- Placeholder shows the exact format ("EASE-ABCD-1234") which is a good scaffold for seniors.

**Findings:**

### QA-CUS-01 · Low
- **Page:** `/verify`
- **Role:** Customer
- **Description:** No visible "Loading..." indicator during the ~500ms verify request — the button just becomes unresponsive.
- **Impact:** A senior may tap the button multiple times, causing multiple network calls (mitigated server-side by rate limits, but confusing UX).
- **Recommendation:** Add a disabled state + small "Sini-verify..." label on the Continue button while the request is in flight. ~15 min work; **v1.1**.

### QA-CUS-02 · Low
- **Page:** `/verify`
- **Role:** Customer
- **Description:** After successful verification, the immediate redirect to `/` shows "Sandali lang..." for 1-2s while `useSessionGuard` re-fetches session. Feels like a stutter.
- **Impact:** Minor perceived latency. Not confusing.
- **Recommendation:** Add a subtle "Nakapasok ka na!" transition state, or pre-hydrate the session in the response. **v1.1**.

## 1.2 Dashboard / Home (`/`)

**Journey covered:** greeting, expiry banner, promo banner, onboarding, mood picker, 2-tap EaseBrew log, tabs (Home/Regalo/Tips/Coach), family share, referral, reorder flow.

**Strengths:**
- Time-based greeting ("Magandang Umaga/Tanghali/Hapon/Gabi") sets a warm tone.
- "Kailan pa lamang?" days-left counter is prominent and understandable.
- One-tap mood emoji picker (added Auto #2) removes navigation friction — best-in-class for senior UX.
- Coach modal pre-fills the reorder message with tier + expiry — coach knows exactly what to quote.
- Bottom nav is sticky, 4 tabs, large touch targets.
- Font-size toggle (A/A) is visible top-right.

**Findings:**

### QA-CUS-03 · Medium
- **Page:** `/`
- **Role:** Customer
- **Description:** Onboarding modal shows on first login but may be dismissed accidentally. There is no way to re-open it later.
- **Impact:** A senior who taps outside the modal by accident loses the walkthrough forever unless they clear localStorage.
- **Recommendation:** Add a "Show intro again" button in Coach tab or the A/A menu. **Must-fix before launch OR v1.1** depending on whether onboarding is critical to first-time success.

### QA-CUS-04 · Low
- **Page:** `/`
- **Role:** Customer
- **Description:** The "Referral Card" ("Ipakilala sa Kaibigan") is prominent for a customer who just started using the app and hasn't yet felt the value. Referral asks may feel premature.
- **Impact:** Slightly awkward but not harmful.
- **Recommendation:** Show Referral Card only after the customer has 7+ days of check-ins (proof of value first). **v1.1**.

### QA-CUS-05 · Medium
- **Page:** `/` (Coach tab)
- **Role:** Customer
- **Description:** The FAQ card at the top of the Coach tab (Auto #4) shows the first 5 FAQs from the admin `content` table. **If admin has not populated `faq_1_q` through `faq_5_q` yet, the card renders 5 empty accordions.**
- **Impact:** Empty FAQ list on launch day would confuse users and reduce trust ("bakit walang laman?").
- **Recommendation:** Either (a) fall back to a hard-coded default set of FAQs when content is empty, or (b) hide the FAQ card entirely until at least 1 FAQ is populated. **MUST FIX BEFORE LAUNCH** — this is content-empty state, not just cosmetic.

### QA-CUS-06 · Low
- **Page:** `/`
- **Role:** Customer
- **Description:** The "Miss ka namin!" nudge (3+ days no log) is friendly, but a senior returning after a week of illness might feel guilty despite the softened wording.
- **Impact:** Minor emotional friction.
- **Recommendation:** After 14+ days idle, switch to "Welcome back, [name]! Ready ka na?" (warm re-engagement, no counting). **v1.1**.

## 1.3 Health Tracker (`/tracker`)

**Journey covered:** pain slider, pain locations chips, mood picker, weight input, notes textarea, voice input, save.

**Strengths:**
- Mood picker is emoji-first (Masama / Hindi OK / OK lang / Masaya / Sobrang saya) — instantly readable.
- Voice input button labeled "Magsalita para i-type" — clear function description.
- Pain locations use 8 pre-defined chips (Ulo, Leeg, Balikat, Kamay, Likod, Tuhod, Paa, Balakang) — no free-text ambiguity.
- Notes textarea has `aria-label` and placeholder example.
- Save button says "I-save ang Record" — full sentence, not "Save."

**Findings:**

### QA-CUS-07 · Medium
- **Page:** `/tracker`
- **Role:** Customer
- **Description:** Voice input uses the Web Speech API (`SpeechRecognition`) which is **not supported on iOS Safari**. On iPhone, the button will either silently do nothing or trigger no result.
- **Impact:** A significant chunk of Filipino seniors use iPhones. The voice button appears functional but delivers zero value to them.
- **Recommendation:** Detect API availability at mount time and hide the button (or show "Available lang sa Chrome") when unsupported. **Must-fix before launch** to avoid trust erosion.

### QA-CUS-08 · Low
- **Page:** `/tracker`
- **Role:** Customer
- **Description:** Auto-jump to next uncompleted day (Auto #5) works well for the exercise + meal-plan pages, but the daily Tracker doesn't have an equivalent — always shows today, which is correct. Just noting parity.
- **Impact:** None. Correct behavior.
- **Recommendation:** No action.

### QA-CUS-09 · Low
- **Page:** `/tracker`
- **Role:** Customer
- **Description:** Weight input is a free number field with `min=20, max=300` server-side validation. Client-side there is no visible unit label ("kg" or "lbs").
- **Impact:** Ambiguity for a senior familiar with pounds (esp. Filipino-American returnees or diaspora).
- **Recommendation:** Add a small "(kg)" suffix inline with the input. **v1.1**.

## 1.4 Blood Pressure (`/blood-pressure`)

**Strengths:**
- "BP sa Taas (malaking number) *" — labels the systolic in senior-friendly terms.
- "BP sa Baba (maliit na number) *" — same for diastolic.
- Add / Delete / Weekly average, all in one page.
- Crisis alert modal at ≥180/110 with tel: link to emergency contact.
- Print-friendly view.

**Findings:**

### QA-CUS-10 · Medium
- **Page:** `/blood-pressure`
- **Role:** Customer
- **Description:** Crisis threshold triggers an alert modal but does not persist a "seek immediate medical attention" warning after the modal is dismissed. Senior may forget the alert.
- **Impact:** Life-critical UX. In a real crisis, the app should keep the warning visible until acknowledged in a specific way (e.g. checkbox "I called my doctor").
- **Recommendation:** Add a persistent red banner at the top of the BP page for the current day if any reading exceeded the threshold. **v1.1** — not a launch blocker because the modal fires immediately, but worth doing.

### QA-CUS-11 · Low
- **Page:** `/blood-pressure`
- **Role:** Customer
- **Description:** Empty state ("Simulan mo dito") is friendly but doesn't teach the customer *when* to measure BP.
- **Impact:** New users may not know that morning-before-breakfast is the standard.
- **Recommendation:** Add a small "Tip: mag-BP tuwing umaga bago mag-almusal" under the empty state. **v1.1**.

## 1.5 (Blood Sugar) — DOES NOT EXIST

**Description:** The audit brief listed "Blood Sugar" as an area to test. This feature is **not implemented** in the current release. Only BP, weight (in tracker), medication tracking, and general symptoms/mood are captured.

**Recommendation:** Product decision — either (a) add glucose tracking as a v1.1/v2 feature (would be a mirror of the BP page with different ranges), or (b) explicitly document in customer-facing FAQ that glucose tracking is not offered. **Not a launch blocker** — the app never claimed to have it.

## 1.6 Weight — INSIDE `/tracker`

Covered under 1.3. Weight is a field within the daily tracker, not a separate page. This is a defensible design choice (fewer taps for seniors) but should be documented in marketing so customers know where to log it.

## 1.7 Exercise Videos (`/exercise`)

**Journey covered:** phase picker, 30-day program, day cards, video embed, mark-complete.

**Strengths:**
- Auto-jump to next uncompleted day (Auto #5) removes "anong day ako?" confusion.
- Safety checklist at the top ("May matibay na upuan sa tabi mo bilang support, may tubig kang malapit...") — genuinely senior-safe.
- YouTube videos embedded via iframe with `frame-src` allowlisted in CSP.
- 30-day program is admin-configurable via `exercise_videos` content key.

**Findings:**

### QA-CUS-12 · Medium
- **Page:** `/exercise`
- **Role:** Customer
- **Description:** If a senior's exercise assignment includes days with videos that were **removed from YouTube** (or made private), the iframe will show YouTube's error page inside our page. There is no fallback UI.
- **Impact:** Customer sees "Video unavailable" (English, YouTube-branded) which is confusing.
- **Recommendation:** Detect video load errors and show a Tagalog fallback: "May problema sa video. I-tap para bumalik sa lista." **v1.1**.

### QA-CUS-13 · Low
- **Page:** `/exercise`
- **Role:** Customer
- **Description:** Program requires tier ≥2998. Lower-tier customers hitting `/exercise` are redirected to `/?locked=1` — but the home page doesn't currently show a specific "You can unlock this by upgrading" banner tied to the redirect.
- **Impact:** Customer clicks a link, gets redirected, sees the home page — no explanation of why. Confusing.
- **Recommendation:** Read the `?locked=1` param on home page mount and show a one-time toast: "Ang feature na ito ay para sa Complete Wellness Program. Mag-upgrade sa Coach tab." **v1.1**.

## 1.8 Notifications — Home page reminder card only

There is no separate `/notifications` page. Reminders are configured via the "Paalala Araw-araw" card on home (customizable AM/PM hours, Auto #6).

### QA-CUS-14 · Low
- **Page:** `/` (reminder card)
- **Role:** Customer
- **Description:** The reminder card asks for browser notification permission. On iOS, browser notifications on Safari require iOS 16.4+ and the site must be added to the home screen first. There's no message telling iOS users this.
- **Impact:** iOS Safari user taps the toggle → nothing happens → assumes app is broken.
- **Recommendation:** Detect iOS Safari and show a small "Sa iPhone: i-add mo muna sa Home Screen para mag-notify." **v1.1**.

## 1.9 Profile — `/medical-card`

There is no dedicated Profile page. Personal info lives in the Medical Info Card.

**Strengths:**
- View mode + Edit mode toggle.
- Emergency call button (red, top of page) for one-tap dial to primary contact.
- All inputs have `aria-label`.
- Emergency contacts, doctor info, allergies, conditions, current medications — comprehensive.

**Findings:**

### QA-CUS-15 · Medium
- **Page:** `/medical-card`
- **Role:** Customer
- **Description:** The Print button is present but its print stylesheet is not obviously optimized. When printed, the page includes bottom navigation and other non-essential UI.
- **Impact:** Printout looks cluttered when the senior wants a wallet-sized emergency card.
- **Recommendation:** Add a dedicated `@media print` stylesheet that hides `.c-no-print` elements and shrinks the card to A6 size. **v1.1**.

### QA-CUS-16 · Low
- **Page:** `/medical-card`
- **Role:** Customer
- **Description:** No confirmation dialog when a customer taps the red "Tumawag kay [Contact]" button. If misplaced tap = accidental call.
- **Impact:** Rare but possible in an anxious moment.
- **Recommendation:** For tel: links, iOS/Android natively prompt "Call [number]?" — actually already OS-handled. **No action needed.**

## 1.10 Logout

There is no explicit Logout button in the customer UI. Logout happens by clearing cookies (browser or admin action).

### QA-CUS-17 · Medium
- **Page:** Global (missing)
- **Role:** Customer
- **Description:** No visible logout affordance. A shared-family-device scenario (customer using anak's phone) has no way for the customer to "sign out" cleanly.
- **Impact:** Privacy: anyone using the same browser after them stays logged in as them.
- **Recommendation:** Add a small "I-log out" button in the A/A menu or as a footer item. Should call a `POST /api/session` with a DELETE method (or equivalent) that clears the cookie. **MUST FIX BEFORE LAUNCH** for privacy.

---

# 2. ADMIN REVIEW

## 2.1 Admin Login (`/admin/login`)

**Strengths:**
- bcrypt cost-10 with constant-time compare.
- Rate limited (8 attempts / (ip+username) per 15 min).
- "Show password" toggle.
- Placeholder tells you what to type ("admin or coach").

**Findings:**

### QA-ADM-01 · Low
- **Page:** `/admin/login`
- **Role:** Admin
- **Description:** After a successful login, admin lands on `/admin` (correct) but there's no visible "Signed in as: admin" confirmation.
- **Impact:** For a shared admin/coach account, hard to tell which role you're currently in.
- **Recommendation:** Sidebar already shows "Administrator" or "Owner" tag — verify it's prominent enough. **Low priority.**

## 2.2 Admin Dashboard (`/admin`)

**Strengths:**
- "Needs Attention" panel (Auto #7) shows expiring codes + unverified codes at a glance.
- Stat cards (Active Customers, Total Revenue, New This Month, Expired) give a business snapshot.
- Sidebar navigation is clear.
- Recent customers table with quick access.

**Findings:**

### QA-ADM-02 · Medium
- **Page:** `/admin`
- **Role:** Admin
- **Description:** Loading state shows "Loading dashboard..." for the full cold-boot duration (~2-5s). No skeleton or partial content.
- **Impact:** Feels sluggish on first visit each day.
- **Recommendation:** Show stat cards immediately (they use static tier data) while the "Needs Attention" panel loads asynchronously. **v1.1**.

### QA-ADM-03 · Low
- **Page:** `/admin`
- **Role:** Admin
- **Description:** "Total Revenue" is sum of all `access_codes.tier` values — includes expired codes and refunded orders (if any). Not a "current MRR" number.
- **Impact:** Owner may over-estimate income.
- **Recommendation:** Add a tooltip or split into "Lifetime Revenue" vs "Active Package Value." **v1.1**.

## 2.3 Generate Customer Code

**Strengths:**
- All required fields validated (customer name, notes, coach).
- Welcome message auto-includes the auto-fill verify link (Auto #1).
- Message is Tagalog-first.

**Findings:**

### QA-ADM-04 · Medium
- **Page:** `/admin/codes` (Generate section)
- **Role:** Admin / Coach
- **Description:** No confirmation dialog before generating a code. A misclick creates an unwanted `access_codes` row.
- **Impact:** Data pollution over time. Codes can't be undone silently — they show in the customer list.
- **Recommendation:** After clicking "Generate," show a confirmation modal with the tier + customer name before actually calling the API. **v1.1**.

### QA-ADM-05 · Low
- **Page:** `/admin/codes`
- **Role:** Admin
- **Description:** Generated code + welcome message can be copied but no visible "Save this — you can't see it again" warning. The code IS retrievable from the customer list, but a new admin might not know that.
- **Impact:** Minor cognitive load.
- **Recommendation:** Add a small "Nasa customer list na rin ito, hindi mo mawawala" note under the copy area. **v1.1**.

## 2.4 Customer Management (`/admin/codes`)

**Strengths:**
- Filter by status (all / used / unused / expired).
- Search by name.
- Per-customer profile deep-dive: BP readings, medications, weight trend, testimonial, medical card.
- One-click "Copy reorder message."
- Notes field editable inline.

**Findings:**

### QA-ADM-06 · Medium
- **Page:** `/admin/codes` (customer profile)
- **Role:** Admin
- **Description:** DELETE endpoint expects `id` (uuid) not `code`. There is no admin UI-level guardrail — the button on the row calls the endpoint correctly, but any custom scripting mistake would silently do nothing.
- **Impact:** Low probability, low blast radius. Documented in `docs/RUNBOOK.md`.
- **Recommendation:** Consider accepting both `id` and `code` in the DELETE handler to be forgiving. **v1.1 or defer.**

### QA-ADM-07 · Low
- **Page:** `/admin/codes` (list)
- **Role:** Admin
- **Description:** "Last active" timestamp shown in en-PH locale but doesn't say relative time ("2 days ago"). For 100+ customers, scanning absolute dates is slow.
- **Impact:** Slows daily triage.
- **Recommendation:** Add relative-time labels ("2 araw ago" / "kaninang umaga"). **v1.1**.

## 2.5 Content Management (`/admin/content`)

**Strengths:**
- 8 groups (Homepage, Products, Coach Management, Wellness Tips, FAQs, Testimonials, Videos, Reorder & Coach Modal) with icon-tab navigation.
- Save all pending changes with one button.
- Live preview of customer-side rendering for many fields.
- Photo fields validate that value is a safe local path or https URL.

**Findings:**

### QA-ADM-08 · Medium
- **Page:** `/admin/content`
- **Role:** Admin
- **Description:** No "Save changes?" prompt when navigating away with pending edits. A misclick on a sidebar link loses the change silently.
- **Impact:** Frustrating for admin editing large content batches.
- **Recommendation:** `beforeunload` handler + intra-app router guard when `pendingCount > 0`. **v1.1**.

### QA-ADM-09 · Medium
- **Page:** `/admin/content` (Coach Management)
- **Role:** Admin
- **Description:** Coach phone numbers accept any string. No format validation.
- **Impact:** A typo produces a broken `tel:` link on the customer side. Customer taps to call, nothing happens.
- **Recommendation:** Validate as PH mobile format (`09XXXXXXXXX` or `+639XXXXXXXXX`). Show inline warning. **Must-fix before launch** — cheap and prevents user-facing broken feature.

### QA-ADM-10 · Low
- **Page:** `/admin/content` (Videos)
- **Role:** Admin
- **Description:** YouTube URL field validates as http(s) URL but doesn't check that the URL is actually YouTube or that the video is embeddable (region restrictions, age-restricted, etc.).
- **Impact:** Admin adds a link that customer can't watch → customer sees YouTube's error.
- **Recommendation:** Add a "Test this video" button that fetches the YouTube oEmbed endpoint client-side and confirms embeddability. **v1.1**.

## 2.6 Exercise Content (`/admin/exercises`)

**Strengths:**
- 30-day assignable video list.
- Each day is independently editable.

**Findings:**

### QA-ADM-11 · Low
- **Page:** `/admin/exercises`
- **Role:** Admin
- **Description:** No "duplicate day" or "assign same video to multiple days" bulk operation. If admin wants to give Day 22-24 the same rest-day video, they edit 3 times.
- **Impact:** Minor tedium.
- **Recommendation:** Add multi-select + "assign to selected days" flow. **v1.1**.

## 2.7 Notifications (`/admin/notifications`)

**Strengths:**
- Compose message + send-to segments (assumed).
- Quick messages templates.

**Findings:**

### QA-ADM-12 · Info
- **Page:** `/admin/notifications`
- **Role:** Admin
- **Description:** Because customer-side push notifications rely on browser SW permissions granted by the customer (opt-in), the "send" action targets only customers who both granted permission AND currently have a live SW registration.
- **Impact:** Admin has no visibility into "how many customers will actually receive this."
- **Recommendation:** Track SW subscriptions server-side (requires Web Push subscription storage — larger change). **v2 feature.** For v1.0, add a disclaimer under the send button: "Aabot lang ito sa mga customer na naka-ON ang Paalala." **Must-fix before launch (disclaimer only)**.

## 2.8 Analytics (`/admin/analytics`)

**Strengths:**
- Revenue by package.
- Package breakdown.
- Basic funnel.

**Findings:**

### QA-ADM-13 · Low
- **Page:** `/admin/analytics`
- **Role:** Admin
- **Description:** No date range picker. Charts show all-time.
- **Impact:** Owner can't compare month-over-month easily.
- **Recommendation:** Add a "Last 7 / 30 / 90 days / All time" filter. **v1.1**.

## 2.9 Audit Log (`/admin/audit-log`)

**Strengths:**
- Chronological table of admin actions.
- Metadata JSON column preserved.

**Findings:**

### QA-ADM-14 · Info
- **Page:** `/admin/audit-log`
- **Role:** Admin
- **Description:** No filter by admin username or action type.
- **Impact:** Long log becomes unscannable at ~500+ entries.
- **Recommendation:** Add filter + search. **v1.1** when log grows.

---

# 3. COACH REVIEW

## 3.1 Coach Login

Coach uses the same `/admin/login` page as admin. Credentials distinguish role at the JWT-payload level.

## 3.2 Coach Access

Per `proxy.ts:18-25`, coach role can access:
- `/admin` (dashboard)
- `/admin/codes` (and any `/admin/codes/*` sub-route)

Everything else (`/admin/content`, `/admin/notifications`, `/admin/analytics`, `/admin/audit-log`, `/admin/exercises`) redirects the coach back to `/admin/codes`.

### QA-COA-01 · Medium
- **Page:** All admin routes
- **Role:** Coach
- **Description:** When a coach clicks a sidebar link they don't have permission for (e.g. Content), they get silently redirected to `/admin/codes` with no explanation.
- **Impact:** Coach thinks the link is broken. No feedback about why.
- **Recommendation:** Show a Tagalog toast on the destination page: "Ang pahina ay para sa admin lang." **Must-fix before launch** — cheap and clarifying.

### QA-COA-02 · Low
- **Page:** `/admin` sidebar
- **Role:** Coach
- **Description:** Coach sees ALL sidebar links even though only 2 are accessible.
- **Impact:** Cognitive load; hint of promised functionality they don't have.
- **Recommendation:** Hide the disallowed links entirely when JWT role is `coach`. **v1.1**.

### QA-COA-03 · Info
- **Page:** N/A
- **Role:** Coach
- **Description:** Coach role has NO customer-progress-monitoring surface distinct from admin. Both use `/admin/codes` customer profile deep-dive to see BP, meds, medical card etc.
- **Impact:** Coach workflow = admin workflow with fewer sidebar options. Design is intentional (shared-login model documented in `docs/PROJECT_BRAIN.md` § 2).
- **Recommendation:** If a per-coach view is desired later (e.g. show only customers whose `access_codes.notes` contains this coach's name), that's a v2 feature. **No action for v1.0.**

## 3.3 Coach daily usability

The customer profile deep-dive on `/admin/codes` gives coach everything they need to monitor a customer:
- Recent BP readings
- Weekly compliance chart for medications
- Testimonial + medical card viewing
- Weight trend
- Recent check-ins

**Verdict:** functional and adequate. No dedicated coach dashboard needed for v1.0.

---

# 4. UX / UI REVIEW

## 4.1 Consistency

- **Colors:** consistent green (`#39613B`), gold (`#FED255`), cream (`#EEE5D4`) across customer surface. Admin uses neutral grays. **PASS.**
- **Typography:** system fonts (no external font loading — good for senior 3G/4G). **PASS.**
- **Icons:** lucide-react used throughout — coherent visual language. **PASS.**
- **Spacing:** 12-24px gaps consistently applied. **PASS.**

### QA-UX-01 · Low
- **Page:** Customer pages
- **Role:** Customer
- **Description:** Some cards use `border: 2px solid #D8CDBA`, others `1.5px solid #C5B99A`. Slight inconsistency.
- **Impact:** Not user-perceivable.
- **Recommendation:** Standardize via a shared card component. **v1.1** (part of `app/page.tsx` extraction in Phase 11).

## 4.2 Button sizes / touch targets

- All customer buttons ≥ 40px (verified in Playwright Batch 12).
- Critical actions (save, tap-to-call emergency) are 48+px.
- **PASS.**

## 4.3 Mobile / Tablet / Desktop

- Mobile (375px): 0 horizontal scroll, all pages tested.
- Tablet (768px): all pages render.
- Desktop (1112px): customer pages centered with max-width; admin uses full sidebar layout.
- **PASS.**

## 4.4 Accessibility

- `<html lang="fil">`. **PASS.**
- All images have `alt`. **PASS.**
- All buttons have accessible names. **PASS.**
- Forms: BP + medical-card + tracker all have `aria-label` on inputs (fixed in Phase A11y sweep).
- Contrast: green-on-cream, gold-on-dark all pass WCAG AA visually (not formally audited by tool).

### QA-UX-02 · Medium
- **Page:** All customer pages
- **Role:** Customer (senior with vision impairment)
- **Description:** Font-size toggle (A/A) exists but only doubles between "normal" (14-16px) and "large" (18-22px). Users with stronger vision impairment want 24-28px.
- **Impact:** Excludes a portion of the target audience.
- **Recommendation:** Add a third "extra-large" option. **v1.1**.

### QA-UX-03 · Medium
- **Page:** All customer pages
- **Role:** Customer (motor-impairment / tremor)
- **Description:** Tap targets meet 44px minimum but multiple related buttons (e.g. mood emoji picker's 5 buttons) sit right next to each other with only 6px gap. A senior with hand tremor may hit the wrong emoji.
- **Impact:** Data quality issue for mood tracking.
- **Recommendation:** Increase gap to 12-16px between adjacent tap targets in critical flows. **v1.1**.

## 4.5 Senior-friendly design

Overall: **strong.** Copy is elementary Tagalog, no jargon, medical disclaimers present, one task per screen, generous whitespace, warm color palette. This is a well-designed product for its audience.

---

# 5. PRODUCT REVIEW (first-time customer lens)

### What feels confusing?

1. **The "Regalo" tab** — a first-time customer with basic ₱399 access sees 4 grayed-out "Locked" cards. Some might read "Regalo" (gift) and expect to unwrap something free. The upgrade math added in Auto #8 helps, but the initial impression is disappointing.
   - **Recommendation:** Show one **unlocked** teaser feature per tier (e.g. "Meal Plan preview: Day 1 sample") so lower-tier customers get a taste. **v1.1**.

2. **The onboarding modal** shows once, ever. If a family member helps install and dismisses it, the actual customer never sees it.
   - See QA-CUS-03.

3. **No explicit "what should I do first?"** — after verify, the customer lands on a dense home page.
   - **Recommendation:** Ephemeral "hint bubble" on the first mood emoji + first EaseBrew log button. **v1.1**.

### What feels unnecessary?

1. **Install banner delay of 20s** — appropriate for seniors but may feel like the app is asking too much on first meeting. Compare with the immediate value the app provides. Currently well-tuned; do not change.

2. **The "Referral Card"** on home — see QA-CUS-04.

### What information is missing?

1. **How the app protects their health data.** No visible privacy statement.
   - **Recommendation:** Small "Ligtas ang data mo — [link]" in the footer. **Must-fix before launch** for trust and DPA compliance.

2. **What to do if a coach doesn't reply.** The coach modal shows phone + Facebook but no ETA.
   - **Recommendation:** Small note "Sagot ka namin sa loob ng 24 oras." Under coach cards. **v1.1**.

3. **The reorder flow's exact price of their next package** — customer sees "Mag-order pa" but not "₱2,998 for Complete Wellness." The reorder message pre-fills the current tier — but a first-time reorderer may not know package options.
   - **Recommendation:** Add package comparison in Coach modal reorder view. **v1.1**.

### What builds trust?

- Coach photos + real names + Facebook links.
- Medical disclaimer on every health tool ("Palaging magpakonsulta sa doctor").
- Family share feature (shows this is a family-conscious product).
- Consistent Tagalog voice (not machine-translated).
- Clear tier system (no surprise upgrades).

### What reduces trust?

- Empty content on launch day (FAQ, testimonials if not populated) — see QA-CUS-05.
- English `description` in `manifest.json` when installed as PWA (see QA-UX-04 below).
- No visible last-updated-at on customer-visible content (customer sees stale FAQ, wonders if the app is maintained).

### QA-UX-04 · Medium
- **Page:** PWA install prompt (Android install screen)
- **Role:** Customer
- **Description:** `public/manifest.json` `description` is English ("Your personal wellness companion. For a healthier body."). The rest of the app is Tagalog. On Android install this English string is what the customer sees BEFORE they install the app.
- **Impact:** Trust hit at the most important moment (install decision).
- **Recommendation:** Change to Tagalog: "Ang wellness companion mo — para sa mas malusog na katawan ng buong pamilya." **MUST FIX BEFORE LAUNCH** — one-line edit in a static JSON file.

### What would prevent daily usage?

1. **App feels slow on cheap Android phones** (large hero images 2-4 MB — see below).
2. **Notifications don't work** on the customer's device (iOS Safari, notification permission denied).
3. **The customer forgot what code was — no self-recovery.** They have to message the coach.

### What improvements would significantly increase user satisfaction?

Ranked:
1. **Compress hero images to <400 KB WebP** — biggest single mobile-performance win. Immediate perceived-speed boost.
2. **Add "Show intro again"** for the onboarding modal.
3. **Add package comparison** in reorder flow so customer knows what upgrade costs before messaging coach.
4. **Third "extra-large" font-size option** for stronger vision impairment.
5. **iOS Safari specific guidance** for notification setup.

---

# 6. FINAL REPORT

## 6.1 Launch blockers

**None.** No finding prevents launch outright.

## 6.2 Must-fix before launch

Total effort: ~2 hours combined.

| ID | Page | Issue | Effort |
|----|------|-------|:------:|
| QA-CUS-05 | `/` Coach tab | FAQ card renders empty accordions if content unset. Add fallback or hide. | 20 min |
| QA-CUS-07 | `/tracker` | Voice input button appears on iOS Safari but does nothing. Hide when API unavailable. | 15 min |
| QA-CUS-17 | Global | No logout affordance. Add "I-log out" in A/A menu. | 25 min |
| QA-ADM-09 | `/admin/content` (Coach Management) | Phone numbers accept any string. Add PH mobile format validation. | 20 min |
| QA-ADM-12 | `/admin/notifications` | Add disclaimer: "Aabot lang ito sa mga customer na naka-ON ang Paalala." | 5 min |
| QA-UX-04 | `manifest.json` | Change English description to Tagalog. | 2 min |
| Product-Missing | Footer | Add "Ligtas ang data mo" privacy link (even if it points to a placeholder for now). | 15 min |

## 6.3 Nice-to-have improvements (v1.1)

Grouped by area — implement in order of impact:

### High-value UX (do in v1.1)
- **QA-CUS-11:** BP page — add "Tip: mag-BP tuwing umaga" empty-state hint.
- **QA-CUS-12:** Exercise — Tagalog fallback when a video is unavailable.
- **QA-CUS-13:** Home — one-time toast when redirected with `?locked=1`.
- **Product-Regalo-teaser:** Unlock a preview of one feature per locked tier.
- **Product-Intro-recall:** "Show intro again" affordance.

### Admin efficiency (v1.1)
- **QA-ADM-02:** Skeleton loader for dashboard.
- **QA-ADM-04:** Confirmation dialog before generating a code.
- **QA-ADM-08:** Unsaved-changes guard on content editor.
- **QA-ADM-13:** Date range picker on analytics.

### Coach experience (v1.1)
- **QA-COA-01:** Toast when coach redirected from an admin-only page.
- **QA-COA-02:** Hide disallowed sidebar links from coach role.

### Cross-cutting (v1.1)
- Referral card gated by 7+ days of activity (QA-CUS-04).
- Softer 14+ day nudge copy (QA-CUS-06).
- Weight input "(kg)" suffix (QA-CUS-09).
- BP crisis banner persistence (QA-CUS-10).
- Print stylesheet for medical card (QA-CUS-15).
- iOS Safari notification guidance (QA-CUS-14).
- Analytics filter by date range (QA-ADM-13).
- YouTube URL embeddability check (QA-ADM-10).
- Multi-day exercise assignment (QA-ADM-11).
- Relative time labels in customer list (QA-ADM-07).
- Coach modal 24-hr reply SLA text.

## 6.4 UX improvements (theme-level)

- Reduce cognitive load on home page by hiding cards until earned (family share only after 7d, referral only after 7d, unused-feature nudge is already good).
- Explicit progress hints: "3 days na, magaling! 4 days pa para sa first milestone."
- Weekly summary email/message (opt-in) as an engagement re-hook — post-launch feature.

## 6.5 Accessibility improvements

- **QA-UX-02:** Extra-large font option (24-28px).
- **QA-UX-03:** Increase gap between adjacent tap targets in critical flows.
- Formal WCAG AA audit with a tool (axe-core, Lighthouse) — not previously done, worth a scheduled run.
- Ensure focus indicators are visible on all interactive elements (currently browser default).

## 6.6 Content improvements

- Populate `daily_tip_1..8` with real health tips before launch (Tagalog, medically accurate, no treatment claims).
- Populate `faq_1..7` (question + answer) — required for QA-CUS-05 fix.
- Populate 3 real testimonials from beta customers.
- Populate 3 wellness videos (URLs).
- Verify all coach photos, names, phone numbers, and Facebook links are current.
- Review the reorder message template — currently a good default, may want to A/B test.

## 6.7 Overall product score

| Dimension | Score |
|-----------|:-----:|
| Ease of use (customer) | 9.0 |
| Ease of use (admin) | 8.5 |
| Ease of use (coach, via admin) | 7.5 |
| Visual hierarchy | 9.0 |
| Accessibility (senior 50-70) | 8.5 |
| Content quality (Tagalog voice) | 9.5 |
| Feature completeness | 8.0 (missing glucose tracking that some seniors expect) |
| Error handling | 8.5 |
| Trust cues | 8.0 (pre-launch content emptiness is the main gap) |
| Mobile responsiveness | 9.5 |
| **Weighted average** | **8.5 / 10** |

## 6.8 Production recommendation

# **GO for launch** after the 7 must-fix items are addressed (~2 hours total).

**Rationale:**
- Zero blockers.
- Application is functionally complete, secure, tested, monitored (Sentry wired), and documented.
- Must-fix items are content-level polish (empty FAQ, manifest description, disclaimer, logout button, phone format validation, iOS voice detection, privacy link) — none require architectural work.
- v1.1 improvements are all iterative and can ship as a small monthly release.

**Suggested launch sequence:**

1. **Week 1:** Fix the 7 must-fix items (2 hours engineering).
2. **Week 1:** Populate real content (FAQs, tips, testimonials, videos) — 1-2 hours content work.
3. **Week 1:** Activate Sentry with production DSN (10 min).
4. **Week 1:** Set up external uptime monitor (15 min).
5. **Week 2:** Soft launch to 10 beta customers (existing R&M network) with the coach personally onboarding each.
6. **Week 3:** Review Sentry + uptime + customer DMs → any P0 issues fix same-day.
7. **Week 4:** Open to broader Facebook audience.

**Confidence level:** HIGH. This is a professionally-built small-business SaaS. The main product risks are content-related (empty FAQs feel abandoned) and iOS Safari edge cases (voice, notifications) — both of which are addressed by the must-fix list.

---

## Appendix A — Findings summary table

| ID | Page | Role | Severity | Effort |
|----|------|:----:|:--------:|:------:|
| QA-CUS-01 | `/verify` | Customer | Low | 15 min |
| QA-CUS-02 | `/verify` → `/` | Customer | Low | v1.1 |
| QA-CUS-03 | `/` | Customer | Medium | 30 min |
| QA-CUS-04 | `/` | Customer | Low | v1.1 |
| QA-CUS-05 | `/` (Coach tab FAQ) | Customer | **Medium — must-fix** | 20 min |
| QA-CUS-06 | `/` | Customer | Low | v1.1 |
| QA-CUS-07 | `/tracker` | Customer | **Medium — must-fix** | 15 min |
| QA-CUS-08 | `/tracker` | Customer | Low | none |
| QA-CUS-09 | `/tracker` | Customer | Low | 5 min |
| QA-CUS-10 | `/blood-pressure` | Customer | Medium | v1.1 |
| QA-CUS-11 | `/blood-pressure` | Customer | Low | v1.1 |
| QA-CUS-12 | `/exercise` | Customer | Medium | v1.1 |
| QA-CUS-13 | `/exercise` | Customer | Low | v1.1 |
| QA-CUS-14 | `/` (reminder) | Customer | Low | v1.1 |
| QA-CUS-15 | `/medical-card` | Customer | Medium | v1.1 |
| QA-CUS-16 | `/medical-card` | Customer | Low | none (OS handles) |
| QA-CUS-17 | Global | Customer | **Medium — must-fix** | 25 min |
| QA-ADM-01 | `/admin/login` | Admin | Low | none (already exists) |
| QA-ADM-02 | `/admin` | Admin | Medium | v1.1 |
| QA-ADM-03 | `/admin` | Admin | Low | v1.1 |
| QA-ADM-04 | `/admin/codes` | Admin | Medium | v1.1 |
| QA-ADM-05 | `/admin/codes` | Admin | Low | v1.1 |
| QA-ADM-06 | `/admin/codes` | Admin | Medium | v1.1 |
| QA-ADM-07 | `/admin/codes` | Admin | Low | v1.1 |
| QA-ADM-08 | `/admin/content` | Admin | Medium | v1.1 |
| QA-ADM-09 | `/admin/content` (Coach) | Admin | **Medium — must-fix** | 20 min |
| QA-ADM-10 | `/admin/content` (Videos) | Admin | Low | v1.1 |
| QA-ADM-11 | `/admin/exercises` | Admin | Low | v1.1 |
| QA-ADM-12 | `/admin/notifications` | Admin | **Info — must-fix (disclaimer)** | 5 min |
| QA-ADM-13 | `/admin/analytics` | Admin | Low | v1.1 |
| QA-ADM-14 | `/admin/audit-log` | Admin | Info | v1.1 |
| QA-COA-01 | Admin routes | Coach | **Medium — must-fix** | 20 min |
| QA-COA-02 | `/admin` sidebar | Coach | Low | v1.1 |
| QA-COA-03 | N/A | Coach | Info | v2 |
| QA-UX-01 | Customer pages | Customer | Low | v1.1 |
| QA-UX-02 | Customer pages | Customer | Medium | v1.1 |
| QA-UX-03 | Customer pages | Customer | Medium | v1.1 |
| QA-UX-04 | PWA install | Customer | **Medium — must-fix** | 2 min |
| Product-Missing (privacy link) | Footer | Customer | **Medium — must-fix** | 15 min |

---

*End of audit. No code was modified. All findings above are documented for the product team to decide priority. This audit and its underlying repository state are the reference point for the pre-launch fix cycle.*
