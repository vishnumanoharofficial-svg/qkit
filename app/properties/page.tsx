'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LayoutGrid, List, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import PropertyCardSkeleton from '@/components/property/PropertyCardSkeleton';
import { cn } from '@/lib/utils';
import { PROPERTY_CATEGORIES, TRANSACTION_TYPES } from '@/lib/constants';
import type { PropertyListing } from '@/lib/types';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Loading properties…</div>}>
      <PropertiesPageInner />
    </Suspense>
  );
}

function PropertiesPageInner() {
  const searchParams = useSearchParams();
  const [view, setView]             = useState<'grid'|'list'>('grid');
  const [sort, setSort]             = useState('newest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [listings, setListings]     = useState<PropertyListing[]>([]);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [filters, setFilters] = useState({
    transaction_type: searchParams.get('type') || '',
    category:         searchParams.get('category') || '',
    min_price:        '',
    max_price:        '',
    seller_type:      '',
    verified:         false,
    featured:         searchParams.get('featured') === 'true',
  });

  // Fetch real listings from API
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('status', 'published');
    params.set('limit', '50');
    params.set('sort', sort);
    if (filters.transaction_type) params.set('type', filters.transaction_type);
    if (filters.featured)         params.set('featured', 'true');

    fetch(`/api/properties?${params.toString()}`)
      .then(r => r.json())
      .then((json: { data?: PropertyListing[]; total?: number }) => {
        let data = json.data ?? [];
        // Client-side filter for fields not supported by API
        if (filters.category)    data = data.filter(l => l.category?.slug === filters.category);
        if (filters.seller_type) data = data.filter(l => l.seller_type === filters.seller_type);
        if (filters.verified)    data = data.filter(l => l.is_verified);
        if (filters.min_price)   data = data.filter(l => l.price >= Number(filters.min_price));
        if (filters.max_price)   data = data.filter(l => l.price <= Number(filters.max_price));
        setListings(data);
        setTotal(json.total ?? data.length);
      })
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [filters, sort]);

  function clearFilters() {
    setFilters({ transaction_type:'', category:'', min_price:'', max_price:'', seller_type:'', verified: false, featured: false });
  }

  const activeFilterCount = [
    filters.transaction_type, filters.category, filters.seller_type,
    filters.min_price, filters.max_price, filters.verified, filters.featured,
  ].filter(Boolean).length;

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
        {/* Page header */}
        <div className="bg-white border-b border-slate-100 py-6">
          <div className="container-qkit">
            <h1 className="font-heading text-2xl font-bold text-slate-900">All Properties in Kottayam</h1>
            <p className="text-slate-500 text-sm mt-1">
              {loading ? 'Loading…' : `${listings.length} properties found`}
            </p>
          </div>
        </div>

        <div className="container-qkit py-8">
          <div className="flex gap-8">
            {/* Sidebar filters — desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="card p-5 sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-heading font-semibold text-slate-900">Filters</h2>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-xs text-brand-600 hover:underline">Clear all</button>
                  )}
                </div>

                {/* Transaction type */}
                <div className="mb-5">
                  <label className="label">Transaction Type</label>
                  <div className="space-y-1.5">
                    {TRANSACTION_TYPES.map(t => (
                      <label key={t.value} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="tx" value={t.value}
                          checked={filters.transaction_type === t.value}
                          onChange={() => setFilters(f => ({ ...f, transaction_type: t.value }))}
                          className="accent-brand-600" />
                        <span className="text-sm text-slate-700">{t.label}</span>
                      </label>
                    ))}
                    {filters.transaction_type && (
                      <button onClick={() => setFilters(f => ({ ...f, transaction_type: '' }))} className="text-xs text-slate-400 hover:text-slate-600">✕ Clear</button>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="mb-5">
                  <label className="label">Category</label>
                  <select className="input text-sm" value={filters.category}
                    onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
                    <option value="">All Categories</option>
                    {PROPERTY_CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
                  </select>
                </div>

                {/* Price range */}
                <div className="mb-5">
                  <label className="label">Price Range (₹)</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min" className="input text-sm" value={filters.min_price}
                      onChange={e => setFilters(f => ({ ...f, min_price: e.target.value }))} />
                    <input type="number" placeholder="Max" className="input text-sm" value={filters.max_price}
                      onChange={e => setFilters(f => ({ ...f, max_price: e.target.value }))} />
                  </div>
                </div>

                {/* Seller type */}
                <div className="mb-5">
                  <label className="label">Listed By</label>
                  <div className="space-y-1.5">
                    {[{v:'owner',l:'Owner'},{v:'agent',l:'Agent'},{v:'builder',l:'Builder'}].map(s => (
                      <label key={s.v} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="seller" value={s.v}
                          checked={filters.seller_type === s.v}
                          onChange={() => setFilters(f => ({ ...f, seller_type: s.v }))}
                          className="accent-brand-600" />
                        <span className="text-sm text-slate-700">{s.l}</span>
                      </label>
                    ))}
                    {filters.seller_type && (
                      <button onClick={() => setFilters(f => ({ ...f, seller_type: '' }))} className="text-xs text-slate-400 hover:text-slate-600">✕ Clear</button>
                    )}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-slate-700">Verified Only</span>
                    <input type="checkbox" checked={filters.verified}
                      onChange={e => setFilters(f => ({ ...f, verified: e.target.checked }))}
                      className="accent-brand-600 w-4 h-4" />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-slate-700">Featured Only</span>
                    <input type="checkbox" checked={filters.featured}
                      onChange={e => setFilters(f => ({ ...f, featured: e.target.checked }))}
                      className="accent-brand-600 w-4 h-4" />
                  </label>
                </div>
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4 mb-5">
                <button onClick={() => setFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 btn-secondary btn-sm">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center">{activeFilterCount}</span>}
                </button>

                <div className="flex items-center gap-3 ml-auto">
                  <select className="input text-sm w-44" value={sort} onChange={e => setSort(e.target.value)}>
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                    <button onClick={() => setView('grid')} className={cn('p-1.5 rounded-lg transition-colors', view==='grid' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600')} aria-label="Grid view"><LayoutGrid className="w-4 h-4" /></button>
                    <button onClick={() => setView('list')} className={cn('p-1.5 rounded-lg transition-colors', view==='list' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600')} aria-label="List view"><List className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>

              {/* Active filters pills */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {filters.transaction_type && <FilterPill label={`Type: ${filters.transaction_type}`} onRemove={() => setFilters(f => ({ ...f, transaction_type: '' }))} />}
                  {filters.category && <FilterPill label={`Category: ${filters.category}`} onRemove={() => setFilters(f => ({ ...f, category: '' }))} />}
                  {filters.seller_type && <FilterPill label={`By: ${filters.seller_type}`} onRemove={() => setFilters(f => ({ ...f, seller_type: '' }))} />}
                  {filters.verified && <FilterPill label="Verified" onRemove={() => setFilters(f => ({ ...f, verified: false }))} />}
                  {filters.featured && <FilterPill label="Featured" onRemove={() => setFilters(f => ({ ...f, featured: false }))} />}
                </div>
              )}

              {/* Listings grid */}
              {loading ? (
                <div className={cn(
                  view === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                    : 'flex flex-col gap-4'
                )}>
                  {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-24">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="font-heading font-semibold text-slate-700 mb-2">No properties found</h3>
                  <p className="text-slate-500 text-sm mb-6">Try adjusting your filters or check back later for new listings.</p>
                  <button onClick={clearFilters} className="btn-primary btn-md">Clear All Filters</button>
                </div>
              ) : (
                <div className={cn(
                  view === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                    : 'flex flex-col gap-4'
                )}>
                  {listings.map(l => <PropertyCard key={l.id} listing={l} view={view} />)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile filter bottom sheet */}
        {filterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setFilterOpen(false)} />
            <div className="bottom-sheet">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading font-bold text-slate-900">Filters</h2>
                <button onClick={() => setFilterOpen(false)} className="p-2 rounded-xl hover:bg-slate-100"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="label">Transaction Type</label>
                  <div className="flex flex-wrap gap-2">
                    {TRANSACTION_TYPES.map(t => (
                      <button key={t.value}
                        onClick={() => setFilters(f => ({ ...f, transaction_type: f.transaction_type===t.value ? '' : t.value }))}
                        className={cn('px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                          filters.transaction_type===t.value ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200 text-slate-600 hover:border-brand-300')}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
                    <option value="">All Categories</option>
                    {PROPERTY_CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { clearFilters(); setFilterOpen(false); }} className="flex-1 btn-secondary btn-lg">Clear All</button>
                  <button onClick={() => setFilterOpen(false)} className="flex-1 btn-primary btn-lg">Show {listings.length} Results</button>
                </div>
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
