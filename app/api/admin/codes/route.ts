import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { supabaseAdmin } from '@/lib/supabase';

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

// Helper — checks if a code belongs to the given coach (based on notes prefix "[CoachName] ...")
function isOwnedByCoach(code: any, username: string) {
  if (!code?.notes) return false;
  // notes format: "[Coach Rai] some note"
  const match = code.notes.match(/^\[(.+?)\]/);
  if (!match) return false;
  const noteCoach = match[1].trim().toLowerCase();
  return noteCoach === username.trim().toLowerCase();
}

// GET — fetch all codes with filters (owner: all, coach: own only)
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyToken(req);
    if (!admin) {
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

    let codes = data || [];

    // Coach can only see codes they generated
    if (admin.role === 'coach') {
      codes = codes.filter(c => isOwnedByCoach(c, admin.username));
    }

    return NextResponse.json({ success: true, codes });

  } catch (err) {
    console.error('Fetch codes error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

// PATCH — deactivate or reactivate a code
export async function PATCH(req: NextRequest) {
  try {
    const admin = await verifyToken(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id, action } = await req.json();

    if (!id || !action) {
      return NextResponse.json({ error: 'ID and action are required.' }, { status: 400 });
    }

    // If coach, verify ownership first
    if (admin.role !== 'owner') {
      const { data: existing, error: fetchErr } = await supabaseAdmin
        .from('access_codes')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !existing) {
        return NextResponse.json({ error: 'Code not found.' }, { status: 404 });
      }
      if (!isOwnedByCoach(existing, admin.username)) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
      }
    }

    if (action === 'deactivate') {
      const { error } = await supabaseAdmin
        .from('access_codes')
        .update({ expires_at: new Date().toISOString() })
        .eq('id', id);
      if (error) return NextResponse.json({ error: 'Failed to deactivate code.' }, { status: 500 });
    }

    if (action === 'reactivate') {
      const { error } = await supabaseAdmin
        .from('access_codes')
        .update({ is_used: false, used_at: null, expires_at: null, device_id: null })
        .eq('id', id);
      if (error) return NextResponse.json({ error: 'Failed to reactivate code.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('Update code error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

// DELETE — delete a code permanently (owner: any code, coach: own codes only)
export async function DELETE(req: NextRequest) {
  try {
    const admin = await verifyToken(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required.' }, { status: 400 });
    }

    // If coach, verify ownership before deleting
    if (admin.role !== 'owner') {
      const { data: existing, error: fetchErr } = await supabaseAdmin
        .from('access_codes')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !existing) {
        return NextResponse.json({ error: 'Code not found.' }, { status: 404 });
      }
      if (!isOwnedByCoach(existing, admin.username)) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
      }
    }

    const { error } = await supabaseAdmin
      .from('access_codes')
      .delete()
      .eq('id', id);

    if (error) return NextResponse.json({ error: 'Failed to delete code.' }, { status: 500 });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('Delete code error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}