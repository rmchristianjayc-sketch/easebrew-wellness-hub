import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { supabaseAdmin } from '@/lib/supabase';

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_SECRET!);

// ── AUTH HELPER (copied from api/admin/codes/route.ts pattern) ──────────────
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

// ── GET — returns ALL content rows (admin-only, no key whitelist) ────────────
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyToken(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Only owner can access/edit content
    if (admin.role !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden. Content management is for owner only.' },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('content')
      .select('key, value, updated_by, updated_at')
      .order('key', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch content.' }, { status: 500 });
    }

    const map: Record<string, string> = {};
    (data || []).forEach((row) => {
      map[row.key] = row.value;
    });

    return NextResponse.json({ success: true, content: map });

  } catch (err) {
    console.error('Admin content GET error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

// ── POST — upsert one or many content key/value pairs ───────────────────────
// Body: { updates: { key: string; value: string }[] }
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyToken(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    if (admin.role !== 'owner') {
      return NextResponse.json(
        { error: 'Forbidden. Content management is for owner only.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updates: { key: string; value: string }[] = body?.updates;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. Provide updates: [{ key, value }].' },
        { status: 400 }
      );
    }

    // Validate each entry
    for (const entry of updates) {
      if (typeof entry.key !== 'string' || entry.key.trim() === '') {
        return NextResponse.json(
          { error: 'Each update must have a non-empty key.' },
          { status: 400 }
        );
      }
    }

    const now = new Date().toISOString();

    const rows = updates.map((entry) => ({
      key:        entry.key.trim(),
      value:      entry.value ?? '',
      updated_by: admin.username,
      updated_at: now,
    }));

    // upsert: insert or update on conflict of `key`
    const { error } = await supabaseAdmin
      .from('content')
      .upsert(rows, { onConflict: 'key' });

    if (error) {
      console.error('Content upsert error:', error);
      return NextResponse.json({ error: 'Failed to save content.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, saved: rows.length });

  } catch (err) {
    console.error('Admin content POST error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}