import { NextRequest, NextResponse } from 'next/server';
import { JWTPayload, SignJWT, jwtVerify } from 'jose';
import { supabaseAdmin } from '@/lib/supabase';

function encodeSecret(secret: string) {
  return new TextEncoder().encode(secret);
}

function getSigningSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured.');
  return encodeSecret(secret);
}

function getVerificationSecrets() {
  const secrets = [process.env.JWT_SECRET].filter(
    (s): s is string => Boolean(s)
  );
  if (secrets.length === 0) throw new Error('JWT_SECRET is not configured.');
  return secrets.map(encodeSecret);
}

async function verifySignedToken(token: string) {
  const secrets = getVerificationSecrets();
  if (secrets.length === 0) throw new Error('JWT_SECRET or ADMIN_SECRET is not configured.');

  for (const secret of secrets) {
    try {
      return await jwtVerify(token, secret);
    } catch {}
  }

  throw new Error('Invalid token.');
}

export type AdminPayload = {
  username: string;
  role: 'owner' | 'coach';
};

export type CustomerSession = {
  code: string;
  tier: number;
  packs: number;
  expires_at: string;
  device_id: string;
};

function isValidAdminPayload(payload: unknown): payload is AdminPayload {
  if (typeof payload !== 'object' || payload === null) return false;
  const value = payload as Record<string, unknown>;
  return (
    typeof value.username === 'string' &&
    value.username.length > 0 &&
    (value.role === 'owner' || value.role === 'coach')
  );
}

async function getActiveAdminPayload(payload: AdminPayload): Promise<AdminPayload | null> {
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('username, role, is_active')
    .eq('username_normalized', payload.username.trim().toLowerCase())
    .maybeSingle();

  if (error) {
    console.error('Admin session lookup error:', error);
    return null;
  }

  if (
    !data ||
    data.is_active !== true ||
    typeof data.username !== 'string' ||
    (data.role !== 'owner' && data.role !== 'coach')
  ) {
    return null;
  }

  return {
    username: data.username,
    role: data.role,
  };
}

function isValidCustomerSession(
  payload: JWTPayload
): payload is JWTPayload & CustomerSession {
  return (
    typeof payload.code === 'string' &&
    payload.code.length > 0 &&
    typeof payload.tier === 'number' &&
    typeof payload.packs === 'number' &&
    typeof payload.expires_at === 'string' &&
    !Number.isNaN(Date.parse(payload.expires_at)) &&
    typeof payload.device_id === 'string' &&
    payload.device_id.length > 0
  );
}

export async function verifyToken(req: NextRequest): Promise<AdminPayload | null> {
  const token = req.cookies.get('eb_admin_token')?.value;
  if (!token) return null;

  try {
    const { payload } = await verifySignedToken(token);
    return isValidAdminPayload(payload) ? await getActiveAdminPayload(payload) : null;
  } catch {
    return null;
  }
}

export async function createAdminToken(payload: AdminPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSigningSecret());
}

export async function setAdminSessionCookie(
  response: NextResponse,
  payload: AdminPayload
) {
  response.cookies.set('eb_admin_token', await createAdminToken(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24,
    path: '/',
  });
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set('eb_admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/',
  });
}

export async function createCustomerToken(session: CustomerSession) {
  const expiresAt = Math.floor(new Date(session.expires_at).getTime() / 1000);
  return new SignJWT({ ...session, kind: 'customer' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSigningSecret());
}

export async function verifyCustomerToken(
  req: NextRequest
): Promise<CustomerSession | null> {
  const token = req.cookies.get('eb_session')?.value;
  if (!token) return null;

  try {
    const { payload } = await verifySignedToken(token);
    if (payload.kind !== 'customer' || !isValidCustomerSession(payload)) return null;
    if (new Date(payload.expires_at).getTime() <= Date.now()) return null;

    return {
      code: payload.code,
      tier: payload.tier,
      packs: payload.packs,
      expires_at: payload.expires_at,
      device_id: payload.device_id,
    };
  } catch {
    return null;
  }
}

export async function setCustomerSessionCookie(
  response: NextResponse,
  session: CustomerSession
) {
  response.cookies.set('eb_session', await createCustomerToken(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(session.expires_at),
    path: '/',
  });
}

export function clearCustomerSessionCookie(response: NextResponse) {
  response.cookies.set('eb_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/',
  });
}
