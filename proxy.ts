import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const PROTECTED_PATHS = ['/dashboard', '/post-property', '/seller'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip if Supabase is not configured (demo mode without .env.local)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
    return NextResponse.next();
  }

  // Check if path is protected
  const isProtected = PROTECTED_PATHS.some(path => pathname.startsWith(path));

  if (isProtected) {
    const sessionCookie = request.cookies.get('sb-access-token') ||
                          request.cookies.get('sb-auth-token');
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.png$).*)',
  ],
};
