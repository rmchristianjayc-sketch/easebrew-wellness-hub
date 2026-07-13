# Agent Onboarding — R&M EaseBrew Wellness Hub

**Every new session starts here.** Read these in order:

1. **[docs/PROJECT_BRAIN.md](docs/PROJECT_BRAIN.md)** — comprehensive project knowledge (business rules, architecture, features, UI system, engineering rules, roadmap, troubleshooting). Read this first; it saves the user from re-explaining.

2. **[docs/DECISIONS.md](docs/DECISIONS.md)** — architecture decisions (ADRs). Read when you need to understand *why* something is the way it is.

3. **Auto-memory** at `~/.claude/projects/C--Users-admin-Documents-easebrew-wellness-hub/memory/` — user preferences and prior-session notes. Loaded automatically by Claude Code.

<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Non-negotiable rules

- **Do NOT update `PROJECT_CONTEXT.md`** at the root — it's a legacy snapshot doc, kept for history only.
- **Do NOT commit `.env*` or `cookies.txt`** — they contain secrets.
- **Customer surface is mobile-first Tagalog** (seniors 50+). Admin surface is desktop English/Tag mix. See § 2 and § 5 of PROJECT_BRAIN.md.
- **Never claim medical benefits** — always include "Palaging magpakonsulta sa doctor" disclaimer on health tools. See § 2 wellness rules.

## Fast lookup

| Question | Where to look |
|----------|---------------|
| What tier unlocks what? | `lib/tierGates.ts` + § 2 of PROJECT_BRAIN |
| Editable content keys? | `lib/contentKeys.ts` `PUBLIC_CONTENT_KEYS` |
| Package prices? | `lib/price-config.ts` |
| Exercise program data? | `lib/exerciseProgram.ts` |
| API auth? | `lib/auth.ts` |
| Routes → tier gates? | `proxy.ts` + `lib/tierGates.ts` |
| Recent changes? | `git log --oneline -20` and CHANGELOG in PROJECT_BRAIN § 14 |
| Known bugs? | PROJECT_BRAIN § 8 |
| How to reset a customer? | PROJECT_BRAIN § 15 Troubleshooting |

## Update discipline

- When a fact in PROJECT_BRAIN.md becomes stale, **fix it there first** before working on code that would drift from it.
- Non-obvious architectural choices → append to DECISIONS.md (never rewrite past entries; mark SUPERSEDED instead).
- Feature ships → add a line to PROJECT_BRAIN § 14 (Changelog) and, if the feature is new, to § 7 (Feature Inventory).

Everything else is in PROJECT_BRAIN.md. Start there.
