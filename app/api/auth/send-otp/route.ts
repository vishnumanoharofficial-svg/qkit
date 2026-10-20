import { NextRequest, NextResponse } from 'next/server';
import { randomInt, createHmac, createHash } from 'crypto';

const SECRET = process.env.NEXTAUTH_SECRET ?? 'qkit-otp-secret';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const cleanEmail = String(email ?? '').trim().toLowerCase();

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp     = String(randomInt(100000, 999999));
    const expiry  = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Sign the OTP challenge: base64url(email:otp:expiry) + HMAC
    const payload = Buffer.from(`${cleanEmail}:${otp}:${expiry}`).toString('base64url');
    const sig     = createHmac('sha256', SECRET).update(payload).digest('base64url');
    const challenge = `${payload}.${sig}`;

    // Send OTP email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json(
        { error: 'Email provider not configured. Add RESEND_API_KEY to Vercel env vars.' },
        { status: 500 }
      );
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
            <div style="background:#059669;width:48px;height:48px;border-radius:12px;margin-bottom:24px;display:inline-flex;align-items:center;justify-content:center">
              <span style="color:white;font-size:22px;font-weight:900;padding:0 10px;line-height:48px">q</span>
            </div>
            <h2 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 8px 0">Your qkit login code</h2>
            <p style="color:#64748b;font-size:15px;margin:0 0 24px 0">Enter this code on the login page. It expires in <strong>10 minutes</strong>.</p>
            <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:16px;padding:24px;text-align:center;margin-bottom:24px">
              <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#059669;font-family:monospace">${otp}</span>
            </div>
            <p style="color:#94a3b8;font-size:13px;margin:0">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      }),
    });

    const emailData = await emailRes.json() as { id?: string; name?: string; message?: string };

    if (!emailRes.ok) {
      console.error('[send-otp] Resend error:', emailData);
      return NextResponse.json(
        { error: `Email failed: ${emailData.message ?? emailData.name ?? 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Store challenge in a signed httpOnly cookie (no DB table needed)
    const response = NextResponse.json({ success: true });
    response.cookies.set('otp_challenge', challenge, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   10 * 60, // 10 minutes
      path:     '/',
    });

    return response;

  } catch (err) {
    console.error('[send-otp] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
