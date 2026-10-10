import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/admin/moderate — approve or reject a listing
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

    // Check admin role
    const { data: profile } = await supabase
      .from('users').select('role').eq('id', user.id).single();
    if (!profile || !['admin','super_admin','moderator'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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

    // Get current status for history
    const { data: listing } = await supabase
      .from('property_listings').select('status').eq('id', listing_id).single();

    // Update listing status
    const updateData: Record<string, unknown> = {
      status:     newStatus,
      updated_at: new Date().toISOString(),
    };
    if (action === 'approve') {
      updateData.published_at = new Date().toISOString();
      updateData.rejection_reason = null;
    }
    if (action === 'reject' || action === 'suspend') {
      updateData.rejection_reason = reason || 'Does not comply with listing guidelines';
    }

    const { error: updateErr } = await supabase
      .from('property_listings').update(updateData).eq('id', listing_id);
    if (updateErr) throw updateErr;

    // Status history
    await supabase.from('listing_status_history').insert({
      listing_id,
      old_status: listing?.status,
      new_status: newStatus,
      changed_by: user.id,
      reason,
    });

    // Moderation action record
    await supabase.from('moderation_actions').insert({
      listing_id, moderator_id: user.id, action, reason,
    });

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id, action: `moderation_${action}`,
      entity_type: 'property_listings', entity_id: listing_id,
      old_value: { status: listing?.status },
      new_value: { status: newStatus, reason },
    });

    return NextResponse.json({ success: true, new_status: newStatus });
  } catch (err) {
    console.error('[POST /api/admin/moderate]', err);
    return NextResponse.json({ error: 'Moderation action failed' }, { status: 500 });
  }
}
