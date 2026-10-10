-- ============================================================
-- qkit Real Estate Marketplace — Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Run on: Supabase PostgreSQL
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- LOCATION TAXONOMY
-- ============================================================

CREATE TABLE states (
  id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code CHAR(2) NOT NULL UNIQUE
);

CREATE TABLE districts (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  name     TEXT NOT NULL
);

CREATE TABLE cities (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  is_popular  BOOLEAN NOT NULL DEFAULT FALSE,
  lat         DOUBLE PRECISION,
  lng         DOUBLE PRECISION
);

CREATE TABLE localities (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name    TEXT NOT NULL,
  pincode CHAR(6),
  lat     DOUBLE PRECISION,
  lng     DOUBLE PRECISION
);

CREATE INDEX idx_localities_city_id ON localities(city_id);
CREATE INDEX idx_localities_pincode ON localities(pincode);

-- ============================================================
-- USERS & PROFILES
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'guest', 'buyer', 'seller', 'agent', 'builder',
  'moderator', 'admin', 'super_admin'
);

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT UNIQUE,
  phone       TEXT UNIQUE,
  name        TEXT NOT NULL,
  avatar_url  TEXT,
  role        user_role NOT NULL DEFAULT 'buyer',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE profiles (
  user_id          UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio              TEXT,
  company_name     TEXT,
  rera_number      TEXT,
  experience_years INT,
  rating           NUMERIC(3,2),
  total_listings   INT NOT NULL DEFAULT 0,
  website          TEXT,
  verified_at      TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROPERTY CATEGORIES (Admin-managed)
-- ============================================================

CREATE TABLE property_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  icon        TEXT,
  description TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE property_subcategories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES property_categories(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TYPE field_type AS ENUM (
  'text', 'number', 'select', 'multiselect', 'boolean', 'textarea'
);

CREATE TABLE property_field_definitions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES property_categories(id) ON DELETE CASCADE,
  field_key   TEXT NOT NULL,
  label       TEXT NOT NULL,
  type        field_type NOT NULL DEFAULT 'text',
  options     JSONB,          -- array of string options for select/multiselect
  placeholder TEXT,
  unit        TEXT,
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(category_id, field_key)
);

-- ============================================================
-- PROPERTY LISTINGS
-- ============================================================

CREATE TYPE transaction_type AS ENUM ('sale', 'rent', 'lease', 'auction');
CREATE TYPE listing_status   AS ENUM ('draft','pending','published','rejected','expired','sold','rented','leased','paused');
CREATE TYPE seller_type      AS ENUM ('owner', 'agent', 'builder');
CREATE TYPE area_unit        AS ENUM ('sqft','sqmt','cent','acre','ground','bigha','marla');
CREATE TYPE price_unit       AS ENUM ('total','per_sqft','per_month','per_year');

CREATE TABLE property_listings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id         UUID NOT NULL REFERENCES property_categories(id),
  subcategory_id      UUID REFERENCES property_subcategories(id),
  title               TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  description         TEXT,
  transaction_type    transaction_type NOT NULL,
  status              listing_status NOT NULL DEFAULT 'pending',
  price               BIGINT NOT NULL,
  price_unit          price_unit NOT NULL DEFAULT 'total',
  negotiable          BOOLEAN NOT NULL DEFAULT TRUE,
  area                NUMERIC(12,4) NOT NULL,
  area_unit           area_unit NOT NULL DEFAULT 'sqft',
  locality_id         UUID REFERENCES localities(id),
  address_line        TEXT,
  lat                 DOUBLE PRECISION,
  lng                 DOUBLE PRECISION,
  show_exact_location BOOLEAN NOT NULL DEFAULT FALSE,
  seller_name         TEXT NOT NULL,
  seller_phone        TEXT NOT NULL,
  seller_type         seller_type NOT NULL DEFAULT 'owner',
  is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured         BOOLEAN NOT NULL DEFAULT FALSE,
  is_promoted         BOOLEAN NOT NULL DEFAULT FALSE,
  views_count         INT NOT NULL DEFAULT 0,
  enquiries_count     INT NOT NULL DEFAULT 0,
  listing_id          TEXT NOT NULL UNIQUE,     -- Human-readable QK-XXXXXX
  expires_at          TIMESTAMPTZ,
  published_at        TIMESTAMPTZ,
  rejection_reason    TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast search
CREATE INDEX idx_listings_status           ON property_listings(status);
CREATE INDEX idx_listings_transaction_type ON property_listings(transaction_type);
CREATE INDEX idx_listings_category_id      ON property_listings(category_id);
CREATE INDEX idx_listings_locality_id      ON property_listings(locality_id);
CREATE INDEX idx_listings_user_id          ON property_listings(user_id);
CREATE INDEX idx_listings_price            ON property_listings(price);
CREATE INDEX idx_listings_area             ON property_listings(area);
CREATE INDEX idx_listings_created_at       ON property_listings(created_at DESC);
CREATE INDEX idx_listings_featured         ON property_listings(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_listings_search           ON property_listings USING gin(to_tsvector('english', title || ' ' || COALESCE(description,'')));
CREATE INDEX idx_listings_slug             ON property_listings(slug);

-- Dynamic attributes per listing (category-specific fields)
CREATE TABLE property_attributes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
  field_key  TEXT NOT NULL,
  field_value TEXT NOT NULL,
  UNIQUE(listing_id, field_key)
);
CREATE INDEX idx_attributes_listing_id ON property_attributes(listing_id);

CREATE TYPE media_type AS ENUM ('image', 'video', 'document');

CREATE TABLE property_media (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  type       media_type NOT NULL DEFAULT 'image',
  sort_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_media_listing_id ON property_media(listing_id);

-- ============================================================
-- ENGAGEMENT
-- ============================================================

CREATE TABLE favorites (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

CREATE TYPE enquiry_status AS ENUM ('new', 'read', 'replied', 'closed');

CREATE TABLE enquiries (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id   UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
  buyer_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  seller_id    UUID NOT NULL REFERENCES users(id),
  message      TEXT NOT NULL,
  buyer_name   TEXT,
  buyer_phone  TEXT,
  buyer_email  TEXT,
  status       enquiry_status NOT NULL DEFAULT 'new',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_enquiries_listing_id  ON enquiries(listing_id);
CREATE INDEX idx_enquiries_seller_id   ON enquiries(seller_id);
CREATE INDEX idx_enquiries_buyer_id    ON enquiries(buyer_id);

CREATE TABLE conversations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enquiry_id UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES users(id),
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);

CREATE TYPE visit_status AS ENUM ('requested','confirmed','completed','cancelled');

CREATE TABLE site_visits (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id     UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
  buyer_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preferred_date DATE NOT NULL,
  status         visit_status NOT NULL DEFAULT 'requested',
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE saved_searches (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filters_json  JSONB NOT NULL,
  name          TEXT,
  alert_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MODERATION
-- ============================================================

CREATE TABLE listing_status_history (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
  old_status listing_status,
  new_status listing_status NOT NULL,
  changed_by UUID REFERENCES users(id),
  reason     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE moderation_actions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id   UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
  moderator_id UUID NOT NULL REFERENCES users(id),
  action       TEXT NOT NULL,   -- 'approve','reject','unpublish','restore','suspend'
  reason       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reason      TEXT NOT NULL,
  details     TEXT,
  status      TEXT NOT NULL DEFAULT 'open',   -- open, reviewed, dismissed
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MONETIZATION
-- ============================================================

CREATE TYPE plan_type AS ENUM ('basic','featured','premium','agent','builder');
CREATE TYPE sub_status AS ENUM ('active','expired','cancelled');

CREATE TABLE plans (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  type           plan_type NOT NULL,
  price          INT NOT NULL,               -- in paise (₹1 = 100 paise)
  duration_days  INT NOT NULL DEFAULT 30,
  features_json  JSONB NOT NULL DEFAULT '{}',
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id    UUID NOT NULL REFERENCES plans(id),
  status     sub_status NOT NULL DEFAULT 'active',
  starts_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id),
  listing_id        UUID REFERENCES property_listings(id),
  plan_id           UUID REFERENCES plans(id),
  amount            INT NOT NULL,             -- in paise
  currency          CHAR(3) NOT NULL DEFAULT 'INR',
  status            TEXT NOT NULL DEFAULT 'created',  -- created,paid,failed,refunded
  razorpay_order_id TEXT UNIQUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id              UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  razorpay_payment_id   TEXT NOT NULL UNIQUE,
  razorpay_signature    TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'pending',  -- pending,verified,failed
  verified_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE promotions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,       -- featured, homepage_banner, category_top
  starts_at  TIMESTAMPTZ NOT NULL,
  ends_at    TIMESTAMPTZ NOT NULL,
  order_id   UUID REFERENCES orders(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PLATFORM
-- ============================================================

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  data_json  JSONB,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

CREATE TABLE admin_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id),
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  old_value   JSONB,
  new_value   JSONB,
  ip          INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

CREATE TABLE verification_records (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
  verifier_id UUID REFERENCES users(id),
  type        TEXT NOT NULL,     -- 'ownership','title_check','site_visit'
  status      TEXT NOT NULL DEFAULT 'pending',
  notes       TEXT,
  verified_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW-LEVEL SECURITY (Supabase)
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users: can only read/update their own profile
CREATE POLICY "users_own_row" ON users
  FOR ALL USING (auth.uid() = id);

-- Public listings: anyone can read published listings
CREATE POLICY "listings_public_read" ON property_listings
  FOR SELECT USING (status = 'published');

-- Sellers: can manage their own listings
CREATE POLICY "listings_owner_all" ON property_listings
  FOR ALL USING (auth.uid() = user_id);

-- Favorites: users manage their own
CREATE POLICY "favorites_own" ON favorites
  FOR ALL USING (auth.uid() = user_id);

-- Enquiries: buyer sees their enquiries, seller sees enquiries on their listings
CREATE POLICY "enquiries_buyer" ON enquiries
  FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "enquiries_seller" ON enquiries
  FOR SELECT USING (auth.uid() = seller_id);

-- Notifications: own only
CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- Orders/Payments: own only
CREATE POLICY "orders_own" ON orders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "payments_own" ON payments FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = payments.order_id AND o.user_id = auth.uid()));

-- ============================================================
-- DEFAULT SEED DATA — Categories & Fields
-- ============================================================

INSERT INTO property_categories (name, slug, icon, description, sort_order) VALUES
  ('Residential Plots',    'residential-plots',  '🏕️', 'Land for home construction',          1),
  ('Commercial Plots',     'commercial-plots',   '🏗️', 'Land for commercial use',              2),
  ('Houses & Villas',      'houses',             '🏡', 'Independent houses, villas',           3),
  ('Apartments & Flats',   'apartments',         '🏢', 'Flats, apartments, studios',           4),
  ('Commercial Spaces',    'commercial',         '🏪', 'Offices, shops, showrooms',            5),
  ('Agricultural Land',    'agricultural',       '🌾', 'Farm land, plantation',                6),
  ('Industrial Land',      'industrial',         '🏭', 'Industrial plots & sheds',             7),
  ('Warehouses',           'warehouses',         '🏚️', 'Godowns, warehouses',                  8),
  ('Office Spaces',        'office-spaces',      '💼', 'Offices, co-working spaces',           9),
  ('Shops & Showrooms',    'shops',              '🛍️', 'Retail, showrooms',                   10),
  ('Rental Properties',    'rental',             '🔑', 'Properties for rent',                 11),
  ('Lease Properties',     'lease-properties',   '📋', 'Long-term lease',                     12),
  ('Mixed-Use',            'mixed-use',          '🏙️', 'Mixed residential & commercial',      13);

INSERT INTO admin_settings (key, value) VALUES
  ('site_name',              'qkit'),
  ('tagline',                'Find Your Perfect Property'),
  ('free_listing_limit',     '3'),
  ('listing_expiry_days',    '90'),
  ('auto_publish',           'false'),
  ('support_email',          'support@qkit.in'),
  ('support_phone',          '+918000000000'),
  ('featured_price_7d',      '49900'),
  ('featured_price_30d',     '149900'),
  ('homepage_banner_price',  '299900');
