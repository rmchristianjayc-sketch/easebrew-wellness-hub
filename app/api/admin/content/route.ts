import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { supabaseAdmin } from '@/lib/supabase';

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_SECRET!);

// Verify admin token helper
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

// GET — fetch all content
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyToken(req);
    if (!admin || admin.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('content')
      .select('*')
      .order('key', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch content.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, content: data });

  } catch (err) {
    console.error('Fetch content error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

// POST — update content
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyToken(req);
    if (!admin || admin.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { key, value } = await req.json();

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('content')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
        updated_by: admin.username,
      }, { onConflict: 'key' })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update content.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, content: data });

  } catch (err) {
    console.error('Update content error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

// DELETE — delete content key
export async function DELETE(req: NextRequest) {
  try {
    const admin = await verifyToken(req);
    if (!admin || admin.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { key } = await req.json();

    if (!key) {
      return NextResponse.json({ error: 'Key is required.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('content')
      .delete()
      .eq('key', key);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete content.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('Delete content error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}