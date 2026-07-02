-- ============================================================
-- content
--
-- Admin-editable string content (hero copy, product names +
-- descriptions, coach info, tips, FAQs, testimonials, videos,
-- order URLs, promo banner text). Whitelist of allowed keys
-- lives in lib/contentKeys.ts (PUBLIC_CONTENT_KEYS).
--
-- Public GET /api/content returns only whitelisted rows.
-- Owner-only POST /api/admin/content upserts onConflict='key'.
-- Deleting a row falls back to the in-code default.
-- ============================================================

create table if not exists public.content (
  id          uuid        primary key default gen_random_uuid(),
  key         text        not null unique,
  value       text        not null default '',
  updated_at  timestamptz not null default now(),
  updated_by  text        not null
);

-- Explicit index on key (covered by unique but useful for planners)
create index if not exists content_key_idx
  on public.content (key);

alter table public.content enable row level security;

drop policy if exists "Service role can manage content" on public.content;
create policy "Service role can manage content"
on public.content
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

comment on table public.content is
  'Admin-editable string overrides for customer-facing copy. Keys must be in the PUBLIC_CONTENT_KEYS whitelist to be exposed via /api/content.';
