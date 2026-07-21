-- ============================================================
-- prune_admin_login_attempts()
--
-- Deletes admin_login_attempts rows older than 24 hours. The
-- rate-limit window is only 15 minutes (see /api/admin/login),
-- so anything older than a day is dead data.
--
-- Called nightly by pg_cron when the extension is available.
-- Also safe to call manually: `select public.prune_admin_login_attempts();`
-- ============================================================

create or replace function public.prune_admin_login_attempts()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.admin_login_attempts
  where attempted_at < now() - interval '24 hours';
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

comment on function public.prune_admin_login_attempts is
  'Deletes admin_login_attempts rows older than 24h. Safe to run anytime. Scheduled nightly via pg_cron when available.';

-- ============================================================
-- pg_cron scheduling — best-effort
--
-- pg_cron ships with Supabase but must be explicitly enabled in
-- Dashboard → Database → Extensions before jobs can be scheduled.
-- The block below tries to schedule the job and no-ops if the
-- extension is not installed, so this migration is safe to apply
-- either way. If pg_cron is enabled later, re-run this migration.
-- ============================================================

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    -- Remove any prior version of the same-named job before re-scheduling
    perform cron.unschedule(jobid)
    from cron.job
    where jobname = 'prune-admin-login-attempts';

    -- Run daily at 03:15 UTC (11:15 AM Manila) — off-peak
    perform cron.schedule(
      'prune-admin-login-attempts',
      '15 3 * * *',
      $cron$select public.prune_admin_login_attempts();$cron$
    );
    raise notice 'pg_cron job "prune-admin-login-attempts" scheduled (daily 03:15 UTC).';
  else
    raise notice 'pg_cron extension not installed — enable it in Supabase Dashboard → Database → Extensions, then re-run this migration to schedule the nightly prune.';
  end if;
end;
$$;
