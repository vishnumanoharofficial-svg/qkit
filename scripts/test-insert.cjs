/**
 * Supabase migration runner via the pg connection URL
 * Uses the direct database URL if available, or falls back to generating 
 * the SQL migration file for manual execution.
 */
const https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const PROJECT_REF = 'kikxqygvlrzzgmipjmud';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtpa3hxeWd2bHJ6emdtaXBqbXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTYzMjU0OSwiZXhwIjoyMTA3MjA4NTQ5fQ.RTLQTsiOzkZ4d4dXCdYoAvQCFFTdOdy9KE4TD2JLb2M';

// STEP 1: First create the exec_sql RPC function using the anon/service key
// We need to create a helper function as a superuser - not possible via REST
// WORKAROUND: POST a property listing test to see what error we get
function makeRequest(hostname, method, path, body, headers) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const options = {
      hostname, path, method,
      headers: { ...headers, 'Content-Length': Buffer.byteLength(postData) },
      rejectUnauthorized: false,
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function main() {
  // Test: Try inserting a property listing to see current schema status
  console.log('\n=== Testing property insert ===');
  const testInsert = await makeRequest(
    `${PROJECT_REF}.supabase.co`,
    'POST',
    '/rest/v1/property_listings',
    {
      user_id: '00000000-0000-0000-0000-000000000001',
      title: 'TEST LISTING',
      slug: 'test-listing-qk-test01',
      transaction_type: 'sale',
      category_slug: 'residential-plots',
      taluk: 'Kottayam',
      town_panchayat: 'Kottayam Municipality',
      district: 'Kottayam',
      state: 'Kerala',
      price: 100000,
      price_unit: 'total',
      area: 1000,
      area_unit: 'sqft',
      seller_name: 'Test User',
      seller_phone: '9999999999',
      seller_type: 'owner',
      status: 'pending',
      listing_id: 'QK-TEST01',
      negotiable: true,
      show_exact_location: false,
    },
    {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    }
  );
  console.log('Insert result:', testInsert.status, JSON.stringify(testInsert.body).slice(0, 800));
}

main().catch(e => console.error('Error:', e.message));
