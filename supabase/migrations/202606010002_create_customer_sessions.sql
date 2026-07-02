-- ============================================================
-- customer_sessions
--
-- Durable record of activated customer sessions. The actual
-- session credential is the JWT in the eb_session cookie; this
-- table exists so:
--   * Re-verifying on the same device restores state without
--     re-charging validity.
--   * The admin dashboard can show "last seen" and analytics.
--   * Coach can inspect who activated which code.
--
-- One row per (code, device_id). Deleted manually before the
-- parent access_codes row is deleted (see /api/admin/codes
-- DELETE handler).
-- ============================================================

create table if not exists public.customer_sessions (
  id            uuid        primary key default gen_random_uuid(),
  code_id       uuid        not null references public.access_codes(id),
  code          text        not null,
  device_id     text        not null,
  tier          integer     not null,
  packs         integer     not null,
  activated_at  timestamptz not null default now(),
  expires_at    timestamptz not null,
  last_seen_at  timestamptz not null default now()
);

-- Verify-code path looks up sessions by (code, device_id)
create index if not exists customer_sessions_code_device_idx
  on public.customer_sessions (code, device_id);

-- Cascade-style cleanup keyed on code_id (manual delete in API)
create index if not exists customer_sessions_code_id_idx
  on public.customer_sessions (code_id);

-- Analytics: recently active customers
create index if not exists customer_sessions_last_seen_idx
  on public.customer_sessions (last_seen_at desc);

alter table public.customer_sessions enable row level security;

drop policy if exists "Service role can manage customer sessions" on public.customer_sessions;
create policy "Service role can manage customer sessions"
on public.customer_sessions
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

comment on table public.customer_sessions is
  'Materialized customer session rows for restore + analytics. The JWT cookie is the actual auth credential.';
