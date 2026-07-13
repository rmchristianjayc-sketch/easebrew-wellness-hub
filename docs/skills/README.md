# Claude Desktop Skills — R&M EaseBrew

3 custom skills na pwede mong i-upload sa Claude Desktop → **Settings → Skills → Add → Add skill (upload)**.

## Kung ano yung mga skills

| File | When it triggers | What it does |
|------|------------------|--------------|
| **`easebrew-project-context.md`** | Sinabi mo "EaseBrew", "customer", "coach", "wellness hub", or umpisa ng chat about the app | Auto-loads business + technical context so Claude knows the tier system, rules, and stack without you explaining |
| **`easebrew-generate-customer.md`** | Sinabi mo "bagong customer", "generate code", "may nag-order" | Guided flow — asks for name/tier/coach/notes, then walks you through the admin panel steps and drafts the Messenger welcome message |
| **`easebrew-debug-customer.md`** | Sinabi mo "customer complains", "hindi maka-login", "problema si [customer]" | Systematic triage — checks the top failure modes (device swap, expired code, rate limit, cache) and gives exact SQL/action to fix each |

## Paano i-upload

1. Open Claude Desktop
2. Click gear icon → **Settings**
3. Sa sidebar under **Customize**, click **Skills**
4. Click **Add** button (top right) → choose "Upload skill"
5. Select one of the `.md` files sa folder na ito
6. Repeat for the other 2 files

## Paano gamitin

Wala kang gagawin — Claude mismo ang mag-trigger ng skill based sa sinasabi mo. Halimbawa:

- Sabi mo: **"May nag-order ngayon si Aling Cora ng ₱1,499 package"**
  → Auto-triggers `easebrew-generate-customer` → walks you through
- Sabi mo: **"Nag-message si Tatay Ben, hindi daw siya maka-login"**
  → Auto-triggers `easebrew-debug-customer` → runs triage
- Sabi mo: **"Puwede ba dagdag ng bagong wellness tip sa app?"**
  → Auto-triggers `easebrew-project-context` → knows the tier system, content keys, admin flow

## Kung baguhin mo yung skill later

- Edit yung `.md` file dito sa project
- Sa Claude Desktop Skills panel, delete the old version at re-upload the new one
- Or: use `skill-creator` (Anthropic skill na nakita sa list mo) para mag-manage from within Claude

## Versioning

Since nakalagay sila sa git repo, may version history ka via `git log docs/skills/`. Kung gusto mo bumalik sa old version, `git show <commit>:docs/skills/[filename]` lang.
