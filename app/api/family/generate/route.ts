import { NextRequest, NextResponse } from 'next/server';
import { verifyCustomerToken, createFamilyShareToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const session = await verifyCustomerToken(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Pull customer_name from access_codes for personalized header
    const { data: codeRow } = await supabaseAdmin
      .from('access_codes')
      .select('customer_name')
      .eq('code', session.code)
      .maybeSingle();

    const ownerName = codeRow?.customer_name || 'Customer';
    const token = await createFamilyShareToken(session.code, ownerName);
    return NextResponse.json({ success: true, token });
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
