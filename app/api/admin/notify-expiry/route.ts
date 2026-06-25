import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  // Vercel cron passes Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.get('authorization');
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return NextResponse.json({ error: 'ADMIN_EMAIL not configured' }, { status: 500 });
  }

  const now = new Date();
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { data: codes, error } = await supabaseAdmin
    .from('access_codes')
    .select('code, customer_name, tier, packs, expires_at, notes')
    .eq('is_used', true)
    .gte('expires_at', now.toISOString())
    .lte('expires_at', in7days.toISOString())
    .order('expires_at', { ascending: true });

  if (error) {
    console.error('Expiry check error:', error);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }

  if (!codes || codes.length === 0) {
    return NextResponse.json({ message: 'No expiring codes today', count: 0 });
  }

  const rows = codes.map(c => {
    const daysLeft = Math.ceil((new Date(c.expires_at).getTime() - now.getTime()) / 86400000);
    const urgentColor = daysLeft <= 3 ? '#dc2626' : '#b45309';
    return `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-weight:bold;">${c.customer_name || 'Unknown'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-family:monospace;color:#39613B;">${c.code}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">₱${c.tier?.toLocaleString()} · ${c.packs}pk</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-weight:bold;color:${urgentColor};">${daysLeft} araw</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">${new Date(c.expires_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
      </tr>`;
  }).join('');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://easebrew-wellness-hub.vercel.app';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;">
      <div style="background:#39613B;padding:24px;border-radius:12px 12px 0 0;">
        <h1 style="color:#FED255;margin:0;font-size:22px;">⚠️ EaseBrew — ${codes.length} Customer${codes.length > 1 ? 's' : ''} Expiring Soon</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Mag-send ng re-order reminder sa mga customers na ito ngayon!</p>
      </div>
      <div style="background:white;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 12px 12px;padding:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f8f8f8;">
              <th style="text-align:left;padding:10px 12px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Customer</th>
              <th style="text-align:left;padding:10px 12px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Code</th>
              <th style="text-align:left;padding:10px 12px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Package</th>
              <th style="text-align:left;padding:10px 12px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Days Left</th>
              <th style="text-align:left;padding:10px 12px;font-size:11px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Expires</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="margin-top:24px;text-align:center;">
          <a href="${siteUrl}/admin/codes" style="background:#39613B;color:white;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:bold;font-size:15px;display:inline-block;">
            Open Admin → Access Codes →
          </a>
        </div>
        <p style="color:#999;font-size:12px;margin-top:24px;text-align:center;">
          R&M EaseBrew Wellness Hub — Automated Daily Alert
        </p>
      </div>
    </div>`;

  const { error: emailError } = await resend.emails.send({
    from: 'EaseBrew Alerts <onboarding@resend.dev>',
    to: adminEmail,
    subject: `⚠️ ${codes.length} EaseBrew Customer${codes.length > 1 ? 's' : ''} Expiring in 7 Days`,
    html,
  });

  if (emailError) {
    console.error('Email send error:', emailError);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  return NextResponse.json({ success: true, sent: codes.length });
}
