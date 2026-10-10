import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateListingId, slugify } from '@/lib/utils';

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
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

    const body = await request.json();
    const {
      title, description, transaction_type, category_id, subcategory_id,
      price, price_unit, negotiable, area, area_unit,
      locality_id, address_line, lat, lng, show_exact_location,
      seller_name, seller_phone, seller_type,
      attributes, media_urls,
    } = body;

    // Basic validation
    if (!title || !transaction_type || !category_id || !price || !area || !seller_name || !seller_phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const listing_id = generateListingId();
    const slug = `${slugify(title)}-${listing_id.toLowerCase()}`;

    const { data: listing, error } = await supabase
      .from('property_listings')
      .insert({
        user_id: user.id,
        category_id, subcategory_id: subcategory_id || null,
        title, slug, description,
        transaction_type, price, price_unit: price_unit || 'total',
        negotiable: negotiable ?? true,
        area, area_unit: area_unit || 'sqft',
        locality_id: locality_id || null,
        address_line, lat, lng,
        show_exact_location: show_exact_location ?? false,
        seller_name, seller_phone, seller_type: seller_type || 'owner',
        status: 'pending',   // requires moderation unless admin sets auto_publish
        listing_id,
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Insert dynamic attributes
    if (attributes && Object.keys(attributes).length > 0) {
      const attrRows = Object.entries(attributes)
        .filter(([, v]) => v !== '' && v !== null && v !== undefined)
        .map(([field_key, field_value]) => ({
          listing_id: listing.id,
          field_key,
          field_value: String(field_value),
        }));
      if (attrRows.length > 0) {
        await supabase.from('property_attributes').insert(attrRows);
      }
    }

    // Insert media references
    if (media_urls && Array.isArray(media_urls) && media_urls.length > 0) {
      const mediaRows = media_urls.map((url: string, i: number) => ({
        listing_id: listing.id, url, type: 'image', sort_order: i, is_primary: i === 0,
      }));
      await supabase.from('property_media').insert(mediaRows);
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id, action: 'create_listing',
      entity_type: 'property_listings', entity_id: listing.id,
    });

    return NextResponse.json({ listing_id, slug, id: listing.id }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/properties]', err);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}
