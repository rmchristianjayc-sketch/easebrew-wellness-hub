import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// ============================================================
// PROGRESS API — para sa Exercise, Meal Plan, at Tracker
// GET  /api/progress?type=exercise|mealplan|tracker
// POST /api/progress  body: { type, data }
// Auth: eb_session cookie (same pattern ng customer pages)
// ============================================================

function getSession(req: NextRequest) {
  const cookie = req.cookies.get('eb_session')?.value;
  if (!cookie) return null;
  try {
    const s = JSON.parse(decodeURIComponent(cookie));
    if (!s?.code || !s?.expires_at) return null;
    if (new Date(s.expires_at) < new Date()) return null;
    return s as { code: string; tier: number; expires_at: string };
  } catch {
    return null;
  }
}

// ── GET — kunin ang progress ng isang type ─────────────────
export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const type = new URL(req.url).searchParams.get('type');
  if (!type) return NextResponse.json({ error: 'type is required.' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('progress')
    .select('data, updated_at')
    .eq('code', session.code)
    .eq('type', type)
    .maybeSingle();

  if (error) return NextResponse.json({ error: 'Failed to fetch progress.' }, { status: 500 });

  return NextResponse.json({ success: true, data: data?.data ?? null, updated_at: data?.updated_at ?? null });
}

// ── POST — i-save/update ang progress ─────────────────────
export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const body = await req.json();
  const { type, data } = body;

  if (!type || data === undefined) {
    return NextResponse.json({ error: 'type and data are required.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('progress')
    .upsert(
      { code: session.code, type, data, updated_at: new Date().toISOString() },
      { onConflict: 'code,type' }
    );

  if (error) return NextResponse.json({ error: 'Failed to save progress.' }, { status: 500 });

  return NextResponse.json({ success: true });
}