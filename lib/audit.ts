import { supabaseAdmin } from '@/lib/supabase';

export type AuditAction =
  | 'generate_code'
  | 'deactivate_code'
  | 'reactivate_code'
  | 'delete_code'
  | 'update_code_notes'
  | 'update_content'
  | 'delete_content'
  | 'admin_login'
  | 'admin_login_failed';

export async function writeAuditLog(opts: {
  admin_username: string;
  action: AuditAction;
  target_id?: string;
  target_code?: string;
  metadata?: Record<string, unknown>;
}) {
  await supabaseAdmin.from('admin_audit_log').insert({
    admin_username: opts.admin_username,
    action:         opts.action,
    target_id:      opts.target_id  ?? null,
    target_code:    opts.target_code ?? null,
    metadata:       opts.metadata   ?? null,
  });
  // Fire-and-forget — never let audit failure block the real response
}
