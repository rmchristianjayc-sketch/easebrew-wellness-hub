create table if not exists public.admin_login_attempts (
  id           uuid        primary key default gen_random_uuid(),
  identifier   text        not null,
  attempted_at timestamptz not null default now()
);

-- Fast lookup by identifier within the rate-limit window
create index if not exists admin_login_attempts_identifier_idx
  on public.admin_login_attempts (identifier, attempted_at desc);

alter table public.admin_login_attempts enable row level security;

drop policy if exists "Service role can manage admin login attempts" on public.admin_login_attempts;
create policy "Service role can manage admin login attempts"
on public.admin_login_attempts
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

comment on table public.admin_login_attempts is
  'Records failed and in-progress admin login attempts for rate limiting. Rows older than the rate-limit window (15 minutes) can be pruned safely.';
