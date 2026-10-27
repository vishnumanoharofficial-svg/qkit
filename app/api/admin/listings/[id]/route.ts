import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET /api/admin/listings/[id] — fetch single listing with all fields + media
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('property_listings')
      .select('*, media:property_media(id,url,is_primary,sort_order,type)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    return NextResponse.json({ listing: data });
  } catch (err) {
    console.error('[GET /api/admin/listings/[id]]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH /api/admin/listings/[id] — update listing, preserving all existing data
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const supabase = getSupabase();
    const body = await request.json();

    const {
      title, description, transaction_type, category_slug,
      price, price_unit, negotiable, area, area_unit,
      taluk, town_panchayat, city, locality, address_line,
      seller_name, seller_phone, seller_type,
      bedrooms, bathrooms, floor, total_floors,
      furnishing, parking, facing, age,
      status, is_featured, is_verified,
      image_urls,        // new images to ADD (appended, not replaced)
      replace_images,    // if true: replace all media; if false: append
    } = body;

    // Build attributes JSONB from property detail fields — never lose existing data
    // First fetch current attributes so we merge, not overwrite
    const { data: existing } = await supabase
      .from('property_listings')
      .select('attributes')
      .eq('id', id)
      .single();

    const currentAttrs: Record<string, string> = (existing?.attributes as Record<string, string>) ?? {};
    const updatedAttrs: Record<string, string> = { ...currentAttrs };

    if (bedrooms)    updatedAttrs.bedrooms    = String(bedrooms);
    if (bathrooms)   updatedAttrs.bathrooms   = String(bathrooms);
    if (floor)       updatedAttrs.floor       = String(floor);
    if (total_floors)updatedAttrs.total_floors= String(total_floors);
    if (furnishing)  updatedAttrs.furnishing  = String(furnishing);
    if (parking)     updatedAttrs.parking     = String(parking);
    if (facing)      updatedAttrs.facing      = String(facing);
    if (age)         updatedAttrs.age         = String(age);

    // Build update payload — only include fields that were sent
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patch: Record<string, any> = {
      updated_at: new Date().toISOString(),
      attributes: Object.keys(updatedAttrs).length > 0 ? updatedAttrs : null,
    };

    if (title          !== undefined) patch.title           = title;
    if (description    !== undefined) patch.description     = description || null;
    if (transaction_type !== undefined) patch.transaction_type = transaction_type;
    if (category_slug  !== undefined) patch.category_slug  = category_slug || null;
    if (price          !== undefined) patch.price           = Number(price);
    if (price_unit     !== undefined) patch.price_unit      = price_unit;
    if (negotiable     !== undefined) patch.negotiable      = Boolean(negotiable);
    if (area           !== undefined) patch.area            = Number(area);
    if (area_unit      !== undefined) patch.area_unit       = area_unit;
    if (taluk          !== undefined) patch.taluk           = taluk || null;
    if (town_panchayat !== undefined) patch.town_panchayat  = town_panchayat || null;
    if (city           !== undefined) patch.city            = city || null;
    if (locality       !== undefined) patch.locality        = locality || null;
    if (address_line   !== undefined) patch.address_line    = address_line || null;
    if (seller_name    !== undefined) patch.seller_name     = seller_name;
    if (seller_phone   !== undefined) patch.seller_phone    = seller_phone;
    if (seller_type    !== undefined) patch.seller_type     = seller_type;
    if (status         !== undefined) {
      patch.status = status;
      if (status === 'published') patch.published_at = new Date().toISOString();
    }
    if (is_featured    !== undefined) patch.is_featured     = Boolean(is_featured);
    if (is_verified    !== undefined) patch.is_verified     = Boolean(is_verified);

    const { data: updated, error: patchErr } = await supabase
      .from('property_listings')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (patchErr) {
      console.error('[PATCH /api/admin/listings/[id]]', patchErr);
      return NextResponse.json({ error: patchErr.message }, { status: 500 });
    }

    // Handle media updates
    if (Array.isArray(image_urls) && image_urls.length > 0) {
      if (replace_images) {
        // Delete all existing media first, then insert new ones
        await supabase.from('property_media').delete().eq('listing_id', id);
        const mediaRows = image_urls.map((url: string, idx: number) => ({
          listing_id: id,
          url,
          type: 'image',
          sort_order: idx,
          is_primary: idx === 0,
        }));
        await supabase.from('property_media').insert(mediaRows);
      } else {
        // Append new images — get current max sort_order first
        const { data: existing_media } = await supabase
          .from('property_media')
          .select('sort_order')
          .eq('listing_id', id)
          .order('sort_order', { ascending: false })
          .limit(1);

        const startOrder = (existing_media?.[0]?.sort_order ?? -1) + 1;
        const hasExistingMedia = startOrder > 0;

        const mediaRows = image_urls.map((url: string, idx: number) => ({
          listing_id: id,
          url,
          type: 'image',
          sort_order: startOrder + idx,
          is_primary: !hasExistingMedia && idx === 0,
        }));
        await supabase.from('property_media').insert(mediaRows);
      }
    }

    return NextResponse.json({ success: true, listing: updated });
  } catch (err) {
    console.error('[PATCH /api/admin/listings/[id]]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/admin/listings/[id] — soft-delete by setting status=rejected
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('property_listings')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/admin/listings/[id]]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
