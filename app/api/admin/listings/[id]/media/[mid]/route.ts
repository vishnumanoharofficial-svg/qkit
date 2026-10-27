import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// DELETE /api/admin/listings/[id]/media/[mid] — remove a single media row by its id
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string; mid: string }> }
) {
  const { id, mid } = await context.params;
  try {
    const supabase = getSupabase();

    // Safety check: ensure the media row actually belongs to this listing
    const { error } = await supabase
      .from('property_media')
      .delete()
      .eq('id', mid)
      .eq('listing_id', id);

    if (error) {
      console.error('[DELETE /api/admin/listings/[id]/media/[mid]]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/admin/listings/[id]/media/[mid]]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
