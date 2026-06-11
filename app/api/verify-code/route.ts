import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { code, device_id } = await req.json();

    if (!code || !device_id) {
      return NextResponse.json(
        { error: 'Code and device ID are required.' },
        { status: 400 }
      );
    }

    // ✅ FIXED — i-format ng may dash: EASE-XXXX-XXXX para match sa Supabase
    const stripped = code.replace(/[-\s]/g, "").toUpperCase().slice(0, 12);
    const cleanCode = `${stripped.slice(0,4)}-${stripped.slice(4,8)}-${stripped.slice(8,12)}`;
    console.log('🔍 Searching for code:', cleanCode);

    // Check if code exists
    const { data: accessCode, error: fetchError } = await supabaseAdmin
      .from('access_codes')
      .select('*')
      .eq('code', cleanCode)
      .single();

    if (fetchError || !accessCode) {
      console.error('❌ Fetch error:', JSON.stringify(fetchError));
      console.log('❌ accessCode result:', accessCode);
      return NextResponse.json(
        { error: 'Invalid code. Please check and try again.' },
        { status: 404 }
      );
    }

    console.log('✅ Code found:', accessCode.code, '| is_used:', accessCode.is_used);

    // Check if already used by a different device
    if (accessCode.is_used && accessCode.device_id !== device_id) {
      return NextResponse.json(
        { error: 'This code has already been used on another device.' },
        { status: 403 }
      );
    }

    // Check if expired
    if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This code has expired. Please order again to get a new code.' },
        { status: 403 }
      );
    }

    // If same device is re-verifying — return existing session
    if (accessCode.is_used && accessCode.device_id === device_id) {
      const { data: existingSession } = await supabaseAdmin
        .from('customer_sessions')
        .select('*')
        .eq('code', cleanCode)
        .eq('device_id', device_id)
        .single();

      if (existingSession) {
        await supabaseAdmin
          .from('customer_sessions')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', existingSession.id);

        return NextResponse.json({ success: true, session: existingSession });
      }
    }

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + accessCode.validity_days);

    // Mark code as used
    const { error: updateError } = await supabaseAdmin
      .from('access_codes')
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        device_id,
      })
      .eq('id', accessCode.id);

    if (updateError) {
      console.error('❌ Update error:', JSON.stringify(updateError));
    }

    // Create session
    const sessionData = {
      code_id: accessCode.id,
      code: cleanCode,
      device_id,
      tier: accessCode.tier,
      packs: accessCode.packs,
      activated_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      last_seen_at: new Date().toISOString(),
    };

    console.log('📝 Creating session:', sessionData);

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('customer_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (sessionError) {
      console.error('❌ Session error:', JSON.stringify(sessionError));
      return NextResponse.json(
        { error: 'Failed to create session. Please try again.' },
        { status: 500 }
      );
    }

    // Log activity
    await supabaseAdmin.from('activity_logs').insert({
      device_id,
      action: 'code_verified',
      metadata: { code: cleanCode, tier: accessCode.tier, packs: accessCode.packs },
    });

    console.log('🎉 Session created successfully!');
    return NextResponse.json({ success: true, session });

  } catch (err) {
    console.error('Verify code error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}