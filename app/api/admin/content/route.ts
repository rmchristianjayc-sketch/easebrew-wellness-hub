import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { PUBLIC_CONTENT_KEY_SET, PUBLIC_CONTENT_KEYS, validateContentUpdate } from '@/lib/contentKeys';
import { writeAuditLog } from '@/lib/audit';

// ── GET — returns editable public content rows only ─────────────────────────
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
      .in('key', PUBLIC_CONTENT_KEYS)
      .order('key', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch content.' }, { status: 500 });
    }

    const map: Record<string, string> = {};
    (data || []).forEach((row) => {
      map[row.key] = row.value;
    });

    return NextResponse.json({ success: true, content: map });

  } catch {
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
      if (
        typeof entry.key !== 'string' ||
        entry.key.trim() === '' ||
        typeof entry.value !== 'string'
      ) {
        return NextResponse.json(
          { error: 'Each update must have a valid key and text value.' },
          { status: 400 }
        );
      }

      const validationError = validateContentUpdate(entry.key.trim(), entry.value);
      if (validationError) {
        return NextResponse.json(
          { error: `${entry.key}: ${validationError}` },
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
      return NextResponse.json({ error: 'Failed to save content.' }, { status: 500 });
    }

    writeAuditLog({
      admin_username: admin.username,
      action: 'update_content',
      metadata: { keys: rows.map((r) => r.key) },
    });
    return NextResponse.json({ success: true, saved: rows.length });

  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

// ── DELETE — remove a content row so it falls back to the default ────────────
// Body: { key: string }
export async function DELETE(req: NextRequest) {
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
    const key = typeof body?.key === 'string' ? body.key.trim() : '';

    if (!key || !PUBLIC_CONTENT_KEY_SET.has(key)) {
      return NextResponse.json({ error: 'Invalid or unknown content key.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('content')
      .delete()
      .eq('key', key);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete content.' }, { status: 500 });
    }

    writeAuditLog({ admin_username: admin.username, action: 'delete_content', metadata: { key } });
    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
