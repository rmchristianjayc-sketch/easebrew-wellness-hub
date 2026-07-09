import { compare } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { clearAdminSessionCookie, setAdminSessionCookie } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { writeAuditLog } from '@/lib/audit';

const MAX_ATTEMPTS = 8;
const WINDOW_MINUTES = 15;
// Precomputed dummy hash (bcrypt cost 10) so timing is constant when username doesn't exist.
const DUMMY_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8UjZQtG2gLh8H9Xn5eZbXeZbXeZbXe';

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

async function isRateLimited(identifier: string) {
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
  const { count, error } = await supabaseAdmin
    .from('admin_login_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('identifier', identifier)
    .gt('attempted_at', windowStart);

  if (error) return false;
  return (count ?? 0) >= MAX_ATTEMPTS;
}

async function recordAttempt(identifier: string) {
  await supabaseAdmin.from('admin_login_attempts').insert({ identifier });
}

async function clearAttempts(identifier: string) {
  await supabaseAdmin.from('admin_login_attempts').delete().eq('identifier', identifier);
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
    throw new Error('Admin login lookup failed.');
  }

  return isLoginAdminUser(data) ? data : null;
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const rateLimitKey = getRateLimitKey(req, username);
    const normalizedUsername = normalizeUsername(username);

    if (
      !normalizedUsername ||
      normalizedUsername.length > 64 ||
      typeof password !== 'string' ||
      password.length > 256
    ) {
      return NextResponse.json(
        { error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    if (await isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    await recordAttempt(rateLimitKey);

    const adminUser = await findAdminUser(normalizedUsername);
    // Always run bcrypt.compare to prevent username enumeration via timing.
    const hashToCheck = adminUser?.is_active === true ? adminUser.password_hash : DUMMY_HASH;
    const passwordMatches = await compare(password, hashToCheck);
    const isValidPassword = passwordMatches && adminUser?.is_active === true;

    if (!adminUser || !isValidPassword) {
      await writeAuditLog({ admin_username: normalizedUsername, action: 'admin_login_failed' });
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    await clearAttempts(rateLimitKey);
    await writeAuditLog({ admin_username: adminUser.username, action: 'admin_login' });
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
  } catch {
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
