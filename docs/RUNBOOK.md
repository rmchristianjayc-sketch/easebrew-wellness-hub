# Runbook — R&M EaseBrew Wellness Hub

**Purpose:** the on-call reference for common incidents. When something breaks at 2 AM, open this file and follow the numbered steps for the matching incident type. Every incident here has been either observed in staging or plausibly modelled.

**Format:** each incident lists **symptom → diagnosis → fix → post-mortem note**.

---

## 1. Deployment procedure

### Auto (normal path)
1. `git push origin master`
2. GitHub Actions runs CI (lint + typecheck + build + Playwright + CodeQL)
3. Vercel auto-deploys on green CI (assuming GitHub↔Vercel integration is connected)
4. Verify: `curl -sI https://your-domain.com/` returns 200 with all security headers
5. Smoke-test one customer flow (verify → home → mood tap)

### Manual (fallback)
```bash
git checkout master && git pull
npm ci
npm run lint && npm run typecheck && npm run build && npm test
vercel deploy --prod
```

Preview deploy for a branch:
```bash
git push origin <branch-name>          # opens PR → auto preview URL
# or
vercel deploy                          # gives an <hash>.vercel.app URL
```

---

## 2. Rollback procedure

### Fast rollback (recommended when uncertain)
1. Vercel Dashboard → Project → Deployments
2. Find the last deploy that was known-good (green + tested)
3. Click ••• → **Promote to Production**
4. Confirm — takes ~30 seconds
5. Verify: `curl -sI https://your-domain.com/` shows the rolled-back build

### Revert commit (permanent fix)
```bash
git revert <bad-commit-sha>
git push origin master
```
CI runs, Vercel redeploys the reverted state.

### Rollback DB migration (rare)
If a migration corrupted data, restore from Supabase automatic backup:
1. Supabase Dashboard → Database → Backups
2. Pick the last backup before the migration
3. Click Restore → confirm impacts
4. Update `PROJECT_BRAIN.md` § 14 Changelog with the rollback

---

## 3. Incident: App is down

**Symptom:** customers report "cannot open the app" / uptime monitor alerts.

**Diagnose (in order):**
1. Try the URL yourself: `curl -sI https://your-domain.com/`
   - 200 → app is up; customer likely has local issue → confirm with them
   - 5xx → app is broken → step 2
   - Timeout / DNS fail → Vercel or DNS issue → step 3

2. **Vercel logs** — Dashboard → Deployments → latest → Logs tab
   - Look for stack traces or repeated errors
   - If a recent deploy correlates → **rollback** (§2)

3. **Vercel status page:** https://vercel-status.com
   - If Vercel outage: post to Facebook Page ("May issue si Vercel, babalik siya soon"). Nothing else to do.

4. **Supabase status page:** https://status.supabase.com
   - If Supabase outage: static pages still load; anything touching data returns errors. Same messaging as above.

5. **DNS:** `dig your-domain.com` → confirm A/CNAME record matches Vercel's expected value

**Fix:**
- Recent deploy caused it → rollback
- External outage → wait + communicate
- DNS mis-config → correct in your registrar, propagate

**Post-mortem:** log the timeline in the ops journal (or Github issue). Note detection time, resolution time, root cause.

---

## 4. Incident: App is slow

**Symptom:** customers report the app takes > 5 seconds to load.

**Diagnose:**
1. Check Vercel → Analytics → Response time chart
2. Sentry → Performance (if activated) → route breakdown
3. Supabase → Database → Reports → slow query log
4. Check the Sentry `tracesSampleRate` — bump to 1.0 during the incident for full visibility

**Common causes:**
- Cold Vercel edge cache after a fresh deploy → warms up within minutes
- Supabase connection pool exhaustion → check "connection count" in Supabase dashboard
- CDN cache miss storm on `/api/content` after a deploy → 30-second cache normally absorbs this, but a mass user reload can hit it
- Unusually large `progress.data` payload → check `select length(data::text) from progress where code = 'EASE-...' order by length desc limit 10;`

**Fix:**
- Pool exhaustion → temporarily reduce workers in Vercel project settings; migrate to Supabase pooler URL
- Rogue payload → truncate the customer's entries: `update progress set data = jsonb_set(data, '{entries}', '[]'::jsonb) where code = 'EASE-...' and type = 'tracker';`

---

## 5. Incident: Customer can't verify code

**Symptom:** customer reports "invalid code" or the verify page rejects them.

**Diagnose:**
```sql
select code, is_used, device_id, expires_at, used_at, customer_name
from access_codes where code = 'EASE-XXXX-XXXX';
```

- **No row** → code doesn't exist / typo → resend the exact code (via `/admin/codes`)
- **`is_used = true` and `device_id ≠` customer's device** → code locked to old phone → unbind (below)
- **`expires_at < now()`** → expired → generate a new code
- **Rate-limited (429 in Vercel logs)** → wait 15 minutes OR clear entries:
  ```sql
  delete from admin_login_attempts where identifier like '%EASE-XXXX-XXXX%';
  ```

**Unbind device (customer changed phones):**
```sql
update access_codes
set device_id = null, is_used = false, used_at = null
where code = 'EASE-XXXX-XXXX';
delete from customer_sessions where code = 'EASE-XXXX-XXXX';
```
Then send the customer the auto-fill link again.

---

## 6. Incident: Customer's data disappeared

**Symptom:** customer says "wala na yung mga na-log ko dati."

**Diagnose:**
```sql
select type, jsonb_array_length(data->'entries') as count, updated_at
from progress where code = 'EASE-XXXX-XXXX';
```

- **Row present with count > 0** → data is fine on server; client-side cache issue. Ask customer to hard-refresh (Ctrl+F5) or reinstall the PWA.
- **Row present but count = 0 or missing entries** → check `admin_audit_log` for delete operations:
  ```sql
  select * from admin_audit_log where target_code = 'EASE-XXXX-XXXX' order by created_at desc limit 20;
  ```
- **No progress row at all** → customer never actually saved data OR row was deleted. Restore from Supabase backup.

**Restore single customer from backup:**
1. Supabase Dashboard → Database → Backups → pick the backup covering the missing data
2. **Do NOT full-restore** — that would clobber every customer. Instead download the backup as SQL dump.
3. Extract just this customer's progress row:
   ```bash
   grep "EASE-XXXX-XXXX" backup.sql | grep -oP "insert into.*progress.*"
   ```
4. Run the extracted insert on the live DB.

---

## 7. Incident: Admin can't log in

**Symptom:** admin login page returns "Invalid username or password" for correct credentials.

**Diagnose:**
- Rate-limited from prior wrong attempts? Check:
  ```sql
  select count(*) from admin_login_attempts
  where identifier like 'admin%' and attempted_at > now() - interval '15 minutes';
  ```
- If ≥ 8 → rate limit hit. Wait 15 min OR clear:
  ```sql
  delete from admin_login_attempts where identifier like 'admin%';
  ```

- Password rotated but forgotten?
  ```sql
  -- Generate a new hash locally:
  node -e "console.log(require('bcryptjs').hashSync('newpassword', 10))"
  -- Then update:
  update admin_users set password_hash = '<the-hash-above>' where username = 'admin';
  ```

---

## 8. Incident: 5xx spike in Vercel logs

**Symptom:** Vercel dashboard shows > 1 % error rate.

**Diagnose:**
1. Sentry → most recent issue group (if activated)
2. Vercel logs → filter by status ≥ 500 → look at path + stack trace
3. Correlate with the last deploy time

**Fix:**
- Recent deploy → rollback (§2)
- Sentry shows an unhandled exception on a specific route → open an issue, patch, deploy

---

## 9. Incident: Suspected credential leak

**JWT_SECRET compromised:**
```bash
# 1. Generate a new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# 2. Update in ALL THREE places:
#    - Vercel Env Vars (Production + Preview)
#    - GitHub Actions Repository Secrets
#    - Local .env.local
# 3. Redeploy Vercel — every session now invalidated. Customers must re-verify.
```

**SUPABASE_SERVICE_ROLE_KEY compromised:**
1. Supabase Dashboard → Project Settings → API → **Regenerate service_role key**
2. Update the new key in Vercel + GitHub Actions + `.env.local`
3. Redeploy Vercel
4. Old key is dead. Anyone who scraped it now has nothing.

**Admin password suspected shared:**
1. Reset per §7 with a new bcrypt hash
2. Optional: pair with a JWT_SECRET rotation if severe (invalidates all admin sessions too)

---

## 10. Backup procedure

**Automatic (Supabase-managed):**
- Free tier: daily, retained 7 days
- Pro tier: point-in-time recovery
- Verify: Supabase Dashboard → Database → Backups

**Manual dump (before risky operation):**
```bash
# Get connection string from Supabase Dashboard → Project Settings → Database
pg_dump "postgresql://postgres:<password>@db.xxx.supabase.co:5432/postgres" \
  --schema=public --data-only --no-owner \
  > backup-$(date +%Y%m%d-%H%M%S).sql
```
Store locally + optionally upload to a separate cloud drive.

**Restore:**
```bash
psql "postgresql://..." < backup-YYYYMMDD-HHMMSS.sql
```
Or use Supabase's UI restore (Dashboard → Database → Backups → Restore).

---

## 11. Common admin tasks

**Reset a customer to first-verify state:**
```sql
update access_codes
set is_used = false, device_id = null, used_at = null
where code = 'EASE-XXXX-XXXX';
delete from customer_sessions where code = 'EASE-XXXX-XXXX';
```
Their progress data stays — only re-verify is required.

**Extend a customer's access:**
```sql
update access_codes
set expires_at = expires_at + interval '30 days'
where code = 'EASE-XXXX-XXXX';
```

**Bulk expire codes on a date:**
```sql
update access_codes
set expires_at = '2027-01-01'::timestamptz
where customer_name in ('Nanay Rosa', 'Tatay Ben');
```

**Manually add an audit-log entry:**
```sql
insert into admin_audit_log (admin_username, action, target_code, metadata)
values ('admin', 'manual_cleanup', 'EASE-XXXX-XXXX',
  jsonb_build_object('reason', 'customer requested reset', 'ticket', 'DM-2026-07-14'));
```

---

## 12. Monitoring steps (daily)

1. Open Vercel dashboard → verify Deployments status is green
2. Open Sentry (once activated) → check for new issues
3. `/admin` → check "Needs Attention" panel — codes near expiry, unverified codes
4. `/admin/audit-log` → confirm activity matches what admin/coach did today
5. Uptime monitor → confirm 100 % this week

If anything odd, dig via §3-§9 above.

---

## 13. When to escalate

Escalate to a senior engineer (or open a Supabase support ticket) if:
- Data corruption spanning > 1 customer with no clear cause
- 5xx rate > 5 % and rollback doesn't fix it
- Supabase reports "database unreachable" for > 15 minutes
- Suspected active attack in progress (unusual traffic patterns, mass 401s from one IP)

Supabase support: https://supabase.com/dashboard (bottom-right chat button)
Vercel support: https://vercel.com/help
