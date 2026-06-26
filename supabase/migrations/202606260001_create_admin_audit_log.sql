create table if not exists public.admin_audit_log (
  id          uuid        primary key default gen_random_uuid(),
  admin_username text     not null,
  action      text        not null,
  target_id   text,
  target_code text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

-- Fast lookup by admin (para malaman kung sino ang aktibo)
create index if not exists admin_audit_log_admin_idx
  on public.admin_audit_log (admin_username);

-- Fast lookup by time (default sort ng UI)
create index if not exists admin_audit_log_created_idx
  on public.admin_audit_log (created_at desc);

-- Fast lookup by target code (para makita ang history ng isang code)
create index if not exists admin_audit_log_code_idx
  on public.admin_audit_log (target_code)
  where target_code is not null;

alter table public.admin_audit_log enable row level security;

drop policy if exists "Service role can manage audit log" on public.admin_audit_log;
create policy "Service role can manage audit log"
on public.admin_audit_log
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

comment on table public.admin_audit_log is
  'Immutable record of all admin actions — code generation, deactivation, deletion, content edits, logins.';

comment on column public.admin_audit_log.action is
  'One of: generate_code, deactivate_code, reactivate_code, delete_code, update_code_notes, update_content, delete_content, admin_login, admin_login_failed';
