import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/enquiries — seller fetches their enquiries
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status     = searchParams.get('status');
    const listing_id = searchParams.get('listing_id');
    const page       = Math.max(Number(searchParams.get('page') ?? 1), 1);
    const limit      = Math.min(Number(searchParams.get('limit') ?? 20), 50);
    const offset     = (page - 1) * limit;

    let query = supabase
      .from('enquiries')
      .select(`*, listing:property_listings(id,title,slug,listing_id)`, { count: 'exact' })
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status)     query = query.eq('status', status);
    if (listing_id) query = query.eq('listing_id', listing_id);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ data, total: count ?? 0, page, per_page: limit });
  } catch (err) {
    console.error('[GET /api/enquiries]', err);
    return NextResponse.json({ error: 'Failed to fetch enquiries' }, { status: 500 });
  }
}

// POST /api/enquiries — buyer sends an enquiry
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

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
        buyer_id:    user?.id ?? null,
        seller_id:   listing.user_id,
        message,
        buyer_name:  buyer_name  || user?.user_metadata?.name || null,
        buyer_phone: buyer_phone || null,
        buyer_email: buyer_email || user?.email || null,
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
