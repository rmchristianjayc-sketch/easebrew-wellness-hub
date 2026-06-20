import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

// ✅ GET — coach makakakita ng sariling codes lang, owner makakakita ng lahat
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyToken(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all';
    const requestedLimit = Number.parseInt(searchParams.get('limit') || '50', 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 500)
      : 50;

    let query = supabaseAdmin
      .from('access_codes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (admin.role === 'coach') {
      query = query.eq('created_by', admin.username);
    }

    if (filter === 'used')   query = query.eq('is_used', true);
    if (filter === 'unused') query = query.eq('is_used', false);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: 'Failed to fetch codes.' }, { status: 500 });

    return NextResponse.json({ success: true, codes: data || [] });

  } catch (err) {
    console.error('Fetch codes error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

// ✅ PATCH — coach pwede lang mag-deactivate, hindi pwedeng mag-reactivate
export async function PATCH(req: NextRequest) {
  try {
    const admin = await verifyToken(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id, action } = await req.json();
    if (!id || !['deactivate', 'reactivate'].includes(action)) {
      return NextResponse.json({ error: 'ID and action are required.' }, { status: 400 });
    }

    if (admin.role === 'coach' && action === 'reactivate') {
      return NextResponse.json(
        { error: 'Unauthorized. Ang reactivation ay para sa owner lang.' },
        { status: 403 }
      );
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

// ✅ DELETE — owner lang ang pwedeng mag-delete permanently
export async function DELETE(req: NextRequest) {
  try {
    const admin = await verifyToken(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    if (admin.role === 'coach') {
      return NextResponse.json(
        { error: 'Unauthorized. Ang permanent deletion ay para sa owner lang.' },
        { status: 403 }
      );
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'ID is required.' }, { status: 400 });
    }

    // ✅ STEP 1: I-fetch muna ang code value (kailangan para sa progress delete)
    const { data: codeRow, error: fetchError } = await supabaseAdmin
      .from('access_codes')
      .select('code')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !codeRow) {
      return NextResponse.json({ error: 'Code not found.' }, { status: 404 });
    }

    // ✅ STEP 2: Delete related sessions (FK constraint)
    const { error: sessionsError } = await supabaseAdmin
      .from('customer_sessions')
      .delete()
      .eq('code_id', id);

    if (sessionsError) {
      return NextResponse.json(
        { error: `Failed to delete related sessions: ${sessionsError.message}` },
        { status: 500 }
      );
    }

    // ✅ STEP 3: Delete orphaned progress rows (Bug #6 fix)
    const { error: progressError } = await supabaseAdmin
      .from('progress')
      .delete()
      .eq('code', codeRow.code);

    if (progressError) {
      return NextResponse.json(
        { error: `Failed to delete related progress: ${progressError.message}` },
        { status: 500 }
      );
    }

    // ✅ STEP 4: Delete the code itself
    const { error } = await supabaseAdmin
      .from('access_codes')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete code: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('Delete code error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
