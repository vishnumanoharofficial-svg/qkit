import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { createSessionToken, COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/auth/session';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();
    const clean = String(phone ?? '').replace(/\D/g, '');

    if (clean.length !== 10 || !otp || String(otp).length !== 6) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const fullPhone = `+91${clean}`;
    const otpHash   = createHash('sha256')
      .update(String(otp) + (process.env.NEXTAUTH_SECRET ?? 'qkit'))
      .digest('hex');

    // Verify OTP from DB
    const { data: otpRecord, error: otpErr } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', fullPhone)
      .eq('code_hash', otpHash)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle();

    if (otpErr || !otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP. Please try again.' }, { status: 400 });
    }

    // Mark OTP as used
    await supabase.from('otp_codes').update({ used: true }).eq('id', otpRecord.id);

    // Find or create user in app_users table
    let { data: user } = await supabase
      .from('app_users')
      .select('*')
      .eq('phone', fullPhone)
      .maybeSingle();

    if (!user) {
      const { data: newUser, error: createErr } = await supabase
        .from('app_users')
        .insert({ phone: fullPhone })
        .select('*')
        .single();

      if (createErr || !newUser) {
        console.error('[verify-otp] User create error:', createErr);
        return NextResponse.json({ error: 'Could not create user account' }, { status: 500 });
      }
      user = newUser;
    }

    // Issue session cookie
    const token = createSessionToken({ userId: user.id, phone: fullPhone, name: user.name });

    const response = NextResponse.json({ success: true, isNew: !user.name });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   COOKIE_MAX_AGE,
      path:     '/',
    });

    return response;

  } catch (err) {
    console.error('[verify-otp] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
