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
      .select('customer_name, expires_at')
      .eq('code', session.code)
      .maybeSingle();

    const ownerName = codeRow?.customer_name || 'Customer';
    const token = await createFamilyShareToken(session.code, ownerName);

    // Effective expiry the client should display = min(token TTL, code TTL).
    // Token TTL is 7 days from now; the family route also enforces the
    // code's expires_at, so if the pack expires sooner the link stops
    // working then — the client should not promise more than that.
    const tokenExpiry = Date.now() + 7 * 86400_000;
    const codeExpiry = codeRow?.expires_at
      ? new Date(codeRow.expires_at).getTime()
      : Number.POSITIVE_INFINITY;
    const effectiveExpiry = new Date(Math.min(tokenExpiry, codeExpiry)).toISOString();

    return NextResponse.json({ success: true, token, expiresAt: effectiveExpiry });
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
