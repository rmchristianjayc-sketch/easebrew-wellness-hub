import { compare } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { clearAdminSessionCookie, setAdminSessionCookie } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

const attempts = new Map<string, { count: number; resetAt: number }>();
type AdminRole = 'owner' | 'coach';
type LoginAdminUser = {
  username: string;
  role: AdminRole;
  password_hash: string;
  is_active: boolean;
};

function getRateLimitKey(req: NextRequest, username: unknown) {
  const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwardedFor || req.headers.get('x-real-ip') || 'unknown';
  return `${ip}:${typeof username === 'string' ? username.toLowerCase() : 'unknown'}`;
}

function isRateLimited(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 0, resetAt: now + WINDOW_MS });
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  attempts.set(key, { ...entry, count: entry.count + 1 });
}

function normalizeUsername(username: unknown) {
  return typeof username === 'string' ? username.trim().toLowerCase() : '';
}

function isAdminRole(role: unknown): role is AdminRole {
  return role === 'owner' || role === 'coach';
}

function isLoginAdminUser(value: unknown): value is LoginAdminUser {
  if (typeof value !== 'object' || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.username === 'string' &&
    isAdminRole(row.role) &&
    typeof row.password_hash === 'string' &&
    typeof row.is_active === 'boolean'
  );
}

async function findAdminUser(username: string) {
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('username, role, password_hash, is_active')
    .eq('username_normalized', username)
    .maybeSingle();

  if (error) {
    console.error('Admin user lookup error:', JSON.stringify(error));
    throw new Error('Admin login lookup failed.');
  }

  return isLoginAdminUser(data) ? data : null;
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const rateLimitKey = getRateLimitKey(req, username);
    const normalizedUsername = normalizeUsername(username);

    if (!normalizedUsername || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const adminUser = await findAdminUser(normalizedUsername);
    const isValidPassword =
      adminUser?.is_active === true
        ? await compare(password, adminUser.password_hash)
        : false;

    if (!adminUser || !isValidPassword) {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    attempts.delete(rateLimitKey);
    const response = NextResponse.json({
      success: true,
      role: adminUser.role,
      username: adminUser.username,
    });
    await setAdminSessionCookie(response, {
      username: adminUser.username,
      role: adminUser.role,
    });
    return response;
  } catch (err) {
    console.error('Admin login error:', String(err));
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  clearAdminSessionCookie(response);
  return response;
}
