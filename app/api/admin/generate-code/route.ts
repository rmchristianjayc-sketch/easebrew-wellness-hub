import { NextRequest, NextResponse } from 'next/server';
import { randomInt } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { PRICE_CONFIG } from '@/lib/price-config';
import { verifyToken } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const pick = () => chars[randomInt(chars.length)];
  const part1 = Array.from({ length: 4 }, pick).join('');
  const part2 = Array.from({ length: 4 }, pick).join('');
  return `EASE-${part1}-${part2}`;
}

function isDuplicateCodeError(error: { code?: string } | null) {
  return error?.code === '23505';
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
    const customerName =
      typeof customer_name === 'string' ? customer_name.trim().slice(0, 120) : '';
    const safeNotes =
      typeof notes === 'string' ? notes.trim().slice(0, 1000) : '';

    if (!customerName) {
      return NextResponse.json({ error: 'Customer name is required.' }, { status: 400 });
    }

    for (let attempt = 0; attempt < 10; attempt++) {
      const { data: newCode, error: insertError } = await supabaseAdmin
        .from('access_codes')
        .insert({
          code: generateCode(),
          tier: tierNum,
          packs: config.packs,
          validity_days: config.validityDays,
          is_used: false,
          created_by: admin.username,
          customer_name: customerName || null,
          notes: safeNotes || null,
        })
        .select()
        .single();

      if (!insertError) {
        writeAuditLog({
          admin_username: admin.username,
          action: 'generate_code',
          target_id: newCode.id,
          target_code: newCode.code,
          metadata: { tier: tierNum, customer_name: customerName, notes: safeNotes || null },
        });
        return NextResponse.json({ success: true, code: newCode });
      }

      if (!isDuplicateCodeError(insertError)) {
        return NextResponse.json({ error: 'Failed to save code.' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Failed to generate unique code.' }, { status: 500 });

  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
