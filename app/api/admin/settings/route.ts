import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/admin/settings — fetch all admin settings
export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!profile || !['admin','super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase.from('admin_settings').select('*').order('key');
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err) {
    console.error('[GET /api/admin/settings]', err);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// POST /api/admin/settings — upsert a setting
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!profile || !['admin','super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { key, value } = await request.json();
    if (!key || value === undefined) {
      return NextResponse.json({ error: 'key and value required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('admin_settings')
      .upsert({ key, value: String(value), updated_by: user.id, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) throw error;

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id, action: 'update_setting',
      entity_type: 'admin_settings', new_value: { key, value },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/admin/settings]', err);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
