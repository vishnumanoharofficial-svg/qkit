import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session';

// GET /api/my-listings — returns listings that belong to the logged-in user
// Matches by owner_email stored in property_attributes (set at submission time)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const limit = Math.min(Number(searchParams.get('limit') ?? 50), 100);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const ownerEmail = session.phone; // session.phone stores the email

    // Step 1: Find listing IDs from property_attributes where owner_email matches
    const { data: attrRows } = await supabase
      .from('property_attributes')
      .select('listing_id')
      .eq('field_key', 'owner_email')
      .eq('field_value', ownerEmail);

    const listingIds = (attrRows ?? []).map(r => r.listing_id);

    // Also try direct seller_phone match (for listings posted via admin/older entries)
    let query = supabase
      .from('property_listings')
      .select('*, media:property_media(url,is_primary)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (listingIds.length > 0) {
      // Match by owner_email attribute OR by seller_phone (email stored there)
      query = query.or(`id.in.(${listingIds.join(',')}),seller_phone.eq.${ownerEmail}`);
    } else {
      // Fallback: match by seller_phone = email
      query = query.eq('seller_phone', ownerEmail);
    }

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data: data ?? [], total: count ?? 0 });
  } catch (err) {
    console.error('[GET /api/my-listings]', err);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}
