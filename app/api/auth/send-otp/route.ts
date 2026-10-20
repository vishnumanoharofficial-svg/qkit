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

    // Send OTP email via Brevo (formerly Sendinblue)
    const brevoKey   = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL; // your verified sender email
    if (!brevoKey || !senderEmail) {
      return NextResponse.json(
        { error: 'Email provider not configured. Add BREVO_API_KEY and BREVO_SENDER_EMAIL to Vercel env vars.' },
        { status: 500 }
      );
    }

    const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key':      brevoKey,
        'Content-Type': 'application/json',
        'Accept':       'application/json',
      },
      body: JSON.stringify({
        sender:      { name: 'qkit', email: senderEmail },
        to:          [{ email: cleanEmail }],
        subject:     `${otp} is your qkit login code`,
        htmlContent: `
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

    const emailData = await emailRes.json() as { messageId?: string; code?: string; message?: string };

    if (!emailRes.ok) {
      console.error('[send-otp] Brevo error:', emailData);
      return NextResponse.json(
        { error: `Email failed: ${emailData.message ?? 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Return challenge token in response body (client stores in state — no cookie issues)
    return NextResponse.json({ success: true, challengeToken: challenge });

  } catch (err) {
    console.error('[send-otp] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
