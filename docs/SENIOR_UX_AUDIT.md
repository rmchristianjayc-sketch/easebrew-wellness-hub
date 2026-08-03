# Senior UX Audit — Customer Side

**Date:** 2026-08-03
**Scope:** Customer-facing pages only (admin/coach excluded per spec).
**Lens:** Would a 65-year-old first-time smartphone user understand this immediately?
**Method:** Code review of every P1 area + overall customer UX pass. Each finding is grounded in a specific file/line, not speculation.

**Priority levels**
- **CRITICAL** — blocks a senior from completing a core task, or high risk of confusion during UAT
- **HIGH** — meaningful drop-off risk / cognitive overload
- **MEDIUM** — reduces polish or clarity; not blocking
- **LOW** — nice-to-have, cosmetic, or edge case

---

## PRIORITY 1 — INVESTIGATED AREAS

### 1. Login / Install Flow ([app/verify/page.tsx](app/verify/page.tsx), [InstallBanner in app/page.tsx:888](app/page.tsx#L888))

**Working well:**
- `?code=` auto-fill query param (verify/page.tsx:180) — coach shares `/verify?code=EASE-...` link, box pre-fills.
- Session cookie expiry matches pack validity ([lib/auth.ts:146](lib/auth.ts#L146)) — 10–315 days. Once logged in, customer stays logged in for the whole pack.
- Auto-navigate to hub 1s after success (verify/page.tsx:205).
- 20s delayed install banner ([app/page.tsx:914](app/page.tsx#L914)) — doesn't ambush first-time user.
- Success screen is celebratory, not sterile.

**Verified issues:**

| # | Issue | File / line | Priority |
|---|---|---|---|
| L1 | **Verify page shows a 3-tab bottom nav (Code / Packages / Coach) during first-time verify.** A first-time customer just wants to type their code but sees "Packages" and "Coach" tabs, implying they have more to do. Cognitive overhead at exactly the wrong moment. | [verify/page.tsx:452-476](app/verify/page.tsx#L452) | HIGH |
| L2 | **"Step 1 → Step 2" indicator on verify form has no real Step 2.** Both circles just react to whether the code is typed. Reads as: "what am I supposed to do next?" | [verify/page.tsx:289-293](app/verify/page.tsx#L289) | MEDIUM |
| L3 | **`beforeinstallprompt` doesn't fire on some Android browsers** (Samsung Internet, MIUI, some in-app WebViews). On those, the Android install banner never appears — user has no path to install. No fallback "how to install manually" screen. Real risk on Xiaomi devices per prior feedback. | [app/page.tsx:911-917](app/page.tsx#L911) | HIGH |
| L4 | **Install banner is bottom-anchored** — competes with Coach FAB and content. On some phones the banner covers the "Bumalik sa Hub" bar. | [app/page.tsx:934-946](app/page.tsx#L934) | MEDIUM |
| L5 | **iOS install instructions are text-only** ("i-tap ang Share tapos Add to Home Screen"). Seniors on iPhones will not know what the Share icon looks like without a picture/GIF. | [app/page.tsx:948-985](app/page.tsx#L948) | MEDIUM |
| L6 | **After verify success, user waits 1000ms then is redirected.** Nothing tells them to install NOW. The install banner fires 20s later, after they've already started exploring. Bad "peak moment" for install prompt. | verify/page.tsx:205 + app/page.tsx:914 | MEDIUM |
| L7 | **PWA session on iOS Safari is cleared after 7 days of no PWA launch** (Apple's ITP policy). Not fixable app-side, but a "Kung na-logout ka, ito ang code mo:" reminder in the install screen would help. | (iOS platform) | LOW |

**Suggested simplifications** (do not implement yet):
- **On verify page: hide the 3-tab bottom nav until AFTER first verify.** Show only "Code" input, plus a subtle "May tanong? Contact Coach" text link at the bottom.
- **Drop the "Step 1/2" numbered indicator** — replace with a simple "12 characters" character counter under the input.
- **Add Android WebView / Samsung Internet fallback:** if `beforeinstallprompt` hasn't fired within 15s of first visit, show a manual "how to install" card with screenshots.
- **Move the install banner into the success screen itself** — show it right when the user is at their happiest, before they even leave verify.
- **Add "Save this code" screenshot suggestion** on the success screen — if session dies later, they can re-enter.

---

### 2. Tracker ([app/tracker/page.tsx](app/tracker/page.tsx))

**Working well:**
- Prefill-from-yesterday reduces daily typing (tracker/page.tsx:523).
- Numbered steps 1→5 give visual anchoring.
- Every button has ≥64px tap targets.
- History tab with pain trend chart + copy-to-clipboard for coach.
- Streak badge + milestone celebrations.

**Verified issues:**

| # | Issue | File / line | Priority |
|---|---|---|---|
| T1 | **5 numbered steps to log a daily check-in** is too many for the business goal (which is really just tracking EaseBrew adherence). Steps 3–5 (pain location, mood, notes) are all optional but the visual weight is identical to steps 1–2. Senior sees "5 things every day" and abandons. | [tracker/page.tsx:519-745](app/tracker/page.tsx#L519) | **CRITICAL** |
| T2 | **Pain location wall of chips** (10+ options like "Ulo", "Balikat", "Baywang", etc.) requires reading + tapping through many. Common cases like "Walang sakit" and "Ganun pa rin sa kahapon" are not one-taps. | [tracker/page.tsx:634-675](app/tracker/page.tsx#L634) | HIGH |
| T3 | **Save button is at the very bottom of a long form.** After picking mood or writing notes, user must scroll all the way down. Should sticky-pin the Save button OR auto-scroll after last field. | [tracker/page.tsx:727-740](app/tracker/page.tsx#L727) | MEDIUM |
| T4 | **"I-share ang Progress sa Coach" only copies to clipboard.** Senior sees "Na-copy na" and doesn't know what to do next. Should use Web Share API where available, or explicit micro-copy: "Bumukas na ang Messenger, i-paste sa chat." | [tracker/page.tsx:782-796](app/tracker/page.tsx#L782) | HIGH |
| T5 | **Speech-to-text VoiceButton on Notes is unlabeled and unfamiliar.** Seniors may fear pressing it (may permission prompt for microphone). Add tooltip "Puwede kang mag-record ng boses" on first render. | [tracker/page.tsx:714-716](app/tracker/page.tsx#L714) | LOW |
| T6 | **Tab strip (Ngayon / History) scrolls out of view.** User loses navigation as they scroll the today form. Sticky tabs would keep orientation. | [tracker/page.tsx:503-516](app/tracker/page.tsx#L503) | MEDIUM |
| T7 | **"Prefilled from yesterday" banner has an "I-clear" button** — but no "keep" button. Seniors don't know if inaction = accept or discard. | tracker/page.tsx:523-537 | LOW |

**Suggested simplifications:**
- **Collapse steps 3–5 into a single "More details ▼" expandable.** Default flow: EaseBrew ✓ AM/PM + Pain 1–10 + Save. Done in 3 taps.
- **Add "Walang sakit ngayon" as the first pain-location chip** — one-tap for the good days.
- **Sticky the Save button** at the bottom of the today form.
- **Replace "I-share" clipboard flow with Web Share API when available** — one tap opens Messenger with pre-filled message.

---

### 3. Family Link ([FamilyShareCard in app/page.tsx:595](app/page.tsx#L595), [app/family/[token]/page.tsx](app/family/[token]/page.tsx))

**Working well:**
- Web Share API used when available (Messenger/SMS/anything).
- 7-day expiry keeps risk low.
- Recipient page is read-only, clean, no personal medical data.
- Message template auto-includes "7 araw na valid" note.

**Verified issues:**

| # | Issue | File / line | Priority |
|---|---|---|---|
| F1 | **Two-step share: (1) "Gumawa ng Family Link" → wait → (2) "I-share sa Messenger."** Senior has to know they need to tap twice for a single action. Should generate + share in ONE tap. | [app/page.tsx:640-676](app/page.tsx#L640) | **HIGH** |
| F2 | **The raw generated URL is displayed** in a monospace box across multiple lines. Seniors think they need to memorize/type it. Should hide the URL and just show "Link ready" state with the share buttons. | [app/page.tsx:654-657](app/page.tsx#L654) | HIGH |
| F3 | **Card lives on Home tab only, mid-page.** No obvious entry point. Senior who wants to send to daughter has to remember it's on the Home tab. | app/page.tsx:1599 | MEDIUM |
| F4 | **When Web Share API is unavailable** ("I-copy ang mensahe" is the only path), no micro-copy tells the senior what to do next. Adds a mystery step. | app/page.tsx:663-665 | MEDIUM |
| F5 | **Family recipient page shows stats but no way to interact back.** Family member sees "Ma-avg pain 6/10" and wants to call Mama — no shortcut. | family/[token]/page.tsx:66-141 | LOW |
| F6 | **No indicator that a family link is currently active.** Senior generates a link, forgets, generates another → old link still lives on. Should show "May naka-share ka na — expires [date]" state. | app/page.tsx:640-676 | MEDIUM |

**Suggested simplifications:**
- **Merge into one button: "I-share sa Pamilya sa Messenger" → generates + immediately opens Web Share sheet.** Fallback to copy for old browsers.
- **Hide the raw URL** by default. Just show a green "Link handa na ✓" chip + share button.
- **Add a "Family Share" shortcut** to the Coach FAB area OR as a dedicated tile in "Free Tools" grid.
- **Show "Na-share mo na kay [Name]? Valid pa hanggang [date]"** state after generation.

---

### 4. Exercise ([app/exercise/page.tsx](app/exercise/page.tsx))

**Working well:**
- Safety checklist + stop signs at top of page.
- Phase (1/2/3) → Day → Exercise nested hierarchy.
- Rest days marked with moon icon.
- Per-exercise "Tapos na" toggle + per-day "Tapos na" summary button.
- Modification tips shown for each exercise.

**Verified issues:**

| # | Issue | File / line | Priority |
|---|---|---|---|
| E1 | **YouTube iframe has full player controls: fullscreen, share, thumbs, YouTube-branded suggestions on end.** Seniors accidentally tap "Share" or a related video and get lost outside the exercise flow. NO restriction to `rel=0`, `modestbranding=1`, `disablekb=1`, `showinfo=0`. | [exercise/page.tsx:317](app/exercise/page.tsx#L317) | **CRITICAL** |
| E2 | **No loop option** — user explicitly asked for loop capability. YouTube embed doesn't loop unless `playlist=<id>&loop=1` params are added. | exercise/page.tsx:317 | **HIGH** (user-requested) |
| E3 | **Related videos overlay at end of clip** distracts and can navigate away. YouTube's `rel=0` reduces (not eliminates) this. | exercise/page.tsx:317 | HIGH |
| E4 | **Card is clickable to toggle "done," but user often just wants to read the instruction.** Accidental "mark done" triggers. Should require an explicit checkbox tap, not the whole card. | [exercise/page.tsx:297](app/exercise/page.tsx#L297) | HIGH |
| E5 | **Rest days show "1 gawain" or "1 ehersisyo" count** — awkward for a rest day. Should say "Pahinga lang — walang exercise." | exercise/page.tsx:281-283 | LOW |
| E6 | **Progressive disclosure requires 3+ taps** (Phase → Day → Exercise) to see the actual instructions. Senior clicking around loses context. | exercise/page.tsx:236-345 | MEDIUM |
| E7 | **"I-tap para markahan na tapos" micro-copy** is small and grey — easy to miss. | exercise/page.tsx:327 | LOW |
| E8 | **No text-only fallback if video fails to load** — instruction text is BELOW where the video would be, so if the iframe silently fails, senior sees a blank black box. | exercise/page.tsx:311-321 | MEDIUM |

**Suggested simplifications:**
- **Add YouTube player params: `?rel=0&modestbranding=1&playsinline=1&loop=1&playlist=<videoId>`** — hides related videos, reduces branding, enables loop (per user request).
- **Consider self-hosted MP4** for the top 10 most-watched exercises if we control the source — full control of controls, no YouTube branding, cleaner UX.
- **Split card click from "mark done"** — card tap expands, checkbox at right taps to complete.
- **Show instruction text ABOVE the video** so text is always visible even if video fails.
- **Add a big "Play Video" placeholder** if the video hasn't been tapped — makes affordance obvious.

---

### 5. Meal Plan ([app/meal-plan/page.tsx](app/meal-plan/page.tsx))

**Working well:**
- 7-week grouping via WEEKS selector (top).
- Progress bar showing completed days.
- "Copy grocery list for this week" button — senior can paste to Messenger or print.
- Auto-navigation to current day expands relevant card.

**Verified issues:**

| # | Issue | File / line | Priority |
|---|---|---|---|
| M1 | **"What do I eat today?" is buried under: week selector + progress + reminder + all 7 day-cards.** The current day IS auto-expanded but only after the user finds it in the list. No "Today's Meal" hero at the top. | [meal-plan/page.tsx:278-366](app/meal-plan/page.tsx#L278) | **CRITICAL** |
| M2 | **Each meal is a single dense line of Tagalog:** "Easebrew + Oatmeal na may saging na saba at honey" — no visual separation of drink vs. main vs. sides. Senior scans slowly. | [meal-plan/page.tsx:339](app/meal-plan/page.tsx#L339) | HIGH |
| M3 | **7 day-cards per week is still a wall to scroll** even after picking a week. Senior wants "today," not a menu list. | meal-plan/page.tsx:278-366 | HIGH |
| M4 | **"~1,650 kcal" and nutrient tags ("Omega-3, Iron, Vit C")** are technical medical/gym jargon. Seniors care about "para sa puso" or "malakas ang bone" — not calorie counts. | meal-plan/page.tsx:313 & 344-346 | MEDIUM |
| M5 | **"Tapos na ngayon!" button at the bottom of expanded day** — senior may not realize they should tap it, and the reward is minimal (just a checkmark). | meal-plan/page.tsx:348-360 | LOW |
| M6 | **50-day plan is hardcoded** — cannot be personalized (dietary restrictions, dislikes, allergies). Not a P1 launch blocker but a growth-stage concern. | meal-plan/page.tsx:35-86 | LOW |
| M7 | **English label "50-DAY PROGRAM"** in the hero — jarring against otherwise-Tagalog UI. | meal-plan/page.tsx:191-193 | LOW |

**Suggested simplifications:**
- **Add a "TODAY" hero card** at the very top (before week selector) — shows today's meals with LIVE date, "Tapos na ba?" toggle. Everything else moves below.
- **Split each meal into 2 lines:** drink on line 1 (`Easebrew`), food on line 2 (`Oatmeal + saging + honey`). Reads faster.
- **Replace calorie/nutrient tags with a single "Benefit ngayon" line** in Tagalog ("Para sa puso" / "Para sa bones"). Hide raw numbers unless requested.
- **Add a "Ipakita lahat ng 7-araw" toggle** — default to just today + next day; show week only on demand.

---

### 6. Bagong Katawan ([app/bagong-katawan/page.tsx](app/bagong-katawan/page.tsx))

**Working well:**
- 90-day journey split into 3 clear phases with color coding.
- Progress bar per phase + overall.
- Tabs (Plan / Progress / Gabay) organize very different content types.
- Milestone celebrations at 30 / 60 / 90.
- Each day shows meals + exercise + EaseBrew reminder.

**Verified issues:**

| # | Issue | File / line | Priority |
|---|---|---|---|
| BK1 | **Every day has 6+ tracking inputs:** Easebrew ✓, Exercise ✓, Tubig (0-12 stepper), Sakit (1-10 stepper), Lakas (1-10 stepper), Notes textarea. Then a "Tapos na ngayon!" button. Overwhelming for a daily commitment. | [bagong-katawan/page.tsx:490-538](app/bagong-katawan/page.tsx#L490) | **CRITICAL** |
| BK2 | **Bagong Katawan tracks EaseBrew + exercise + pain — the exact same data as the dedicated Tracker page.** Two places to log the same thing. Senior asks "Which do I use?" | bagong-katawan/page.tsx vs tracker/page.tsx | **CRITICAL** (product decision needed) |
| BK3 | **"Sukat Mo" section on Progress tab has a 4-column grid** (Day 1/30/60/90) of number inputs. At 320px each cell is ~55px wide with 18px number — cramped for entering "70.5". | [bagong-katawan/page.tsx:598-616](app/bagong-katawan/page.tsx#L598) | HIGH |
| BK4 | **"Select Phase" English label** in an otherwise-Tagalog UI. | bagong-katawan/page.tsx:382 | MEDIUM |
| BK5 | **`▼` `▶` `▲` unicode characters** used for expand indicators instead of lucide `ChevronUp/Down` — inconsistent with rest of app. | bagong-katawan/page.tsx:399, 451 | LOW |
| BK6 | **Gabay tab has 4 sub-sections** (Easebrew, Sobrang Sakit, Food Guide, Goals) — deep nesting, hard to remember what's where. Senior visits once, forgets structure. | bagong-katawan/page.tsx:633-698 | MEDIUM |
| BK7 | **`minWidth: 100/110` on meal labels** in flex rows — no wrap issue confirmed, but tight on 320px. | bagong-katawan/page.tsx:473, 646 | LOW |

**Suggested simplifications:**
- **Product decision: pick ONE place to track EaseBrew/exercise/pain.** Recommend: Bagong Katawan for structured 90-day journey, Tracker for daily quick-log. Make them talk to each other (single source of truth). Even simpler: **remove the tracking widgets from Bagong Katawan entirely** and link to Tracker with "Log today in Tracker →".
- **Reduce daily tracking to just Easebrew ✓ + Exercise ✓** by default. Move Tubig/Sakit/Lakas/Notes into a "More details" expandable.
- **Sukat section:** replace 4-column grid with 4 stacked rows (Day 1: [input], Day 30: [input], …). Much easier to enter on mobile.
- **Fix "Select Phase" → "Pumili ng Phase"** and swap unicode arrows for lucide icons.

---

### 7. Recipe Book ([app/recipes/page.tsx](app/recipes/page.tsx))

**Working well:**
- Search bar at top.
- Category chips (horizontal scroll).
- Favorites persist across sessions.
- Photos for some recipes provide visual richness.

**Verified issues:**

| # | Issue | File / line | Priority |
|---|---|---|---|
| R1 | **Recipe photos only exist for 3 of 30 recipes** (id 1, 2, 5). Cards without photos look "unfinished" — senior may think those recipes are broken/incomplete. Either add photos for all OR remove photo affordance entirely for consistency. | [recipes/page.tsx:961-965](app/recipes/page.tsx#L961) | HIGH |
| R2 | **Emoji used throughout** — category icons (`🍚`, `🥣`, `🍴`), daily-tip strip (`☕`, `💧`, `🍚`), favorite heart (`❤️` `🤍`), search icon (`🔍`), "▲/▼" collapse arrows. These render inconsistently on Android. Prior emoji-to-lucide sweep skipped this page. | recipes/page.tsx:914-924, 1020, 900, 1039 | MEDIUM |
| R3 | **"⭐".repeat(recipe.stars)** as literal star characters — screen reader reads "star star star," non-semantic. Should use `<Star>` lucide icons. | recipes/page.tsx:1010 | LOW |
| R4 | **Recipe card is very tall when expanded** (photo + badges + description + ingredients + instructions + tips). Senior scrolls a lot. Consider collapsing ingredients + instructions separately. | recipes/page.tsx:1044+ | MEDIUM |
| R5 | **Category filter uses `❤️` for favorites** but the favorites tab is styled like regular categories — no visual differentiation. | recipes/page.tsx:930-948 | LOW |
| R6 | **No "Recipe of the Day" or featured** recipe on top — user always starts from search or scroll. No default action. | recipes/page.tsx:955+ | MEDIUM |
| R7 | **Search placeholder** uses emoji-in-placeholder trick (`🔍 Hanapin ang recipe...`) — bare-bones, not senior-obvious. Prefer a real input icon on the left side of the box. | recipes/page.tsx:898-908 | LOW |

**Suggested simplifications:**
- **Add photos for all 30 recipes** OR remove the photo affordance and show a large category icon instead — one consistent visual pattern.
- **Emoji → lucide sweep on this page** to match rest of app.
- **Add a "Ihain Ngayon" (Cook Tonight) featured card** on top — either random or aligned to today's meal-plan.
- **Split expanded recipe into "Ingredients" / "Paano Lutuin"** sub-tabs so senior sees one chunk at a time.

---

## PRIORITY 2 — OVERALL CUSTOMER UX

### Home page ([app/page.tsx:1478+](app/page.tsx#L1478))

**Verified issues:**

| # | Issue | Priority |
|---|---|---|
| H1 | **Sticky header competes for attention with 5 elements at once:** brand, tier label, "A A" font toggle, "Regalo" counter, 4-tab nav strip. Senior can't identify the primary CTA. | HIGH |
| H2 | **Home tab is a MEGA-PAGE**: hero, check-in emoji, tomorrow's meal preview, free-tools grid, daily tip, EaseBrew reminder, routine, more tips, referral card, testimonial card, family share, FAQ, plus banners (promo/notification/expiry). Scroll fatigue. | **CRITICAL** |
| H3 | **Coach FAB label reads "COACH" at 8px** — very small. Icon-only interpretation is possible but not obvious to a senior. Enlarging isn't enough; consider making the whole thing more discoverable (e.g. "Tap for Coach"). | MEDIUM |
| H4 | **Multiple banners stack:** PromoBanner + NotificationBanner + ExpiryBanner + InstallBanner can all be present. Cognitive noise. | MEDIUM |
| H5 | **Font toggle ("A A") is functional but its purpose is not obvious.** Small icon-only button — senior may miss it or fear tapping. Better: "Palakihin ang text" text button in Settings. | LOW |
| H6 | **Onboarding modal fires only once** — if senior dismisses accidentally, they can't re-see it. Add a "Balikan ang Guided Tour" link on Coach tab. | MEDIUM |

### Cross-cutting patterns

| # | Issue | Priority |
|---|---|---|
| C1 | **Loading state is a plain "Sandali lang..." text** with no spinner or skeleton. Senior may think the app froze. | MEDIUM |
| C2 | **Long body copy before the action button** — many pages have 3–4-line explainer paragraphs. Senior skips to the button; the text is wasted. Move explainer AFTER action, or shorten to 1 line. | HIGH |
| C3 | **"AI-looking" patterns** the user should decide about: gradient backgrounds (bagong-katawan header, family recipient page), extensive pastel color swatches on stat tiles, numbered step circles (1→2→3→4→5 in Tracker), rounded pill-badges everywhere. Not broken UX — brand/aesthetic choice. | MEDIUM |
| C4 | **Save state uses green "Na-save na!" for 3s then disappears.** Senior may not see it if they were looking at the button. Consider persistent "Huling save: 8:42 AM" line. | LOW |
| C5 | **Copy-to-clipboard flows require user to know what "paste" means** — used in tracker, meal-plan, family share, medical card. Senior audience unfamiliar. Prefer Web Share API. | HIGH |

---

## PRIORITY RANKING — CONSOLIDATED

### CRITICAL (highest UX risk; recommend fixing before UAT)
1. **BK2** — Duplicate tracking between Tracker and Bagong Katawan (product decision)
2. **BK1** — Bagong Katawan daily has 6+ tracking inputs
3. **M1** — Meal plan has no "Today's Meal" hero; buried
4. **T1** — Tracker has 5 required-looking steps
5. **E1** — YouTube embed shows full controls + related videos
6. **H2** — Home page is a mega-scroll with 12+ sections

### HIGH (should fix if time allows before launch)
- **L1** — Verify page 3-tab bottom nav confuses first-time users
- **L3** — Android install fallback missing for browsers without `beforeinstallprompt`
- **T2** — Pain-location wall of chips
- **T4** — "I-share sa Coach" is clipboard-only, no Messenger deep link
- **F1** — Family share requires 2 taps (generate + share)
- **F2** — Raw URL exposed to user (looks confusing)
- **E2** — YouTube loop not enabled (user explicitly requested)
- **E3** — Related videos overlay at end of clip
- **E4** — Card-click marks exercise done (accidental completion)
- **M2** — Each meal is a dense single line
- **M3** — 7 day-cards per week is still a wall
- **BK3** — Sukat 4-column grid cramped at 320px
- **R1** — Only 3/30 recipes have photos
- **H1** — Sticky header has too many elements
- **C2** — Long body copy before CTA buttons
- **C5** — Clipboard-based sharing UX

### MEDIUM
- **L2** — "Step 1/2" indicator on verify with no real Step 2
- **L4** — Install banner conflicts with bottom UI
- **L5** — iOS install instructions text-only
- **L6** — Install prompt timing misses "peak moment"
- **T3** — Save button not sticky
- **T6** — Tab strip scrolls out of view
- **F3** — Family share entry only on Home tab
- **F4** — Fallback copy has no "what next" micro-copy
- **F6** — No active-link indicator
- **E6** — 3-tap deep nav (Phase→Day→Exercise)
- **E8** — No fallback if video fails
- **M4** — Calorie/nutrient jargon
- **BK6** — Gabay tab has 4 deep sub-sections
- **R2** — Emoji-to-lucide sweep incomplete
- **R4** — Recipe cards very tall when expanded
- **R6** — No "Recipe of the Day"
- **H3** — Coach FAB tiny label
- **H4** — Multiple banners stack
- **H6** — Onboarding not re-openable
- **C1** — Loading state has no skeleton
- **C3** — "AI-looking" patterns (owner decision)

### LOW (nice-to-have, cosmetic)
- L7, T5, T7, F5, E5, E7, M5, M6, M7, BK4, BK5, BK7, R3, R5, R7, H5, C4

---

## NEXT STEPS — YOUR CALL

1. **Review this document** and mark which items to fix. I'd recommend the 6 CRITICAL items first — those are the ones likely to make a senior close the app during UAT.
2. **For BK2 (duplicate tracking)**, this is a product decision. Options:
   - Kill tracking widgets inside Bagong Katawan; link to Tracker.
   - Kill the standalone Tracker page; keep only Bagong Katawan.
   - Keep both, but wire them to the same underlying data.
3. **After you pick the list, I'll implement** each fix as its own small commit so you can revert individually if you disagree with an approach.

**Nothing has been changed in code as part of this audit.**
