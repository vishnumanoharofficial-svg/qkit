import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
  const chars = 'abcdefghjklmnpqrstuvwxyz23456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `${base}-${suffix}`;
}

function generateListingId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'QK-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title, description, transaction_type, category_slug,
      price, price_unit, negotiable, area, area_unit,
      city, state, locality, address_line,
      seller_name, seller_phone, seller_type,
      bedrooms, bathrooms, furnishing, facing,
      parking, floor, total_floors,
      image_urls = [],
      status = 'published',
    } = body;

    // Validate required fields
    if (!title || !price || !area || !seller_name || !seller_phone) {
      return NextResponse.json(
        { error: 'Missing required fields: title, price, area, seller_name, seller_phone' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // If Supabase not configured, return mock success
    if (!supabase) {
      return NextResponse.json({
        success: true,
        mock: true,
        listing: {
          id: crypto.randomUUID(),
          listing_id: generateListingId(),
          slug: generateSlug(title),
          title,
          status,
          created_at: new Date().toISOString(),
        },
        message: 'Mock success — Supabase not configured',
      });
    }

    // System admin user UUID (created in Supabase auth as admin@qkit.in)
    const ADMIN_USER_ID = 'b96b3529-211f-4cd1-b2e3-c8d35dea410b';

    // Look up category_id from property_categories using category_slug
    let resolvedCategoryId: string | null = null;
    if (category_slug) {
      const { data: catRow } = await supabase
        .from('property_categories')
        .select('id')
        .eq('slug', category_slug)
        .maybeSingle();
      resolvedCategoryId = catRow?.id ?? null;
    }

    const slug = generateSlug(title);
    const listing_id = generateListingId();

    // Build attributes object — also auto-extract from title when fields not provided
    const attributes: Record<string, string> = {};
    // Prefer explicit fields, fall back to title regex extraction
    const bedroomsVal   = bedrooms   || (title.match(/(\d+)\s*BHK/i)?.[1] ?? '');
    const bathroomsVal  = bathrooms  || (title.match(/(\d+)\s*Bath(?:room)?/i)?.[1] ?? '');
    if (bedroomsVal)   attributes.bedrooms    = bedroomsVal;
    if (bathroomsVal)  attributes.bathrooms   = bathroomsVal;
    if (furnishing)    attributes.furnishing  = furnishing;
    if (facing)        attributes.facing      = facing;
    if (parking)       attributes.parking     = parking;
    if (floor)         attributes.floor       = floor;
    if (total_floors)  attributes.total_floors = total_floors;

    // Build full address from location fields
    const addrParts = [locality, city, state].filter(Boolean);
    const fullAddress = address_line?.trim() || addrParts.join(', ') || null;

    // Insert the listing — all Kottayam columns exist in DB schema
    const insertData: Record<string, unknown> = {
      title: title.trim(),
      slug,
      listing_id,
      description: description?.trim() || null,
      transaction_type,
      status,
      price: parseFloat(price),
      price_unit: price_unit || 'total',
      negotiable: Boolean(negotiable),
      area: parseFloat(area),
      area_unit: area_unit || 'sqft',
      address_line: fullAddress,
      show_exact_location: false,
      seller_name: seller_name.trim(),
      seller_phone: seller_phone.trim(),
      seller_type: seller_type || 'owner',
      // user_id is omitted — FK points to auth.users and we don't use Supabase auth
      // Properties are owner-identified via seller_phone
      ...(resolvedCategoryId ? { category_id: resolvedCategoryId } : {}),
      category_slug: category_slug || null,
      // Kottayam location columns (already in DB schema)
      city: city || null,
      state: state || 'Kerala',
      district: 'Kottayam',
      is_verified: true,
      is_featured: false,
      is_promoted: false,
      views_count: 0,
      enquiries_count: 0,
      attributes: Object.keys(attributes).length > 0 ? attributes : null,
      published_at: status === 'published' ? new Date().toISOString() : null,
      expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    };

    let listing: Record<string, unknown> | null = null;
    let insertError: { message: string } | null = null;

    const { data: d1, error: e1 } = await supabase
      .from('property_listings')
      .insert(insertData)
      .select()
      .single();

    if (e1) {
      // Fallback: strip any unknown columns and retry with minimal payload
      const minPayload: Record<string, unknown> = { ...insertData };
      delete minPayload.category_slug;
      delete minPayload.city;
      delete minPayload.state;
      delete minPayload.district;
      const { data: d2, error: e2 } = await supabase
        .from('property_listings')
        .insert(minPayload)
        .select()
        .single();
      listing = d2 as Record<string, unknown>;
      insertError = e2;
    } else {
      listing = d1 as Record<string, unknown>;
      insertError = e1;
    }

    if (insertError || !listing) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        { error: insertError?.message ?? 'Insert failed' },
        { status: 500 }
      );
    }

    // Also store category_slug and location as attributes
    const attrRows = [
      category_slug && { listing_id: listing.id, field_key: 'category_slug', field_value: category_slug },
      locality      && { listing_id: listing.id, field_key: 'locality',       field_value: locality },
      city          && { listing_id: listing.id, field_key: 'city',           field_value: city },
      state         && { listing_id: listing.id, field_key: 'state',          field_value: state },
      ...Object.entries(attributes || {}).map(([k, v]) => ({ listing_id: listing!.id, field_key: k, field_value: String(v) })),
    ].filter(Boolean);

    if (attrRows.length > 0) {
      await supabase.from('property_attributes').insert(attrRows as { listing_id: unknown; field_key: string; field_value: string }[]);
    }

    // Insert media if image URLs provided
    if (image_urls.length > 0) {
      const mediaRows = image_urls.map((url: string, index: number) => ({
        listing_id: listing.id,
        url,
        type: 'image',
        sort_order: index,
        is_primary: index === 0,
      }));

      const { error: mediaError } = await supabase
        .from('property_media')
        .insert(mediaRows);

      if (mediaError) {
        console.warn('Media insert warning:', mediaError.message);
        // Non-fatal: listing is created, media failed
      }
    }

    return NextResponse.json({
      success: true,
      listing: {
        id: listing.id,
        listing_id: listing.listing_id,
        slug: listing.slug,
        title: listing.title,
        status: listing.status,
        created_at: listing.created_at,
      },
      message: 'Property created successfully',
    });
  } catch (err) {
    console.error('Admin add-property error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
