# UAT Checklist — Coach

**Audience:** R&M coaches (Josephine, Niña, Mark, Rai, Jo Ann, Mike)
**Time commitment:** 20–30 minutes, one sitting
**Language:** Tagalog + English mix (coach comfort)
**Device:** Desktop or laptop (Chrome/Edge). Not designed for phone.
**Access:** Login sa `/admin` gamit ang shared coach account (walang password reset needed).

*R&M note: pilihin ang 1–2 coaches na mag-test nito bago i-onboard ang buong team.*

---

## Setup

- [ ] Buksan `/admin` sa desktop browser
- [ ] Mag-login (username / password mula sa R&M)
- [ ] Dapat mo makita ang admin dashboard na may:
  - "Kailangan ng Atensyon" panel
  - Recent activity feed
  - Quick stats (active codes, unused codes, etc.)

---

## Test 1 — Generate a code para sa bagong customer (5 min)

- [ ] Sa sidebar, i-click ang **Codes**
- [ ] I-click ang **"Bumuo ng Code"**
- [ ] Pumili ng price tier (hal. ₱999)
- [ ] Ilagay ang customer name (kahit test name lang)
- [ ] Kopya-in ang code na na-generate (format: `EASE-XXXX-XXXX`)
- [ ] I-check: Ang code ay may auto-computed **packs** at **validity_days** batay sa tier
- [ ] I-share sa test phone → verify → mag-login sa customer app
- [ ] Bumalik sa `/admin/codes` — dapat na-lock na ang device_id sa code na yun

**REPORT:** Kung nagkaroon ng error habang nag-generate. Kung mali ang packs/validity.

## Test 2 — Edit ang content na nakikita ng customer (5 min)

- [ ] Sa sidebar, i-click ang **Content**
- [ ] Hanapin ang **`hero_greeting_title`** — dapat "Kamusta, Nanay at Tatay!" ang default
- [ ] I-change sa kahit ano (hal. "Kamusta, Kaibigan!")
- [ ] I-save
- [ ] Buksan ang customer app sa phone → Home tab
- [ ] Within 30 seconds (may 30s cache) dapat na-update na ang greeting
- [ ] Ibalik ang original value
- [ ] **REPORT:** Kung hindi nag-update, o kung may error habang nag-save.

## Test 3 — Test ang Family Share flow end-to-end (3 min)

- [ ] Sa `/admin/customers`, hanapin ang test customer mo
- [ ] I-click ang kanilang row para makita ang detail view
- [ ] Basahin: ilan ang na-share nila sa pamilya? Kailan?
  *(Note: this data is client-side only. Admin doesn't have visibility to individual share tokens for privacy reasons — this is by design.)*
- [ ] Sa customer app, gawin ang Family Share (per Customer Checklist Araw 5)
- [ ] Buksan ang link mula sa "sender" account sa isang PRIVATE / INCOGNITO browser
- [ ] Dapat makita ninyo ang read-only wellness summary (na-log check-ins, EaseBrew count, avg pain, BP)
- [ ] Wala dapat kayong makitang login prompt o edit button
- [ ] **REPORT:** Kung may sensitive data na nakita niyo na hindi dapat, o kung hindi umandar ang link.

## Test 4 — Handle a "customer lost their code" scenario (2 min)

- [ ] Simulate: isang customer nagsabi na nawala nila ang code nila
- [ ] Sa `/admin/codes`, hanapin ang code nila (by customer name)
- [ ] I-click ang **"Kopyahin"** para makuha ulit ang code
- [ ] O kaya, mag-generate ng bagong code para sa kanila kung expired na yung dati
- [ ] **REPORT:** Kung mahirap hanapin ang customer, o kung wala kayong makitang "Kopyahin" action.

## Test 5 — Bantayan ang "Kailangan ng Atensyon" panel (3 min)

- [ ] Sa `/admin` dashboard, tignan ang "Kailangan ng Atensyon" panel
- [ ] Dapat may mga customer na may:
  - Hindi pa nag-check-in ng ilang araw
  - Expiring code sa loob ng 7 days
  - Mataas na pain trend
- [ ] I-click ang isang customer para tignan ang detail
- [ ] Mag-decide: dapat i-message ba, o mag-generate na ng renewal code?
- [ ] **REPORT:** Kung kompleto ang info para makapag-decide, o kung may missing context.

## Test 6 — Coach modal reorder + coaches editing (3 min)

- [ ] Sa `/admin/content`, tignan ang coach entries (`coach_1_name`, `coach_1_photo`, atbp.)
- [ ] I-edit ang isang coach name (hal. "Coach Josephine" → "Coach Josie")
- [ ] I-save at buksan ang customer app → Coach tab
- [ ] Dapat na-update ang name
- [ ] Ibalik sa original
- [ ] **REPORT:** Kung hindi nag-update, o kung nawala ang coach sa listahan.

## Test 7 — Exercise videos (kung may planong palitan ang videos) (2 min)

- [ ] Sa `/admin/exercises`, tignan ang mapping ng exercise slug → YouTube URL
- [ ] I-set ang isang video URL (kahit dummy YouTube link)
- [ ] Sa customer app, buksan ang Exercise → find ang exercise na yun
- [ ] Dapat lumabas ang video sa card na yun
- [ ] I-play — dapat NO related videos overlay sa dulo, dapat naglo-loop
- [ ] **REPORT:** Kung hindi lumabas ang video, kung related videos ay nakita.

---

## Coach-side sanity checks

- [ ] Notifications panel — pwede ba mag-send ng push notification sa isang customer?
- [ ] Audit log — nakikita ba kung sino nag-edit ng content at kailan?
- [ ] Bulk actions — pwede ba mag-generate ng 5 codes ng sabay-sabay?

**Report:** kahit anong feature na nakalimutang gawin o nangyaring error.
