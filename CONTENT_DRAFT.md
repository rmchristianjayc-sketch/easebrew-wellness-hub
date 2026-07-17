# Content Draft — R&M EaseBrew Wellness Hub

**Draft date:** 2026-07-17
**Author:** Claude Opus 4.7 (draft only — no code, database, UI, or business logic changed)
**Target audience:** Filipino adults 50–70
**Tone:** warm, trustworthy, simple Tagalog with familiar English words retained (BP, exercise, tracker), encouraging, never alarmist
**Safety rules applied throughout:**
- No medical claims (no *"gagaling"*, *"makakagamot"*, *"gagamot"*, *"lulunas"*, *"nawawala ang sakit"*, *"cure"*, *"heal"*, *"treat"*).
- No guaranteed results (no *"tiyak"*, *"sure"*, *"100% effective"*).
- Wellness framing only — *"suporta"*, *"kasama"*, *"bahagi ng healthy routine"*.
- Doctor-consultation disclaimer included wherever any health topic is discussed. Standard line:
  > *"Palaging magpakonsulta sa doctor mo bago simulan o baguhin ang anumang health routine."*
- All content is a **DRAFT for owner review** — nothing is inserted into the DB. Owner (R&M) has final approval on every word before it goes live.

**How to use this file:** the owner reviews and edits each section, then either (a) hands the approved copy to the admin to paste into `/admin/content`, or (b) approves the drafts for us to insert directly via a follow-up task. Nothing here is live until the owner signs off.

---

## 1. Welcome Messages

### 1a. Homepage Hero (edit in `/admin/content` → 🏠 Homepage)

| Field | DB key | Draft copy | Length |
|-------|--------|------------|:------:|
| Hero Title | `hero_title` | **Kamusta po, Nanay at Tatay!** | 28 chars |
| Hero Subtitle | `hero_subtitle` | **Kasama mo araw-araw ang R&M EaseBrew — para sa mas magaan at malusog na araw ng pamilya.** | 90 chars |

**Alternate options for A/B testing (pick one):**
- Title: *"Magandang araw, Nanay at Tatay!"*
- Subtitle: *"Suporta sa iyong daily wellness routine — kasama ka namin."*

### 1b. First-login onboarding — currently hard-coded in [app/page.tsx](app/page.tsx) onboarding modal

Not editable via `/admin/content` today (it lives inside the app code). For context and future-editability, here's the recommended wording:

**Recommended draft (5-step onboarding — no code change; owner may request editability later):**

1. *"Salamat po sa pagtitiwala sa R&M EaseBrew!"* — Welcome screen.
2. *"Ito ang wellness companion mo. Kasama mo araw-araw."* — Purpose.
3. *"I-tap ang emoji sa umaga para i-track ang pakiramdam mo."* — Mood check-in intro.
4. *"May tanong? I-tap ang Coach tab — kausapin mo si Coach anytime."* — Coach intro.
5. *"Ready ka na po ba? Simulan na natin!"* — CTA to start.

---

## 2. Wellness Tips (edit in `/admin/content` → 💡 Wellness Tips)

Eight rotating tips shown on the Home Tips tab. Two are already live (`daily_tip_2..5`); the rest are drafted below.

| # | DB key | Draft copy | Length | Status |
|---|--------|-----------|:------:|--------|
| 1 | `daily_tip_1` | **Umaga at gabi ang tamang oras ng EaseBrew.** Inumin 30 minuto bago mag-almusal at bago matulog para maging bahagi ng daily routine. | 129 chars | draft |
| 2 | `daily_tip_2` | *Uminom ng 8 baso ng tubig araw-araw — mahalaga ito para sa katawan.* | 67 chars | ✅ live |
| 3 | `daily_tip_3` | *Tuloy-tuloy lang sa EaseBrew — ang resulta ay darating sa tamang panahon!* | 73 chars | ✅ live |
| 4 | `daily_tip_4` | *Pagsamahin ang EaseBrew sa magaan na exercise para mas mabilis ang resulta.* | 75 chars | ✅ live (rec: soften to *"para mas magaan ang pakiramdam"* — avoids implied guarantee) |
| 5 | `daily_tip_5` | *Iwasan ang processed food habang nag-iinom ng EaseBrew.* | 55 chars | ✅ live |
| 6 | `daily_tip_6` | **Matulog ng 7–8 oras kada gabi.** Kapag pahinga ang katawan, mas magaan ang pakiramdam kinabukasan. | 100 chars | draft |
| 7 | `daily_tip_7` | **Maglakad 15 minuto matapos kumain.** Simpleng exercise, malaking tulong sa digestion at sa katawan. | 100 chars | draft |
| 8 | `daily_tip_8` | **I-log ang pakiramdam mo araw-araw sa Tracker.** Kapag alam mo ang pattern ng katawan mo, mas madaling ma-monitor ang wellness journey mo. | 137 chars | draft |

*Rewrites for existing tips 3 & 4 (soften "guaranteed result" tone — owner discretion):*
- Tip 3 (soft): *"Tuloy-tuloy lang sa EaseBrew — bahagi ito ng long-term wellness routine mo."*
- Tip 4 (soft): *"Pagsamahin ang EaseBrew sa magaan na exercise para mas maganda ang pakiramdam mo araw-araw."*

---

## 3. FAQs (edit in `/admin/content` → ❓ FAQs)

Seven Q&A pairs. Coach tab shows first 5, so **1–5 are the priority**.

### FAQ 1
- **Question (`faq_1_q`):** *Kailan po ako dapat mag-inom ng EaseBrew?*
- **Answer (`faq_1_a`):** *Umaga at gabi po — 2 sachets bawat araw. Inumin 30 minuto bago kumain para maging bahagi ng daily routine. Kung may maintenance medication ka, kumonsulta muna sa doctor bago mag-umpisa.*

### FAQ 2
- **Question (`faq_2_q`):** *May maintenance medicine po ako. Pwede pa rin bang uminom ng EaseBrew?*
- **Answer (`faq_2_a`):** *Palaging magpakonsulta sa doctor mo bago mag-umpisa. Ipakita mo sa doctor ang ingredients ng EaseBrew para masuri kung compatible ito sa gamot mo. Ang EaseBrew ay wellness drink, hindi kapalit ng inirereseta ng doctor.*

### FAQ 3
- **Question (`faq_3_q`):** *Ilang araw bago ako makaramdam ng pagbabago?*
- **Answer (`faq_3_a`):** *Iba-iba po ang karanasan ng bawat isa. May nakakaramdam ng pagbabago sa loob ng ilang linggo, may iba naman mas matagal. Ang mahalaga ay consistency — tuloy-tuloy lang ang daily routine at i-log ang progress mo sa Tracker.*

### FAQ 4
- **Question (`faq_4_q`):** *May allergy po ako sa ilang herbs. Safe ba ito para sa akin?*
- **Answer (`faq_4_a`):** *Palaging basahin ang ingredients list sa packaging bago uminom. Kung may kilalang allergy ka sa herbs o spices, kumonsulta muna sa doctor bago simulan ang EaseBrew.*

### FAQ 5
- **Question (`faq_5_q`):** *Paano ko ma-access ang mga libreng digital products?*
- **Answer (`faq_5_a`):** *I-tap lang ang product cards sa Regalo tab. Automatic po na naka-unlock ang lahat ng products na kasama sa package mo. Kung may tanong ka, i-message ang coach mo sa Coach tab.*

### FAQ 6
- **Question (`faq_6_q`):** *Paano ako mag-order ulit ng EaseBrew?*
- **Answer (`faq_6_a`):** *I-tap ang Coach tab, tapos "Mag-order Ulit" — automatic na naka-set up ang mensahe. I-send mo lang sa coach mo via Facebook Messenger o tumawag sa hotline. COD po at libreng shipping sa buong Pilipinas.*

### FAQ 7
- **Question (`faq_7_q`):** *Pwede bang gamitin ng buong pamilya ang app?*
- **Answer (`faq_7_a`):** *Ang code po ay nakalink sa isang phone lang. Pero pwede mong i-share ang progress mo sa family sa pamamagitan ng "Ipakilala sa Kaibigan" feature — safe na 7-day link ang gagawin, tapos i-send sa family mo.*

**Content note:** FAQ 6 assumes the "Mag-order Ulit" reorder flow — confirm with owner that Messenger + hotline are both currently valid channels.

---

## 4. Product Descriptions (edit in `/admin/content` → 🛍️ Products & Gifts)

Currently all four render English defaults on the customer's Regalo tab. Draft Tagalog replacements below.

### Product 1 — Daily Health Tracker (unlocks ₱999+)

- **Name (`product_1_name`):** **📊 Daily Health Tracker**
- **Description (`product_1_desc`):** *I-log ang pain level, mood, weight, at gamot araw-araw. Simpleng 1-minuto lang — pero malaking tulong para makita mo ang pattern ng katawan mo.*

### Product 2 — Meal Plan + Recipe Book (unlocks ₱1,499+)

- **Name (`product_2_name`):** **🥗 Meal Plan + Recipe Book**
- **Description (`product_2_desc`):** *50-araw na Pinoy-friendly meal plan at 30 healthy recipes. Nakabase sa mga sangkap na madali mong makikita sa palengke at supermarket.*

### Product 3 — Home Exercise Guide (unlocks ₱2,998+)

- **Name (`product_3_name`):** **💪 Home Exercise Guide**
- **Description (`product_3_desc`):** *Mga magaan na exercise na kaya mong gawin sa bahay. Walang gym, walang equipment — kailangan mo lang ay upuan at tubig. Para sa may joint pain o pagod na katawan.*

### Product 4 — Complete Wellness Program (unlocks ₱4,497+)

- **Name (`product_4_name`):** **🏆 Complete Wellness Program**
- **Description (`product_4_desc`):** *Lahat po kasama: 90-araw na program, full exercise plan, meal guide, at weekly check-in kasama ang coach mo. Para sa pinaka-kumpletong wellness journey.*

---

## 5. Exercise Video Titles & Descriptions

Edit in `/admin/exercises`. The 30-day structure and Tagalog titles are already **hardcoded** in [lib/exerciseProgram.ts](lib/exerciseProgram.ts) — this section maps each day's admin video slug to its owner-approved YouTube URL. Titles below match the existing program **exactly** (do not rename in code without owner approval). Descriptions below are drafts for use in video card captions / YouTube upload titles / coach communication.

Video slugs follow the pattern `p{phase}-d{day}-{short-slug}`. Owner assigns one YouTube URL per slug.

### Phase 1 — Foundation at Mobility (Linggo 1–2)

| Day | Slug | Title | Draft description (for admin/coach reference) |
|:---:|------|-------|-----------------------------------------------|
| 1 | `p1-d1-umagang-aktibidad` | **Umagang Aktibidad** | Magaan na warm-up para gisingin ang katawan sa umaga — perfect para sa unang araw. |
| 2 | `p1-d2-paglakad-paghinga` | **Paglakad at Paghinga** | Simpleng paglakad kasama ang breathing exercise — natural na pain-reliever at stress-buster. |
| 3 | `p1-d3-upper-body-mobility` | **Upper Body Mobility** | Pag-iikot ng leeg, balikat, at braso para maging flexible ang upper body. |
| 4 | `p1-d4-chair-yoga` | **Chair Yoga — Flexibility Day** | Malumanay na yoga habang nakaupo — hindi na kailangang bumaba sa sahig. |
| 5 | `p1-d5-lower-body-strength` | **Lower Body Gentle Strength** | Magaan na leg exercises para mapalakas ang binti at tuhod. |
| 6 | `p1-d6-buong-katawan-flexibility` | **Buong Katawan Flexibility** | Full-body stretching — para sa mas magaan na pakiramdam. |
| 7 | `p1-d7-pahinga` | **Pahinga (Rest Day)** | Recovery day — no video needed. Tips sa hydration at tulog. |
| 8 | `p1-d8-balance-chair` | **Balance na May Chair** | Balance exercises gamit ang upuan bilang support — safe at effective. |
| 9 | `p1-d9-posture-check` | **Posture Check-in** | Maglakad-lakad, tumayo, at mag-check ng posture. Malaking tulong sa likod at leeg. |
| 10 | `p1-d10-review` | **Linggo 1–2 Review** | Balikan ang paboritong exercises mo sa unang dalawang linggo. |

### Phase 2 — Strength at Endurance (Linggo 3)

| Day | Slug | Title | Draft description |
|:---:|------|-------|-------------------|
| 11 | `p2-d11-wall-pushups` | **Wall Push-Ups (Upper Body)** | Push-ups laban sa wall — safe alternative sa floor push-ups. |
| 12 | `p2-d12-paglakad-balance` | **Paglakad + Balance** | Kombinasyon ng paglakad at simple balance drills. |
| 13 | `p2-d13-chair-squats` | **Chair Squats + Leg Strength** | Squats gamit ang upuan — pinapalakas ang binti at core. |
| 14 | `p2-d14-active-recovery` | **Active Recovery — Stretching** | Full stretching session — importante sa recovery. |
| 15 | `p2-d15-seated-core` | **Seated Core Work** | Core exercises habang nakaupo — pinapalakas ang tiyan at likod. |
| 16 | `p2-d16-circuit-light` | **Full Body Circuit (Light)** | Magaan na circuit training — kombinasyon ng lahat ng previous exercises. |
| 17 | `p2-d17-tai-chi` | **Tai Chi-Style Flow** | Malumanay na paggalaw ng katawan — nakakarelaks at nagpapalakas. |
| 18 | `p2-d18-balance-confidence` | **Balance Confidence Day** | Advanced balance exercises — natural mong makakayanan by day 18! |
| 19 | `p2-d19-paglakad-chair-strength` | **Paglakad + Chair Strength** | Kombinasyon ng cardio at strength training. |
| 20 | `p2-d20-deep-stretch` | **Deep Stretch Day** | Longer stretching session para sa lahat ng muscle groups. |

### Phase 3 — Advanced at Confidence (Linggo 4+)

| Day | Slug | Title | Draft description |
|:---:|------|-------|-------------------|
| 21 | `p3-d21-power-walking` | **Power Walking** | Mabilis at focused na paglakad — cardio boost para sa katawan. |
| 22 | `p3-d22-chair-strength` | **Chair Strength (Malumanay)** | Malumanay pero effective na strength training. |
| 23 | `p3-d23-deep-flexibility` | **Deep Flexibility Day** | Advanced stretching — flexibility at agility. |
| 24 | `p3-d24-pahinga-pagninilay` | **Pahinga at Pagninilay** | Rest + meditation day — para sa mind at body recovery. |
| 25 | `p3-d25-buong-katawan-practice` | **Buong Katawan Practice** | Full-body routine — practice ng lahat ng natutunan. |
| 26 | `p3-d26-balance-mastery` | **Balance Mastery** | Advanced balance drills — malaki na ang improvement mo ngayon. |
| 27 | `p3-d27-breathing-meditation` | **Breathing at Meditation** | Guided breathing at simple meditation — para sa mental wellness. |
| 28 | `p3-d28-chair-yoga-full` | **Chair Yoga Full Flow** | Complete chair yoga session — 20 minuto ng malumanay na paggalaw. |
| 29 | `p3-d29-paborito-mo` | **Paborito Mo!** | Balikan ang pinakapaborito mong exercise mula Day 1–28. |
| 30 | `p3-d30-celebration` | **🎉 KUMPLETO! Celebration Day** | 30 araw kumpleto! Celebration day at reflection sa journey mo. |

**Video sourcing guidance for owner:**
1. Record with a coach who speaks Tagalog on camera.
2. Length target: 3–8 minutes per day. Seniors won't stay for 15+ minutes.
3. Show the coach *doing* the exercise from a clear angle — 50+ audiences learn by watching, not by listening.
4. Add a doctor disclaimer overlay in the first 5 seconds: *"Palaging magpakonsulta sa doctor mo bago simulan ang bagong exercise routine."*
5. Rest days (7, 14, 24) do not need videos — an empty slug is acceptable; the day card renders the text instructions from `lib/exerciseProgram.ts`.

**Important reminder for owner:** the slug names above are **suggestions** — the actual admin UI will show whatever slugs were used the first time (`p1-d1-neck-rolls` is the one existing entry). Confirm with the developer whether renaming a slug requires a code change or if the admin can rename freely.

---

## 6. Notifications (edit in `/admin/notifications`)

The admin can publish **one** active in-app notification at a time. Below are four drafts to rotate through over time — owner picks one, activates it, then rotates weekly or as needed.

The customer-side reminder card in Home is separately configured by each customer (AM/PM hours). The below are for **admin-broadcast messages**, not the personal reminder.

### 6a. Morning Wellness Reminder

- **Title (`notification_title`):** **Magandang umaga, Nanay/Tatay!**
- **Message (`notification_message`):** *Huwag kalimutan ang morning sachet ng EaseBrew, 30 minuto bago mag-almusal. Uminom din ng isang basong tubig para sa magandang start ng araw.*
- **Best used:** Weekdays 6–8 AM window (activate manually).

### 6b. Exercise Encouragement

- **Title:** **Time for exercise!**
- **Message:** *5–10 minuto lang ng magaan na exercise ngayon — malaki na ang tulong nito sa katawan mo. I-open ang Home Exercise Guide sa Regalo tab kung may access ka. Palaging magpakonsulta sa doctor kung may bagong pain.*
- **Best used:** afternoons, Mon/Wed/Fri.

### 6c. Tracker Reminder

- **Title:** **Paalala: I-log ang pakiramdam mo**
- **Message:** *I-tap ang Tracker at i-log ang pakiramdam mo ngayon. Kahit 30 seconds lang — malaking tulong ito para makita mo ang pattern ng wellness journey mo.*
- **Best used:** end of day, 6–8 PM.

### 6d. Wellness Encouragement (weekly)

- **Title:** **Kaya mo yan!**
- **Message:** *Consistency ang key sa wellness journey mo, Nanay/Tatay. Ang bawat araw na tumutuloy ka ay dagdag na progress. Salamat sa pagtitiwala sa R&M EaseBrew!*
- **Best used:** Sunday evening or Monday morning — motivational reset.

**Reminder disclaimer (already added to admin UI in QA fixes):** aabot lang ang notification sa mga customer na naka-ON ang browser Paalala permission. Hindi 100% na aabot sa lahat.

---

## 7. Coach Information (edit in `/admin/content` → 👥 Coach Management)

**Do not use fake coach identities.** Below is a **placeholder-safe structure** the admin fills with **real R&M team members only**. Every field is per-coach (up to 6 slots).

### Structure per coach

| Field | DB key | Format required | Example (owner replaces) |
|-------|--------|-----------------|--------------------------|
| Name | `coach_N_name` | Real given name + optional title | *"Coach [Pangalan]"* |
| Phone (validated) | `coach_N_number` | `09XXXXXXXXX` or `+639XXXXXXXXX` | *[real R&M coach number]* |
| Display number | `coach_N_display` | Human-friendly with spaces | *"0917 XXX XXXX"* |
| Facebook URL | `coach_N_facebook` | `https://facebook.com/<page>` | *[real R&M coach FB page]* |
| Photo URL | `coach_N_photo` | Local `/coaches/<slug>.webp` recommended | *[upload real coach photo]* |

### Placeholder text if a coach slot is intentionally empty

If R&M only has 3 coaches, leave slots 4–6 completely blank in the admin — the app hides empty slots automatically.

### Coach modal wording (customer-facing framing)

| Field | DB key | Draft copy |
|-------|--------|-----------|
| Coach modal title | `coach_modal_title` | **Pumili ng coach** |
| Subtitle (reorder mode) | `coach_modal_subtitle_reorder` | *I-copy ang mensahe sa taas, tapos i-send sa coach mo via Facebook Messenger.* |
| Subtitle (default mode) | `coach_modal_subtitle_default` | *Tumawag o mag-message para mag-order o para sa tanong.* |

### Reorder message template

| Field | DB key | Draft copy |
|-------|--------|-----------|
| Reorder template | `reorder_message_template` | *"Hi po Coach! Gusto ko po mag-order ulit ng EaseBrew.\n\nPackage: {{package}}{{expiry_line}}\n\nAvailable po ba? Salamat po!"* |

**Placeholder tokens:** `{{package}}` = customer's current tier name. `{{expiry_line}}` = auto-inserted line about their current expiry (leave the token or remove — both work; the app handles empty).

**Owner action items for the coach section:**
1. Verify the hardcoded `DEFAULT_COACHES` values in [app/page.tsx](app/page.tsx) against R&M's real coach roster. If they match reality, mirror into DB. If they don't, replace immediately (highest content-priority — this is what a customer taps to call).
2. Upload real coach photos to `/public/coaches/<slug>.webp`, 300×300 px minimum, warm smiling headshot, neutral background.
3. Confirm each Facebook link opens the coach's actual R&M-affiliated page (not a personal profile).
4. Test each `tel:` link on both Android and iOS after saving — invalid formats break silently on some devices (though our new PH-format validation catches most cases).

---

## 8. Testimonials (edit in `/admin/content` → 💬 Testimonials)

**Explicit rule: no fabricated identities.** Every testimonial slot must be filled with a **real R&M customer** who has given written or recorded **consent**. Do not use stock names ("Nena R.", "Mang Tony") or invented pain scores. The generic defaults currently in the code are placeholders and must not go to production as if they were real customers.

### Structure per testimonial (3 slots)

| Field | DB key | Format required | Example format (owner fills with real data) |
|-------|--------|-----------------|--------------------------------------------|
| Name | `testimonial_N_name` | Given name + last initial (privacy) | *"Aling [Pangalan] R."* |
| Age | `testimonial_N_age` | Integer 50–75 | *[real age]* |
| Location | `testimonial_N_location` | City, Province | *"Quezon City"* / *"Cebu City"* / *"Davao"* |
| Quote | `testimonial_N_quote` | 40–140 chars, direct customer voice, Tagalog | *"Bahagi na ng aking daily routine ang EaseBrew — kasama sa umaga at gabi ko."* |
| Pain before | `testimonial_N_pain_before` | Integer 1–10, real self-reported | *[real number from customer intake]* |
| Pain after | `testimonial_N_pain_after` | Integer 1–10, real self-reported, must be < before | *[real number from follow-up]* |

### Realistic pain-score guidance (owner reference)

Believable improvement arcs, based on typical customer self-reports:
- Mild: 5 → 3
- Moderate: 7 → 4
- Severe: 8 → 5

**Avoid unrealistic jumps** (10 → 0, 9 → 1). They read as fake and damage trust with skeptical Filipino audiences who have seen many "miracle cure" products.

### Consent requirement — mandatory before publishing

For each testimonial, obtain and file:

1. **Written consent form** — customer agrees to their name (given + initial), age, city, quote, and pain scores being shown in the R&M EaseBrew app. Preferably signed physical form, otherwise Messenger conversation screenshot with clear "opo, pwede mo pong gamitin" reply.
2. **Verification of quote** — customer confirms the exact wording of the quote by reading it back (voice note or Messenger reply).
3. **Verification of pain scores** — recorded from the customer's actual tracker entries or intake form, not estimated.
4. **Right to withdraw** — customer can request removal anytime; act within 48 hours.

### Placeholder if all 3 slots are not yet ready

If only 1 real testimonial is ready by launch, **fill slot 1 only** — leave slots 2 and 3 completely blank. The app hides empty testimonial slots automatically (per `buildTestimonials` in [app/page.tsx](app/page.tsx)). It is far better to show one real testimonial than to launch with three fictional ones.

### Example filled slot (formatting reference only — DO NOT COPY THE PERSON)

> **Name:** Aling M. R.
> **Age:** 58
> **Location:** Quezon City
> **Quote:** *"Bahagi na ng aking daily routine ang EaseBrew — kasama sa umaga at gabi ko. Mas magaan na ang pakiramdam ko araw-araw."*
> **Pain before:** 7
> **Pain after:** 4

Notice: the quote **does not claim treatment or cure** — it describes lifestyle and general feeling. Pain-score change is realistic (7→4, not 10→0). This is the template every real entry must follow.

---

## Appendix A — Global editorial checklist (apply to every field before saving)

- [ ] Written in casual Tagalog (English retained only for standard usage: BP, exercise, tracker, weight, sachet).
- [ ] Uses *Nanay / Tatay / Lola / Lolo / Aling / Manong / Tita / Tito* consistently, matching R&M's Messenger tone.
- [ ] Contains no banned terms: *gagaling, makakagamot, gagamot, lulunas, matatanggal ang sakit, cure, heal, treat, gamot*.
- [ ] Contains no guarantee language: *tiyak, sure, 100%, siguradong*.
- [ ] If any health outcome is mentioned or implied, includes or is placed adjacent to *"Palaging magpakonsulta sa doctor"*.
- [ ] Realistic and human — no marketing hyperbole ("miracle", "amazing", "instant").
- [ ] Within the length target from [CONTENT_POPULATION_AUDIT.md § 4](CONTENT_POPULATION_AUDIT.md).
- [ ] Free of typos — reviewed by a second Tagalog speaker.
- [ ] Owner (R&M) explicitly approved this exact wording.

---

## Appendix B — Priority order for owner review & sign-off

Following [CONTENT_POPULATION_AUDIT.md § 3](CONTENT_POPULATION_AUDIT.md):

**Review these first (P0 — blocks launch trust):**
1. Section 7 (Coach Information) — verify defaults vs. reality.
2. Section 4 (Product descriptions) — replace English defaults.
3. Section 3 (FAQ 1–5) — replace generic defaults with real R&M FAQs.
4. Section 8 (Testimonials) — collect **real** customer consent, or launch with 0 slots filled.

**Review these next (P1 — launch week):**
5. Section 2 (Wellness Tips 1, 6, 7, 8) — complete the rotation.
6. Section 5 (Exercise videos, days 2–30) — pending video recording.
7. Section 1 (Hero) + Section 7 (Coach Modal strings).

**Review last (P2 — defer if needed):**
8. Section 6 (Notifications) — 4 drafts ready, activate one at a time.

---

## What happens after owner review

Once the owner approves each section (via Messenger, email, or in-person markup on this file):

1. Owner or admin logs in to `/admin/content`.
2. Pastes approved copy field-by-field.
3. Saves each field — customer surface updates within ~30 seconds (content is cached briefly at the edge).
4. Coach photos: upload to `/public/coaches/*.webp` first (requires developer PR), then reference the local path.
5. Videos: upload to YouTube first, mark as unlisted or public, then paste URL into `/admin/exercises` per-day slot.
6. Testimonials: only after signed consent forms are on file.

---

*End of draft. No code, database, UI, or business logic was modified during this drafting session. Every word in this file is a proposal awaiting owner (R&M) review and approval before it goes live in the customer app.*
