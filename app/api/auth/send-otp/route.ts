import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomInt, createHash } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    const clean = String(phone ?? '').replace(/\D/g, '');

    if (clean.length !== 10) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    const fullPhone = `+91${clean}`;

    // Generate 6-digit OTP
    const otp     = String(randomInt(100000, 999999));
    const otpHash = createHash('sha256')
      .update(otp + (process.env.NEXTAUTH_SECRET ?? 'qkit'))
      .digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

    // Remove any old OTPs for this phone, insert fresh one
    await supabase.from('otp_codes').delete().eq('phone', fullPhone);
    const { error: dbError } = await supabase.from('otp_codes').insert({
      phone:     fullPhone,
      code_hash: otpHash,
      expires_at: expiresAt,
      used:      false,
    });

    if (dbError) {
      console.error('[send-otp] DB error:', dbError);
      return NextResponse.json({ error: 'Could not store OTP' }, { status: 500 });
    }

    // Send SMS via 2factor.in
    const apiKey = process.env.TWOFACTOR_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'SMS provider not configured' }, { status: 500 });
    }

    const smsRes  = await fetch(
      `https://2factor.in/API/V1/${apiKey}/SMS/${clean}/${otp}/AUTOGEN`
    );
    const smsData = await smsRes.json() as { Status: string; Details: string };

    if (smsData.Status !== 'Success') {
      console.error('[send-otp] 2factor error:', smsData);
      return NextResponse.json(
        { error: `SMS failed: ${smsData.Details ?? 'Unknown error'}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[send-otp] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
