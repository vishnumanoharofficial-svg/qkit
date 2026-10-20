import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateListingId, slugify } from '@/lib/utils';
import { cookies } from 'next/headers';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session';

// GET /api/properties?status=published&category=apartments&limit=12&page=1
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status   = searchParams.get('status') ?? 'published';
  const category = searchParams.get('category');
  const type     = searchParams.get('type');
  const city     = searchParams.get('city');
  const limit    = Math.min(Number(searchParams.get('limit') ?? 12), 50);
  const page     = Math.max(Number(searchParams.get('page') ?? 1), 1);
  const offset   = (page - 1) * limit;
  const featured = searchParams.get('featured');
  const verified = searchParams.get('verified');
  const sort     = searchParams.get('sort') ?? 'newest';

  try {
    const supabase = createClient();
    let query = supabase
      .from('property_listings')
      .select(`
        *,
        category:property_categories(id,name,slug),
        locality:localities(id,name,pincode,city:cities(id,name,slug)),
        media:property_media(id,url,type,sort_order,is_primary)
      `, { count: 'exact' })
      .eq('status', status);

    if (category) query = query.eq('category.slug', category);
    if (type)     query = query.eq('transaction_type', type);
    if (featured) query = query.eq('is_featured', true);
    if (verified) query = query.eq('is_verified', true);

    switch (sort) {
      case 'price_asc':  query = query.order('price', { ascending: true });  break;
      case 'price_desc': query = query.order('price', { ascending: false }); break;
      case 'area_asc':   query = query.order('area',  { ascending: true });  break;
      default:           query = query.order('created_at', { ascending: false });
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      data, total: count ?? 0, page, per_page: limit,
      total_pages: Math.ceil((count ?? 0) / limit),
    });
  } catch (err) {
    console.error('[GET /api/properties]', err);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

// POST /api/properties — create a new listing
export async function POST(request: NextRequest) {
  try {
    // ── Auth via custom qkit_session cookie ─────────────────────────────────
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    if (!session) {
      return NextResponse.json({ error: 'Please log in to post a property.' }, { status: 401 });
    }

    const supabase = createClient();
    const body = await request.json();
    const {
      title, description, transaction_type, category_slug,
      taluk, town_panchayat, locality, pincode,
      price, price_unit, negotiable, area, area_unit,
      seller_name, seller_phone, seller_type,
      attributes, media_urls,
    } = body;

    // Basic validation
    if (!title || !transaction_type || !category_slug || !price || !area || !seller_name || !seller_phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const listing_id = generateListingId();
    const slug = `${slugify(title)}-${listing_id.toLowerCase()}`;

    // Build address from Kottayam hierarchy
    const address_parts = [locality, town_panchayat, taluk, 'Kottayam', 'Kerala'].filter(Boolean);
    const address_line  = address_parts.join(', ');

    const { data: listing, error } = await supabase
      .from('property_listings')
      .insert({
        user_id:        session.userId,
        category_slug,
        title, slug, description: description || null,
        transaction_type,
        price: Number(price),
        price_unit:     price_unit || (transaction_type === 'sale' ? 'total' : 'per_month'),
        negotiable:     negotiable ?? true,
        area:           Number(area),
        area_unit:      area_unit || 'sqft',
        // Kottayam location fields
        taluk:          taluk || null,
        town_panchayat: town_panchayat || null,
        locality:       locality || null,
        pincode:        pincode || null,
        address_line,
        state:          'Kerala',
        district:       'Kottayam',
        show_exact_location: false,
        seller_name, seller_phone,
        seller_type:    seller_type || 'owner',
        status:         'pending',   // requires admin approval before going live
        listing_id,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Insert dynamic attributes (bedrooms, bathrooms, etc.)
    if (attributes && Object.keys(attributes).length > 0) {
      const attrRows = Object.entries(attributes)
        .filter(([, v]) => v !== '' && v !== null && v !== undefined)
        .map(([field_key, field_value]) => ({
          listing_id: listing.id,
          field_key,
          field_value: String(field_value),
        }));
      if (attrRows.length > 0) {
        await supabase.from('property_attributes').insert(attrRows).throwOnError();
      }
    }

    // Insert media references (uploaded image URLs)
    if (media_urls && Array.isArray(media_urls) && media_urls.length > 0) {
      const mediaRows = media_urls.map((url: string, i: number) => ({
        listing_id: listing.id, url, type: 'image', sort_order: i, is_primary: i === 0,
      }));
      await supabase.from('property_media').insert(mediaRows).throwOnError();
    }

    return NextResponse.json({ listing_id, slug, id: listing.id }, { status: 201 });
  } catch (err: unknown) {
    console.error('[POST /api/properties]', err);
    const msg = err instanceof Error ? err.message : 'Failed to create listing';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
