-- ============================================================
-- progress
--
-- Per-code, per-type wellness progress data (pain tracker,
-- meal plan checklist, exercise progress, water log, recipe
-- favorites, 90-day program state). Opaque jsonb blob whose
-- shape is defined client-side per feature.
--
-- Written via POST /api/progress with an upsert onConflict on
-- (code, type). API rejects payloads > 100_000 bytes.
--
-- Known type values: 'tracker', 'mealplan', 'exercise',
-- 'recipe_favorites', 'bagong_katawan', 'water'.
-- ============================================================

create table if not exists public.progress (
  code        text        not null,
  type        text        not null,
  data        jsonb       not null,
  updated_at  timestamptz not null default now(),
  primary key (code, type)
);

-- Admin dashboard: "last active tracker entry" per code list
create index if not exists progress_type_updated_idx
  on public.progress (type, updated_at desc);

alter table public.progress enable row level security;

drop policy if exists "Service role can manage progress" on public.progress;
create policy "Service role can manage progress"
on public.progress
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

comment on table public.progress is
  'Opaque per-(code,type) jsonb blob of customer wellness progress. Client owns the shape; server enforces only size + tier-gate.';
