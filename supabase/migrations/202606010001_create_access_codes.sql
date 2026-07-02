-- ============================================================
-- access_codes
--
-- Customer-facing access codes distributed with physical
-- EaseBrew orders. Each code binds to one tier (which controls
-- validity_days + unlocked digital products) and, on first
-- activation, to a single device_id. Consumed via
-- POST /api/verify-code; managed via /admin/codes.
--
-- Note: the UNIQUE constraint on `code` is added separately in
-- migration 202606200001_add_access_codes_code_unique.sql.
-- ============================================================

create table if not exists public.access_codes (
  id             uuid        primary key default gen_random_uuid(),
  code           text        not null,
  tier           integer     not null,
  packs          integer     not null,
  validity_days  integer     not null,
  is_used        boolean     not null default false,
  used_at        timestamptz,
  expires_at     timestamptz,
  device_id      text,
  created_by     text        not null,
  customer_name  text,
  notes          text,
  created_at     timestamptz not null default now()
);

-- Fast lookup by code (verification path)
create index if not exists access_codes_code_idx
  on public.access_codes (code);

-- Coach dashboard filter: "codes I created"
create index if not exists access_codes_created_by_idx
  on public.access_codes (created_by);

-- Admin dashboard filters: used / unused, sorted by created_at
create index if not exists access_codes_is_used_created_idx
  on public.access_codes (is_used, created_at desc);

-- Session revalidation checks expires_at frequently
create index if not exists access_codes_expires_at_idx
  on public.access_codes (expires_at)
  where expires_at is not null;

alter table public.access_codes enable row level security;

drop policy if exists "Service role can manage access codes" on public.access_codes;
create policy "Service role can manage access codes"
on public.access_codes
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

comment on table public.access_codes is
  'Customer access codes (format: EASE-XXXX-XXXX). Each code activates on one device_id and expires validity_days after used_at.';
