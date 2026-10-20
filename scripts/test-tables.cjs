const { createClient } = require('@supabase/supabase-js');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const supabase = createClient(
  'https://kikxqygvlrzzgmipjmud.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtpa3hxeWd2bHJ6emdtaXBqbXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTYzMjU0OSwiZXhwIjoyMTA3MjA4NTQ5fQ.RTLQTsiOzkZ4d4dXCdYoAvQCFFTdOdy9KE4TD2JLb2M',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function testTable(name) {
  const { data, error } = await supabase.from(name).select('*').limit(1);
  return { table: name, status: error ? 'FAIL' : 'OK', error: error?.message, count: data?.length };
}

async function main() {
  const tables = [
    'property_listings', 'property_attributes', 'property_media',
    'app_users', 'property_categories', 'enquiries', 'otp_codes'
  ];
  
  for (const t of tables) {
    const r = await testTable(t);
    console.log(JSON.stringify(r));
  }

  // Also try inserting into otp_codes (which we know works since OTP system works)
  console.log('\n--- Testing otp_codes insert ---');
  const { data: oi, error: oe } = await supabase.from('otp_codes').insert({
    email: 'test@test.com', code: '123456', expires_at: new Date(Date.now() + 60000).toISOString()
  }).select();
  console.log('otp_codes insert:', oe ? oe.message : 'SUCCESS', oi);
}

main().catch(e => console.error('Fatal:', e.message));
