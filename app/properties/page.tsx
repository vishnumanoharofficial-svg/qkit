'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LayoutGrid, List, SlidersHorizontal, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import PropertyCardSkeleton from '@/components/property/PropertyCardSkeleton';
import { cn } from '@/lib/utils';
import { PROPERTY_CATEGORIES, TRANSACTION_TYPES } from '@/lib/constants';
import {
  TALUKS,
  BLOCKS_AND_PANCHAYATS,
  MUNICIPALITIES,
  ALL_KOTTAYAM_LOCATIONS,
} from '@/lib/constants/kottayam-locations';
import type { PropertyListing } from '@/lib/types';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const AREA_PRESETS = [
  { label: 'Any', min: '', max: '' },
  { label: '< 500', min: '', max: '500' },
  { label: '500–1000', min: '500', max: '1000' },
  { label: '1000–2000', min: '1000', max: '2000' },
  { label: '2000–5000', min: '2000', max: '5000' },
  { label: '5000+', min: '5000', max: '' },
];

const PROPERTY_AGES = [
  { value: '', label: 'Any Age' },
  { value: 'New', label: 'New / Under Construction' },
  { value: '1 year', label: 'Less than 1 Year' },
  { value: '1-3 years', label: '1–3 Years' },
  { value: '3-5 years', label: '3–5 Years' },
  { value: '5-10 years', label: '5–10 Years' },
  { value: '10+ years', label: '10+ Years' },
];

const FURNISHING_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'furnished', label: 'Furnished' },
  { value: 'semi-furnished', label: 'Semi-Furnished' },
  { value: 'unfurnished', label: 'Unfurnished' },
];

const PARKING_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'open', label: 'Open Parking' },
  { value: 'covered', label: 'Covered Parking' },
  { value: 'none', label: 'No Parking' },
];

type Filters = {
  transaction_type: string;
  category: string;
  min_price: string;
  max_price: string;
  seller_type: string;
  verified: boolean;
  featured: boolean;
  // Location
  taluk: string;
  town_panchayat: string;
  locality: string;
  // Property details
  bedrooms: string;
  bathrooms: string;
  min_area: string;
  max_area: string;
  furnishing: string;
  parking: string;
  property_age: string;
};

const EMPTY_FILTERS: Filters = {
  transaction_type: '', category: '', min_price: '', max_price: '',
  seller_type: '', verified: false, featured: false,
  taluk: '', town_panchayat: '', locality: '',
  bedrooms: '', bathrooms: '', min_area: '', max_area: '',
  furnishing: '', parking: '', property_age: '',
};

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mr-2" />Loading properties…</div>}>
      <PropertiesPageInner />
    </Suspense>
  );
}

// ── Collapsible filter section ──────────────────────────────────────────────
function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full mb-2 group"
      >
        <span className="text-sm font-semibold text-slate-700 group-hover:text-brand-600 transition-colors">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

function PropertiesPageInner() {
  const searchParams = useSearchParams();
  const [view, setView]             = useState<'grid'|'list'>('grid');
  const [sort, setSort]             = useState('newest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [listings, setListings]     = useState<PropertyListing[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filters, setFilters] = useState<Filters>({
    ...EMPTY_FILTERS,
    transaction_type: searchParams.get('type') || '',
    category:         searchParams.get('category') || '',
    featured:         searchParams.get('featured') === 'true',
    // Location card clicks pass taluk= or town_panchayat= directly
    taluk:          searchParams.get('taluk') || '',
    town_panchayat: searchParams.get('town_panchayat') || '',
    locality:       searchParams.get('locality') || '',
  });

  // Derived: towns for selected taluk
  const townsForTaluk = filters.taluk
    ? [
        ...MUNICIPALITIES.filter(m => m.taluk === filters.taluk).map(m => m.name),
        ...BLOCKS_AND_PANCHAYATS.filter(b => b.taluk === filters.taluk).flatMap(b => b.panchayats),
      ].sort()
    : [];

  // Fetch + client-side filter
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('status', 'published');
    params.set('limit', '100');
    params.set('sort', sort);
    if (filters.transaction_type) params.set('type', filters.transaction_type);
    if (filters.featured)         params.set('featured', 'true');
    // Pass location filters server-side for accurate DB-level filtering
    if (filters.taluk)          params.set('taluk', filters.taluk);
    if (filters.town_panchayat) params.set('town_panchayat', filters.town_panchayat);

    fetch(`/api/properties?${params.toString()}`)
      .then(r => r.json())
      .then((json: { data?: PropertyListing[]; total?: number }) => {
        let data = (json.data ?? []) as (PropertyListing & {
          attributes?: Record<string, string | number | boolean>;
          taluk?: string;
          town_panchayat?: string;
          address_line?: string;
        })[];

        // ── Client-side filters (fields not handled server-side) ──
        if (filters.category)    data = data.filter(l => l.category?.slug === filters.category || (l as unknown as Record<string,string>).category_slug === filters.category);
        if (filters.seller_type) data = data.filter(l => l.seller_type === filters.seller_type);
        if (filters.verified)    data = data.filter(l => l.is_verified);
        if (filters.min_price)   data = data.filter(l => l.price >= Number(filters.min_price));
        if (filters.max_price)   data = data.filter(l => l.price <= Number(filters.max_price));
        // Locality: sub-area text search within address_line
        if (filters.locality) data = data.filter(l =>
          l.address_line?.toLowerCase().includes(filters.locality.toLowerCase())
        );
        // Property detail filters (from attributes JSONB)
        if (filters.bedrooms) data = data.filter(l => {
          const attrs = l.attributes as Record<string, string | number | boolean> | undefined;
          return String(attrs?.bedrooms ?? '') === filters.bedrooms;
        });
        if (filters.bathrooms) data = data.filter(l => {
          const attrs = l.attributes as Record<string, string | number | boolean> | undefined;
          return String(attrs?.bathrooms ?? '') === filters.bathrooms;
        });
        if (filters.furnishing) data = data.filter(l => {
          const attrs = l.attributes as Record<string, string | number | boolean> | undefined;
          return String(attrs?.furnishing ?? '') === filters.furnishing;
        });
        if (filters.parking) data = data.filter(l => {
          const attrs = l.attributes as Record<string, string | number | boolean> | undefined;
          return String(attrs?.parking ?? '') === filters.parking;
        });
        if (filters.property_age) data = data.filter(l => {
          const attrs = l.attributes as Record<string, string | number | boolean> | undefined;
          return String(attrs?.age ?? '') === filters.property_age;
        });
        if (filters.min_area) data = data.filter(l => (l.area ?? 0) >= Number(filters.min_area));
        if (filters.max_area) data = data.filter(l => (l.area ?? 0) <= Number(filters.max_area));

        setListings(data);
      })
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [filters, sort]);

  const setF = (key: keyof Filters, value: string | boolean) =>
    setFilters(f => ({ ...f, [key]: value }));

  function clearFilters() {
    setFilters({ ...EMPTY_FILTERS });
  }

  const activeFilterCount = [
    filters.transaction_type, filters.category, filters.seller_type,
    filters.min_price, filters.max_price,
    filters.taluk, filters.town_panchayat, filters.locality,
    filters.bedrooms, filters.bathrooms,
    filters.min_area, filters.max_area,
    filters.furnishing, filters.parking, filters.property_age,
    filters.verified, filters.featured,
  ].filter(Boolean).length;

  // ── Shared filter panels (used in both sidebar & bottom sheet) ──
  const FilterPanelContent = ({ compact = false }: { compact?: boolean }) => (
    <div className={compact ? 'space-y-0' : 'space-y-0'}>

      {/* ── Transaction Type ── */}
      <FilterSection title="Transaction Type" defaultOpen={true}>
        <div className={cn('flex flex-wrap gap-2', !compact && 'flex-col gap-1.5')}>
          {TRANSACTION_TYPES.map(t => (
            compact ? (
              <button key={t.value}
                onClick={() => setF('transaction_type', filters.transaction_type === t.value ? '' : t.value)}
                className={cn('px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                  filters.transaction_type === t.value
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'border-slate-200 text-slate-600 hover:border-brand-300')}
              >{t.label}</button>
            ) : (
              <label key={t.value} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="tx_desktop" value={t.value}
                  checked={filters.transaction_type === t.value}
                  onChange={() => setF('transaction_type', t.value)}
                  className="accent-brand-600" />
                <span className="text-sm text-slate-700">{t.label}</span>
              </label>
            )
          ))}
          {filters.transaction_type && !compact && (
            <button onClick={() => setF('transaction_type', '')} className="text-xs text-slate-400 hover:text-slate-600 self-start">✕ Clear</button>
          )}
        </div>
      </FilterSection>

      {/* ── Category ── */}
      <FilterSection title="Property Category" defaultOpen={true}>
        <select className="input text-sm" value={filters.category}
          onChange={e => setF('category', e.target.value)}>
          <option value="">All Categories</option>
          {PROPERTY_CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
        </select>
      </FilterSection>

      {/* ── Location ── */}
      <FilterSection title="📍 Location" defaultOpen={true}>
        <div className="space-y-3">
          {/* Taluk */}
          <div>
            <p className="text-xs text-slate-500 mb-1 font-medium">Taluk</p>
            <select className="input text-sm" value={filters.taluk}
              onChange={e => setFilters(f => ({ ...f, taluk: e.target.value, town_panchayat: '', locality: '' }))}>
              <option value="">All Taluks</option>
              {TALUKS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {/* Town / Panchayat */}
          <div>
            <p className="text-xs text-slate-500 mb-1 font-medium">Town / Panchayat</p>
            <select className="input text-sm" value={filters.town_panchayat}
              onChange={e => setFilters(f => ({ ...f, town_panchayat: e.target.value, locality: '' }))}
              disabled={!filters.taluk}>
              <option value="">{filters.taluk ? 'All Towns / Panchayats' : 'Select a Taluk first'}</option>
              {townsForTaluk.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {/* Locality */}
          <div>
            <p className="text-xs text-slate-500 mb-1 font-medium">Locality / Area</p>
            <input
              className="input text-sm"
              list="locality-filter-list"
              placeholder="e.g. Nagampadom, Baker Junction…"
              value={filters.locality}
              onChange={e => setF('locality', e.target.value)}
            />
            <datalist id="locality-filter-list">
              {ALL_KOTTAYAM_LOCATIONS.map(l => <option key={l} value={l} />)}
            </datalist>
          </div>
        </div>
      </FilterSection>

      {/* ── Price Range ── */}
      <FilterSection title="💰 Price Range (₹)" defaultOpen={false}>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" className="input text-sm" value={filters.min_price}
            onChange={e => setF('min_price', e.target.value)} />
          <input type="number" placeholder="Max" className="input text-sm" value={filters.max_price}
            onChange={e => setF('max_price', e.target.value)} />
        </div>
      </FilterSection>

      {/* ── Area (sq.ft) ── */}
      <FilterSection title="📐 Area (sq.ft)" defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {AREA_PRESETS.map(p => (
            <button key={p.label}
              onClick={() => setFilters(f => ({ ...f, min_area: p.min, max_area: p.max }))}
              className={cn('px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
                filters.min_area === p.min && filters.max_area === p.max
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'border-slate-200 text-slate-600 hover:border-brand-300'
              )}
            >{p.label} sqft</button>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input type="number" placeholder="Min sqft" className="input text-sm" value={filters.min_area}
            onChange={e => setF('min_area', e.target.value)} />
          <input type="number" placeholder="Max sqft" className="input text-sm" value={filters.max_area}
            onChange={e => setF('max_area', e.target.value)} />
        </div>
      </FilterSection>

      {/* ── Bedrooms ── */}
      <FilterSection title="🛏 Bedrooms (BHK)" defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5">
          {['', '1', '2', '3', '4', '5', '6+'].map(v => (
            <button key={v}
              onClick={() => setF('bedrooms', filters.bedrooms === v ? '' : v)}
              className={cn('w-10 h-10 rounded-xl text-sm font-semibold border transition-all',
                filters.bedrooms === v && v !== ''
                  ? 'bg-brand-600 text-white border-brand-600'
                  : v === ''
                    ? 'hidden'
                    : 'border-slate-200 text-slate-600 hover:border-brand-400'
              )}
            >{v}</button>
          ))}
          {filters.bedrooms && (
            <button onClick={() => setF('bedrooms', '')} className="text-xs text-slate-400 hover:text-slate-600 self-center ml-1">✕ Any</button>
          )}
        </div>
      </FilterSection>

      {/* ── Bathrooms ── */}
      <FilterSection title="🚿 Bathrooms" defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5">
          {['1', '2', '3', '4', '5', '6'].map(v => (
            <button key={v}
              onClick={() => setF('bathrooms', filters.bathrooms === v ? '' : v)}
              className={cn('w-10 h-10 rounded-xl text-sm font-semibold border transition-all',
                filters.bathrooms === v
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'border-slate-200 text-slate-600 hover:border-brand-400'
              )}
            >{v}</button>
          ))}
          {filters.bathrooms && (
            <button onClick={() => setF('bathrooms', '')} className="text-xs text-slate-400 hover:text-slate-600 self-center ml-1">✕ Any</button>
          )}
        </div>
      </FilterSection>

      {/* ── Furnishing ── */}
      <FilterSection title="🛋 Furnishing" defaultOpen={false}>
        <div className="space-y-1.5">
          {FURNISHING_OPTIONS.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={`furnishing_${compact ? 'm' : 'd'}`} value={opt.value}
                checked={filters.furnishing === opt.value}
                onChange={() => setF('furnishing', opt.value)}
                className="accent-brand-600" />
              <span className="text-sm text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* ── Parking ── */}
      <FilterSection title="🚗 Parking" defaultOpen={false}>
        <div className="space-y-1.5">
          {PARKING_OPTIONS.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={`parking_${compact ? 'm' : 'd'}`} value={opt.value}
                checked={filters.parking === opt.value}
                onChange={() => setF('parking', opt.value)}
                className="accent-brand-600" />
              <span className="text-sm text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* ── Property Age ── */}
      <FilterSection title="🏗 Property Age" defaultOpen={false}>
        <select className="input text-sm" value={filters.property_age}
          onChange={e => setF('property_age', e.target.value)}>
          {PROPERTY_AGES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
      </FilterSection>

      {/* ── Listed By ── */}
      <FilterSection title="👤 Listed By" defaultOpen={false}>
        <div className={cn(compact ? 'flex flex-wrap gap-2' : 'space-y-1.5')}>
          {[{ v: 'owner', l: 'Owner' }, { v: 'agent', l: 'Agent / Dealer' }, { v: 'builder', l: 'Builder' }].map(s => (
            compact ? (
              <button key={s.v}
                onClick={() => setF('seller_type', filters.seller_type === s.v ? '' : s.v)}
                className={cn('px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                  filters.seller_type === s.v
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'border-slate-200 text-slate-600 hover:border-brand-300'
                )}
              >{s.l}</button>
            ) : (
              <label key={s.v} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="seller_d" value={s.v}
                  checked={filters.seller_type === s.v}
                  onChange={() => setF('seller_type', s.v)}
                  className="accent-brand-600" />
                <span className="text-sm text-slate-700">{s.l}</span>
              </label>
            )
          ))}
          {filters.seller_type && !compact && (
            <button onClick={() => setF('seller_type', '')} className="text-xs text-slate-400 hover:text-slate-600 self-start">✕ Clear</button>
          )}
        </div>
      </FilterSection>

      {/* ── Toggles ── */}
      <FilterSection title="✨ Special" defaultOpen={false}>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-slate-700">Verified Only</span>
            <input type="checkbox" checked={filters.verified}
              onChange={e => setF('verified', e.target.checked)}
              className="accent-brand-600 w-4 h-4" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-slate-700">Featured Only</span>
            <input type="checkbox" checked={filters.featured}
              onChange={e => setF('featured', e.target.checked)}
              className="accent-brand-600 w-4 h-4" />
          </label>
        </div>
      </FilterSection>
    </div>
  );

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16 overflow-x-hidden">
        {/* Page header */}
        <div className="bg-white border-b border-slate-100 py-5">
          <div className="container-qkit">
            <h1 className="font-heading text-2xl font-bold text-slate-900">
              {filters.town_panchayat
                ? `Properties in ${filters.town_panchayat}`
                : filters.taluk
                  ? `Properties in ${filters.taluk} Taluk`
                  : 'All Properties in Kottayam'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {loading ? 'Loading…' : `${listings.length} propert${listings.length === 1 ? 'y' : 'ies'} found`}
              {activeFilterCount > 0 && <span className="ml-2 text-brand-600 font-medium">({activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active)</span>}
            </p>
          </div>
        </div>

        <div className="container-qkit py-6">
          <div className="flex gap-6 lg:gap-8">

            {/* ── Desktop Sidebar ── */}
            <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-bold text-slate-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-brand-600" />Filters
                  </h2>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-xs text-brand-600 hover:underline font-medium">
                      Clear all ({activeFilterCount})
                    </button>
                  )}
                </div>
                <FilterPanelContent compact={false} />
              </div>
            </aside>

            {/* ── Main Content ── */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <button onClick={() => setFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 btn-secondary btn-sm">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-2 ml-auto">
                  <select className="input text-sm w-40 sm:w-44" value={sort} onChange={e => setSort(e.target.value)}>
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                    <button onClick={() => setView('grid')}
                      className={cn('p-1.5 rounded-lg transition-colors', view === 'grid' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600')}
                      aria-label="Grid view"><LayoutGrid className="w-4 h-4" /></button>
                    <button onClick={() => setView('list')}
                      className={cn('p-1.5 rounded-lg transition-colors', view === 'list' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600')}
                      aria-label="List view"><List className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              {/* Active filter pills */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {filters.transaction_type && <FilterPill label={`Type: ${filters.transaction_type}`} onRemove={() => setF('transaction_type', '')} />}
                  {filters.category && <FilterPill label={`Category: ${filters.category}`} onRemove={() => setF('category', '')} />}
                  {filters.taluk && <FilterPill label={`Taluk: ${filters.taluk}`} onRemove={() => setFilters(f => ({ ...f, taluk: '', town_panchayat: '', locality: '' }))} />}
                  {filters.town_panchayat && <FilterPill label={`Town: ${filters.town_panchayat}`} onRemove={() => setFilters(f => ({ ...f, town_panchayat: '', locality: '' }))} />}
                  {filters.locality && <FilterPill label={`Area: ${filters.locality}`} onRemove={() => setF('locality', '')} />}
                  {filters.min_price && <FilterPill label={`Min ₹${Number(filters.min_price).toLocaleString('en-IN')}`} onRemove={() => setF('min_price', '')} />}
                  {filters.max_price && <FilterPill label={`Max ₹${Number(filters.max_price).toLocaleString('en-IN')}`} onRemove={() => setF('max_price', '')} />}
                  {filters.min_area && <FilterPill label={`Min ${filters.min_area} sqft`} onRemove={() => setF('min_area', '')} />}
                  {filters.max_area && <FilterPill label={`Max ${filters.max_area} sqft`} onRemove={() => setF('max_area', '')} />}
                  {filters.bedrooms && <FilterPill label={`${filters.bedrooms} BHK`} onRemove={() => setF('bedrooms', '')} />}
                  {filters.bathrooms && <FilterPill label={`${filters.bathrooms} Bath`} onRemove={() => setF('bathrooms', '')} />}
                  {filters.furnishing && <FilterPill label={filters.furnishing} onRemove={() => setF('furnishing', '')} />}
                  {filters.parking && <FilterPill label={`Parking: ${filters.parking}`} onRemove={() => setF('parking', '')} />}
                  {filters.property_age && <FilterPill label={`Age: ${filters.property_age}`} onRemove={() => setF('property_age', '')} />}
                  {filters.seller_type && <FilterPill label={`By: ${filters.seller_type}`} onRemove={() => setF('seller_type', '')} />}
                  {filters.verified && <FilterPill label="Verified" onRemove={() => setF('verified', false)} />}
                  {filters.featured && <FilterPill label="Featured" onRemove={() => setF('featured', false)} />}
                </div>
              )}

              {/* Listings */}
              {loading ? (
                <div className={cn(view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5' : 'flex flex-col gap-4')}>
                  {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="font-heading font-semibold text-slate-700 mb-2">No properties found</h3>
                  <p className="text-slate-500 text-sm mb-6">Try adjusting your filters or check back later for new listings.</p>
                  <button onClick={clearFilters} className="btn-primary btn-md">Clear All Filters</button>
                </div>
              ) : (
                <div className={cn(view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5' : 'flex flex-col gap-4')}>
                  {listings.map(l => <PropertyCard key={l.id} listing={l} view={view} />)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Mobile Filter Bottom Sheet ── */}
        {filterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setFilterOpen(false)} />
            <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl" style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
              {/* Sheet header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
                <h2 className="font-heading font-bold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-brand-600" />Filters
                  {activeFilterCount > 0 && <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center">{activeFilterCount}</span>}
                </h2>
                <button onClick={() => setFilterOpen(false)} className="p-2 rounded-xl hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1 px-5 py-4">
                <FilterPanelContent compact={true} />
              </div>
              {/* Sticky footer buttons */}
              <div className="flex gap-3 px-5 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
                <button onClick={() => { clearFilters(); }} className="flex-1 btn-secondary btn-lg text-sm">
                  Clear All
                </button>
                <button onClick={() => setFilterOpen(false)} className="flex-1 btn-primary btn-lg text-sm">
                  {loading ? 'Loading…' : `Show ${listings.length} Result${listings.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-brand-900" aria-label="Remove filter"><X className="w-3 h-3" /></button>
    </span>
  );
}
