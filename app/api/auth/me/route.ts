import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** GET /api/auth/me — returns current session user */
export async function GET(_req: NextRequest) {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ user: null });

  const session = verifySessionToken(token);
  if (!session) return NextResponse.json({ user: null });

  const { data: user } = await supabase
    .from('app_users')
    .select('id, phone, name, created_at')
    .eq('id', session.userId)
    .maybeSingle();

  return NextResponse.json({ user: user ?? null });
}

/** POST /api/auth/logout — clears the session cookie */
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
  return response;
}
