# Content Population Audit — R&M EaseBrew Wellness Hub

> **Session update 2026-07-21** — 45 additional fields populated via service-role upsert on top of Batch 1 (commit `06776f1`). Live state now: **~70 of 101 keys filled**. Remaining unfilled are intentionally deferred (need owner-provided assets — see § Session update below).

**Audit date:** 2026-07-17
**Auditor:** Claude Opus 4.7 (analysis only — no code, database, UI, or business logic changed)
**Method:** direct enumeration of `PUBLIC_CONTENT_KEYS` in [lib/contentKeys.ts](lib/contentKeys.ts), group-labeling from [app/admin/content/page.tsx](app/admin/content/page.tsx), live `content` table read via service-role client, and cross-check of `exercise_videos` against the 30-day program in [lib/exerciseProgram.ts](lib/exerciseProgram.ts)
**Total keys in `PUBLIC_CONTENT_KEYS` schema:** 77
**Rows currently in `content` table:** 32 (11 hold real values; 15 are empty strings; 5 are placeholder `yourorderlink.com` URLs; 1 legacy `reorder_reminder_days`)

---

## 1. Existing content structure

### Admin UI groups (as rendered in `/admin/content`)

| Group tab | Fields | Underlying keys |
|---|---|---|
| 🏠 Homepage | Hero Title, Hero Subtitle | `hero_title`, `hero_subtitle` |
| 🛍️ Products & Gifts | 4 paid products × (name + description) | `product_1..4_name`, `product_1..4_desc` |
| 👥 Coach Management | Custom UI — 1–6 coaches × (name*, phone*, display, facebook, photo). Stored per-coach as `coach_N_*` (5 keys per coach × 6 slots = 30 keys) | `coach_1..6_{name,number,display,facebook,photo}` |
| 💡 Wellness Tips | 8 slots, multiline | `daily_tip_1..8` |
| ❓ FAQs | 7 slots × (question + answer, answer multiline) | `faq_1..7_q`, `faq_1..7_a` |
| 💬 Testimonials | 3 slots × (name, age, location, quote, pain_before, pain_after) | `testimonial_1..3_*` |
| 🎬 Videos | 3 slots × (title, description, YouTube URL) | `video_1..3_{title,desc,url}` |
| 🛒 Reorder & Coach Modal | Reorder message template, coach modal title, 2 subtitle variants | `reorder_message_template`, `coach_modal_{title,subtitle_reorder,subtitle_default}` |
| — (separate `/admin/exercises` page) | 30-day exercise program video assignment — one YouTube URL per day, keyed by slug e.g. `p1-d1-neck-rolls` | `exercise_videos` (JSON blob) |
| — (separate `/admin/notifications` page) | Announcement/tip banner shown to all customers | `notification_active`, `notification_title`, `notification_message` |
| — (top-level toggle, edited via same page) | Site-wide promo banner | `promo_enabled`, `promo_text` |

### Field definitions — full inventory

| Key | Type / format | Slots | Multiline | Char limit* | Customer-visible surface |
|-----|---------------|:-----:|:---------:|:-----------:|--------------------------|
| `hero_title` | text | 1 | no | 10 000 | Home top banner |
| `hero_subtitle` | text | 1 | yes | 10 000 | Home top banner |
| `product_N_name` | text | 4 | no | 10 000 | Regalo tab product card |
| `product_N_desc` | text | 4 | yes | 10 000 | Regalo tab product card |
| `coach_N_name` | text | 6 | no | 10 000 | Coach modal + Coach tab |
| `coach_N_number` | PH mobile `09XXXXXXXXX` or `+639XXXXXXXXX` | 6 | no | 10 000 | Tap-to-call target (validated in admin UI) |
| `coach_N_display` | text (e.g. `0917 xxx xxxx`) | 6 | no | 10 000 | Displayed alongside call button |
| `coach_N_facebook` | http/https URL (validated) | 6 | no | 10 000 | Coach FB button |
| `coach_N_photo` | safe local `/coaches/*.jpg\|png\|webp\|avif\|gif` OR http(s) URL | 6 | no | 10 000 | Coach avatar |
| `daily_tip_N` | text | 8 | yes | 10 000 | Home Tips tab rotation |
| `faq_N_q` | text | 7 | no | 10 000 | Coach tab FAQ accordion (first 5 shown) |
| `faq_N_a` | text | 7 | yes | 10 000 | Coach tab FAQ accordion |
| `testimonial_N_name` | text | 3 | no | 10 000 | Home Tips tab testimonials strip |
| `testimonial_N_age` | integer (as string) | 3 | no | 10 000 | Testimonials strip |
| `testimonial_N_location` | text | 3 | no | 10 000 | Testimonials strip |
| `testimonial_N_quote` | text | 3 | yes | 10 000 | Testimonials strip |
| `testimonial_N_pain_before` | integer 1–10 (as string) | 3 | no | 10 000 | Pain-reduction badge |
| `testimonial_N_pain_after` | integer 1–10 (as string) | 3 | no | 10 000 | Pain-reduction badge |
| `video_N_title` | text | 3 | no | 10 000 | Home Tips tab videos strip |
| `video_N_desc` | text | 3 | yes | 10 000 | Video card description |
| `video_N_url` | http/https URL (validated) — YouTube expected | 3 | no | 10 000 | YouTube embed src |
| `reorder_message_template` | text with `{{package}}` and `{{expiry}}` placeholders | 1 | yes | 10 000 | Coach modal reorder preview |
| `coach_modal_title` | text | 1 | no | 10 000 | Coach modal header |
| `coach_modal_subtitle_reorder` | text | 1 | no | 10 000 | Coach modal subtitle (reorder context) |
| `coach_modal_subtitle_default` | text | 1 | no | 10 000 | Coach modal subtitle (default context) |
| `promo_enabled` | `"true"` / `"false"` string flag | 1 | no | 10 000 | Site-wide banner toggle |
| `promo_text` | text | 1 | no | 10 000 | Site-wide banner text |
| `notification_active` | `"true"` / `"false"` string flag | 1 | no | 10 000 | In-app notification card toggle |
| `notification_title` | text | 1 | no | 10 000 | Notification card headline |
| `notification_message` | text | 1 | yes | 10 000 | Notification card body |
| `exercise_videos` | JSON object `{"<day-slug>": "<youtube-url>"}` — 30 possible slugs | 1 blob (30 sub-entries) | JSON | 100 000 | Exercise page per-day video embed |
| `coaches_data` | JSON blob (legacy — currently unused; individual `coach_N_*` keys are the live surface) | 1 | JSON | 10 000 | Not rendered |

*Character limits enforced server-side in [lib/contentKeys.ts:78-81](lib/contentKeys.ts#L78) — 10 000 chars per key, except `exercise_videos` at 100 000.

Every field has a runtime **fallback default** in [app/page.tsx](app/page.tsx) (hero copy, tips, FAQs, testimonials, videos, coaches, reorder template, coach-modal strings) or the admin UI (products), so an empty DB row never breaks the customer surface — it just shows placeholder copy that reads generic rather than authentic.

---

## 2. Missing content

### 2a. Empty in DB (row exists, value = `""`)

| Key | Fallback shown to customer | Trust cost |
|-----|----------------------------|------------|
| `daily_tip_1` | Default tip from `DEFAULT_WELLNESS_TIPS` | Low — real defaults are decent |
| `faq_1_q` (row exists, empty) | Default FAQ set (6 hardcoded) | Low — falls back to defaults |
| `product_1..4_name` and `_desc` | English defaults from `PRODUCTS_META` (["Daily Health Tracker" / "Meal Plan + Recipe Book" / "Home Exercise Guide" / "Complete Wellness Program"] and English descriptions) | **HIGH — English text visible to Tagalog-first seniors on the Regalo tab** |
| `reorder_message_template` | Default template with `{{package}}` and `{{expiry_line}}` | Low — default is functional Tagalog |
| `coach_modal_title` / `coach_modal_subtitle_reorder` / `coach_modal_subtitle_default` | Tagalog defaults | Low |

### 2b. Never written (no row at all — 45 keys)

**All coach data — 30 keys totally absent:**
- `coach_1..6_name`, `coach_1..6_number`, `coach_1..6_display`, `coach_1..6_facebook`, `coach_1..6_photo` — **customer sees hardcoded `DEFAULT_COACHES` in [app/page.tsx](app/page.tsx). These may be placeholder / dev-only names and phone numbers.** MUST verify before launch. If defaults are the R&M team's real numbers, they still need `coach_N_photo` for avatars.

**All tips 6-8 (3 keys):** `daily_tip_6`, `daily_tip_7`, `daily_tip_8` → default rotation used.

**All FAQs 2-7 (12 keys):** `faq_2_q..faq_7_a` → falls back to 6 hardcoded defaults (which the Coach-tab FAQ card slices to first 5).

**All testimonials (18 keys):** `testimonial_1..3_*` → hardcoded `DEFAULT_TESTIMONIALS` shown (Nena R. / Mang Tony / Ate Susan — **fictional names**, unverified pain-before/after values).

**All 3 wellness videos (9 keys):** `video_1..3_title/desc/url` → default video list shown (may point to placeholder YouTube URLs).

**Exercise videos (29 of 30 day-slots empty):** only `p1-d1-neck-rolls` has a URL. The remaining 29 days of the 3-phase program have no video — the exercise page will render text instructions only, or an empty iframe area, for phases 1–3.

### 2c. Populated with placeholders (needs replacement, not addition)

| Key | Current value | Concern |
|-----|---------------|---------|
| `order_url_399` / `_699` / `_999` / `_1499` / `_2998` | `https://yourorderlink.com` × 5 | **Broken placeholder — these are not in `PUBLIC_CONTENT_KEYS`, so they render nowhere on the customer surface. Legacy keys, safe to leave but should be cleaned up. Verify with owner whether an order-URL feature is planned; if not, delete these rows.** |
| `reorder_reminder_days` | `3` | Legacy — flagged as dead in [app/admin/content/page.tsx:101](app/admin/content/page.tsx#L101). Not in `PUBLIC_CONTENT_KEYS`; safe to leave, safe to delete. |
| `notification_message` | *"Alam mo ba? Ang turmeric at luya ay natural na anti-inflammatory. Idagdag mo sa mga pagkain mo kasama ng EaseBrew para mas maganda pa ang results!"* | Reasonable copy but `notification_active` is `false`, so it never shows. Fine to keep as draft. |
| `notification_title` | `Wellness Tip` | Fine. |

### 2d. What's already good

- `hero_title` (*Kamusta, Nanay at Tatay!*) — warm, Tagalog, on-brand.
- `hero_subtitle` (*Kasama mo araw-araw para sa mas malusog na katawan.*) — clear, senior-friendly.
- `daily_tip_2..5` — four solid Tagalog tips, no medical claims (hydration, consistency, exercise pairing, avoid processed food).

---

## 3. Priority order for filling content

Recommended sequence — **P0 items block launch trust; P1 items round out first-week experience; P2 are polish**.

### P0 — MUST populate before public launch (~2–3 hours)

1. **Coach Management — `coach_1..6_*`** (up to 30 fields). Verify current `DEFAULT_COACHES` values in [app/page.tsx](app/page.tsx) are R&M's real coaches. If yes, mirror them into the DB (canonical source) and add photos. If no, they are placeholders being shown to real customers and must be replaced immediately. **Highest priority — a broken tel: link means an unreachable coach.**
2. **Product names + descriptions (Tagalog)** — `product_1..4_name` and `product_1..4_desc`. Currently English defaults render on the Regalo tab, breaking the Tagalog voice at the most conversion-sensitive surface.
3. **FAQs 1–5** — `faq_1..5_q` + `faq_1..5_a`. The Coach-tab card only displays first 5. Populating 5 real R&M FAQs displaces the generic defaults with content the coaches actually get asked about (saves messenger time — the entire purpose of Auto #4).
4. **Testimonials — 3 real customers** — `testimonial_1..3_*`. Fictional defaults are a trust liability at launch. Even one real testimonial with genuine pain-before/after is better than three defaults.

### P1 — Populate in launch week (~1–2 hours)

5. **Daily tips 1, 6, 7, 8** (4 fields). Fill the rotation with medically-cautious Tagalog. Existing tips 2–5 are the pattern to match.
6. **Exercise video assignments** — `exercise_videos` JSON, remaining 29 day-slugs. This blocks the paid tier 2 998+ users from getting full value on `/exercise`. Not needed for launch to lower tiers, but any Complete Wellness (4 497) customer verified on day 1 will hit missing videos on day 2.
7. **Coach modal strings** — `coach_modal_title`, `_subtitle_reorder`, `_subtitle_default`, `reorder_message_template`. Defaults are functional but generic; small brand-voice edits pay for themselves.

### P2 — Nice to have, can defer past launch

8. **Wellness videos 1–3** — `video_1..3_*`. Home Tips tab strip. Defaults are placeholder-quality. Add three R&M-recorded or R&M-curated YouTube links.
9. **Announcement banner** — draft `notification_*` for launch-week announcement, keep `notification_active` off until scheduled.
10. **Promo banner** — `promo_text` for a launch offer (if any); leave `promo_enabled=false` until owner OKs.

### Not required — clean up in a housekeeping pass

- `order_url_399/699/999/1499/2998` — 5 orphan rows pointing to `https://yourorderlink.com`. Not consumed anywhere in the customer app. Delete or ignore.
- `reorder_reminder_days` — 1 orphan row. Not consumed. Delete or ignore.
- `coaches_data` — legacy JSON key, superseded by per-coach fields. Not rendered.

---

## 4. Recommendations for senior-friendly content

Enforced by the app's audience (Filipino seniors 50+) and the [PROJECT_BRAIN.md § 2](docs/PROJECT_BRAIN.md) wellness rules.

### Voice and vocabulary

- **Tagalog first, casual and warm.** *"Kamusta po, Nanay/Tatay!"* over *"Hello, valued customer!"*.
- **Short sentences.** Break at 12–15 words. Seniors scan; they don't linger on paragraph blocks.
- **No jargon.** Say *"BP sa taas"* not *"systolic"*; *"gamot"* not *"medication"* (in customer-facing tips; medical-card labels are the exception).
- **Use elder terms consistently.** *Nanay* / *Tatay* / *Lola* / *Lolo* / *Tita* / *Tito*. Match the tone the coaches already use in Messenger.
- **Emoji sparingly, one per card.** Seniors read them as decorative, not functional — never rely on emoji to carry meaning.

### Medical safety — non-negotiable

Every wellness tip, testimonial quote, FAQ answer, and notification message MUST comply with [PROJECT_BRAIN.md § 2](docs/PROJECT_BRAIN.md) wellness rules:

- **Never claim treatment or cure.** Ban words: *gagamot*, *makakagaling*, *lulunas*, *matatanggal*, *nawawala ang sakit*, *cure*, *heal*, *treat*.
- **Frame as support / companion / lifestyle.** *"Kasama mo sa araw-araw"*, *"Bahagi ng healthy routine"*, *"Suporta sa katawan"*.
- **Include the standing disclaimer where any health outcome is implied.** *"Palaging magpakonsulta sa doctor mo bago simulan ang anumang bagong regimen."*
- **Testimonial pain-before/pain-after must be plausible.** A jump from 10 → 0 reads fake. Realistic recovery is 8 → 4, 7 → 3. Anything else invites skepticism.
- **Do not name specific conditions being resolved.** *"May sakit ako sa puso at nawala na"* = liability. *"Mas magaan na ang pakiramdam ko araw-araw"* = safe.

### Photo and URL standards

- **Coach photos:** upload to `/public/coaches/<slug>.webp`, 300×300 px minimum, square, warm/smiling, plain background. Reference the local path (`/coaches/<slug>.webp`) in `coach_N_photo` — safer than external hosts.
- **Facebook links:** always `https://facebook.com/<page>` — validated as `https://` by [lib/contentKeys.ts:47-58](lib/contentKeys.ts#L47).
- **YouTube videos:** long-form `https://youtu.be/<id>` or `https://www.youtube.com/watch?v=<id>` both work in the embed. Verify each URL loads in an incognito window from a PH IP — YouTube age-gate or region-lock is silent and breaks the iframe.
- **Coach phone numbers:** now format-validated in admin UI ([app/admin/content/page.tsx:489-518](app/admin/content/page.tsx#L489)) as `09XXXXXXXXX` or `+639XXXXXXXXX`. Any deviation shows a red inline warning.

### Content length targets

| Field | Target | Reason |
|-------|:------:|--------|
| `hero_title` | ≤ 30 chars | Fits mobile hero without wrapping |
| `hero_subtitle` | ≤ 80 chars | Two lines max on 375-px viewport |
| `product_N_desc` | 60–120 chars | Card body without expansion |
| `daily_tip_N` | 50–150 chars | Scannable in the tips rotation |
| `faq_N_q` | ≤ 60 chars | Fits one line in the accordion header |
| `faq_N_a` | 80–300 chars | Answer without wall-of-text |
| `testimonial_N_quote` | 40–140 chars | One-glance readable |
| `video_N_desc` | 40–100 chars | Card subtitle |
| `reorder_message_template` | 80–200 chars | Fits Messenger's first-screen preview |
| `notification_message` | ≤ 200 chars | Fits push notification body on Android |

### Editorial checklist per field (before saving)

- [ ] Written in casual Tagalog (with English words permitted only where the standard usage is English — *"BP"*, *"exercise"*, *"tracker"*).
- [ ] No medical treatment / cure claims.
- [ ] Where any health effect is implied, includes or is adjacent to a *"Palaging magpakonsulta sa doctor"* disclaimer.
- [ ] Within the length target.
- [ ] Free of typos — seniors notice more than developers assume.
- [ ] Copy-paste tested in the customer surface (admin has live preview; use it).

---

## Appendix A — Content table snapshot (2026-07-17)

Rows in `content` table where value is non-empty and non-placeholder:

```
hero_title                 = "Kamusta, Nanay at Tatay!"
hero_subtitle              = "Kasama mo araw-araw para sa mas malusog na katawan."
daily_tip_2                = "Uminom ng 8 baso ng tubig araw-araw — mahalaga ito para sa katawan."
daily_tip_3                = "Tuloy-tuloy lang sa EaseBrew — ang resulta ay darating sa tamang panahon!"
daily_tip_4                = "Pagsamahin ang EaseBrew sa magaan na exercise para mas mabilis ang resulta."
daily_tip_5                = "Iwasan ang processed food habang nag-iinom ng EaseBrew."
notification_title         = "Wellness Tip"
notification_message       = "Alam mo ba? Ang turmeric at luya ay natural na anti-inflammatory. Idagdag mo sa mga pagkain mo kasama ng EaseBrew para mas maganda pa ang results!"
notification_active        = "false"
promo_enabled              = "false"
exercise_videos            = {"p1-d1-neck-rolls":"https://youtu.be/JpaYwJLzElM?si=zOXVZTxstlPG9bTQ"}  (1 / 30 days)
```

Empty rows in DB: `daily_tip_1`, `faq_1_q`, `product_1..4_name`, `product_1..4_desc`, `promo_text`, `reorder_message_template`, `coach_modal_title`, `coach_modal_subtitle_reorder`, `coach_modal_subtitle_default`.

Placeholder rows (not consumed by customer app; can be ignored or deleted): `order_url_{399,699,999,1499,2998}`, `reorder_reminder_days`.

Never-written keys (45 of 77 in `PUBLIC_CONTENT_KEYS`): all `coach_*`, `faq_2..7`, `daily_tip_{6,7,8}`, all `testimonial_*`, all `video_*`.

---

## Appendix B — Where to populate

| Content type | Admin page | Access |
|--------------|------------|--------|
| Hero, Products, Coaches, Tips, FAQs, Testimonials, Videos, Reorder | `/admin/content` (tabbed) | Owner only (`useAdminGuard(['owner'])`) |
| Exercise per-day videos | `/admin/exercises` | Owner only |
| Notification / promo banner | `/admin/notifications` + Notifications section of `/admin/content` | Owner only |

Coach role has no access to any of these — content editing is owner-only.

---

*End of original audit. No code, database, UI, or business logic was modified during that analysis. Populate P0 items first; the app is safe to launch at any time thanks to hardcoded fallbacks, but populated authentic content is what earns the trust required for the target audience to keep using it.*

---

## Session update — 2026-07-21 (Content Batch 2)

DB-only updates via service-role upsert. No code changed. Groups 1-4 completed with owner approval field-by-field:

### Applied (45 fields)

| Group | DB keys | Wording source |
|-------|---------|----------------|
| Coach modal + reorder (4) | `coach_modal_title`, `coach_modal_subtitle_reorder`, `coach_modal_subtitle_default`, `reorder_message_template` | CONTENT_DRAFT_V2 § 7 (with one owner tweak: reorder template dropped "Salamat po sa pagsuporta" for universal fit) |
| Wellness tips 1/6/7/8 (4 new) | `daily_tip_1`, `daily_tip_6`, `daily_tip_7`, `daily_tip_8` | CONTENT_DRAFT_V2 § 2 as-is |
| Wellness tips 2/5 (refreshed for "po" consistency) | `daily_tip_2`, `daily_tip_5` | Minimal edits — added "po" to existing safe copy |
| FAQ 6 & 7 (extra, not shown on Coach tab; first 5 only render) | `faq_6_q`, `faq_6_a`, `faq_7_q`, `faq_7_a` | CONTENT_DRAFT_V2 § 3 as-is |
| Coach data mirrored to DB (30 = 6 × 5) | `coach_1..6_{name,number,display,facebook,photo}` | Copied verbatim from [lib/coaches.ts](lib/coaches.ts) `DEFAULT_COACHES` (real R&M coaches confirmed by owner). Enables admin editing via `/admin/content` → Coach Management without needing code change for future roster updates. Hardcoded defaults preserved as fallback. |
| Hero title consistency fix | `hero_title` | Changed `"Kamusta, Nanay at Tatay!"` → `"Kamusta po, Nanay at Tatay!"` — matches subtitle's "po" pattern applied throughout content. |

### Still intentionally unfilled (need owner-provided assets)

| Category | Keys | Blocked on |
|----------|------|------------|
| Wellness videos 1-3 (9 fields) | `video_1..3_{title, desc, url}` | Owner supplies 3 YouTube URLs |
| Testimonials (18 fields) | `testimonial_1..3_*` | Real customer signed consent per policy in CONTENT_DRAFT_V2 § 8 |
| Announcement / promo banners (5 fields) | `notification_active`, `promo_enabled`, `promo_text`, etc. | Owner activates via `/admin/notifications` when campaign runs |
| Exercise videos 2-30 (29 slots) | `exercise_videos` JSON entries beyond `p1-d1-neck-rolls` | Owner records or curates 29 more YouTube URLs |

### Live state after session

- **Filled: ~70 of 101 keys** in `PUBLIC_CONTENT_KEYS` schema.
- **Every customer-facing surface** has authentic Tagalog content — hero, products, tips (all 8), FAQs (all 7), coach modal strings, reorder template, coach roster.
- **All 6 real coaches** editable via admin UI going forward.
- **Test suite:** 61 passed / 10 skipped / 0 failed (baseline held).
- **All 7 QA must-fix items** and **CSP dev-fix** already live in code (commits `38f629a`, `3bdb9fb`).

### Handoff to owner (blocking launch or first-week polish)

1. Activate Sentry DSN in Vercel env vars per [docs/MONITORING.md](docs/MONITORING.md).
2. Set up external uptime monitor pointed at `/api/session`.
3. Collect real customer testimonials with signed consent → populate 1-3 slots.
4. Record or curate remaining 29 exercise videos + 3 wellness videos.
5. Verify pre-launch checklist per [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md).

*End of session update. App is content-ready for soft launch.*
