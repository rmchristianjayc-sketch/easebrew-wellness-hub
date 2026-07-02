import { createClient } from '@supabase/supabase-js';

const required = {
  NEXT_PUBLIC_SUPABASE_URL:  process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  JWT_SECRET:                process.env.JWT_SECRET,
};
const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

// Server-only client (service-role). All DB writes go through this.
// Never import into a client component — bundler will try to expose
// the service role key to the browser.
export const supabaseAdmin = createClient(
  required.NEXT_PUBLIC_SUPABASE_URL!,
  required.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export type AccessCode = {
  id: string;
  code: string;
  tier: number;
  packs: number;
  validity_days: number;
  is_used: boolean;
  used_at: string | null;
  expires_at: string | null;
  device_id: string | null;
  created_by: string;
  customer_name: string | null;
  notes: string | null;
  created_at: string;
  last_active_at?: string | null;
};
