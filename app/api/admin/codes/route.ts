import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

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

    // Enrich with last tracker activity
    let enriched = data || [];
    const usedCodes = enriched.filter(c => c.is_used).map(c => c.code);
    if (usedCodes.length > 0) {
      const { data: progressData } = await supabaseAdmin
        .from('progress')
        .select('code, updated_at')
        .in('code', usedCodes)
        .eq('type', 'tracker');
      const actMap = new Map(progressData?.map((p: { code: string; updated_at: string }) => [p.code, p.updated_at]) ?? []);
      enriched = enriched.map(c => ({ ...c, last_active_at: actMap.get(c.code) ?? null }));
    }
    return NextResponse.json({ success: true, codes: enriched });

  } catch {
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

    const body = await req.json();
    const { id, action } = body;
    if (!id || !['deactivate', 'reactivate', 'update_notes'].includes(action)) {
      return NextResponse.json({ error: 'ID and action are required.' }, { status: 400 });
    }

    if (action === 'update_notes') {
      const notes = typeof body.notes === 'string' ? body.notes.slice(0, 500) : '';
      let query = supabaseAdmin.from('access_codes').update({ notes }).eq('id', id);
      if (admin.role === 'coach') query = query.eq('created_by', admin.username);
      const { error } = await query;
      if (error) return NextResponse.json({ error: 'Failed to update notes.' }, { status: 500 });
      writeAuditLog({ admin_username: admin.username, action: 'update_code_notes', target_id: id });
      return NextResponse.json({ success: true });
    }

    if (admin.role === 'coach' && action === 'reactivate') {
      return NextResponse.json(
        { error: 'Unauthorized. Ang reactivation ay para sa owner lang.' },
        { status: 403 }
      );
    }

    if (action === 'deactivate') {
      let query = supabaseAdmin
        .from('access_codes')
        .update({ expires_at: new Date().toISOString() })
        .eq('id', id);
      if (admin.role === 'coach') {
        query = query.eq('created_by', admin.username);
      }
      const { data, error } = await query.select('id, code').maybeSingle();
      if (error) return NextResponse.json({ error: 'Failed to deactivate code.' }, { status: 500 });
      if (!data) {
        return NextResponse.json(
          { error: 'Code not found or not allowed for this account.' },
          { status: 404 }
        );
      }
      writeAuditLog({ admin_username: admin.username, action: 'deactivate_code', target_id: id, target_code: (data as { code?: string }).code });
    }

    if (action === 'reactivate') {
      const { data, error } = await supabaseAdmin
        .from('access_codes')
        .update({ is_used: false, used_at: null, expires_at: null, device_id: null })
        .eq('id', id)
        .select('id, code')
        .maybeSingle();
      if (error) return NextResponse.json({ error: 'Failed to reactivate code.' }, { status: 500 });
      if (!data) {
        return NextResponse.json({ error: 'Code not found.' }, { status: 404 });
      }
      writeAuditLog({ admin_username: admin.username, action: 'reactivate_code', target_id: id, target_code: (data as { code?: string }).code });
    }

    return NextResponse.json({ success: true });

  } catch {
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
      return NextResponse.json({ error: 'Failed to delete code.' }, { status: 500 });
    }

    // ✅ STEP 3: Delete orphaned progress rows (Bug #6 fix)
    const { error: progressError } = await supabaseAdmin
      .from('progress')
      .delete()
      .eq('code', codeRow.code);

    if (progressError) {
      return NextResponse.json({ error: 'Failed to delete code.' }, { status: 500 });
    }

    // ✅ STEP 4: Delete the code itself
    const { error } = await supabaseAdmin
      .from('access_codes')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete code.' }, { status: 500 });
    }

    writeAuditLog({ admin_username: admin.username, action: 'delete_code', target_id: id, target_code: codeRow.code });
    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
