import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/favorites — get user's saved listings
export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id, created_at,
        listing:property_listings(
          id, title, slug, price, price_unit, area, area_unit,
          transaction_type, status, is_verified, is_featured,
          seller_type, created_at, listing_id,
          locality:localities(name, city:cities(name)),
          media:property_media(url, is_primary)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err) {
    console.error('[GET /api/favorites]', err);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

// POST /api/favorites — toggle favorite
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

    const { listing_id } = await request.json();
    if (!listing_id) return NextResponse.json({ error: 'listing_id required' }, { status: 400 });

    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listing_id)
      .single();

    if (existing) {
      // Remove
      await supabase.from('favorites').delete().eq('id', existing.id);
      return NextResponse.json({ favorited: false });
    } else {
      // Add
      await supabase.from('favorites').insert({ user_id: user.id, listing_id });
      return NextResponse.json({ favorited: true }, { status: 201 });
    }
  } catch (err) {
    console.error('[POST /api/favorites]', err);
    return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 });
  }
}
