import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET /api/property/[slug] — fetch single listing by slug
// Next.js 16: params is a Promise
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error } = await supabase
      .from('property_listings')
      .select('*, media:property_media(url,is_primary,type,sort_order)')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Fetch similar listings (same transaction_type)
    const { data: similar } = await supabase
      .from('property_listings')
      .select('*, media:property_media(url,is_primary)')
      .eq('status', 'published')
      .eq('transaction_type', data.transaction_type)
      .neq('id', data.id)
      .limit(4);

    return NextResponse.json({ listing: data, similar: similar ?? [] });
  } catch (err) {
    console.error('[GET /api/property/[slug]]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
