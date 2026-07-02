-- ============================================================
-- activity_logs
--
-- Customer-side telemetry (as opposed to admin_audit_log which
-- tracks admin actions). Written from /api/verify-code on
-- successful first activation with action='code_verified'.
-- Intended for future customer-behavior analytics.
-- ============================================================

create table if not exists public.activity_logs (
  id          uuid        primary key default gen_random_uuid(),
  device_id   text        not null,
  action      text        not null,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

-- Lookup all activity for a device (analytics / support)
create index if not exists activity_logs_device_created_idx
  on public.activity_logs (device_id, created_at desc);

-- Filter by action type
create index if not exists activity_logs_action_created_idx
  on public.activity_logs (action, created_at desc);

alter table public.activity_logs enable row level security;

drop policy if exists "Service role can manage activity logs" on public.activity_logs;
create policy "Service role can manage activity logs"
on public.activity_logs
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

comment on table public.activity_logs is
  'Customer-side telemetry keyed by device_id (not code). Written on notable actions like code_verified.';
