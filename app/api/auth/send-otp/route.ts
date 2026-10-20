import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomInt, createHash } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const cleanEmail = String(email ?? '').trim().toLowerCase();

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp     = String(randomInt(100000, 999999));
    const otpHash = createHash('sha256')
      .update(otp + (process.env.NEXTAUTH_SECRET ?? 'qkit'))
      .digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

    // Remove old OTPs for this email, store fresh one
    await supabase.from('otp_codes').delete().eq('phone', cleanEmail);
    const { error: dbError } = await supabase.from('otp_codes').insert({
      phone:      cleanEmail,   // reusing 'phone' column to store email
      code_hash:  otpHash,
      expires_at: expiresAt,
      used:       false,
    });

    if (dbError) {
      console.error('[send-otp] DB error:', dbError);
      return NextResponse.json({ error: 'Could not store OTP. Make sure the otp_codes table exists in Supabase.' }, { status: 500 });
    }

    // Send OTP email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ error: 'Email provider not configured (RESEND_API_KEY missing)' }, { status: 500 });
    }

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    'qkit <onboarding@resend.dev>',
        to:      [cleanEmail],
        subject: `${otp} is your qkit login code`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
            <div style="background:#059669;width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:24px">
              <span style="color:white;font-size:24px;font-weight:bold;line-height:48px;padding:0 12px">q</span>
            </div>
            <h2 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 8px">Your qkit login code</h2>
            <p style="color:#64748b;font-size:15px;margin:0 0 24px">Use this 6-digit code to sign in. It expires in 10 minutes.</p>
            <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px">
              <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#059669">${otp}</span>
            </div>
            <p style="color:#94a3b8;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      }),
    });

    const emailData = await emailRes.json() as { id?: string; error?: string };

    if (!emailRes.ok) {
      console.error('[send-otp] Resend error:', emailData);
      return NextResponse.json({ error: `Email failed: ${emailData.error ?? 'Unknown error'}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[send-otp] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
