import { createClient } from '@supabase/supabase-js';

const required = {
  NEXT_PUBLIC_SUPABASE_URL:      process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY:     process.env.SUPABASE_SERVICE_ROLE_KEY,
  JWT_SECRET:                    process.env.JWT_SECRET,
};
const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const supabaseUrl = required.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = required.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = required.SUPABASE_SERVICE_ROLE_KEY!;

// Public client — for customer-facing pages
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client — for API routes only (server-side)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ============================================================
// TYPES
// ============================================================

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

export type CustomerSession = {
  id: string;
  code_id: string;
  code: string;
  device_id: string;
  tier: number;
  packs: number;
  activated_at: string;
  expires_at: string;
  last_seen_at: string;
};

export type PushSubscription = {
  id: string;
  device_id: string;
  subscription_json: object;
  tier: number | null;
  created_at: string;
};

export type Content = {
  id: string;
  key: string;
  value: string;
  updated_at: string;
  updated_by: string;
};

export type AdminUser = {
  id: string;
  username: string;
  username_normalized: string;
  role: 'owner' | 'coach';
  password_hash: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};


