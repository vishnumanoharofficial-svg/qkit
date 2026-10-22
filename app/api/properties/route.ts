import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateListingId, slugify } from '@/lib/utils';
import { cookies } from 'next/headers';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session';

// GET /api/properties?status=published&category=apartments&limit=12&page=1&user_id=<uuid>
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status');
  const category    = searchParams.get('category');
  const type        = searchParams.get('type');
  const userIdParam = searchParams.get('user_id');
  const limit       = Math.min(Number(searchParams.get('limit') ?? 12), 50);
  const page        = Math.max(Number(searchParams.get('page') ?? 1), 1);
  const offset      = (page - 1) * limit;
  const featured    = searchParams.get('featured');
  const sort        = searchParams.get('sort') ?? 'newest';

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // When filtering by user, show all their listings (any status)
    // When no user filter, default to published
    const status = statusParam ?? (userIdParam ? null : 'published');

    let query = supabase
      .from('property_listings')
      .select('*, media:property_media(url,is_primary)', { count: 'exact' });

    if (status)     query = query.eq('status', status);
    if (userIdParam) query = query.eq('user_id', userIdParam);
    if (type)       query = query.eq('transaction_type', type);
    if (featured)   query = query.eq('is_featured', true);

    switch (sort) {
      case 'price_asc':  query = query.order('price', { ascending: true });  break;
      case 'price_desc': query = query.order('price', { ascending: false }); break;
      default:           query = query.order('created_at', { ascending: false });
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      data: data ?? [], total: count ?? 0, page, per_page: limit,
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
    // ── Auth via custom qkit_session cookie ───────────────────────────
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    if (!session) {
      return NextResponse.json({ error: 'Please log in to post a property.' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const body = await request.json();
    const {
      title, description, transaction_type, category_slug,
      taluk, town_panchayat, locality, pincode,
      price, price_unit, negotiable, area, area_unit,
      seller_name, seller_phone, seller_type,
      attributes, media_urls,
    } = body;

    // Basic validation
    if (!title || !transaction_type || !price || !area || !seller_name || !seller_phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const listing_id = generateListingId();
    const slug = `${slugify(title)}-${listing_id.toLowerCase()}`;

    // Build full address from Kottayam hierarchy
    const address_parts = [locality, town_panchayat, taluk, 'Kottayam', 'Kerala'].filter(Boolean);
    const address_line  = address_parts.join(', ');

    // Resolve user_id — must match a real Supabase auth.users UUID
    let resolvedUserId: string | null = null;
    const isUuid = /^[0-9a-f-]{36}$/.test(session.userId);
    if (isUuid) {
      resolvedUserId = session.userId;
    } else {
      // session.userId is an email — find or create auth user via Supabase admin API
      const email = session.userId;
      try {
        const searchRes = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
            }
          }
        );
        const searchData = await searchRes.json() as { users?: { id: string; email?: string }[] };
        const existing = searchData.users?.find(u => u.email === email);
        if (existing) {
          resolvedUserId = existing.id;
        } else {
          // Create a new auth user for this email
          const createRes = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email,
                email_confirm: true,
                user_metadata: { name: session.name ?? email.split('@')[0] },
              }),
            }
          );
          const newUser = await createRes.json() as { id?: string };
          resolvedUserId = newUser.id ?? null;
        }
      } catch (e) {
        console.warn('[POST /api/properties] Auth user lookup/create failed:', e);
      }
    }

    if (!resolvedUserId) {
      return NextResponse.json({ error: 'Could not resolve user account. Please log in again.' }, { status: 401 });
    }

    // Resolve category_id from category_slug (property_listings has category_id FK NOT NULL)
    let resolvedCategoryId: string | null = null;
    if (category_slug) {
      const { data: catRow } = await supabase
        .from('property_categories')
        .select('id')
        .eq('slug', category_slug)
        .maybeSingle();
      resolvedCategoryId = catRow?.id ?? null;
    }

    // Build the insert payload using ONLY existing schema columns
    // Kottayam-specific fields (taluk, town_panchayat, category_slug) are stored in address_line + attributes
    const insertPayload: Record<string, unknown> = {
      user_id:          resolvedUserId,
      title,
      slug,
      description:      description || null,
      transaction_type,
      price:            Number(price),
      price_unit:       price_unit || (transaction_type === 'sale' ? 'total' : 'per_month'),
      negotiable:       negotiable ?? true,
      area:             Number(area),
      area_unit:        area_unit || 'sqft',
      address_line,
      show_exact_location: false,
      seller_name,
      seller_phone,
      seller_type:      seller_type || 'owner',
      status:           'pending',
      listing_id,
      is_verified:      false,
      is_featured:      false,
      is_promoted:      false,
      views_count:      0,
      enquiries_count:  0,
      expires_at:       new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      // category_id FK — include if resolved
      ...(resolvedCategoryId ? { category_id: resolvedCategoryId } : {}),
    };

    // Attempt insert — try with extended Kottayam columns first, fallback to base schema
    let listing: Record<string, unknown> | null = null;
    let insertError: { message: string; code?: string } | null = null;

    // Try with category_slug column (if it exists from a previous migration)
    const { data: d1, error: e1 } = await supabase
      .from('property_listings')
      .insert({ ...insertPayload, category_slug: category_slug || null })
      .select()
      .single();

    if (e1) {
      // category_slug column doesn't exist — fall back to base schema
      console.warn('[POST /api/properties] category_slug not found, using base schema:', e1.message);
      const { data: d2, error: e2 } = await supabase
        .from('property_listings')
        .insert(insertPayload)
        .select()
        .single();

      listing = d2 as Record<string, unknown>;
      insertError = e2;
    } else {
      listing = d1 as Record<string, unknown>;
    }

    if (insertError || !listing) {
      console.error('[POST /api/properties] Insert failed:', insertError);
      return NextResponse.json(
        { error: insertError?.message ?? 'Failed to create listing' },
        { status: 500 }
      );
    }

    // Insert dynamic attributes (bedrooms, bathrooms, taluk, town_panchayat, category_slug)
    const allAttrs: Record<string, string> = {
      ...(attributes || {}),
      // Store Kottayam location as attributes too for searchability
      ...(taluk         ? { taluk }          : {}),
      ...(town_panchayat? { town_panchayat } : {}),
      ...(locality      ? { locality }       : {}),
      ...(pincode       ? { pincode }        : {}),
      ...(category_slug ? { category_slug }  : {}),
    };

    if (Object.keys(allAttrs).length > 0) {
      const attrRows = Object.entries(allAttrs)
        .filter(([, v]) => v !== '' && v != null)
        .map(([field_key, field_value]) => ({
          listing_id: listing!.id,
          field_key,
          field_value: String(field_value),
        }));

      if (attrRows.length > 0) {
        const { error: attrErr } = await supabase
          .from('property_attributes')
          .insert(attrRows);
        if (attrErr) console.warn('[POST /api/properties] Attributes insert warning:', attrErr.message);
      }
    }

    // Insert media references
    if (media_urls && Array.isArray(media_urls) && media_urls.length > 0) {
      const mediaRows = media_urls.map((url: string, i: number) => ({
        listing_id: listing!.id, url, type: 'image', sort_order: i, is_primary: i === 0,
      }));
      const { error: mediaErr } = await supabase
        .from('property_media')
        .insert(mediaRows);
      if (mediaErr) console.warn('[POST /api/properties] Media insert warning:', mediaErr.message);
    }

    return NextResponse.json({ listing_id, slug, id: listing.id }, { status: 201 });

  } catch (err: unknown) {
    console.error('[POST /api/properties]', err);
    const msg = err instanceof Error ? err.message : 'Failed to create listing';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
