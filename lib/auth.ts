import { NextRequest, NextResponse } from 'next/server';
import { JWTPayload, SignJWT, jwtVerify } from 'jose';

function getSecret() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error('ADMIN_SECRET is not configured.');
  return new TextEncoder().encode(secret);
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
    const { payload } = await jwtVerify(token, getSecret());
    return isValidAdminPayload(payload) ? payload : null;
  } catch {
    return null;
  }
}

export async function createCustomerToken(session: CustomerSession) {
  const expiresAt = Math.floor(new Date(session.expires_at).getTime() / 1000);
  return new SignJWT({ ...session, kind: 'customer' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecret());
}

export async function verifyCustomerToken(
  req: NextRequest
): Promise<CustomerSession | null> {
  const token = req.cookies.get('eb_session')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
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
