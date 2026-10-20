import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ONE-TIME MIGRATION ENDPOINT
// Usage: GET https://qkit-five.vercel.app/api/run-migration?secret=qkit2024migrate
// Remove this file after migration is complete

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') !== 'qkit2024migrate') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const results: Record<string, unknown> = {};

  // The SQL statements we need to run
  const migrations = [
    // Grant service_role access to all tables
    `GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role`,
    `GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role`,
    // Add missing columns to property_listings
    `ALTER TABLE property_listings ADD COLUMN IF NOT EXISTS category_slug TEXT`,
    `ALTER TABLE property_listings ADD COLUMN IF NOT EXISTS taluk TEXT`,
    `ALTER TABLE property_listings ADD COLUMN IF NOT EXISTS town_panchayat TEXT`,
    `ALTER TABLE property_listings ADD COLUMN IF NOT EXISTS district TEXT DEFAULT 'Kottayam'`,
    `ALTER TABLE property_listings ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Kerala'`,
    `ALTER TABLE property_listings ADD COLUMN IF NOT EXISTS pincode TEXT`,
    `ALTER TABLE property_listings ADD COLUMN IF NOT EXISTS city TEXT`,
    `ALTER TABLE property_listings ADD COLUMN IF NOT EXISTS attributes JSONB`,
    // Add RLS policies
    `ALTER TABLE property_listings ENABLE ROW LEVEL SECURITY`,
    `DROP POLICY IF EXISTS service_role_bypass ON property_listings`,
    `CREATE POLICY service_role_bypass ON property_listings AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true)`,
    `DROP POLICY IF EXISTS public_read ON property_listings`,
    `CREATE POLICY public_read ON property_listings FOR SELECT USING (status = 'published')`,
    `DROP POLICY IF EXISTS anyone_insert ON property_listings`,
    `CREATE POLICY anyone_insert ON property_listings FOR INSERT WITH CHECK (true)`,
  ];

  // Try each migration via RPC
  for (const sql of migrations) {
    try {
      // Try via pg extension if available  
      const { data, error } = await supabase.rpc('exec_sql', { sql_text: sql });
      results[sql.slice(0, 50)] = { data, error: error?.message ?? null };
    } catch (e) {
      results[sql.slice(0, 50)] = { error: String(e) };
    }
  }

  // Also try the Supabase management API directly from the server
  try {
    const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    
    const fullSQL = migrations.join(';\n') + ';';
    
    // Try /v1/projects/{ref}/database/query with service role
    const mgmtRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: fullSQL }),
    });
    const mgmtBody = await mgmtRes.text();
    results['management_api'] = { status: mgmtRes.status, body: mgmtBody.slice(0, 500) };
  } catch (e) {
    results['management_api'] = { error: String(e) };
  }

  return NextResponse.json(results);
}
