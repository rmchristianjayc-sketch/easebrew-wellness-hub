import { NextRequest, NextResponse } from 'next/server';
import { verifyCustomerToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { MINIMUM_TIER_BY_TYPE } from '@/lib/tierGates';

async function getAuthorizedSession(req: NextRequest, type: string) {
  const session = await verifyCustomerToken(req);
  if (!session) return null;

  const { data, error } = await supabaseAdmin
    .from('access_codes')
    .select('is_used, expires_at, device_id, tier')
    .eq('code', session.code)
    .maybeSingle();

  if (
    error ||
    data?.is_used !== true ||
    data.device_id !== session.device_id ||
    typeof data.expires_at !== 'string' ||
    new Date(data.expires_at).getTime() <= Date.now()
  ) {
    return null;
  }

  // Tier gate uses the DB tier (source of truth), not the token — so an
  // admin-side tier upgrade takes effect immediately and doesn't silently
  // fail all writes until the session cookie is refreshed.
  const minimumTier = MINIMUM_TIER_BY_TYPE[type];
  if (!minimumTier || data.tier < minimumTier) return null;

  return { ...session, tier: data.tier };
}

export async function GET(req: NextRequest) {
  try {
    const type = new URL(req.url).searchParams.get('type') ?? '';
    const session = await getAuthorizedSession(req, type);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('progress')
      .select('data, updated_at')
      .eq('code', session.code)
      .eq('type', type)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch progress.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data?.data ?? null,
      updated_at: data?.updated_at ?? null,
    });
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = typeof body.type === 'string' ? body.type : '';
    const session = await getAuthorizedSession(req, type);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    if (body.data === undefined) {
      return NextResponse.json({ error: 'data is required.' }, { status: 400 });
    }
    if (JSON.stringify(body.data).length > 100_000) {
      return NextResponse.json({ error: 'Progress data is too large.' }, { status: 413 });
    }

    const { error } = await supabaseAdmin
      .from('progress')
      .upsert(
        {
          code: session.code,
          type,
          data: body.data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'code,type' }
      );

    if (error) {
      return NextResponse.json({ error: 'Failed to save progress.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
}
