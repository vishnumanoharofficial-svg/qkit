export * from './kottayam-locations';

export const APP_NAME = 'qkit';
export const APP_TAGLINE = 'Find Your Perfect Property';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const TRANSACTION_TYPES = [
  { value: 'sale',  label: 'Buy',   icon: 'Home',    color: 'brand' },
  { value: 'rent',  label: 'Rent',  icon: 'Key',     color: 'blue' },
  { value: 'lease', label: 'Lease', icon: 'FileText', color: 'purple' },
] as const;

export type TransactionType = 'sale' | 'rent' | 'lease' | 'auction';

export const PROPERTY_CATEGORIES = [
  { slug: 'residential-plots',  label: 'Residential Plots',  icon: '🏕️', description: 'Land for home construction' },
  { slug: 'commercial-plots',   label: 'Commercial Plots',   icon: '🏗️', description: 'Land for commercial use' },
  { slug: 'houses',             label: 'Houses & Villas',    icon: '🏡', description: 'Independent houses, villas' },
  { slug: 'apartments',         label: 'Apartments & Flats', icon: '🏢', description: 'Flats, apartments, studios' },
  { slug: 'commercial',         label: 'Commercial Spaces',  icon: '🏬', description: 'Offices, shops, showrooms' },
  { slug: 'agricultural',       label: 'Agricultural Land',  icon: '🌾', description: 'Farm land, plantation' },
  { slug: 'industrial',         label: 'Industrial Land',    icon: '🏭', description: 'Industrial plots & sheds' },
  { slug: 'warehouses',         label: 'Warehouses',         icon: '🏪', description: 'Godowns, warehouses' },
  { slug: 'office-spaces',      label: 'Office Spaces',      icon: '💼', description: 'Offices, co-working' },
  { slug: 'shops',              label: 'Shops & Showrooms',  icon: '🛍️', description: 'Retail, showrooms' },
  { slug: 'rental',             label: 'Rental Properties',  icon: '🔑', description: 'Properties for rent' },
  { slug: 'lease-properties',   label: 'Lease Properties',   icon: '📋', description: 'Long-term lease' },
  { slug: 'mixed-use',          label: 'Mixed-Use',          icon: '🏙️', description: 'Mixed residential & commercial' },
] as const;

export const POPULAR_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Pune', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Lucknow',
  'Kochi', 'Coimbatore', 'Surat', 'Nagpur', 'Bhopal',
];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi (NCT)', 'Jammu & Kashmir', 'Ladakh',
  'Puducherry', 'Chandigarh', 'Andaman & Nicobar Islands',
];

export const AREA_UNITS = [
  { value: 'sqft',   label: 'Sq. Ft.' },
  { value: 'sqmt',   label: 'Sq. Mt.' },
  { value: 'cent',   label: 'Cent' },
  { value: 'acre',   label: 'Acre' },
  { value: 'ground', label: 'Ground' },
  { value: 'bigha',  label: 'Bigha' },
  { value: 'marla',  label: 'Marla' },
];

export const SELLER_TYPES = [
  { value: 'owner',   label: 'Owner',           icon: '👤' },
  { value: 'agent',   label: 'Agent / Broker',  icon: '🤝' },
  { value: 'builder', label: 'Builder / Developer', icon: '🏗️' },
];

export const FURNISHING_TYPES = [
  { value: 'unfurnished',       label: 'Unfurnished' },
  { value: 'semi-furnished',    label: 'Semi-Furnished' },
  { value: 'fully-furnished',   label: 'Fully Furnished' },
];

export const FACING_DIRECTIONS = [
  'East', 'West', 'North', 'South',
  'North-East', 'North-West', 'South-East', 'South-West',
];

export const BHK_TYPES = [
  { value: '1rk',  label: '1 RK' },
  { value: '1bhk', label: '1 BHK' },
  { value: '2bhk', label: '2 BHK' },
  { value: '3bhk', label: '3 BHK' },
  { value: '4bhk', label: '4 BHK' },
  { value: '4plus', label: '4+ BHK' },
];

export const LISTING_STATUSES = [
  { value: 'draft',     label: 'Draft',     color: 'gray' },
  { value: 'pending',   label: 'Pending',   color: 'yellow' },
  { value: 'published', label: 'Published', color: 'green' },
  { value: 'rejected',  label: 'Rejected',  color: 'red' },
  { value: 'expired',   label: 'Expired',   color: 'orange' },
  { value: 'sold',      label: 'Sold',      color: 'blue' },
  { value: 'rented',    label: 'Rented',    color: 'purple' },
  { value: 'leased',    label: 'Leased',    color: 'teal' },
  { value: 'paused',    label: 'Paused',    color: 'slate' },
];

export const MAX_FREE_LISTINGS = 3;
export const MAX_IMAGES_PER_LISTING = 20;
export const MAX_IMAGE_SIZE_MB = 5;
export const LISTING_EXPIRY_DAYS = 90;
