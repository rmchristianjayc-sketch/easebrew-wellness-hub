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
// PRICING CONFIG — 1 pack = 10 sachets = 5 days (2x per day)
// ============================================================

export const PRICE_CONFIG: Record<number, { packs: number; validityDays: number; label: string }> = {
  399:   { packs: 1,  validityDays: 5,   label: '1 Pack — ₱399' },
  699:   { packs: 2,  validityDays: 10,  label: '2 Packs — ₱699' },
  999:   { packs: 3,  validityDays: 15,  label: '3 Packs — ₱999' },
  1499:  { packs: 5,  validityDays: 25,  label: '5 Packs — ₱1,499' },
  2998:  { packs: 10, validityDays: 50,  label: '10 Packs — ₱2,998' },
  4497:  { packs: 15, validityDays: 75,  label: '15 Packs — ₱4,497' },
  5996:  { packs: 20, validityDays: 100, label: '20 Packs — ₱5,996' },
  7499:  { packs: 25, validityDays: 125, label: '25 Packs — ₱7,499' },
  8994:  { packs: 30, validityDays: 150, label: '30 Packs — ₱8,994' },
  11992: { packs: 40, validityDays: 200, label: '40 Packs — ₱11,992' },
  14990: { packs: 50, validityDays: 250, label: '50 Packs — ₱14,990' },
};

// ============================================================
// HELPER — Generate unique device ID
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

// ============================================================
// HELPER — Get session from localStorage
// ============================================================

export function getLocalSession(): CustomerSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('eb_session');
  if (!raw) return null;
  try {
    const session: CustomerSession = JSON.parse(raw);
    if (new Date(session.expires_at) < new Date()) {
      localStorage.removeItem('eb_session');
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

// ============================================================
// HELPER — Save session to localStorage
// ============================================================

export function saveLocalSession(session: CustomerSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('eb_session', JSON.stringify(session));
}

// ============================================================
// HELPER — Clear session
// ============================================================

export function clearLocalSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('eb_session');
  localStorage.removeItem('eb_device_id');
}