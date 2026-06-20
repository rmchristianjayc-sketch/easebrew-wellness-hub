import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { clearAdminSessionCookie, setAdminSessionCookie } from '@/lib/auth';

const OWNER_SECRET = process.env.ADMIN_SECRET;
const COACH_SECRET = process.env.COACH_SECRET;
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

const attempts = new Map<string, { count: number; resetAt: number }>();

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

function safeEquals(value: unknown, expected: string | undefined) {
  if (typeof value !== 'string' || !expected) return false;
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);
  if (valueBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(valueBuffer, expectedBuffer);
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    const rateLimitKey = getRateLimitKey(req, username);

    if (!username || !password) {
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

    let role: 'owner' | 'coach' | null = null;
    if (username === 'admin' && safeEquals(password, OWNER_SECRET)) {
      role = 'owner';
    } else if (username === 'coach' && safeEquals(password, COACH_SECRET)) {
      role = 'coach';
    }

    if (!role) {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    attempts.delete(rateLimitKey);
    const response = NextResponse.json({ success: true, role, username });
    await setAdminSessionCookie(response, { username, role });
    return response;
  } catch (err) {
    console.error('Admin login error:', err);
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
