const https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const PROJECT_REF = 'kikxqygvlrzzgmipjmud';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtpa3hxeWd2bHJ6emdtaXBqbXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTYzMjU0OSwiZXhwIjoyMTA3MjA4NTQ5fQ.RTLQTsiOzkZ4d4dXCdYoAvQCFFTdOdy9KE4TD2JLb2M';

function makeRequest(method, path, body, headers) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const opts = {
      hostname: `${PROJECT_REF}.supabase.co`,
      path, method,
      headers: { ...headers, 'Content-Length': Buffer.byteLength(postData) },
      rejectUnauthorized: false,
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
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

const headers = {
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'apikey': SERVICE_ROLE_KEY,
  'Content-Type': 'application/json',
};

async function main() {
  // Try inserting with ONLY known-safe columns to check what the base schema looks like
  // Try without category_slug first
  console.log('Testing insert without new columns...');
  const r = await makeRequest('POST', '/rest/v1/property_listings', {
    user_id: '00000000-0000-0000-0000-000000000001',
    title: 'SCHEMA TEST',
    slug: 'schema-test-qk-zz9999',
    transaction_type: 'sale',
    price: 100000,
    area: 1000,
    seller_name: 'Test',
    seller_phone: '9999999999',
    seller_type: 'owner',
    status: 'pending',
    listing_id: 'QK-ZZ9999',
    negotiable: true,
    show_exact_location: false,
  }, { ...headers, 'Prefer': 'return=representation' });
  
  console.log('Status:', r.status);
  if (r.status === 201 && Array.isArray(r.body) && r.body.length > 0) {
    console.log('SUCCESS! Existing columns:', Object.keys(r.body[0]).join(', '));
    // Clean up
    const del = await makeRequest('DELETE', `/rest/v1/property_listings?listing_id=eq.QK-ZZ9999`, null, headers);
    console.log('Cleanup:', del.status);
  } else {
    console.log('Error:', JSON.stringify(r.body).slice(0, 500));
  }
}

main().catch(e => console.error('Fatal:', e.message));
