# Senior UX Implementation Plan

**Scope:** 5 customer-side improvements from [SENIOR_UX_AUDIT.md](SENIOR_UX_AUDIT.md).
**Out of scope:** Bagong Katawan, Admin, Coach.
**Strategy:** Each area is one commit — reviewable and revertable independently.

**Legend:** ▼ = new/added · ✘ = removed · ▲ = moved · ✎ = changed

---

## 1. Home page simplification (`app/page.tsx`)

### Current problems (from audit H1, H2)
- **Home tab has 12+ sections** — scroll fatigue.
- **Sticky header has 5 competing elements** — brand, tier, font toggle, Regalo counter, 4-tab nav.
- **3 secondary cards** (Referral, Testimonial, Family Share) live mid-scroll on Home.

### Redesign — Home tab section order

```
CURRENT ORDER                       NEW ORDER
──────────────────────────────────  ──────────────────────────────────
Hero image + greeting               Hero image + greeting  (unchanged)
TodaysSummaryCard                   TodaysSummaryCard      (unchanged)
QuickCheckIn (EaseBrew AM/PM)       QuickCheckIn           (unchanged)
MoodQuickTap                        MoodQuickTap           (unchanged)
UnusedFeatureNudge (dismissible)    UnusedFeatureNudge     (unchanged)
NextExercisePreview                 NextExercisePreview    (unchanged)
ReferralCard                        ─── section break ───
TestimonialSubmissionCard           Mabilis na Access (unlocked tools)
FamilyShareCard                     Libreng Health Tools (grid)
Mabilis na Access (unlocked)        FamilyShareLauncher    ▼ NEW small tile
Libreng Health Tools grid           (see item 5 below)
Daily Wellness Tip                  ✘ moved to Tips tab
Inumin 2x reminder                  Inumin 2x reminder     (unchanged)
Routine section                     ✘ moved to Tips tab
More wellness tip (duplicate)       ✘ removed — dedupe
FAQ (in Coach tab)                  (already on Coach tab)
                                    ReferralCard           ▲ moved to Coach tab
                                    TestimonialSubmissionCard ▲ moved to Coach tab
```

### Sticky header changes

| Element | Before | After |
|---|---|---|
| Brand "R&M EaseBrew" | ✓ shown | ✓ shown |
| Tier label | ✓ shown | ✓ shown |
| Font toggle "A A" | Always visible in header | Keep as-is (accessibility) |
| Regalo counter | Always visible | **Hide when count === 0** |
| 4-tab nav | Home / Regalo / Tips / Coach | Same |

### Coach tab: what gets added
```
Coach tab (current)                 Coach tab (new)
──────────────────────────────      ──────────────────────────────
Coach list                          Coach list                        (unchanged)
FAQ                                 FamilyShareCard          ▼ moved from Home
                                    ReferralCard             ▼ moved from Home
                                    TestimonialSubmissionCard ▼ moved from Home
                                    FAQ                             (unchanged)
```

### Tips tab: what gets added
```
Tips tab (current)                  Tips tab (new)
──────────────────────────────      ──────────────────────────────
Daily tips list                     Daily tips list                   (unchanged)
                                    "Tip para sa Araw" card    ▼ moved from Home
                                    Routine section            ▼ moved from Home
```

### Estimated impact
- Home tab visual length: **~2100px → ~1400px** (rough estimate, phone at 390×844)
- Tap-count to reach "log EaseBrew AM": 1 → 1 (unchanged, already at top)
- Tap-count to reach "share to family": 1 → 2 (Coach tab → button) — acceptable trade for less mid-scroll noise
- **No new components created** — just reordering and moving existing ones between tabs.

### Test plan
- Manual: verify each moved card renders correctly on Coach/Tips tabs
- Playwright: no new tests; existing responsive spec still passes
- Sanity: confirm `session &&` guards stay attached during the move

### Risk: **LOW** — pure reorganization, no logic changes.

---

## 2. Today's Meal hero on Meal Plan (`app/meal-plan/page.tsx`)

### Current problem (from audit M1)
"What do I eat today?" is buried under: hero + week selector + progress bar + reminder + 7 day-cards. Auto-expand of current day helps but doesn't visually elevate.

### Design — new section at top

Add a **TODAY MEAL HERO** card immediately after the hero image, before the week selector:

```
┌──────────────────────────────────────────┐
│  📅 NGAYONG ARAW · Lunes · Nov 4          │
│  Day 12 sa 50-day program                 │
│                                            │
│  🍳 Agahan                                 │
│  Easebrew · Pandesal (2) · Boiled itlog   │
│                                            │
│  🍽️ Tanghalian                            │
│  Sinigang na baboy (lean) · Brown rice    │
│                                            │
│  🥭 Merienda                               │
│  Buko juice · Boiled saging na saba       │
│                                            │
│  🍚 Hapunan                                │
│  Ginisang ampalaya with itlog · Brown rice│
│                                            │
│  [  ✓ Tapos na ngayong araw!  ]           │
│                                            │
│  ─────────────────────────────────────    │
│  Tingnan lahat ng araw ▼                  │
└──────────────────────────────────────────┘
```

### Where to source "today's day"
Already have `getCurrentProgramDay()` helper from Auto #5 automation. Just call it and pull `MEAL_PLAN[dayIndex]`.

### Behavior
- Card is always at top, always shows today (auto-updates as date changes).
- Shows all 4 meals expanded — no tap needed.
- Big green "Tapos na ngayong araw!" button that both marks complete AND syncs to backend.
- Below the card, a **"Tingnan lahat ng araw ▼"** collapsible reveals the existing week selector + full 7-day list.
- **Default state: existing week/day list is COLLAPSED** on first load.
- Persistence: `localStorage` key `mealplan-list-expanded` remembers user's preference.

### Code change (sketch)
```tsx
// New component just above return
function TodayMealHero({ day, isDone, onToggle }: { day: typeof MEAL_PLAN[0]; isDone: boolean; onToggle: () => void }) {
  return (
    <div style={{ background: WHITE, border: `3px solid ${G}`, borderRadius: 22, padding: 20, margin: "20px 20px 0", boxShadow: "0 4px 20px rgba(57,97,59,0.15)" }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: G, letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>
        📅 Ngayong araw · Day {day.day} · {day.weekday}
      </p>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: DARK, margin: "8px 0 16px" }}>Ito ang pagkain ngayon:</h2>
      {[
        { icon: <Coffee size={20} />, label: "Agahan", val: day.agahan },
        { icon: <UtensilsCrossed size={20} />, label: "Tanghalian", val: day.tanghalian },
        { icon: <Apple size={20} />, label: "Merienda", val: day.merienda },
        { icon: <UtensilsCrossed size={20} />, label: "Hapunan", val: day.hapunan },
      ].map((m, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: G, margin: "0 0 4px", display: "flex", alignItems: "center", gap: 6 }}>
            {m.icon} {m.label}
          </p>
          <p style={{ fontSize: 17, color: DARK, margin: 0, lineHeight: 1.5 }}>{m.val}</p>
        </div>
      ))}
      <button onClick={onToggle} style={{ width: "100%", marginTop: 8, background: isDone ? "#dc2626" : G, color: "#fff", border: "none", borderRadius: 14, padding: "16px", fontSize: 18, fontWeight: 700, cursor: "pointer", minHeight: 56 }}>
        {isDone ? <><Undo2 size={18} /> I-undo</> : <><CircleCheck size={18} /> Tapos na ngayong araw!</>}
      </button>
    </div>
  );
}
```

### Test plan
- Snapshot at 320/375/414 viewports
- Verify `getCurrentProgramDay()` returns correct day (mock date to Nov 4 and confirm Day 12 renders)
- Verify "Tapos na" toggle syncs to backend (same `syncMealPlanProgress` already used)

### Risk: **LOW-MEDIUM**
- No data-model changes.
- One new component + one flag (`listExpanded`) added to state.

### Effort: **M** (2–3 hrs including tests)

---

## 3. Tracker simplification (`app/tracker/page.tsx`)

### Current problem (from audit T1)
5 numbered steps visually give equal weight to all fields. Business goal is really just EaseBrew adherence tracking.

### Design — restructured "Ngayon" tab

```
CURRENT                              NEW
────────────────────────────────     ────────────────────────────────
1. EaseBrew Ngayon                   💛 EaseBrew Ngayon              (kept, becomes hero)
   [AM] [PM]                            [AM] [PM]  ← BIG buttons
                                      [ Save AM/PM only ]  ← always visible, primary action
2. Gaano kasakit ngayon?
   (10 pain-level buttons)           ─── expander ───
                                     [ ▼ Higit pang detalye (opsyonal) ]
3. Saan masakit?                        ┌─ only shown if expanded ─┐
   (chip list)                          │ Sakit ngayon (opsyonal)   │
                                        │  [pain 1–10]              │
4. Paano ang mood mo?                   │                            │
   (5 mood options)                     │ Saan masakit (opsyonal)    │
                                        │  [Walang sakit] [pain chips]│
5. Ano ang nararamdaman mo?             │                            │
   (textarea + voice)                   │ Paano ang mood?            │
                                        │  [5 mood emojis]           │
[ Save ]                                │                            │
                                        │ Notes                      │
                                        │  [textarea + voice]        │
                                        └───────────────────────────┘

                                     [ ✓ I-save ang Record ]  ← always visible
                                     (single primary save; text unchanged)
```

### Changes
- **Remove numbered circles (1, 2, 3, 4, 5).** Section titles remain as plain headings.
- **EaseBrew section becomes prominent** — its own card, larger, at top. First thing the eye lands on.
- **Steps 2–5 collapse into ONE "Higit pang detalye (opsyonal)" expander**, closed by default. Label makes clear these are optional.
- **Save button always visible** — sticky bottom, doesn't require scroll.
- **Pain locations get a "Walang sakit" chip** as the first option — one-tap common case.
- **Save button text stays the same** ("I-save ang Record").
- **Prefill-from-yesterday banner** stays.

### State management
- Save behavior unchanged — persists all fields whether shown or hidden. If a senior only ticks EaseBrew and taps Save, that's a valid entry with pain=0 (existing default).
- `optionalExpanded` state (localStorage-backed) — some seniors will always want expanded. Remember their preference.

### Test plan
- Verify Save with EaseBrew-only produces a valid entry
- Verify expander preserves state on tab switch
- Verify Playwright responsive spec passes

### Risk: **MEDIUM**
- Restructures existing steps. Save logic unchanged.
- Need to keep prefill-from-yesterday banner logic intact.

### Effort: **M** (2–3 hrs)

---

## 4. Exercise video improvements (`app/exercise/page.tsx`)

### Current problems (from audit E1, E2, E3, E4, E8)
- YouTube iframe shows full controls, related videos, YouTube branding
- No loop
- Card-click marks exercise complete (accidental)
- If video fails, instruction text is BELOW where video would be — invisible

### Change 1: YouTube embed URL params

**`lib/exerciseProgram.ts` or wherever `youTubeEmbedUrl` lives.**

```ts
// BEFORE
function youTubeEmbedUrl(url: string) {
  const id = extractId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

// AFTER
function youTubeEmbedUrl(url: string) {
  const id = extractId(url);
  if (!id) return null;
  const params = new URLSearchParams({
    rel: "0",              // no related videos from other channels at end
    modestbranding: "1",    // reduces YouTube logo
    playsinline: "1",       // stays inline on iOS (no fullscreen takeover)
    loop: "1",              // loops on end
    playlist: id,           // required for loop to work with single video
    controls: "1",          // keep basic controls (play/pause/seek) — seniors need these
    fs: "0",                // disable fullscreen button (avoids accidental fullscreen)
    iv_load_policy: "3",    // hide annotations
    disablekb: "1",         // no keyboard shortcuts
  });
  return `https://www.youtube.com/embed/${id}?${params}`;
}
```

Rationale:
- `rel=0` + `modestbranding=1` = cleaner player
- `loop=1&playlist=<id>` = per user's explicit request
- Keep `controls=1` — seniors NEED play/pause. Removing entirely is worse.
- `fs=0` = no fullscreen; senior can't get lost in fullscreen mode and forget how to exit
- `iv_load_policy=3` = removes video annotations

### Change 2: instruction text moved ABOVE video

```tsx
// BEFORE (exercise/page.tsx around line 311-321)
{videoEmbed && (
  <div style={{ marginBottom: 12, borderRadius: 12, overflow: "hidden", ... }}>
    <iframe src={embed} ... />
  </div>
)}
<p>{ex.instruction}</p>

// AFTER
<p style={{ fontSize: 17, color: DARK, margin: "0 0 12px 0", lineHeight: 1.6 }}>{ex.instruction}</p>
{videoEmbed && (
  <div style={{ marginBottom: 12, borderRadius: 12, overflow: "hidden", background: "#000", aspectRatio: "16/9", position: "relative" }}>
    <iframe src={embed} title={`Video: ${ex.name}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} />
  </div>
)}
```

- Move `<p>{ex.instruction}</p>` UP before the iframe wrapper. Bump `allowFullScreen` off (backup for `fs=0`).
- If video fails to load, instruction is still there.

### Change 3: separate card-click from "mark done"

```tsx
// BEFORE (line 297): whole exercise card is clickable
<div onClick={() => toggleExercise(exKey)} style={{ padding: ..., cursor: "pointer", ... }}>
  <div style={{ ... /* checkbox */ }}>{exDone && <CircleCheck ... />}</div>
  <div style={{ flex: 1 }}>
    <p>{ex.name}</p>
    ...
  </div>
</div>

// AFTER
<div style={{ padding: ..., background: exDone ? "#F4FAF0" : "transparent" }}>
  {/* Explicit checkbox — the ONLY thing that toggles done */}
  <button
    onClick={() => toggleExercise(exKey)}
    aria-label={exDone ? "Alisin ang tapos" : "Markahan na tapos"}
    style={{ width: 44, height: 44, borderRadius: 999, border: `3px solid ${exDone ? G : "#C5B99A"}`, background: exDone ? G : "transparent", cursor: "pointer", ...  }}
  >
    {exDone && <CircleCheck size={20} color="#fff" />}
  </button>
  <div style={{ flex: 1 }}>
    <p>{ex.name}</p>
    {/* ... rest of exercise details */}
  </div>
</div>
```

- Card no longer has `onClick={toggleExercise}`.
- Only the round checkbox toggles complete.
- Micro-copy "I-tap para markahan na tapos" moves next to the checkbox instead of at bottom.

### Test plan
- Manual: play a video, confirm no related videos overlay at end, confirm it loops
- Manual: fullscreen button hidden
- Manual: tapping card body no longer marks done
- Playwright: existing exercise tests still pass

### Risk: **LOW-MEDIUM**
- URL params are well-documented YouTube params.
- Card click separation is straightforward.
- One concern: some Android WebViews ignore `fs=0` — check on Xiaomi.

### Effort: **S-M** (1.5–2 hrs)

---

## 5. Family Share one-tap (`app/page.tsx` FamilyShareCard)

### Current problems (from audit F1, F2, F6)
- 2 taps: Generate → Share
- Raw URL exposed (looks confusing)
- No indicator that a link is currently active

### Design — new one-tap flow

```
CURRENT                            NEW (when no active link)
──────────────────────────────     ──────────────────────────────
┌─────────────────────────────┐    ┌─────────────────────────────┐
│ 🔗 Ipakita sa Pamilya        │    │ 🔗 Ipakita sa Pamilya        │
│                              │    │                              │
│ Gumawa ng link para sa anak │    │ I-share ang wellness progress│
│ o asawa mo…                  │    │ sa anak o asawa mo — 7 araw │
│                              │    │ valid ang link.              │
│ [ Gumawa ng Family Link ]    │    │                              │
│                              │    │ [ 📤 I-share sa Pamilya ]    │
└─────────────────────────────┘    └─────────────────────────────┘

... (after tap) ...                ... (after tap) ...

┌─────────────────────────────┐    ┌─────────────────────────────┐
│ https://easebrew.com/family/│    │  Web Share sheet opens        │
│ eyJhbGciOiJIUzI1NiIsInR...  │    │  automatically ✓              │
│                              │    │                              │
│ Valid hanggang Nov 11        │    │  ─── active state ───        │
│                              │    │  ✓ Na-share na (kay Anak)    │
│ [ I-copy ang mensahe ]       │    │  Valid hanggang Nov 11        │
│ [ I-share sa Messenger o…]  │    │  [ I-share ulit ]  ⋮ Options │
│ Gumawa ng bagong link        │    │                              │
└─────────────────────────────┘    └─────────────────────────────┘
```

### Flow

**No active link:**
- Single button "📤 I-share sa Pamilya"

**On tap:**
1. Call `/api/family/generate` (existing endpoint, unchanged)
2. Immediately call `navigator.share({...})` with the link
3. If Web Share not available, fall back to clipboard + toast "Na-copy — i-paste sa Messenger"
4. Save state to localStorage: `{ token, expiresAt, sharedAt }`
5. Show "active link" state

**Active link state:**
- ✓ green check + "Na-share na · valid hanggang [date]"
- Primary button "I-share ulit" — reopens Web Share with the SAME link (doesn't regenerate)
- Small "⋮" menu → "I-copy ang link" + "Gumawa ng bagong link" (revokes old, generates new)

### Raw URL — HIDDEN by default
Never shown in the card. If user picks "I-copy ang link" from the ⋮ menu, then it's copied to clipboard silently. No visual monospace text.

### Move to Coach tab (per Home simplification, item 1)
The card lives on Coach tab where family-related actions naturally sit.

### Code sketch
```tsx
function FamilyShareLauncher() {
  const [state, setState] = useState<{ token: string; expiresAt: string; sharedAt: string } | null>(null);
  const [busy, setBusy] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem("eb_family_share");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (new Date(parsed.expiresAt) > new Date()) setState(parsed);
      else localStorage.removeItem("eb_family_share");
    }
  }, []);

  async function shareNow() {
    setBusy(true);
    try {
      let token = state?.token;
      let expiresAt = state?.expiresAt;
      if (!token) {
        const res = await fetch("/api/family/generate", { method: "POST" });
        const data = await res.json();
        if (!data.success) return alert("Hindi na-generate ang link. Subukan ulit.");
        token = data.token; expiresAt = data.expiresAt;
      }
      const url = `${window.location.origin}/family/${token}`;
      const msg = `Kumusta! Ito ang wellness update ko sa EaseBrew:\n\n${url}\n\n(7 araw na valid)`;
      if ("share" in navigator) {
        await (navigator as any).share({ title: "EaseBrew Wellness Update", text: msg, url });
      } else {
        await navigator.clipboard.writeText(msg);
        alert("Na-copy sa clipboard. I-paste mo sa Messenger o SMS.");
      }
      const next = { token, expiresAt, sharedAt: new Date().toISOString() };
      localStorage.setItem("eb_family_share", JSON.stringify(next));
      setState(next);
    } finally { setBusy(false); }
  }

  return (
    <div style={{ background: "#f0f9ff", border: "2px solid #0ea5e9", borderRadius: 20, padding: 18, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Share2 size={20} color="#0369a1" />
        <p style={{ fontSize: 16, fontWeight: 700, color: "#0c4a6e", margin: 0 }}>Ipakita sa Pamilya</p>
      </div>
      {state ? (
        <>
          <p style={{ fontSize: 14, color: "#164e63", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <CircleCheck size={16} color="#16a34a" /> Na-share na · valid hanggang {new Date(state.expiresAt).toLocaleDateString("fil-PH", { month: "long", day: "numeric" })}
          </p>
          <button onClick={shareNow} disabled={busy} style={{ width: "100%", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer", minHeight: 52 }}>
            {busy ? "..." : "I-share ulit"}
          </button>
        </>
      ) : (
        <>
          <p style={{ fontSize: 14, color: "#164e63", margin: "0 0 12px", lineHeight: 1.5 }}>
            I-share ang wellness progress sa anak o asawa mo — 7 araw valid ang link.
          </p>
          <button onClick={shareNow} disabled={busy} style={{ width: "100%", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer", minHeight: 52 }}>
            {busy ? "Ginagawa..." : "📤 I-share sa Pamilya"}
          </button>
        </>
      )}
    </div>
  );
}
```

### Test plan
- Web Share available (mobile Chrome): one tap opens sheet
- Web Share unavailable (desktop): falls back to clipboard + alert
- Reload: active state persists via localStorage
- Regenerate: new token replaces old in state

### Risk: **LOW-MEDIUM**
- Backend endpoint unchanged
- Web Share API well-supported on modern mobile
- Fallback path tested

### Effort: **M** (2 hrs)

---

## Rollout plan

**One PR per area, in this order:**

| # | Area | Commit tag | Files touched | Est. hrs | Risk |
|---|---|---|---|---|---|
| 1 | Home simplification | `ux(home): simplify — move secondary cards to Coach/Tips` | app/page.tsx | 2 | LOW |
| 2 | Meal Plan Today hero | `ux(meal-plan): add Today's Meal hero at top` | app/meal-plan/page.tsx | 3 | LOW-MED |
| 3 | Tracker simplify | `ux(tracker): make EaseBrew primary, collapse optional fields` | app/tracker/page.tsx | 3 | MED |
| 4 | Exercise video | `ux(exercise): clean YouTube embed + separate tap-to-complete` | app/exercise/page.tsx + lib/exerciseProgram.ts | 2 | LOW-MED |
| 5 | Family Share 1-tap | `ux(family): one-tap share, hide raw URL, active-link state` | app/page.tsx | 2 | LOW-MED |

**Total estimated effort:** ~12 hours.

**After each commit:** run `npm run typecheck && npm run lint && npm run build && npx playwright test tests/e2e/customer/responsive.spec.ts`. If green, push. If red, fix or revert.

**Not touched:**
- Bagong Katawan (per your instruction)
- Admin (per product spec)
- Coach dashboard (per product spec)

---

## Questions before I start

1. **Confirm section moves for Home:**
   - ReferralCard → Coach tab? (Recommend YES)
   - TestimonialSubmissionCard → Coach tab? (Recommend YES)
   - Daily Wellness Tip → Tips tab? (Recommend YES)
   - Routine section → Tips tab? (Recommend YES)
2. **Meal Plan default:** should the full 7-day list be **collapsed** or **expanded** by default? Recommend collapsed with "Tingnan lahat ng araw ▼" so seniors focus on today.
3. **Tracker Save button:** sticky-pin at bottom of viewport, or just always-visible below the collapsible? Sticky is safer for seniors (never lost) but adds a fixed element.
4. **Exercise fullscreen:** fully disabled (`fs=0`) or keep? Some seniors WANT fullscreen for visibility. Recommend keeping fullscreen enabled but expect it might be tapped accidentally.
5. **Family share icon:** keep `📤` emoji in button OR swap for lucide `<Share2>`? Recommend lucide (matches prior emoji-to-lucide sweep policy).

**Give me a "go" (with any answers to above) and I'll start with item 1 (Home simplification).**
