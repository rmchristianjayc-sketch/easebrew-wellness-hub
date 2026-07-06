-- ============================================================
-- R&M EaseBrew Wellness Hub — Complete Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. ADMIN USERS
-- Stores admin and coach login credentials
create table if not exists admin_users (
  id                  uuid primary key default gen_random_uuid(),
  username            text not null,
  username_normalized text not null unique,
  password_hash       text not null,
  role                text not null check (role in ('owner', 'coach')),
  is_active           boolean not null default true,
  created_at          timestamptz not null default now()
);

-- 2. ADMIN LOGIN ATTEMPTS (rate limiting)
create table if not exists admin_login_attempts (
  id           uuid primary key default gen_random_uuid(),
  identifier   text not null,
  attempted_at timestamptz not null default now()
);

create index if not exists idx_login_attempts_lookup
  on admin_login_attempts (identifier, attempted_at);

-- 3. ACCESS CODES
-- Each code gives a customer access to the wellness hub
create table if not exists access_codes (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  tier          integer not null,
  packs         integer not null,
  validity_days integer not null,
  is_used       boolean not null default false,
  used_at       timestamptz,
  expires_at    timestamptz,
  device_id     text,
  created_by    text not null,
  customer_name text,
  notes         text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_access_codes_code on access_codes (code);
create index if not exists idx_access_codes_created_by on access_codes (created_by);

-- 4. CUSTOMER SESSIONS
-- Tracks active device sessions per code
create table if not exists customer_sessions (
  id           uuid primary key default gen_random_uuid(),
  code_id      uuid references access_codes(id) on delete cascade,
  code         text not null,
  device_id    text not null,
  tier         integer not null,
  packs        integer not null,
  expires_at   timestamptz not null,
  activated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists idx_sessions_code_device
  on customer_sessions (code, device_id);

-- 5. PROGRESS
-- Stores all customer progress data (tracker, meal plan, BP, etc.)
create table if not exists progress (
  id         uuid primary key default gen_random_uuid(),
  code       text not null,
  type       text not null,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(code, type)
);

create index if not exists idx_progress_code_type on progress (code, type);

-- 6. CONTENT
-- Key-value store for admin-editable content (hero text, tips, etc.)
create table if not exists content (
  key        text primary key,
  value      text not null default '',
  updated_by text,
  updated_at timestamptz default now()
);

-- 7. ADMIN AUDIT LOG
-- Tracks all admin/coach actions
create table if not exists admin_audit_log (
  id              uuid primary key default gen_random_uuid(),
  admin_username  text not null,
  action          text not null,
  target_id       text,
  target_code     text,
  metadata        jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists idx_audit_log_created
  on admin_audit_log (created_at desc);

-- 8. ACTIVITY LOGS
-- Tracks customer-side events (code verification, etc.)
create table if not exists activity_logs (
  id        uuid primary key default gen_random_uuid(),
  device_id text,
  action    text not null,
  metadata  jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- GRANTS — ensure service_role can access all tables
-- (Supabase service_role bypasses RLS but still needs table grants)
-- ============================================================

GRANT ALL ON public.admin_users          TO service_role;
GRANT ALL ON public.admin_login_attempts TO service_role;
GRANT ALL ON public.access_codes         TO service_role;
GRANT ALL ON public.customer_sessions    TO service_role;
GRANT ALL ON public.progress             TO service_role;
GRANT ALL ON public.content              TO service_role;
GRANT ALL ON public.admin_audit_log      TO service_role;
GRANT ALL ON public.activity_logs        TO service_role;

-- ============================================================
-- RLS POLICIES
-- All access goes through supabaseAdmin (service role key),
-- so we disable RLS or allow service role only.
-- ============================================================

alter table admin_users          enable row level security;
alter table admin_login_attempts enable row level security;
alter table access_codes         enable row level security;
alter table customer_sessions    enable row level security;
alter table progress             enable row level security;
alter table content              enable row level security;
alter table admin_audit_log      enable row level security;
alter table activity_logs        enable row level security;

-- Service role bypasses RLS automatically, so no policies needed.
-- If you want extra safety, add policies that deny anon/authenticated:

create policy "Deny all for anon" on admin_users          for all to anon using (false);
create policy "Deny all for anon" on admin_login_attempts for all to anon using (false);
create policy "Deny all for anon" on access_codes         for all to anon using (false);
create policy "Deny all for anon" on customer_sessions    for all to anon using (false);
create policy "Deny all for anon" on progress             for all to anon using (false);
create policy "Deny all for anon" on content              for all to anon using (false);
create policy "Deny all for anon" on admin_audit_log      for all to anon using (false);
create policy "Deny all for anon" on activity_logs        for all to anon using (false);

create policy "Deny all for auth" on admin_users          for all to authenticated using (false);
create policy "Deny all for auth" on admin_login_attempts for all to authenticated using (false);
create policy "Deny all for auth" on access_codes         for all to authenticated using (false);
create policy "Deny all for auth" on customer_sessions    for all to authenticated using (false);
create policy "Deny all for auth" on progress             for all to authenticated using (false);
create policy "Deny all for auth" on content              for all to authenticated using (false);
create policy "Deny all for auth" on admin_audit_log      for all to authenticated using (false);
create policy "Deny all for auth" on activity_logs        for all to authenticated using (false);

-- ============================================================
-- SEED DATA — Admin and Coach accounts
-- Password: marioandmaria (bcrypt hash below)
-- ============================================================

-- Generate the hash: run this in Node.js if you want a fresh one:
--   const bcrypt = require('bcryptjs');
--   console.log(bcrypt.hashSync('marioandmaria', 10));

insert into admin_users (username, username_normalized, password_hash, role) values
  ('admin', 'admin', '$2b$10$v3TecKqOcSedCBUhiDQrNeS/RoCaTTe5UTMy4kTFu5ZDe5oFd7Woi', 'owner'),
  ('coach', 'coach', '$2b$10$v3TecKqOcSedCBUhiDQrNeS/RoCaTTe5UTMy4kTFu5ZDe5oFd7Woi', 'coach')
on conflict (username_normalized) do nothing;

-- ============================================================
-- CLEANUP: Auto-delete old login attempts (optional)
-- Run as a Supabase cron or pg_cron job
-- ============================================================
-- delete from admin_login_attempts
-- where attempted_at < now() - interval '1 hour';
