const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  'https://kikxqygvlrzzgmipjmud.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtpa3hxeWd2bHJ6emdtaXBqbXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTYzMjU0OSwiZXhwIjoyMTA3MjA4NTQ5fQ.RTLQTsiOzkZ4d4dXCdYoAvQCFFTdOdy9KE4TD2JLb2M',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  // Fetch one row to see columns
  const { data, error } = await sb.from('property_listings').select('*').limit(1);
  if (error) { 
    console.log('FETCH ERROR:', JSON.stringify(error)); 
    return; 
  }
  if (data && data.length > 0) {
    console.log('COLUMNS:', Object.keys(data[0]).join(', '));
    console.log('SAMPLE ROW:', JSON.stringify(data[0], null, 2));
  } else {
    console.log('TABLE IS EMPTY');
    // Try to get column info via a dummy select
    const { error: se } = await sb.from('property_listings').select('id,title,category_slug,taluk,town_panchayat,district,state,pincode,status').limit(1);
    if (se) {
      console.log('SCHEMA CHECK ERROR:', JSON.stringify(se));
    } else {
      console.log('All new columns exist!');
    }
  }
}
main().catch(e => console.error('FATAL:', e.message));
