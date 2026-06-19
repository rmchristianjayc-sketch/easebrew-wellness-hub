import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// ============================================================
// PUBLIC CONTENT ENDPOINT — walang login required
// Ginagamit ng customer-facing pages (hub, verify) para
// makuha ang promo announcement, product info, order links,
// coach info, hero text, tips, FAQs, testimonials, at videos
//
// IMPORTANT: GET lang ito, read-only. Limited lang sa
// keys na safe makita ng customers (whitelist below).
// ============================================================

const PUBLIC_KEYS = [
  // Promo banner
  'promo_enabled',
  'promo_text',

  // Hero (hub page)
  'hero_title',
  'hero_subtitle',

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

  // Wellness tips (hub page Tips tab)
  'daily_tip_1', 'daily_tip_2', 'daily_tip_3', 'daily_tip_4',
  'daily_tip_5', 'daily_tip_6', 'daily_tip_7', 'daily_tip_8',

  // FAQs (hub page Tips tab)
  'faq_1_q', 'faq_1_a',
  'faq_2_q', 'faq_2_a',
  'faq_3_q', 'faq_3_a',
  'faq_4_q', 'faq_4_a',
  'faq_5_q', 'faq_5_a',
  'faq_6_q', 'faq_6_a',
  'faq_7_q', 'faq_7_a',

  // Testimonials (hub page Tips tab)
  'testimonial_1_name', 'testimonial_1_age', 'testimonial_1_location',
  'testimonial_1_quote', 'testimonial_1_pain_before', 'testimonial_1_pain_after',
  'testimonial_2_name', 'testimonial_2_age', 'testimonial_2_location',
  'testimonial_2_quote', 'testimonial_2_pain_before', 'testimonial_2_pain_after',
  'testimonial_3_name', 'testimonial_3_age', 'testimonial_3_location',
  'testimonial_3_quote', 'testimonial_3_pain_before', 'testimonial_3_pain_after',

  // Videos (hub page Gifts tab)
  'video_1_title', 'video_1_desc', 'video_1_url',
  'video_2_title', 'video_2_desc', 'video_2_url',
  'video_3_title', 'video_3_desc', 'video_3_url',
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