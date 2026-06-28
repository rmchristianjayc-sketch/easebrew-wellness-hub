import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyToken(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const code = new URL(req.url).searchParams.get('code');
    if (!code) return NextResponse.json({ error: 'code is required.' }, { status: 400 });

    // Verify the code exists (coaches can only see their own codes)
    const codeQuery = supabaseAdmin
      .from('access_codes')
      .select('*')
      .eq('code', code)
      .maybeSingle();
    const { data: codeData, error: codeErr } = await codeQuery;
    if (codeErr || !codeData) return NextResponse.json({ error: 'Code not found.' }, { status: 404 });
    if (admin.role === 'coach' && codeData.created_by !== admin.username) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    // Fetch all progress types
    const { data: progressRows } = await supabaseAdmin
      .from('progress')
      .select('type, data, updated_at')
      .eq('code', code);

    const progress: Record<string, { data: unknown; updated_at: string }> = {};
    for (const row of progressRows || []) {
      progress[row.type] = { data: row.data, updated_at: row.updated_at };
    }

    return NextResponse.json({ success: true, code: codeData, progress });
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
