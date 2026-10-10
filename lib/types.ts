export type UserRole = 'guest' | 'buyer' | 'seller' | 'agent' | 'builder' | 'moderator' | 'admin' | 'super_admin';
export type TransactionType = 'sale' | 'rent' | 'lease' | 'auction';
export type ListingStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'expired' | 'sold' | 'rented' | 'leased' | 'paused';
export type SellerType = 'owner' | 'agent' | 'builder';
export type AreaUnit = 'sqft' | 'sqmt' | 'cent' | 'acre' | 'ground' | 'bigha' | 'marla';
export type PriceUnit = 'total' | 'per_sqft' | 'per_month' | 'per_year';
export type MediaType = 'image' | 'video' | 'document';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
}

export interface Profile {
  user_id: string;
  bio?: string;
  company_name?: string;
  rera_number?: string;
  experience_years?: number;
  rating?: number;
  total_listings?: number;
}

export interface PropertyCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  subcategories?: PropertySubcategory[];
  field_definitions?: PropertyFieldDefinition[];
}

export interface PropertySubcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
}

export interface PropertyFieldDefinition {
  id: string;
  category_id: string;
  field_key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'textarea';
  options?: string[];
  is_required: boolean;
  sort_order: number;
  is_active: boolean;
  placeholder?: string;
  unit?: string;
}

export interface Locality {
  id: string;
  city_id: string;
  name: string;
  pincode?: string;
  lat?: number;
  lng?: number;
  city?: City;
}

export interface City {
  id: string;
  district_id: string;
  name: string;
  slug: string;
  is_popular: boolean;
  district?: District;
}

export interface District {
  id: string;
  state_id: string;
  name: string;
  state?: State;
}

export interface State {
  id: string;
  name: string;
  code: string;
}

export interface PropertyMedia {
  id: string;
  listing_id: string;
  url: string;
  type: MediaType;
  sort_order: number;
  is_primary: boolean;
}

export interface PropertyListing {
  id: string;
  user_id: string;
  category_id: string;
  subcategory_id?: string;
  title: string;
  slug: string;
  description?: string;
  transaction_type: TransactionType;
  status: ListingStatus;
  price: number;
  price_unit: PriceUnit;
  negotiable: boolean;
  area: number;
  area_unit: AreaUnit;
  locality_id?: string;
  address_line?: string;
  lat?: number;
  lng?: number;
  show_exact_location: boolean;
  seller_name: string;
  seller_phone: string;
  seller_type: SellerType;
  is_verified: boolean;
  is_featured: boolean;
  is_promoted: boolean;
  views_count: number;
  enquiries_count: number;
  listing_id: string;
  expires_at?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: PropertyCategory;
  locality?: Locality;
  media?: PropertyMedia[];
  attributes?: Record<string, string | number | boolean>;
  user?: User;
}

export interface Enquiry {
  id: string;
  listing_id: string;
  buyer_id?: string;
  seller_id: string;
  message: string;
  buyer_name?: string;
  buyer_phone?: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  created_at: string;
  listing?: PropertyListing;
}

export interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
  listing?: PropertyListing;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  filters_json: Record<string, unknown>;
  name?: string;
  alert_enabled: boolean;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  type: 'basic' | 'featured' | 'premium' | 'agent' | 'builder';
  price: number;
  duration_days: number;
  features_json: Record<string, unknown>;
  is_active: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'expired' | 'cancelled';
  starts_at: string;
  expires_at: string;
  plan?: Plan;
}

export interface AdminSetting {
  key: string;
  value: string;
  updated_at: string;
}

// Search / Filter types
export interface SearchFilters {
  query?: string;
  transaction_type?: TransactionType;
  category_slug?: string;
  state?: string;
  city?: string;
  locality?: string;
  pincode?: string;
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  area_unit?: AreaUnit;
  bedrooms?: string[];
  furnishing?: string[];
  seller_type?: SellerType;
  is_verified?: boolean;
  is_featured?: boolean;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'area_asc' | 'relevance';
  page?: number;
  per_page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
