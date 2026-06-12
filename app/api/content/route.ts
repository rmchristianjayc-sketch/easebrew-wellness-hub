import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// ============================================================
// PUBLIC CONTENT ENDPOINT — walang login required
// Ginagamit ng customer-facing pages (hub, verify) para
// makuha ang promo announcement, product info, order links,
// at coach info na na-edit ng admin sa /admin/content
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

  // Order links — tier-based keys (verify page Gifts tab)
  'order_url_399',
  'order_url_699',
  'order_url_999',
  'order_url_1499',
  'order_url_2998',
  'order_url_4497',
  'order_url_5996',
  'order_url_7499',
  'order_url_8994',
  'order_url_11992',
  'order_url_14990',

  // Coach info (hub page + verify page coach modal)
  'coach_1_name', 'coach_1_number', 'coach_1_display', 'coach_1_facebook', 'coach_1_photo',
  'coach_2_name', 'coach_2_number', 'coach_2_display', 'coach_2_facebook', 'coach_2_photo',
  'coach_3_name', 'coach_3_number', 'coach_3_display', 'coach_3_facebook', 'coach_3_photo',
  'coach_4_name', 'coach_4_number', 'coach_4_display', 'coach_4_facebook', 'coach_4_photo',
  'coach_5_name', 'coach_5_number', 'coach_5_display', 'coach_5_facebook', 'coach_5_photo',
  'coach_6_name', 'coach_6_number', 'coach_6_display', 'coach_6_facebook', 'coach_6_photo',
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