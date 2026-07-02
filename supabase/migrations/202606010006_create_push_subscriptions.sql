-- ============================================================
-- push_subscriptions
--
-- Web Push subscription objects keyed by device_id. The
-- type is exported from lib/supabase.ts and this table is
-- meant to back a future push-notification sender; at time
-- of writing, /admin/notifications is a Messenger template
-- library, not a live sender. Table is provisioned so
-- subscription capture can start early.
-- ============================================================

create table if not exists public.push_subscriptions (
  id                 uuid        primary key default gen_random_uuid(),
  device_id          text        not null,
  subscription_json  jsonb       not null,
  tier               integer,
  created_at         timestamptz not null default now()
);

-- One row per device (upsert target once sender is wired)
create unique index if not exists push_subscriptions_device_id_unique
  on public.push_subscriptions (device_id);

-- Send-by-tier filter (e.g. VIP-only announcement)
create index if not exists push_subscriptions_tier_idx
  on public.push_subscriptions (tier)
  where tier is not null;

alter table public.push_subscriptions enable row level security;

drop policy if exists "Service role can manage push subscriptions" on public.push_subscriptions;
create policy "Service role can manage push subscriptions"
on public.push_subscriptions
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

comment on table public.push_subscriptions is
  'Web Push endpoint + keys per device_id. Used by future push sender; capture can start before the sender ships.';
