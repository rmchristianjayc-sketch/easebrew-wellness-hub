import { NextRequest, NextResponse } from 'next/server';
import { verifyFamilyShareToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const payload = await verifyFamilyShareToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired share link.' }, { status: 404 });
    }

    // Ensure the underlying access code is still active — if the coach
    // deactivated it, or the pack has expired, refuse even if the share
    // token itself is still within its 7-day window.
    const { data: codeRow } = await supabaseAdmin
      .from('access_codes')
      .select('is_used, expires_at')
      .eq('code', payload.code)
      .maybeSingle();
    if (!codeRow || !codeRow.is_used || !codeRow.expires_at ||
        new Date(codeRow.expires_at).getTime() <= Date.now()) {
      return NextResponse.json({ error: 'Share link is no longer available.' }, { status: 410 });
    }

    // Only return safe subset: tracker + BP summary, no medications, no medical card details
    const { data: progressRows } = await supabaseAdmin
      .from('progress')
      .select('type, data, updated_at')
      .eq('code', payload.code)
      .in('type', ['tracker', 'blood_pressure']);

    const progress: Record<string, { data: unknown; updated_at: string }> = {};
    for (const row of progressRows || []) {
      progress[row.type] = { data: row.data, updated_at: row.updated_at };
    }

    return NextResponse.json({
      success: true,
      name: payload.name,
      progress,
    });
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
