import { NextRequest, NextResponse } from 'next/server';
import { setCustomerSessionCookie, type CustomerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

function normalizeCode(value: unknown) {
  if (typeof value !== 'string' || value.length > 20) return null;
  const stripped = value.replace(/[-\s]/g, '').toUpperCase();
  if (!/^EASE[A-Z0-9]{8}$/.test(stripped)) return null;
  return `${stripped.slice(0, 4)}-${stripped.slice(4, 8)}-${stripped.slice(8)}`;
}

const DEVICE_ID_RE = /^dev_[0-9a-f]{32}$/;
function isValidDeviceId(value: unknown): value is string {
  return typeof value === 'string' && DEVICE_ID_RE.test(value);
}

const VERIFY_MAX_ATTEMPTS = 10;
const VERIFY_WINDOW_MINUTES = 15;

function getVerifyIp(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwardedFor || req.headers.get('x-real-ip') || 'unknown';
}

async function isVerifyRateLimited(ip: string, deviceId: string) {
  const windowStart = new Date(Date.now() - VERIFY_WINDOW_MINUTES * 60 * 1000).toISOString();
  const identifier = `${ip}:${deviceId}`;
  const { count, error } = await supabaseAdmin
    .from('admin_login_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('identifier', `verify:${identifier}`)
    .gt('attempted_at', windowStart);
  if (error) return false;
  return (count ?? 0) >= VERIFY_MAX_ATTEMPTS;
}

async function recordVerifyAttempt(ip: string, deviceId: string) {
  await supabaseAdmin
    .from('admin_login_attempts')
    .insert({ identifier: `verify:${ip}:${deviceId}` });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = normalizeCode(body.code);
    const deviceId = body.device_id;

    if (!code || !isValidDeviceId(deviceId)) {
      return NextResponse.json(
        { error: 'A valid code and device ID are required.' },
        { status: 400 }
      );
    }

    const ip = getVerifyIp(req);
    if (await isVerifyRateLimited(ip, deviceId)) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }
    await recordVerifyAttempt(ip, deviceId);

    const { data: accessCode, error: fetchError } = await supabaseAdmin
      .from('access_codes')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Unable to verify the code right now. Please try again.' },
        { status: 500 }
      );
    }
    if (!accessCode) {
      return NextResponse.json(
        { error: 'Invalid code. Please check and try again.' },
        { status: 404 }
      );
    }

    const expired =
      typeof accessCode.expires_at === 'string' &&
      new Date(accessCode.expires_at).getTime() <= Date.now();
    if (expired) {
      await supabaseAdmin
        .from('customer_sessions')
        .delete()
        .eq('code', code)
        .eq('device_id', deviceId);
      return NextResponse.json(
        { error: 'This code has expired or has been deactivated. Please order again to get a new code.' },
        { status: 403 }
      );
    }

    if (accessCode.is_used && accessCode.device_id !== deviceId) {
      return NextResponse.json(
        { error: 'This code has already been used on another device.' },
        { status: 403 }
      );
    }

    if (accessCode.is_used) {
      const { data: existingSession, error: sessionError } = await supabaseAdmin
        .from('customer_sessions')
        .select('*')
        .eq('code', code)
        .eq('device_id', deviceId)
        .maybeSingle();

      if (sessionError) {
        return NextResponse.json({ error: 'Failed to restore session.' }, { status: 500 });
      }

      const session: CustomerSession = existingSession ?? {
        code,
        device_id: deviceId,
        tier: accessCode.tier,
        packs: accessCode.packs,
        expires_at: accessCode.expires_at,
      };
      if (!session.expires_at) {
        return NextResponse.json({ error: 'This code has no valid expiry.' }, { status: 403 });
      }

      if (existingSession) {
        await supabaseAdmin
          .from('customer_sessions')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', existingSession.id);
      } else {
        const now = new Date().toISOString();
        const { error: restoreError } = await supabaseAdmin
          .from('customer_sessions')
          .insert({
            code_id: accessCode.id,
            ...session,
            activated_at: accessCode.used_at ?? now,
            last_seen_at: now,
          });
        if (restoreError) {
          return NextResponse.json({ error: 'Failed to restore session.' }, { status: 500 });
        }
      }

      const response = NextResponse.json({ success: true, session });
      await setCustomerSessionCookie(response, session);
      return response;
    }

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + accessCode.validity_days);

    const { data: claimedCode, error: claimError } = await supabaseAdmin
      .from('access_codes')
      .update({
        is_used: true,
        used_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        device_id: deviceId,
      })
      .eq('id', accessCode.id)
      .eq('is_used', false)
      .select('id')
      .maybeSingle();

    if (claimError) {
      return NextResponse.json({ error: 'Failed to activate code.' }, { status: 500 });
    }
    if (!claimedCode) {
      return NextResponse.json(
        { error: 'This code was just activated on another device. Please try again.' },
        { status: 409 }
      );
    }

    const session: CustomerSession = {
      code,
      device_id: deviceId,
      tier: accessCode.tier,
      packs: accessCode.packs,
      expires_at: expiresAt.toISOString(),
    };
    const { error: sessionError } = await supabaseAdmin
      .from('customer_sessions')
      .insert({
        code_id: accessCode.id,
        ...session,
        activated_at: now.toISOString(),
        last_seen_at: now.toISOString(),
      });

    if (sessionError) {
      const { error: rollbackError } = await supabaseAdmin
        .from('access_codes')
        .update({ is_used: false, used_at: null, expires_at: null, device_id: null })
        .eq('id', accessCode.id)
        .eq('device_id', deviceId);

      return NextResponse.json(
        {
          error: rollbackError
            ? 'There was a problem activating your code. Your code is locked. Please contact your coach for help.'
            : 'Could not activate the code. Please try again.',
        },
        { status: 500 }
      );
    }

    await supabaseAdmin.from('activity_logs').insert({
      device_id: deviceId,
      action: 'code_verified',
      metadata: { code, tier: accessCode.tier, packs: accessCode.packs },
    });

    const response = NextResponse.json({ success: true, session });
    await setCustomerSessionCookie(response, session);
    return response;
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
