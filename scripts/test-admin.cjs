const https = require('https');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const PROJECT_REF = 'kikxqygvlrzzgmipjmud';
// The service role key IS the access token for management API calls via /rest/v1
// But for management API we need a personal access token. 
// Let's try via the DB connection string approach using supabase-js with auth.admin

const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  'https://kikxqygvlrzzgmipjmud.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtpa3hxeWd2bHJ6emdtaXBqbXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTYzMjU0OSwiZXhwIjoyMTA3MjA4NTQ5fQ.RTLQTsiOzkZ4d4dXCdYoAvQCFFTdOdy9KE4TD2JLb2M',
  { 
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'public' },
    global: { headers: { 'x-my-custom-header': 'qkit' } }
  }
);

async function main() {
  // Try admin.listUsers to confirm service_role works
  const { data, error } = await sb.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (error) {
    console.log('Auth admin error:', JSON.stringify(error));
  } else {
    console.log('Auth admin works! Users count:', data.users?.length);
  }

  // Try rpc call for column check
  const { data: cols, error: colErr } = await sb.rpc('version');
  console.log('RPC version result:', cols, colErr ? JSON.stringify(colErr) : '');
}

main().catch(e => console.error('FATAL:', e.message));
