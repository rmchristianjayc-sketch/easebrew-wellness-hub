import { NextRequest, NextResponse } from 'next/server';
import {
  clearCustomerSessionCookie,
  setCustomerSessionCookie,
  verifyCustomerToken,
} from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const session = await verifyCustomerToken(req);
  if (!session) {
    const response = NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    clearCustomerSessionCookie(response);
    return response;
  }

  const { data, error } = await supabaseAdmin
    .from('access_codes')
    .select('code, tier, packs, expires_at, device_id, is_used, used_at')
    .eq('code', session.code)
    .maybeSingle();

  if (error) {
    const response = NextResponse.json({ error: 'Session expired or deactivated.' }, { status: 401 });
    clearCustomerSessionCookie(response);
    return response;
  }

  const isValid =
    data?.is_used === true &&
    data.device_id === session.device_id &&
    typeof data.expires_at === 'string' &&
    new Date(data.expires_at).getTime() > Date.now();

  if (!isValid) {
    const response = NextResponse.json(
      { error: 'Session expired or deactivated.' },
      { status: 401 }
    );
    clearCustomerSessionCookie(response);
    return response;
  }

  const freshSession = {
    code: data.code,
    tier: data.tier,
    packs: data.packs,
    expires_at: data.expires_at,
    device_id: data.device_id,
    activated_at: data.used_at ?? undefined,
  };
  const response = NextResponse.json({ success: true, session: freshSession });
  await setCustomerSessionCookie(response, freshSession);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  clearCustomerSessionCookie(response);
  return response;
}
