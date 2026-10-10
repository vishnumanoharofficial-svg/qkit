import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/search — full-text property search with filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const q        = searchParams.get('q') ?? '';
  const type     = searchParams.get('type');
  const category = searchParams.get('category');
  const city     = searchParams.get('city');
  const locality = searchParams.get('locality');
  const pincode  = searchParams.get('pincode');
  const min_price = searchParams.get('min_price');
  const max_price = searchParams.get('max_price');
  const min_area  = searchParams.get('min_area');
  const max_area  = searchParams.get('max_area');
  const verified  = searchParams.get('verified');
  const featured  = searchParams.get('featured');
  const seller_type = searchParams.get('seller_type');
  const sort     = searchParams.get('sort') ?? 'newest';
  const page     = Math.max(Number(searchParams.get('page') ?? 1), 1);
  const limit    = Math.min(Number(searchParams.get('limit') ?? 12), 50);
  const offset   = (page - 1) * limit;

  try {
    const supabase = createClient();

    let query = supabase
      .from('property_listings')
      .select(`
        id, title, slug, price, price_unit, area, area_unit,
        transaction_type, status, is_verified, is_featured, is_promoted,
        seller_name, seller_type, views_count, enquiries_count,
        listing_id, created_at, negotiable,
        category:property_categories(name, slug),
        locality:localities(name, pincode, city:cities(name, slug)),
        media:property_media(url, is_primary, sort_order)
      `, { count: 'exact' })
      .eq('status', 'published');

    // Full-text search
    if (q) {
      query = query.textSearch('title', q, { type: 'websearch', config: 'english' });
    }

    if (type)         query = query.eq('transaction_type', type);
    if (category)     query = query.eq('category.slug', category);
    if (seller_type)  query = query.eq('seller_type', seller_type);
    if (verified)     query = query.eq('is_verified', true);
    if (featured)     query = query.eq('is_featured', true);
    if (min_price)    query = query.gte('price', Number(min_price));
    if (max_price)    query = query.lte('price', Number(max_price));
    if (min_area)     query = query.gte('area', Number(min_area));
    if (max_area)     query = query.lte('area', Number(max_area));

    switch (sort) {
      case 'price_asc':  query = query.order('price', { ascending: true }); break;
      case 'price_desc': query = query.order('price', { ascending: false }); break;
      case 'area_asc':   query = query.order('area',  { ascending: true }); break;
      default:           query = query.order('created_at', { ascending: false });
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);
    if (error) throw error;

    return NextResponse.json({
      data, total: count ?? 0, page, per_page: limit,
      total_pages: Math.ceil((count ?? 0) / limit),
    });
  } catch (err) {
    console.error('[GET /api/search]', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
