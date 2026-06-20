import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
  role: 'owner' | 'coach';
  created_at: string;
};

// ============================================================
// HELPER — Generate unique device ID
// ✅ Ginagamit pa rin sa verify/page.tsx at bagong-katawan/page.tsx
// ============================================================

export function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('eb_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('eb_device_id', id);
  }
  return id;
}