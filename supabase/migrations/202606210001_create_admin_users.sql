create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  username_normalized text generated always as (lower(btrim(username))) stored,
  role text not null check (role in ('owner', 'coach')),
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists admin_users_username_normalized_unique
  on public.admin_users (username_normalized);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at
before update on public.admin_users
for each row
execute function public.set_updated_at();

alter table public.admin_users enable row level security;

drop policy if exists "Service role can manage admin users" on public.admin_users;
create policy "Service role can manage admin users"
on public.admin_users
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

comment on table public.admin_users is
  'Admin and coach login users. Store bcrypt hashes only, never plaintext passwords.';

comment on column public.admin_users.password_hash is
  'bcryptjs hash generated from the user password.';
