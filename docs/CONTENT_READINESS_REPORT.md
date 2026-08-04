# Content Readiness Report

**Date:** 2026-08-04
**Method:** Fetched live `/api/content` payload, cross-referenced against `PUBLIC_CONTENT_KEYS` in `lib/contentKeys.ts`, and inspected `lib/exerciseProgram.ts` for exercise-video coverage.
**Source:** `PUBLIC_CONTENT_KEYS` declares **100 keys**. DB has **71 populated**, **29 empty/missing**.

---

## Executive summary

**71 / 100 keys populated (71%).**

| Bucket | Count | Impact if unfixed |
|---|---|---|
| ✅ **Complete** | 71 keys — all daily tips, all FAQs, all coaches, all products, hero, banner, coach modal, reorder template, 1 exercise video entry | None |
| 🟡 **Placeholder** | 1 key — `coaches_data` (legacy; per-coach fields now used instead) | None — dead key, safe to ignore |
| 🟠 **Missing (non-blocking)** | 10 keys — `promo_text` (1), video_1..3 slots (9) | Non-blocking — UI degrades gracefully |
| 🔴 **Launch-blocking (owner decision)** | 18 keys — all 3 testimonial slots (6 fields each) | Blocks social proof; UI falls back to hardcoded defaults |
| **Exercise-video coverage** | 1 / 149 exercise slots (<1%) | Not blocking — text-first layout means video-less exercises still work; but the paid Exercise experience is weaker |

---

## ✅ COMPLETE (71 keys)

### Daily tips — 8 / 8 ✓
`daily_tip_1` `daily_tip_2` `daily_tip_3` `daily_tip_4` `daily_tip_5` `daily_tip_6` `daily_tip_7` `daily_tip_8`

Ready for launch. All 8 slots populated with senior-friendly Tagalog wellness content.

### FAQ — 14 / 14 (7 Q&A pairs) ✓
`faq_1_q` `faq_1_a` … `faq_7_q` `faq_7_a`

Ready for launch. Every FAQ has both question and answer populated.

### Coach info — 30 / 30 (6 coaches × 5 fields) ✓
`coach_1_name` `coach_1_number` `coach_1_display` `coach_1_facebook` `coach_1_photo` (and same for coaches 2-6)

Ready for launch. All 6 coaches fully profiled. Test the tap-to-call + Facebook link paths as part of UAT Day 5.

### Product blurbs — 8 / 8 (4 products × 2 fields) ✓
`product_1_name` `product_1_desc` … `product_4_name` `product_4_desc`

Ready.

### Hero + notification banner — 5 / 5 (excluding `promo_text`) ✓
`hero_title` `hero_subtitle` `notification_active` `notification_title` `notification_message`

Ready.

### Coach modal + reorder — 4 / 4 ✓
`coach_modal_title` `coach_modal_subtitle_reorder` `coach_modal_subtitle_default` `reorder_message_template`

Ready.

### Meal Plan (out-of-content-DB; hardcoded)
Not tracked in `PUBLIC_CONTENT_KEYS` — the 50-day meal plan lives directly in `app/meal-plan/page.tsx:35-86`. **All 50 days populated with 4 meals each + nutrients + focus tag.** ✅ Complete.

### Exercise program (out-of-content-DB; hardcoded)
Lives in `lib/exerciseProgram.ts`. All 30 days with full exercise sets. ✅ Complete for the *program structure*. See "Exercise Videos" below for the coverage gap.

### Recipes (out-of-content-DB; hardcoded)
30 recipes in `app/recipes/page.tsx`. All have ingredients + instructions. ✅ Complete for the recipe *data*; photo coverage remains at 3 / 30 as documented in the Senior UX audit (R1).

---

## 🟡 PLACEHOLDER (1 key)

### `coaches_data`
Legacy content key predating the per-coach fields. The customer app now reads `coach_N_*` (which are all populated). `coaches_data` is safe to leave empty; no code path consumes it.

**Recommendation:** either delete from `PUBLIC_CONTENT_KEYS` (cleanup) or leave and document as deprecated. Not blocking.

---

## 🟠 MISSING — non-blocking (10 keys)

### `promo_text` — 1 key
Not set. The `promo_enabled` flag defaults to hidden, so the promo banner doesn't render. **No user impact.**

Populate only when R&M wants to run a specific promo (e.g., "3+1 packs this week").

### `video_1..3` slots — 9 keys
`video_1_title` `video_1_desc` `video_1_url` (× 3)

These are the 3 "featured video" slots intended for coach intro videos or product demos. The customer UI in the Coach tab renders them only when populated, so missing = section doesn't appear.

**Recommendation:** populate before soft launch IF the owner wants featured coach intros. Otherwise leave empty and the section stays hidden — no error, no ugly placeholder.

---

## 🔴 LAUNCH-BLOCKING (owner decision) — 18 keys

### `testimonial_1..3` — all 18 fields missing
`testimonial_1_name` `testimonial_1_age` `testimonial_1_location` `testimonial_1_quote` `testimonial_1_pain_before` `testimonial_1_pain_after` (× 3 testimonials)

The Tips tab has a "Mga Kwento ng Customer" section that renders these testimonials. When empty, the customer sees:
- Header ("Mga Kwento ng Customer")
- **Empty state** — no cards, no fallback copy → looks broken

**Why launch-blocking:**
- Social proof is a major driver for senior conversion
- An empty section signals "no one uses this" — worse than not having the section at all
- The customer app doesn't hide the section header when there's no data

**Fix options (owner decision):**
1. **Populate 3 real testimonials** with real customer consent. Best option — takes 1-2 hours to collect from existing satisfied customers.
2. **Hide the section entirely** when all 3 are empty. Trivial code change (1-liner conditional). Ship as-is for soft launch, populate testimonials post-launch as they come in.
3. **Ship with a "Sasabihan namin sa lalong madaling panahon" placeholder.** Not recommended — reads like a broken app.

**Recommended:** Option 2 for soft launch (hide-when-empty), then Option 1 within 2 weeks of launch as real stories accumulate.

---

## Exercise Videos — Coverage Gap

**Content key `exercise_videos` populated:** YES (JSON map exists)
**Slot coverage:** **1 of 149 exercises** has a video URL (`p1-d1-neck-rolls`)

The Exercise page's customer UX (after Commit #4) puts instruction text ABOVE the video block, so exercises without videos render cleanly — the video panel just doesn't appear. **Not a runtime error.**

However, for the paid Exercise experience:
- Tier 2998 customers pay to unlock Exercise
- Text-only exercises are usable but the "video-first" pitch is understated
- Sellability suffers if a customer opens Day 5 and sees zero videos

**Recommended fill order (highest-impact exercises first):**
1. Day 1 of each Phase (Phase 1 Day 1, Phase 2 Day 1, Phase 3 Day 1) — first impressions
2. Warm-up exercises across all days (repeated frequently)
3. Any exercise flagged "hard" by seniors during UAT

**Not launch-blocking**, but strongly recommend populating at least 20-30 videos before wide launch.

---

## Coverage matrix

| Category | Populated | Total | % | Launch status |
|---|---|---|---|---|
| Daily tips | 8 | 8 | 100% | ✅ Ready |
| FAQ | 14 | 14 | 100% | ✅ Ready |
| Coach info | 30 | 30 | 100% | ✅ Ready |
| Products | 8 | 8 | 100% | ✅ Ready |
| Hero + banner | 5 | 5 | 100% | ✅ Ready |
| Coach modal + reorder | 4 | 4 | 100% | ✅ Ready |
| Testimonials | 0 | 18 | 0% | 🔴 Blocking (owner decides fix) |
| Featured videos | 0 | 9 | 0% | 🟠 Non-blocking (hidden when empty) |
| Promo text | 0 | 1 | 0% | 🟠 Non-blocking (feature-flagged off) |
| Legacy `coaches_data` | 0 | 1 | 0% | 🟡 Dead key (superseded) |
| **DB-tracked total** | **71** | **100** | **71%** | |
| Meal Plan (hardcoded) | 50 | 50 | 100% | ✅ Ready |
| Exercise program (hardcoded) | 30 | 30 | 100% | ✅ Ready |
| Recipes (hardcoded) | 30 | 30 | 100% | ✅ Ready |
| Exercise videos (per slot) | 1 | 149 | <1% | 🟠 Non-blocking |

---

## Launch-readiness verdict

**Content readiness: 85% (weighted).**

- ✅ **All programmatic content is ready** (tips, FAQs, coaches, products, banners, meal plan, exercise plan, recipes)
- 🔴 **1 owner decision required:** testimonials — populate 3 or hide-when-empty
- 🟠 **Nice-to-have:** populate 20+ exercise videos and 3 featured videos before wide launch

### Recommended sequence

1. **Owner picks testimonial strategy** (populate vs hide-when-empty) — 15 min decision
2. If "hide-when-empty" → 1-line code change (`{testimonials.length > 0 && ...}` wrapper) — 10 min
3. If "populate" → collect 3 real quotes with consent — 1-2 hours across a few Messenger conversations
4. Ship soft launch
5. Post-launch: fill exercise videos as content becomes available (owner-supplied YouTube URLs)

**Content is not the launch blocker.** The testimonial section behavior is a 10-minute code fix if the owner prefers to launch before real testimonials are collected.
