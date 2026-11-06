import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// DELETE /api/my-listings/[id] — user can permanently delete their own listing
// Ownership verified by checking owner_email in property_attributes OR seller_phone match
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ownerEmail = session.phone; // session.phone stores user email
    const supabase = getSupabase();

    // Verify ownership — check property_attributes for owner_email
    const { data: attrRow } = await supabase
      .from('property_attributes')
      .select('listing_id')
      .eq('listing_id', id)
      .eq('field_key', 'owner_email')
      .eq('field_value', ownerEmail)
      .maybeSingle();

    // Also check direct seller_phone match as fallback
    const { data: listing } = await supabase
      .from('property_listings')
      .select('id, seller_phone')
      .eq('id', id)
      .maybeSingle();

    const ownsViaAttr    = !!attrRow;
    const ownsViaPhone   = listing?.seller_phone === ownerEmail;

    if (!ownsViaAttr && !ownsViaPhone) {
      return NextResponse.json({ error: 'Forbidden — this listing does not belong to you' }, { status: 403 });
    }

    // Delete media records first (FK constraint)
    await supabase.from('property_media').delete().eq('listing_id', id);
    // Delete property attributes
    await supabase.from('property_attributes').delete().eq('listing_id', id);
    // Delete the listing itself
    const { error } = await supabase
      .from('property_listings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[DELETE /api/my-listings/[id]]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/my-listings/[id]]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
