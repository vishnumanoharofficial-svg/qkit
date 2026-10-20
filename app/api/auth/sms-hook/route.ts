import { NextRequest, NextResponse } from 'next/server';

/**
 * Supabase "Send SMS" Auth Hook
 *
 * Supabase calls this endpoint whenever it needs to send an OTP SMS.
 * We forward the OTP to the user's phone via 2factor.in (Indian SMS provider).
 *
 * Supabase Auth → Hooks → "Send SMS" → HTTP → this URL
 */

export async function POST(req: NextRequest) {
  try {
    // Verify the request is from Supabase (optional secret header)
    const hookSecret = process.env.SUPABASE_HOOK_SECRET;
    if (hookSecret) {
      const authHeader = req.headers.get('authorization');
      if (authHeader !== `Bearer ${hookSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await req.json();
    const phone: string = body?.user?.phone ?? '';
    const otp: string   = body?.sms?.otp ?? '';

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Missing phone or otp' }, { status: 400 });
    }

    // Strip country code → keep 10-digit number for 2factor API
    const mobile = phone.replace(/^\+91/, '').replace(/\D/g, '');

    const apiKey = process.env.TWOFACTOR_API_KEY;
    if (!apiKey) {
      console.error('[sms-hook] TWOFACTOR_API_KEY is not set');
      return NextResponse.json({ error: 'SMS provider not configured' }, { status: 500 });
    }

    // 2factor.in Transactional OTP API
    // Docs: https://2factor.in/API/V1/{api_key}/SMS/{phone}/{otp}/AUTOGEN
    const url = `https://2factor.in/API/V1/${apiKey}/SMS/${mobile}/${otp}/AUTOGEN`;

    const res  = await fetch(url, { method: 'GET' });
    const data = await res.json() as { Status: string; Details: string };

    if (data.Status !== 'Success') {
      console.error('[sms-hook] 2factor.in error:', data);
      return NextResponse.json({ error: `SMS failed: ${data.Details}` }, { status: 500 });
    }

    console.log(`[sms-hook] OTP sent to ${mobile} — Session: ${data.Details}`);

    // Supabase expects an empty 200 response on success
    return NextResponse.json({});

  } catch (err) {
    console.error('[sms-hook] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
