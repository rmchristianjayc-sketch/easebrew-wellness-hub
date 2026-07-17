# Content Draft V2 — R&M EaseBrew Wellness Hub

**Revision date:** 2026-07-17
**Author:** Claude Opus 4.7 (draft only — no code, database, UI, or business logic changed)
**Supersedes:** [CONTENT_DRAFT.md](CONTENT_DRAFT.md) (V1)
**Target audience:** Filipino adults 50–70
**Tone:** warm, gentle, kalmadong Tagalog na parang kausap mo si Lola/Lolo — trustworthy, encouraging, never pushy

## What changed vs. V1 (owner requests applied)

1. **Removed all remaining health claims.** V1 still had implied outcomes in a few places (e.g. FAQ 3 mentioning "pagbabago"). V2 speaks only in terms of *routine*, *pakiramdam*, *paalala*, *suporta* — never about the product doing something to the body.
2. **Removed all implied guarantees.** No more "resulta ay darating", "mas mabilis ang resulta", "malaking tulong". Replaced with descriptions of behavior/routine only.
3. **Warmer, more senior-friendly Tagalog.** Added *po* consistently, softer openings (*"Nakakatuwa po"*, *"Salamat po"*, *"Kalmado lang"*), gentler verbs (*"pwede mo pong subukan"* instead of *"gawin mo"*), and elder framing (*Nanay/Tatay/Lola/Lolo* addressed directly).
4. **Removed dosage and timing assumptions.** No more *"2 sachets bawat araw"*, *"30 minuto bago mag-almusal"*, *"umaga at gabi"*. Product usage instructions now defer entirely to *"sundin po ang nakasulat sa packaging o payo ng coach mo"*. Owner confirms the correct dosage before any specific instruction goes live.
5. **Testimonials remain empty.** No fictional entries drafted. The structure and consent process are documented; every slot stays blank until real R&M customers provide signed consent.
6. Two existing live tips (`daily_tip_3` and `daily_tip_4`) explicitly flagged for **replacement** rather than left as-is, because they contain the exact "guaranteed result" language V2 is removing.

**Safety rules (re-applied and stricter):**
- Banned words: *gagaling, makakagamot, gagamot, lulunas, matatanggal, cure, heal, treat, gamot, resulta, mabilis, tiyak, sure, 100%, siguradong, guaranteed, epektibo, effective*.
- No dosage, timing, or frequency instructions unless owner explicitly authorizes each one.
- Standard disclaimer wherever any health topic surfaces:
  > *"Palaging magpakonsulta po sa doctor bago simulan o baguhin ang anumang health routine."*
- Every mention of the product is framed as a *daily companion* or *routine*, never as something that acts on the body.

**How to use this file:** the owner reviews V2. Anything the owner marks up gets applied to a V3 or goes straight to insertion via `/admin/content`. Nothing is live until the owner signs off.

---

## 1. Welcome Messages

### 1a. Homepage Hero (edit in `/admin/content` → 🏠 Homepage)

| Field | DB key | Draft V2 | Length | Change note |
|-------|--------|---------|:------:|-------------|
| Hero Title | `hero_title` | **Kamusta po, Nanay at Tatay!** | 28 chars | ✅ unchanged from V1 |
| Hero Subtitle | `hero_subtitle` | **Salamat po sa pagtitiwala sa R&M EaseBrew. Kasama po namin kayo araw-araw.** | 78 chars | Warmer, more relational — removes "para sa mas magaan" (implied benefit). |

**Alternate options for owner:**
- Title: *"Magandang araw po, Nanay at Tatay!"*
- Title: *"Kumusta po kayo ngayon?"*
- Subtitle: *"Kasama mo po ang R&M EaseBrew family sa iyong wellness journey."*
- Subtitle: *"Nandito po kami para sa inyo."*

### 1b. First-login onboarding (recommended wording — currently hard-coded)

Not editable via `/admin/content` today. Owner may request editability later.

1. *"Salamat po sa pagtitiwala sa R&M EaseBrew!"*
2. *"Ito po ang inyong wellness companion — kasama kayo namin araw-araw."*
3. *"Puwede po ninyong i-tap ang emoji sa umaga para i-track ang pakiramdam ninyo."*
4. *"May tanong po ba? Nandito lang ang coach ninyo sa Coach tab — pwede po kayong mag-message anytime."*
5. *"Handa na po ba tayo, Nanay/Tatay? Kalmado lang, kasama kayo namin."*

---

## 2. Wellness Tips (edit in `/admin/content` → 💡 Wellness Tips)

Eight rotating tips. V2 removes result/timing claims from every entry — including the two live tips flagged for replacement.

| # | DB key | Draft V2 copy | Length | Change note |
|---|--------|--------------|:------:|-------------|
| 1 | `daily_tip_1` | **Sundin po ang inyong daily routine.** Consistency po ang mahalaga — hindi po dapat maging mabigat, dahan-dahan lang. | 121 chars | Removes dosage/timing from V1. |
| 2 | `daily_tip_2` | **Uminom po ng sapat na tubig araw-araw.** Ang katawan po natin ay nangangailangan ng hydration para maging kalmado ang pakiramdam. | 137 chars | Softened from live version — removes "8 baso" specific dosage; owner may prefer to keep. |
| 3 | `daily_tip_3` | **Tuloy-tuloy lang po sa daily routine ninyo.** Consistency ang mahalaga sa long-term wellness. | 96 chars | ⚠️ **Replaces live tip** ("resulta ay darating" removed). |
| 4 | `daily_tip_4` | **Kasama po ng EaseBrew, ang magaan na exercise ay bahagi ng healthy routine.** Kahit ilang minuto lang po araw-araw. | 115 chars | ⚠️ **Replaces live tip** ("mas mabilis ang resulta" removed). |
| 5 | `daily_tip_5` | **Piliin po ang mga sariwang gulay at prutas.** Ang klase ng pagkain natin ay bahagi ng ating wellness journey. | 112 chars | Softer than the live "Iwasan ang processed food" (which sounds prohibitive to elders); owner may prefer the original. |
| 6 | `daily_tip_6` | **Magpahinga po ng sapat sa gabi.** Ang tulog po ang pinakanatural na paraan para maging kalmado ang katawan bukas. | 116 chars | New — no timing dosage. |
| 7 | `daily_tip_7` | **Maglakad-lakad po pagkatapos kumain.** Simpleng gawain lang po — pero bahagi na ng healthy routine. | 101 chars | New — no timing dosage. |
| 8 | `daily_tip_8` | **I-log po ang pakiramdam ninyo sa Tracker.** Kahit kalmado lang po ang araw, mahalaga ito para makita ninyo ang pattern ng inyong wellness journey. | 149 chars | New. |

**Standing note appended to Tips section (owner may render as a small footer):**
> *"Palaging magpakonsulta po sa doctor bago simulan o baguhin ang anumang health routine."*

**Owner decision needed:**
- Keep V1 tip 2 ("8 baso ng tubig") which has specific quantity? Or use V2 (no quantity)?
- Keep V1 tip 5 ("Iwasan ang processed food") which is prohibitive? Or use V2 (encouragement to choose fresh)?

---

## 3. FAQs (edit in `/admin/content` → ❓ FAQs)

Seven Q&A pairs. V2 removes all dosage/timing/frequency assumptions and softens the tone throughout.

### FAQ 1
- **Question (`faq_1_q`):** *Kailan po dapat inumin ang EaseBrew?*
- **Answer V2 (`faq_1_a`):** *Sundin po ninyo ang mga instructions na nakasulat sa packaging o ang payo ng inyong coach. Kung may maintenance medication po kayo, mahalaga munang kumonsulta sa doctor bago simulan ang bagong routine. Nandito lang po ang coach ninyo para sa tanong — i-tap lang ang Coach tab.*
- **Change:** removed "umaga at gabi po — 2 sachets bawat araw. Inumin 30 minuto bago kumain" (dosage/timing assumption).

### FAQ 2
- **Question (`faq_2_q`):** *May maintenance medicine po ako. Pwede po ba akong uminom ng EaseBrew?*
- **Answer V2 (`faq_2_a`):** *Palaging magpakonsulta po sa inyong doctor bago mag-umpisa. Ipakita po ninyo ang ingredients ng EaseBrew para masuri kung compatible ito sa gamot ninyo. Ang EaseBrew po ay wellness drink na bahagi lang ng healthy routine — hindi po ito kapalit ng inirereseta ng doctor.*
- **Change:** minimal — added *po* consistently.

### FAQ 3
- **Question (`faq_3_q`):** *Ano po ang mararamdaman ko habang nag-iinom ng EaseBrew?*
- **Answer V2 (`faq_3_a`):** *Iba-iba po ang karanasan ng bawat isa. Ang mahalaga po ay consistency sa daily routine at pag-log ng pakiramdam sa Tracker. Kung may bago o hindi pamilyar po na pakiramdam, palaging magpakonsulta sa doctor.*
- **Change:** V1 asked "ilang araw bago makaramdam ng pagbabago" which implies guaranteed change. V2 reframes as "ano ang mararamdaman ko" and refuses to promise anything.

### FAQ 4
- **Question (`faq_4_q`):** *May allergy po ako sa ilang herbs. Safe po ba ito para sa akin?*
- **Answer V2 (`faq_4_a`):** *Basahin po ninyo ang ingredients list sa packaging bago uminom. Kung may kilalang allergy po kayo sa herbs o spices, mahalaga munang kumonsulta sa doctor bago simulan ang EaseBrew. Ang safety po ninyo ay priority namin.*
- **Change:** minimal — added *po* consistently, softer closing.

### FAQ 5
- **Question (`faq_5_q`):** *Paano po ma-access ang mga libreng digital products?*
- **Answer V2 (`faq_5_a`):** *I-tap lang po ang product cards sa Regalo tab. Automatic po na naka-unlock ang lahat ng products na kasama sa package ninyo. Kung may tanong po kayo, i-tap ang Coach tab — kausapin ninyo ang coach anytime.*
- **Change:** minimal — warmer with *po* + reassurance.

### FAQ 6
- **Question (`faq_6_q`):** *Paano po ako mag-order ulit ng EaseBrew?*
- **Answer V2 (`faq_6_a`):** *I-tap lang po ang Coach tab, tapos "Mag-order Ulit" — automatic pong naka-set up ang mensahe. I-send ninyo lang sa coach ninyo. COD po at libreng shipping sa buong Pilipinas — walang pang-abala.*
- **Change:** removed "via Facebook Messenger o tumawag sa hotline" (owner to confirm exact channels).

### FAQ 7
- **Question (`faq_7_q`):** *Pwede po bang gamitin ng buong pamilya ang app?*
- **Answer V2 (`faq_7_a`):** *Ang code po ay nakalink sa isang phone lang. Pero pwede ninyong i-share ang wellness journey ninyo sa family sa pamamagitan ng "Ipakilala sa Kaibigan" feature — safe na 7-araw na link ang gagawin, tapos i-send sa mga mahal ninyo sa buhay.*
- **Change:** warmer closing (*mga mahal ninyo sa buhay* replaces the neutral *family mo*).

---

## 4. Product Descriptions (edit in `/admin/content` → 🛍️ Products & Gifts)

All four English defaults still need Tagalog replacement. V2 removes performance/outcome language.

### Product 1 — Daily Health Tracker (unlocks ₱999+)

- **Name (`product_1_name`):** **📊 Daily Health Tracker**
- **Description V2 (`product_1_desc`):** *Simpleng paraan po ng pag-log ng pain, mood, weight, at gamot araw-araw. Kailangan po lang ng 1 minuto para makita ninyo ang pattern ng inyong wellness journey.*
- **Change:** removed *"malaking tulong"* (implied benefit).

### Product 2 — Meal Plan + Recipe Book (unlocks ₱1,499+)

- **Name (`product_2_name`):** **🥗 Meal Plan + Recipe Book**
- **Description V2 (`product_2_desc`):** *50-araw na Pinoy-friendly meal plan at 30 healthy recipes. Nakabase po sa mga sariwang sangkap na madali ninyong makikita sa palengke.*
- **Change:** removed *"o supermarket"* (simpler); removed adjective *"healthy"* implication (rewrote to describe the meal plan, not the outcome).

### Product 3 — Home Exercise Guide (unlocks ₱2,998+)

- **Name (`product_3_name`):** **💪 Home Exercise Guide**
- **Description V2 (`product_3_desc`):** *Mga magaan na exercise po na pwede ninyong gawin sa bahay. Walang gym, walang equipment — upuan at tubig lang. Kalmadong pace na komportable sa katawan ninyo.*
- **Change:** removed *"Para sa may joint pain o pagod na katawan"* (medical framing) → replaced with *"kalmadong pace na komportable sa katawan ninyo"* (experiential framing).

### Product 4 — Complete Wellness Program (unlocks ₱4,497+)

- **Name (`product_4_name`):** **🏆 Complete Wellness Program**
- **Description V2 (`product_4_desc`):** *Lahat po kasama: 90-araw na program, full exercise plan, meal guide, at weekly check-in kasama ng coach ninyo. Para sa mga gustong kumpletong wellness routine na may gabay ng coach.*
- **Change:** removed *"pinaka-kumpletong wellness journey"* (superlative) → replaced with descriptive language about what the customer gets.

---

## 5. Exercise Video Titles & Descriptions

Titles are hardcoded in [lib/exerciseProgram.ts](lib/exerciseProgram.ts) and must not be renamed without owner + developer approval. Only the descriptions are new content.

V2 removes all performance / outcome language from descriptions. Focus is on *what happens in the video* and *how gentle it is*, never on what the customer will gain.

### Phase 1 — Foundation at Mobility (Linggo 1–2)

| Day | Slug | Title (existing) | Description V2 |
|:---:|------|-------|-----------------|
| 1 | `p1-d1-umagang-aktibidad` | Umagang Aktibidad | Malumanay pong warm-up para gisingin ang katawan sa umaga. Kalmado lang po. |
| 2 | `p1-d2-paglakad-paghinga` | Paglakad at Paghinga | Malumanay na paglakad kasama ang breathing exercise. Sundin lang po ang komportableng pace ninyo. |
| 3 | `p1-d3-upper-body-mobility` | Upper Body Mobility | Malumanay na pag-iikot ng leeg, balikat, at braso. Dahan-dahan lang po. |
| 4 | `p1-d4-chair-yoga` | Chair Yoga — Flexibility Day | Malumanay na yoga po habang nakaupo. Hindi na po kailangang bumaba sa sahig. |
| 5 | `p1-d5-lower-body-strength` | Lower Body Gentle Strength | Magaan na leg exercises po para sa binti at tuhod. Kalmadong pace lang. |
| 6 | `p1-d6-buong-katawan-flexibility` | Buong Katawan Flexibility | Malumanay na full-body stretching. Sundin lang po ang komportableng movement ninyo. |
| 7 | `p1-d7-pahinga` | Pahinga (Rest Day) | Rest day po — walang video. Magpahinga at mag-hydrate. |
| 8 | `p1-d8-balance-chair` | Balance na May Chair | Balance exercises po gamit ang upuan bilang support. Safe at malumanay. |
| 9 | `p1-d9-posture-check` | Posture Check-in | Malumanay na posture practice — maglakad-lakad at mag-check ng posture ninyo. |
| 10 | `p1-d10-review` | Linggo 1–2 Review | Balikan po ang mga exercise na komportable para sa inyo. |

### Phase 2 — Strength at Endurance (Linggo 3)

| Day | Slug | Title (existing) | Description V2 |
|:---:|------|-------|-----------------|
| 11 | `p2-d11-wall-pushups` | Wall Push-Ups (Upper Body) | Push-ups po laban sa wall — safer alternative sa floor push-ups. Sundin lang ang komportableng pace. |
| 12 | `p2-d12-paglakad-balance` | Paglakad + Balance | Kombinasyon ng malumanay na paglakad at simple balance drills. |
| 13 | `p2-d13-chair-squats` | Chair Squats + Leg Strength | Malumanay na squats gamit ang upuan. Kalmado lang po. |
| 14 | `p2-d14-active-recovery` | Active Recovery — Stretching | Malumanay na full-body stretching. Bahagi ng recovery ang stretching. |
| 15 | `p2-d15-seated-core` | Seated Core Work | Magaan na core exercises habang nakaupo. |
| 16 | `p2-d16-circuit-light` | Full Body Circuit (Light) | Magaan po na circuit — kombinasyon ng mga naunang exercises. Sundin lang ang komportableng pace. |
| 17 | `p2-d17-tai-chi` | Tai Chi-Style Flow | Malumanay at kalmadong paggalaw ng katawan — inspired by Tai Chi. |
| 18 | `p2-d18-balance-confidence` | Balance Confidence Day | Balance exercises para sa mas komportableng pakiramdam. Sundin lang ang inyong pace. |
| 19 | `p2-d19-paglakad-chair-strength` | Paglakad + Chair Strength | Kombinasyon ng paglakad at malumanay na strength training. |
| 20 | `p2-d20-deep-stretch` | Deep Stretch Day | Longer stretching session po para sa lahat ng muscle groups. Malumanay lang. |

### Phase 3 — Advanced at Confidence (Linggo 4+)

| Day | Slug | Title (existing) | Description V2 |
|:---:|------|-------|-----------------|
| 21 | `p3-d21-power-walking` | Power Walking | Mas focused na paglakad — sundin lang ang pace na komportable para sa katawan ninyo. |
| 22 | `p3-d22-chair-strength` | Chair Strength (Malumanay) | Malumanay pero strength-focused na training. Kalmadong pace. |
| 23 | `p3-d23-deep-flexibility` | Deep Flexibility Day | Advanced stretching — sundin lang po ang inyong flexibility level. |
| 24 | `p3-d24-pahinga-pagninilay` | Pahinga at Pagninilay | Rest at meditation day. Magpahinga po nang husto. |
| 25 | `p3-d25-buong-katawan-practice` | Buong Katawan Practice | Full-body routine — balikan ang lahat ng natutunan. |
| 26 | `p3-d26-balance-mastery` | Balance Mastery | Advanced balance drills. Sundin lang ang inyong komportableng pace. |
| 27 | `p3-d27-breathing-meditation` | Breathing at Meditation | Guided breathing at simple meditation — para sa kalmadong isip. |
| 28 | `p3-d28-chair-yoga-full` | Chair Yoga Full Flow | Complete chair yoga session — malumanay lang po. |
| 29 | `p3-d29-paborito-mo` | Paborito Mo! | Balikan po ang pinaka-komportableng exercise para sa inyo. |
| 30 | `p3-d30-celebration` | 🎉 KUMPLETO! Celebration Day | Salamat po sa 30-araw na wellness journey! Reflection at pahinga. |

**Standing disclaimer for owner to overlay on every video (first 5 seconds):**
> *"Palaging magpakonsulta po sa doctor bago simulan ang bagong exercise routine. Kung may pain o hindi komportable, tigil lang po."*

**Video sourcing reminders (unchanged from V1):**
- 3–8 minutes per video.
- Coach speaks Tagalog on camera.
- Clear angle showing the coach doing the exercise.
- Rest days (7, 14, 24) don't need video.
- Slug renames may require code change — confirm with developer.

---

## 6. Notifications (edit in `/admin/notifications`)

Four drafts to rotate. V2 removes timing prescriptions and outcome claims.

### 6a. Morning Wellness Reminder

- **Title (`notification_title`):** **Magandang umaga po, Nanay/Tatay!**
- **Message (`notification_message`):** *Salamat po sa pagiging bahagi ng R&M EaseBrew family. Kalmadong start ng araw po sa inyo. Uminom po ng tubig — nandito lang po kami.*
- **Change:** removed dosage/timing ("morning sachet", "30 minuto bago mag-almusal").
- **Best used:** weekday mornings.

### 6b. Exercise Encouragement

- **Title:** **Sandali po para sa magaan na exercise**
- **Message:** *Kahit ilang minuto lang po araw-araw, bahagi na po ito ng healthy routine. I-open po ang Home Exercise Guide sa Regalo tab kung may access kayo. Palaging magpakonsulta sa doctor kung may bagong pain o hindi komportableng pakiramdam.*
- **Change:** removed *"5–10 minuto lang"* (specific), removed *"malaki na ang tulong"* (implied benefit).
- **Best used:** afternoons, non-consecutive days.

### 6c. Tracker Reminder

- **Title:** **Paalala po: I-log ang pakiramdam ninyo**
- **Message:** *I-tap lang po ang Tracker. Kalmado lang — kahit ilang segundo lang po ang log. Ito ay para makita ninyo ang pattern ng inyong wellness journey.*
- **Change:** removed *"30 seconds lang"* (specific), removed *"malaking tulong"* (implied benefit).
- **Best used:** evenings.

### 6d. Wellness Encouragement (weekly)

- **Title:** **Nakakatuwa po ang consistency ninyo!**
- **Message:** *Salamat po sa pagiging bahagi ng R&M EaseBrew family. Ang bawat araw na tumutuloy po kayo ay bahagi na ng inyong wellness journey. Nandito lang po kami — kasama ninyo.*
- **Change:** removed *"Kaya mo yan!"* (V1 title — good energy but slightly pressure-y for elder audience), warmer replacement.
- **Best used:** weekly, Sunday evening or Monday morning.

**Admin UI disclaimer already in place:** *"Aabot lang ito sa mga customer na naka-ON ang Paalala"* — no change needed.

---

## 7. Coach Information (edit in `/admin/content` → 👥 Coach Management)

**Do not use fake coach identities.** Structure is unchanged from V1. Copy for the coach modal is softened in V2.

### Structure per coach (unchanged from V1)

| Field | DB key | Format required |
|-------|--------|-----------------|
| Name | `coach_N_name` | Real given name + optional title |
| Phone (validated) | `coach_N_number` | `09XXXXXXXXX` or `+639XXXXXXXXX` |
| Display number | `coach_N_display` | Human-friendly with spaces |
| Facebook URL | `coach_N_facebook` | `https://facebook.com/<page>` |
| Photo URL | `coach_N_photo` | Local `/coaches/<slug>.webp` |

### Coach modal wording — V2 (warmer, softer)

| Field | DB key | Draft V2 |
|-------|--------|---------|
| Coach modal title | `coach_modal_title` | **Pumili po ng coach** |
| Subtitle (reorder mode) | `coach_modal_subtitle_reorder` | *I-copy lang po ang mensahe sa taas, tapos i-send sa coach ninyo. Sasagot din po kami sa lalong madaling panahon.* |
| Subtitle (default mode) | `coach_modal_subtitle_default` | *Nandito lang po kami — tumawag o mag-message anytime. Walang pang-abala po ang tanong ninyo.* |

### Reorder message template — V2 (warmer)

| Field | DB key | Draft V2 |
|-------|--------|---------|
| Reorder template | `reorder_message_template` | *"Hi po Coach! Salamat po sa pagsuporta. Gusto ko po sanang mag-order ulit ng EaseBrew.\n\nPackage: {{package}}{{expiry_line}}\n\nAvailable po ba? Maraming salamat po!"* |

**Placeholder tokens:** `{{package}}` = customer's current tier name. `{{expiry_line}}` = auto-inserted expiry text. Both are optional — remove if owner prefers cleaner message.

**Owner action items (unchanged from V1):**
1. Verify hardcoded `DEFAULT_COACHES` vs. real R&M roster.
2. Upload real coach photos to `/public/coaches/`.
3. Confirm each Facebook link is R&M-affiliated (not personal profile).
4. Test each `tel:` link on Android and iOS.

---

## 8. Testimonials (edit in `/admin/content` → 💬 Testimonials)

**Explicit rule: no fabricated identities. All 3 slots remain empty until real R&M customers provide signed consent.** V2 makes this stricter — do not draft placeholder wording that could be mistaken for real quotes.

### Structure per testimonial (3 slots, all currently empty and staying empty)

| Field | DB key | Format required |
|-------|--------|-----------------|
| Name | `testimonial_N_name` | Given name + last initial only (privacy) |
| Age | `testimonial_N_age` | Integer 50–75 |
| Location | `testimonial_N_location` | City, Province |
| Quote | `testimonial_N_quote` | 40–140 chars, direct customer voice, Tagalog, **no medical claims** |
| Pain before | `testimonial_N_pain_before` | Integer 1–10, real self-reported |
| Pain after | `testimonial_N_pain_after` | Integer 1–10, must be < before, realistic gap |

### Consent workflow — MANDATORY before any testimonial goes live

For each testimonial, the owner must have on file:

1. **Written or recorded consent** — customer explicitly agrees to their name (given + initial), age, city, quote, and pain scores appearing in the R&M EaseBrew app. Signed physical form preferred; otherwise a Messenger conversation where the customer types *"opo, pwede po ninyong gamitin"* is the minimum. **Screenshot must show the customer's name/photo, the exact wording of the quote, and the date.**
2. **Verification of the quote** — customer reads the exact wording back (voice note or Messenger reply confirming *"opo, tama po yan"*).
3. **Verification of pain scores** — recorded from the customer's actual tracker entries or intake form. Never estimated by staff. Owner to preserve the source (screenshot of tracker or scanned intake form).
4. **Right to withdraw** — customer can request removal anytime; act within 48 hours.

### Content safety rules for the quote itself

The quote must:
- Speak only about the customer's *feelings, routine, or experience*, never about medical outcomes.
- Never contain: *gagaling, makakagamot, gumaling ako, natanggal ang sakit, nawala ang [condition]*.
- Never diagnose or reference a specific medical condition.
- Refer to the product as a *bahagi ng routine*, *kasama ko*, *daily companion*.

**Acceptable phrasing patterns (for owner to guide customer during consent conversation):**
- *"Bahagi na po ng aking daily routine..."*
- *"Kasama ko po ang EaseBrew sa umaga at gabi..."*
- *"Mas kalmado po ang pakiramdam ko araw-araw..."*
- *"Nandito lang po ang coach kapag may tanong ako..."*
- *"Nakakatuwa po ang wellness journey ko kasama ang R&M..."*

**Unacceptable phrasing patterns (reject if the customer offers these):**
- *"Gumaling ako sa..."* → replace with *"Mas magaan po ang pakiramdam ko..."*
- *"Nawala na ang sakit ko..."* → replace with *"Mas komportable po ako ngayon..."*
- *"Ibinigay sa akin ni EaseBrew ang..."* → replace with *"Bahagi po ng aking routine..."*

### Realistic pain-score gaps (owner reference)

Believable arcs based on self-report:
- Mild journey: 5 → 3
- Moderate journey: 7 → 4
- Longer journey: 8 → 5

Never accept 10 → 0, 9 → 1, or any gap > 5. Filipino audiences have seen "miracle cure" marketing and will disbelieve unrealistic claims.

### Launch policy

If **zero** consented testimonials are ready by launch: **leave all 3 slots blank**. The app hides empty testimonial slots automatically ([app/page.tsx `buildTestimonials`](app/page.tsx)). Better to show none than fake ones.

If **1** consented testimonial is ready: fill slot 1, leave 2 and 3 blank.

Same rule for 2 and 3 — never pad with defaults or invented entries.

### No example filled slot in V2

V1 included an "example format reference" filled slot for guidance. **V2 removes that example** — even labeled clearly as fictional, a filled example creates a copy-paste temptation. Owner references the fields table above and the acceptable-phrasing patterns instead.

---

## Appendix A — V2 editorial checklist (stricter than V1)

- [ ] Written in warm, senior-friendly Tagalog — *po* used consistently, elder terms (*Nanay/Tatay/Lola/Lolo*) where appropriate.
- [ ] Contains **no banned words**: *gagaling, makakagamot, gagamot, lulunas, matatanggal, cure, heal, treat, gamot, mabilis, tiyak, sure, 100%, siguradong, guaranteed, epektibo, effective, resulta* (unless framed as behavioral tracking, e.g. *"tracker result"*).
- [ ] Contains **no dosage, timing, or frequency assumptions** unless owner explicitly authorized each one. Defer to *"sundin po ang packaging o payo ng coach"*.
- [ ] Contains **no implied guarantees** — never promises the customer will feel better, get better, or achieve any specific outcome.
- [ ] Refers to the product only as a *bahagi ng routine*, *daily companion*, or *kasama araw-araw* — never as an actor doing something to the body.
- [ ] Wherever any health topic is mentioned or implied, the standard doctor-consultation line is included or clearly adjacent:
      > *"Palaging magpakonsulta po sa doctor bago simulan o baguhin ang anumang health routine."*
- [ ] Length within targets (per [CONTENT_POPULATION_AUDIT.md § 4](CONTENT_POPULATION_AUDIT.md)).
- [ ] Reviewed by a second Tagalog speaker (ideally the owner's coach or a senior family member).
- [ ] Owner (R&M) explicitly approved this exact wording.

---

## Appendix B — Owner decisions still pending

Items requiring an explicit yes/no from R&M before this draft can go to the DB:

1. **Dosage/timing content:** V2 removes all specific dosage instructions from tips and FAQs. Should any specific dosage go back (e.g. keep *"8 baso ng tubig"* in tip 2, or *"umaga at gabi"* in FAQ 1)? Owner confirms per field.
2. **Reorder channels:** V1 FAQ 6 mentioned Facebook Messenger + hotline. V2 removes both — confirm the correct current channels.
3. **Live tips replacement:** `daily_tip_3` and `daily_tip_4` are currently live with "guaranteed result" language. Owner confirms replacement with V2 versions (or softer alternatives from V1).
4. **Tip 2 & 5 style:** owner chooses V1 (specific quantities, prohibitive tone) or V2 (no quantities, encouraging tone). Both are safe.
5. **Coach roster verification:** hardcoded defaults in [app/page.tsx](app/page.tsx) may or may not be real R&M coaches. Owner confirms and either mirrors into DB or replaces.
6. **Testimonials:** owner confirms the launch policy — leave all 3 slots blank until real consented testimonials are collected.

---

## What happens after owner review

Once the owner marks up this V2 and signals approval:

1. Any owner-edited copy becomes V3 (or the final).
2. Approved copy is pasted field-by-field into `/admin/content` and `/admin/notifications`.
3. Live tips 3 and 4 are actively replaced (not just added — the "guaranteed result" wording must not remain on the customer surface).
4. Coach photos uploaded to `/public/coaches/` via a small developer PR before the coach fields go live.
5. Testimonials stay blank until real signed consent exists — no exceptions.

---

*End of V2 draft. No code, database, UI, or business logic was modified during this drafting session. Every word is a proposal awaiting owner (R&M) review and approval before it goes live in the customer app.*
