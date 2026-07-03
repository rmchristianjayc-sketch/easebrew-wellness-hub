export const PUBLIC_CONTENT_KEYS = [
  'promo_enabled',
  'promo_text',
  'notification_active',
  'notification_title',
  'notification_message',
  'hero_title',
  'hero_subtitle',
  'product_1_name', 'product_1_desc',
  'product_2_name', 'product_2_desc',
  'product_3_name', 'product_3_desc',
  'product_4_name', 'product_4_desc',
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
  'coach_1_name', 'coach_1_number', 'coach_1_display', 'coach_1_facebook', 'coach_1_photo',
  'coach_2_name', 'coach_2_number', 'coach_2_display', 'coach_2_facebook', 'coach_2_photo',
  'coach_3_name', 'coach_3_number', 'coach_3_display', 'coach_3_facebook', 'coach_3_photo',
  'coach_4_name', 'coach_4_number', 'coach_4_display', 'coach_4_facebook', 'coach_4_photo',
  'coach_5_name', 'coach_5_number', 'coach_5_display', 'coach_5_facebook', 'coach_5_photo',
  'coach_6_name', 'coach_6_number', 'coach_6_display', 'coach_6_facebook', 'coach_6_photo',
  'daily_tip_1', 'daily_tip_2', 'daily_tip_3', 'daily_tip_4',
  'daily_tip_5', 'daily_tip_6', 'daily_tip_7', 'daily_tip_8',
  'faq_1_q', 'faq_1_a',
  'faq_2_q', 'faq_2_a',
  'faq_3_q', 'faq_3_a',
  'faq_4_q', 'faq_4_a',
  'faq_5_q', 'faq_5_a',
  'faq_6_q', 'faq_6_a',
  'faq_7_q', 'faq_7_a',
  'testimonial_1_name', 'testimonial_1_age', 'testimonial_1_location',
  'testimonial_1_quote', 'testimonial_1_pain_before', 'testimonial_1_pain_after',
  'testimonial_2_name', 'testimonial_2_age', 'testimonial_2_location',
  'testimonial_2_quote', 'testimonial_2_pain_before', 'testimonial_2_pain_after',
  'testimonial_3_name', 'testimonial_3_age', 'testimonial_3_location',
  'testimonial_3_quote', 'testimonial_3_pain_before', 'testimonial_3_pain_after',
  'video_1_title', 'video_1_desc', 'video_1_url',
  'video_2_title', 'video_2_desc', 'video_2_url',
  'video_3_title', 'video_3_desc', 'video_3_url',
] as const;

export const PUBLIC_CONTENT_KEY_SET = new Set<string>(PUBLIC_CONTENT_KEYS);

const HTTP_URL_KEYS = [
  /^order_url_\d+$/,
  /^coach_\d+_facebook$/,
  /^video_\d+_url$/,
];

const PHOTO_KEYS = [/^coach_\d+_photo$/];

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function isSafeLocalPath(value: string) {
  return (
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('\\') &&
    !value.includes('..') &&
    /\.(avif|gif|jpe?g|png|webp)$/i.test(value)
  );
}

export function validateContentUpdate(key: string, value: string) {
  if (!PUBLIC_CONTENT_KEY_SET.has(key)) {
    return 'Unknown content key.';
  }

  if (value.length > 10000) {
    return 'Content value is too long.';
  }

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (HTTP_URL_KEYS.some((pattern) => pattern.test(key)) && !isHttpUrl(trimmed)) {
    return 'URL fields must use http or https URLs.';
  }

  if (
    PHOTO_KEYS.some((pattern) => pattern.test(key)) &&
    !isSafeLocalPath(trimmed) &&
    !isHttpUrl(trimmed)
  ) {
    return 'Photo fields must use a safe local image path or http/https URL.';
  }

  return null;
}
