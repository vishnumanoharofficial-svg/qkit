import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';
import { createSessionToken, COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/auth/session';

const SECRET = process.env.NEXTAUTH_SECRET ?? 'qkit-otp-secret';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, otp, challengeToken } = await req.json();
    const cleanEmail = String(email ?? '').trim().toLowerCase();

    if (!cleanEmail.includes('@') || !otp || String(otp).length !== 6) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Read the OTP challenge from request body (sent by client)
    const challenge = challengeToken as string | undefined;
    if (!challenge) {
      return NextResponse.json(
        { error: 'OTP session missing. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Verify signature
    const dot     = challenge.lastIndexOf('.');
    const payload = challenge.slice(0, dot);
    const sig     = challenge.slice(dot + 1);
    const expected = createHmac('sha256', SECRET).update(payload).digest('base64url');

    if (sig !== expected) {
      return NextResponse.json({ error: 'Invalid OTP challenge.' }, { status: 400 });
    }

    // Decode payload: email:otp:expiry
    const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
    const [storedEmail, storedOtp, expiryStr] = decoded.split(':');

    // Check email matches
    if (storedEmail !== cleanEmail) {
      return NextResponse.json({ error: 'Email mismatch.' }, { status: 400 });
    }

    // Check OTP matches
    if (storedOtp !== String(otp)) {
      return NextResponse.json({ error: 'Incorrect OTP. Please try again.' }, { status: 400 });
    }

    // Check not expired
    if (Date.now() > Number(expiryStr)) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // OTP verified ✅ — find or create user in app_users
    let { data: user } = await supabase
      .from('app_users')
      .select('*')
      .eq('phone', cleanEmail)
      .maybeSingle();

    if (!user) {
      const { data: newUser, error: createErr } = await supabase
        .from('app_users')
        .insert({ phone: cleanEmail })
        .select('*')
        .single();

      if (createErr || !newUser) {
        // app_users table may not exist — still log user in with email only
        console.warn('[verify-otp] Could not create user in app_users:', createErr?.message);
        // Fallback: use email as userId so login still works
        const fallbackToken = createSessionToken({
          userId: cleanEmail,
          phone:  cleanEmail,
        });
        const res = NextResponse.json({ success: true, isNew: true });
        res.cookies.set(COOKIE_NAME, fallbackToken, {
          httpOnly: true,
          secure:   process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge:   COOKIE_MAX_AGE,
          path:     '/',
        });
        res.cookies.set('otp_challenge', '', { maxAge: 0, path: '/' });
        return res;      }
      user = newUser;
    }

    // Issue session cookie
    const token = createSessionToken({
      userId: user.id,
      phone:  cleanEmail,
      name:   user.name ?? undefined,
    });

    const response = NextResponse.json({ success: true, isNew: !user.name });

    // Set session cookie
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   COOKIE_MAX_AGE,
      path:     '/',
    });

    // Clear OTP challenge cookie
    response.cookies.set('otp_challenge', '', { maxAge: 0, path: '/' });

    return response;

  } catch (err) {
    console.error('[verify-otp] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
