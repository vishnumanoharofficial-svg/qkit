import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session';

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/** Resolve the current user from our custom session cookie */
async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// GET /api/enquiries — seller fetches their enquiries
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    const supabase = getClient();
    const { searchParams } = new URL(request.url);

    const sellerIdParam = searchParams.get('seller_id');
    const countOnly     = searchParams.get('count') === 'true';
    const status        = searchParams.get('status');
    const listing_id    = searchParams.get('listing_id');
    const page          = Math.max(Number(searchParams.get('page') ?? 1), 1);
    const limit         = Math.min(Number(searchParams.get('limit') ?? 20), 50);
    const offset        = (page - 1) * limit;

    // Determine seller_id: prefer query param (from dashboard), else use session
    const sellerId = sellerIdParam ?? session?.userId ?? null;

    if (!sellerId) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    if (countOnly) {
      const { count, error } = await supabase
        .from('enquiries')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', sellerId);
      if (error) throw error;
      return NextResponse.json({ count: count ?? 0 });
    }

    let query = supabase
      .from('enquiries')
      .select(
        `*, listing:property_listings(id,title,slug,listing_id,price,price_unit,town_panchayat,address_line)`,
        { count: 'exact' }
      )
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status)     query = query.eq('status', status);
    if (listing_id) query = query.eq('listing_id', listing_id);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ data: data ?? [], total: count ?? 0, page, per_page: limit });
  } catch (err) {
    console.error('[GET /api/enquiries]', err);
    return NextResponse.json({ error: 'Failed to fetch enquiries' }, { status: 500 });
  }
}

// POST /api/enquiries — buyer sends an enquiry
export async function POST(request: NextRequest) {
  try {
    const supabase = getClient();
    const session  = await getSessionUser();

    const { listing_id, message, buyer_name, buyer_phone, buyer_email } = await request.json();

    if (!listing_id || !message) {
      return NextResponse.json({ error: 'listing_id and message required' }, { status: 400 });
    }

    // Fetch listing to get seller_id
    const { data: listing, error: listingErr } = await supabase
      .from('property_listings')
      .select('user_id, status, enquiries_count')
      .eq('id', listing_id)
      .single();

    if (listingErr || !listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    if (listing.status !== 'published') return NextResponse.json({ error: 'Listing is not active' }, { status: 400 });

    const { data: enquiry, error: enqErr } = await supabase
      .from('enquiries')
      .insert({
        listing_id,
        buyer_id:    session?.userId ?? null,
        seller_id:   listing.user_id,
        message,
        buyer_name:  buyer_name  || session?.name || null,
        buyer_phone: buyer_phone || null,
        buyer_email: buyer_email || session?.phone || null,
        status:      'new',
      })
      .select()
      .single();

    if (enqErr) throw enqErr;

    // Increment enquiry count
    await supabase
      .from('property_listings')
      .update({ enquiries_count: (listing.enquiries_count || 0) + 1 })
      .eq('id', listing_id);

    return NextResponse.json({ id: enquiry.id, success: true }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/enquiries]', err);
    return NextResponse.json({ error: 'Failed to send enquiry' }, { status: 500 });
  }
}
