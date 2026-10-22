import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session';

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// GET /api/favorites — get user's saved listings (supports ?user_id=... and ?count=true)
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('user_id');
    const countOnly   = searchParams.get('count') === 'true';

    const userId = userIdParam ?? session?.userId ?? null;
    if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

    const supabase = getClient();

    if (countOnly) {
      const { count, error } = await supabase
        .from('favorites')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
      if (error) {
        // favorites table may not exist — return 0
        console.warn('[GET /api/favorites count]', error.message);
        return NextResponse.json({ count: 0 });
      }
      return NextResponse.json({ count: count ?? 0 });
    }

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id, created_at,
        listing:property_listings(
          id, title, slug, price, price_unit, area, area_unit,
          transaction_type, status, is_verified, is_featured,
          seller_type, created_at, listing_id, address_line,
          media:property_media(url, is_primary)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[GET /api/favorites]', error.message);
      return NextResponse.json({ data: [] });
    }
    return NextResponse.json({ data: data ?? [] });
  } catch (err) {
    console.error('[GET /api/favorites]', err);
    return NextResponse.json({ data: [], error: 'Failed to fetch favorites' });
  }
}

// POST /api/favorites — toggle favorite
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

    const supabase = getClient();
    const { listing_id } = await request.json();
    if (!listing_id) return NextResponse.json({ error: 'listing_id required' }, { status: 400 });

    const userId = session.userId;

    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('listing_id', listing_id)
      .maybeSingle();

    if (existing) {
      await supabase.from('favorites').delete().eq('id', existing.id);
      return NextResponse.json({ favorited: false });
    } else {
      await supabase.from('favorites').insert({ user_id: userId, listing_id });
      return NextResponse.json({ favorited: true }, { status: 201 });
    }
  } catch (err) {
    console.error('[POST /api/favorites]', err);
    return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 });
  }
}
