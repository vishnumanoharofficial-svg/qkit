-- ============================================================
-- qkit Phase 1 Migration
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Grant service_role access to bypass RLS for all tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 2. Add Kottayam location columns to property_listings (if they don't exist)
ALTER TABLE public.property_listings
  ADD COLUMN IF NOT EXISTS category_slug   TEXT,
  ADD COLUMN IF NOT EXISTS taluk           TEXT,
  ADD COLUMN IF NOT EXISTS town_panchayat  TEXT,
  ADD COLUMN IF NOT EXISTS district        TEXT DEFAULT 'Kottayam',
  ADD COLUMN IF NOT EXISTS state           TEXT DEFAULT 'Kerala',
  ADD COLUMN IF NOT EXISTS pincode         TEXT,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 3. Add published_at column if missing
ALTER TABLE public.property_listings
  ADD COLUMN IF NOT EXISTS published_at    TIMESTAMPTZ;

-- 4. Create property_attributes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.property_attributes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES public.property_listings(id) ON DELETE CASCADE,
  field_key   TEXT NOT NULL,
  field_value TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 5. Ensure property_media table exists
CREATE TABLE IF NOT EXISTS public.property_media (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES public.property_listings(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  type        TEXT DEFAULT 'image',
  sort_order  INT DEFAULT 0,
  is_primary  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 6. Grant access to new tables
GRANT ALL ON public.property_attributes TO service_role;
GRANT ALL ON public.property_media TO service_role;

-- 7. Enable RLS bypass for service_role on property_listings
ALTER TABLE public.property_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "service_role_bypass" ON public.property_listings
  AS PERMISSIVE FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 8. Allow anyone to read published listings (public read)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='property_listings' AND policyname='public_read_published'
  ) THEN
    CREATE POLICY "public_read_published" ON public.property_listings
      FOR SELECT USING (status = 'published');
  END IF;
END $$;

-- 9. Allow authenticated users to insert their own listings
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='property_listings' AND policyname='users_insert_own'
  ) THEN
    CREATE POLICY "users_insert_own" ON public.property_listings
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema='public' AND table_name='property_listings'
ORDER BY ordinal_position;
