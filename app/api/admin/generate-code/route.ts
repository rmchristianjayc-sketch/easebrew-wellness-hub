import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { supabaseAdmin, PRICE_CONFIG } from '@/lib/supabase';

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

// ✅ POST — generate code lang, GET ay nasa codes/route.ts na
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyToken(req);
    if (!admin) {
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
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save code: ' + insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, code: newCode });

  } catch (err) {
    console.error('Generate code error:', err);
    return NextResponse.json({ error: 'Something went wrong: ' + String(err) }, { status: 500 });
  }
}