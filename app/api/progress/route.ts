import { NextRequest, NextResponse } from 'next/server';
import { verifyCustomerToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

const MINIMUM_TIER_BY_TYPE: Record<string, number> = {
  tracker: 399,
  mealplan: 1499,
  exercise: 1499,
  recipe_favorites: 2998,
  bagong_katawan: 4497,
  water: 399,
};

async function getAuthorizedSession(req: NextRequest, type: string) {
  const session = await verifyCustomerToken(req);
  const minimumTier = MINIMUM_TIER_BY_TYPE[type];
  if (!session || !minimumTier || session.tier < minimumTier) return null;

  const { data, error } = await supabaseAdmin
    .from('access_codes')
    .select('is_used, expires_at, device_id, tier')
    .eq('code', session.code)
    .maybeSingle();

  if (
    error ||
    data?.is_used !== true ||
    data.device_id !== session.device_id ||
    data.tier !== session.tier ||
    typeof data.expires_at !== 'string' ||
    new Date(data.expires_at).getTime() <= Date.now()
  ) {
    return null;
  }

  return session;
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
