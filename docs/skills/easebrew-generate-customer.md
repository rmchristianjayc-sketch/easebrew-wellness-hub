---
name: easebrew-generate-customer
description: Guided walkthrough for creating a new R&M EaseBrew customer code and preparing the Messenger welcome message. Trigger when the user says "bagong customer", "generate code", "may nag-order", "new order", "add customer", "gawa ng code", or asks how to onboard a new EaseBrew buyer. Collects customer name, tier (₱399/₱999/₱1,499/₱2,998/₱4,497/etc.), assigned coach, and notes; produces the exact steps and copy-paste welcome message (with auto-fill verify link) they send via Messenger.
---

# Generate a new EaseBrew customer code

Walk the owner through creating a new customer code and preparing the welcome message.

## Step 1 — Collect the details

Ask (one turn, all questions):

1. **Customer name** — how they want to be greeted (Nanay Rosa / Tatay Ben / full name)
2. **Package (tier)** — which they ordered:
   - ₱399 (1 pack, 10 days) — basic
   - ₱699 (2 packs, 20 days) — basic
   - ₱999 (3 packs, 30 days) — unlocks Daily Tracker
   - ₱1,499 (5 packs, 45 days) — + Meal Plan + Recipes
   - ₱2,998 (10 packs, 75 days) — + Exercise
   - ₱4,497 (15 packs, 105 days) — + Complete Wellness
   - Larger (₱5,996 – ₱14,990) — same features, longer validity
3. **Coach assigned** — who's handling this customer (Josephine / Niña / Mark / Rai / Jo Ann / etc.)
4. **Notes** — order date, delivery address if relevant, or any special context

## Step 2 — Confirm with the owner

Show back what you got, one line each:
```
✅ Ready to generate:
   Customer: [name]
   Package:  [tier] ([packs] packs, [days] days validity)
   Coach:    [coach name]
   Notes:    [notes]
```
Ask: "Tama na po ba? Sabihin mo lang 'go' or fix anything."

## Step 3 — Owner generates in admin panel

Once confirmed, remind them the actual code generation happens in the admin panel:

```
📋 Sa /admin/codes:
   1. Click "Generate Code" button
   2. Fill in — Customer: [name] | Tier: [tier] | Coach: [coach] | Notes: [notes]
   3. Click Save
   4. Copy the code that appears (looks like EASE-XXXX-XXXX)
   5. Copy the welcome message shown below the code
   6. Paste sa Messenger conversation with the customer
```

If they don't have the admin panel open, tell them: https://[their-domain]/admin/codes

## Step 4 — Optional: draft the Messenger message

If they ask you to draft the message (before they paste from admin), template:

```
Kumusta po [Customer Name]!

Eto po ang R&M EaseBrew Wellness Hub access mo.

I-tap lang po ang link — auto-fill na ang code mo, tapos tap "Continue":

https://[their-domain]/verify?code=EASE-XXXX-XXXX

Package: [tier label]
Code (kung kailangan mo i-type): EASE-XXXX-XXXX

Kung may tanong, message mo lang ang coach mo. Salamat po!
```

(The admin panel already generates this exact template — this is only if they want a preview before opening the panel.)

## Step 5 — Reminders after generation

Once they say "done, na-generate na":
- Save the code in your records (customer name → code lookup)
- Coach follows up in 2-3 days if customer hasn't verified (see "Kailangan ng Atensyon" panel in /admin)
- Code activates on first verify (expires_at = that date + validity days)

## Never do

- Do not fabricate a code (they always come from the admin panel API).
- Do not skip the coach field — coach visibility helps with follow-ups.
- Do not use ₱-prefixed strings without confirming tier from the price table.
