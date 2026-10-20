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

    // Ensure system admin user exists in app_users
    const ADMIN_USER_ID = '00000000-0000-0000-0000-000000000001';
    await supabase
      .from('app_users')
      .upsert(
        { id: ADMIN_USER_ID, phone: 'admin@qkit.in', name: 'Admin' },
        { onConflict: 'id', ignoreDuplicates: true }
      );

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

    // Build attributes object
    const attributes: Record<string, string> = {};
    if (bedrooms)     attributes.bedrooms    = bedrooms;
    if (bathrooms)    attributes.bathrooms   = bathrooms;
    if (furnishing)   attributes.furnishing  = furnishing;
    if (facing)       attributes.facing      = facing;
    if (parking)      attributes.parking     = parking;
    if (floor)        attributes.floor       = floor;
    if (total_floors) attributes.total_floors = total_floors;

    // Build full address from location fields
    const addrParts = [locality, city, state].filter(Boolean);
    const fullAddress = address_line?.trim() || addrParts.join(', ') || null;

    // Insert the listing using ONLY verified existing schema columns
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
      // Use a system admin UUID for admin-created listings
      user_id: '00000000-0000-0000-0000-000000000001',
      // category_id FK — use resolved UUID or null (requires nullable migration)
      ...(resolvedCategoryId ? { category_id: resolvedCategoryId } : {}),
      is_verified: true,
      is_featured: false,
      is_promoted: false,
      views_count: 0,
      enquiries_count: 0,
      published_at: status === 'published' ? new Date().toISOString() : null,
      expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Try inserting with category_slug first, fallback to base schema if column missing
    let listing: Record<string, unknown> | null = null;
    let insertError: { message: string } | null = null;

    const { data: d1, error: e1 } = await supabase
      .from('property_listings')
      .insert({ ...insertData, category_slug: category_slug || null })
      .select()
      .single();

    if (e1 && e1.message?.includes('category_slug')) {
      // category_slug column doesn't exist yet — insert without it
      const { data: d2, error: e2 } = await supabase
        .from('property_listings')
        .insert(insertData)
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
