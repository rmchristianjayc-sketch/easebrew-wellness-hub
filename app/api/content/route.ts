import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { PUBLIC_CONTENT_KEYS } from '@/lib/contentKeys';

// ============================================================
// PUBLIC CONTENT ENDPOINT — walang login required
// Ginagamit ng customer-facing pages (hub, verify) para
// makuha ang promo announcement, product info, order links,
// coach info, hero text, tips, FAQs, testimonials, at videos
//
// IMPORTANT: GET lang ito, read-only. Limited lang sa
// keys na safe makita ng customers (whitelist below).
// ============================================================

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('content')
      .select('key, value')
      .in('key', PUBLIC_CONTENT_KEYS);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch content.' }, { status: 500 });
    }

    // Convert array → simple key-value map para madaling gamitin sa frontend
    const map: Record<string, string> = {};
    (data || []).forEach((row) => {
      map[row.key] = row.value;
    });

    const res = NextResponse.json({ success: true, content: map });
    res.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return res;

  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
