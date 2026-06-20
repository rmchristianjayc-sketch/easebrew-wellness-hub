-- Check for duplicate codes before applying this migration:
--
-- select code, count(*)
-- from public.access_codes
-- group by code
-- having count(*) > 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'access_codes_code_unique'
      and conrelid = 'public.access_codes'::regclass
  ) then
    alter table public.access_codes
      add constraint access_codes_code_unique unique (code);
  end if;
end $$;
