const https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const PROJECT_REF = 'kikxqygvlrzzgmipjmud';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtpa3hxeWd2bHJ6emdtaXBqbXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTYzMjU0OSwiZXhwIjoyMTA3MjA4NTQ5fQ.RTLQTsiOzkZ4d4dXCdYoAvQCFFTdOdy9KE4TD2JLb2M';

function makeRequest(hostname, method, path, body, token) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const options = {
      hostname,
      path,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
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

const sql = `
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
ALTER TABLE public.property_listings
  ADD COLUMN IF NOT EXISTS category_slug    TEXT,
  ADD COLUMN IF NOT EXISTS taluk            TEXT,
  ADD COLUMN IF NOT EXISTS town_panchayat   TEXT,
  ADD COLUMN IF NOT EXISTS district         TEXT DEFAULT 'Kottayam',
  ADD COLUMN IF NOT EXISTS state            TEXT DEFAULT 'Kerala',
  ADD COLUMN IF NOT EXISTS pincode          TEXT,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS published_at     TIMESTAMPTZ;
CREATE TABLE IF NOT EXISTS public.property_attributes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES public.property_listings(id) ON DELETE CASCADE,
  field_key   TEXT NOT NULL,
  field_value TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.property_media (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES public.property_listings(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  type        TEXT DEFAULT 'image',
  sort_order  INT DEFAULT 0,
  is_primary  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);
GRANT ALL ON public.property_attributes TO service_role;
GRANT ALL ON public.property_media TO service_role;
ALTER TABLE public.property_listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_bypass" ON public.property_listings;
CREATE POLICY "service_role_bypass" ON public.property_listings AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_read_published" ON public.property_listings;
CREATE POLICY "public_read_published" ON public.property_listings FOR SELECT USING (status = 'published');
DROP POLICY IF EXISTS "users_insert_own" ON public.property_listings;
CREATE POLICY "users_insert_own" ON public.property_listings FOR INSERT WITH CHECK (true);
ALTER TABLE public.property_attributes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "attr_service_role" ON public.property_attributes;
CREATE POLICY "attr_service_role" ON public.property_attributes AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);
ALTER TABLE public.property_media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "media_service_role" ON public.property_media;
CREATE POLICY "media_service_role" ON public.property_media AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);
`;

async function main() {
  // Supabase Management API: POST /v1/projects/{ref}/database/query
  console.log('Trying Management API /v1/projects/.../database/query ...');
  const r1 = await makeRequest(
    'api.supabase.com',
    'POST',
    `/v1/projects/${PROJECT_REF}/database/query`,
    { query: sql },
    SERVICE_ROLE_KEY
  );
  console.log('Management API result:', r1.status, JSON.stringify(r1.body).slice(0, 1000));
}

main().catch(e => console.error('Error:', e.message));
