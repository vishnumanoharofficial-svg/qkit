const { createClient } = require('@supabase/supabase-js');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const supabase = createClient(
  'https://kikxqygvlrzzgmipjmud.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtpa3hxeWd2bHJ6emdtaXBqbXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTYzMjU0OSwiZXhwIjoyMTA3MjA4NTQ5fQ.RTLQTsiOzkZ4d4dXCdYoAvQCFFTdOdy9KE4TD2JLb2M',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  // Check what tables exist in the schema cache via OpenAPI
  const res = await fetch('https://kikxqygvlrzzgmipjmud.supabase.co/rest/v1/', {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtpa3hxeWd2bHJ6emdtaXBqbXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTYzMjU0OSwiZXhwIjoyMTA3MjA4NTQ5fQ.RTLQTsiOzkZ4d4dXCdYoAvQCFFTdOdy9KE4TD2JLb2M',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtpa3hxeWd2bHJ6emdtaXBqbXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTYzMjU0OSwiZXhwIjoyMTA3MjA4NTQ5fQ.RTLQTsiOzkZ4d4dXCdYoAvQCFFTdOdy9KE4TD2JLb2M',
    }
  });
  const body = await res.json();
  
  // List all paths (tables) available in the REST API
  const paths = Object.keys(body.paths || {});
  console.log('Available REST paths:', paths.slice(0, 30));
  
  // Check property_listings definition
  const plDef = body.definitions?.property_listings;
  if (plDef) {
    console.log('\nproperty_listings columns:', Object.keys(plDef.properties || {}));
  } else {
    console.log('\nproperty_listings not in schema!');
    console.log('All definitions:', Object.keys(body.definitions || {}).slice(0, 20));
  }
}

main().catch(e => console.error('Fatal:', e.message));
