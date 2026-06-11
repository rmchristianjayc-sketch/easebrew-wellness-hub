import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { supabaseAdmin } from '@/lib/supabase';

const PRICE_CONFIG: Record<number, { packs: number; validityDays: number; label: string }> = {
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

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_SECRET!);

async function verifyToken(req: NextRequest) {
  const token = req.cookies.get('eb_admin_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { username: string; role: 'owner' | 'coach' };
  } catch {
    return null;
  }
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `EASE-${part1}-${part2}`;
}

// POST — generate a new code (Coach and Owner only)
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyToken(req);

    // ✅ FIXED — Coach AND Owner lang makakagenerate
    if (!admin || (admin.role !== 'coach' && admin.role !== 'owner')) {
      return NextResponse.json({ error: 'Unauthorized. Please login again.' }, { status: 401 });
    }

    const body = await req.json();
    const { tier, customer_name, notes } = body;

    const tierNum = Number(tier);
    if (!tierNum || !PRICE_CONFIG[tierNum]) {
      return NextResponse.json({ error: 'Invalid tier selected.' }, { status: 400 });
    }

    const config = PRICE_CONFIG[tierNum];

    let code = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      code = generateCode();
      const { data } = await supabaseAdmin
        .from('access_codes')
        .select('id')
        .eq('code', code)
        .maybeSingle();
      if (!data) isUnique = true;
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json({ error: 'Failed to generate unique code.' }, { status: 500 });
    }

    const { data: newCode, error: insertError } = await supabaseAdmin
      .from('access_codes')
      .insert({
        code,
        tier: tierNum,
        packs: config.packs,
        validity_days: config.validityDays,
        is_used: false,
        created_by: admin.username,
        customer_name: customer_name || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: 'Failed to save code: ' + insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, code: newCode });

  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong: ' + String(err) }, { status: 500 });
  }
}

// GET — fetch all codes (Owner only)
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyToken(req);
    if (!admin || admin.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabaseAdmin
      .from('access_codes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (filter === 'used') query = query.eq('is_used', true);
    if (filter === 'unused') query = query.eq('is_used', false);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch codes.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, codes: data });

  } catch (err) {
    console.error('Fetch codes error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}