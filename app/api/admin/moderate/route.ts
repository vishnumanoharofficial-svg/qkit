import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/admin/moderate — approve or reject a listing (no Supabase auth required — admin page is protected separately)
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { listing_id, action, reason } = await request.json();

    if (!listing_id || !action) {
      return NextResponse.json({ error: 'listing_id and action required' }, { status: 400 });
    }

    const validActions = ['approve', 'reject', 'unpublish', 'restore', 'suspend'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: `Invalid action. Must be one of: ${validActions.join(', ')}` }, { status: 400 });
    }

    const statusMap: Record<string, string> = {
      approve:   'published',
      reject:    'rejected',
      unpublish: 'paused',
      restore:   'published',
      suspend:   'rejected',
    };
    const newStatus = statusMap[action];

    const updateData: Record<string, unknown> = {
      status:     newStatus,
      updated_at: new Date().toISOString(),
    };
    if (action === 'approve') {
      updateData.published_at     = new Date().toISOString();
      updateData.rejection_reason = null;
    }
    if (action === 'reject' || action === 'suspend') {
      updateData.rejection_reason = reason || 'Does not comply with listing guidelines';
    }

    const { error: updateErr } = await supabase
      .from('property_listings')
      .update(updateData)
      .eq('id', listing_id);

    if (updateErr) throw updateErr;

    return NextResponse.json({ success: true, new_status: newStatus });
  } catch (err) {
    console.error('[POST /api/admin/moderate]', err);
    return NextResponse.json({ error: 'Moderation action failed' }, { status: 500 });
  }
}
