import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// ============================================================
// PUBLIC CONTENT ENDPOINT — walang login required
// Ginagamit ng customer-facing pages (hub, verify) para
// makuha ang promo announcement, product info, at order links
// na na-edit ng admin sa /admin/content
//
// IMPORTANT: GET lang ito, read-only. Limited lang sa
// keys na safe makita ng customers (whitelist below).
// ============================================================

const PUBLIC_KEYS = [
  // Promo banner
  'promo_enabled',
  'promo_text',

  // Product names + descriptions (hub page + verify page gifts)
  'product_1_name', 'product_1_desc',
  'product_2_name', 'product_2_desc',
  'product_3_name', 'product_3_desc',
  'product_4_name', 'product_4_desc',
  'product_5_name', 'product_5_desc',
  'product_6_name', 'product_6_desc',

  // Order links (verify page Gifts tab — "Mag-order" buttons)
  'order_url_1',
  'order_url_2',
  'order_url_3',
  'order_url_4',
  'order_url_5',
  'order_url_6',
];

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('content')
      .select('key, value')
      .in('key', PUBLIC_KEYS);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch content.' }, { status: 500 });
    }

    // Convert array → simple key-value map para madaling gamitin sa frontend
    const map: Record<string, string> = {};
    (data || []).forEach((row) => {
      map[row.key] = row.value;
    });

    return NextResponse.json({ success: true, content: map });

  } catch (err) {
    console.error('Public content fetch error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}