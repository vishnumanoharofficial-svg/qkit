const https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const PROJECT_REF = 'kikxqygvlrzzgmipjmud';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtpa3hxeWd2bHJ6emdtaXBqbXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTYzMjU0OSwiZXhwIjoyMTA3MjA4NTQ5fQ.RTLQTsiOzkZ4d4dXCdYoAvQCFFTdOdy9KE4TD2JLb2M';

function makeRequest(method, path, body, extraHeaders) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const opts = {
      hostname: `${PROJECT_REF}.supabase.co`,
      path, method,
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...(extraHeaders || {}),
      },
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

async function main() {
  // Try app_users to confirm service_role works for that table
  console.log('1. Testing app_users access...');
  const u = await makeRequest('GET', '/rest/v1/app_users?limit=1&select=*', null, {});
  console.log('app_users:', u.status, JSON.stringify(u.body).slice(0, 200));

  // Try reading app_users schema to confirm service_role works
  console.log('\n2. Trying property_listings with select only...');
  const pl = await makeRequest('GET', '/rest/v1/property_listings?limit=1&select=id,title,status', null, {});
  console.log('property_listings select:', pl.status, JSON.stringify(pl.body).slice(0, 300));

  // Try the openapi schema
  console.log('\n3. Checking OpenAPI schema...');
  const api = await makeRequest('GET', '/rest/v1/?select=*', null, {});
  console.log('OpenAPI:', api.status, String(api.body).slice(0, 200));
}

main().catch(e => console.error('Fatal:', e.message));
