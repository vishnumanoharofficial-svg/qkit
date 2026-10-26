'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import PropertyCardSkeleton from '@/components/property/PropertyCardSkeleton';
import { cn } from '@/lib/utils';
import { PROPERTY_CATEGORIES, TRANSACTION_TYPES } from '@/lib/constants';
import type { PropertyListing } from '@/lib/types';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Searching…</div>}>
      <SearchPageInner />
    </Suspense>
  );
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery]         = useState(searchParams.get('q') || '');
  const [view, setView]           = useState<'grid'|'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [results, setResults]     = useState<PropertyListing[]>([]);
  const [loading, setLoading]     = useState(false);
  const [filters, setFilters] = useState({
    type:      searchParams.get('type') || '',
    category:  searchParams.get('category') || '',
    location:  searchParams.get('location') || '',
    min_price: '',
    max_price: '',
    verified:  false,
  });

  const doSearch = useCallback((q: string, f: typeof filters) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('status', 'published');
    params.set('limit', '50');
    if (q)         params.set('q', q);
    if (f.type)    params.set('type', f.type);

    fetch(`/api/properties?${params.toString()}`)
      .then(r => r.json())
      .then((json: { data?: PropertyListing[] }) => {
        let data = json.data ?? [];
        // Client-side filters
        const qLower = q.toLowerCase().trim();
        if (qLower) {
          data = data.filter(l =>
            l.title?.toLowerCase().includes(qLower) ||
            l.description?.toLowerCase().includes(qLower) ||
            l.city?.toLowerCase().includes(qLower) ||
            l.taluk?.toLowerCase().includes(qLower) ||
            l.town_panchayat?.toLowerCase().includes(qLower) ||
            l.listing_id?.toLowerCase().includes(qLower)
          );
        }
        if (f.category)  data = data.filter(l => l.category?.slug === f.category);
        if (f.verified)  data = data.filter(l => l.is_verified);
        if (f.location)  data = data.filter(l =>
          l.city?.toLowerCase().includes(f.location.toLowerCase()) ||
          l.taluk?.toLowerCase().includes(f.location.toLowerCase())
        );
        if (f.min_price) data = data.filter(l => l.price >= Number(f.min_price));
        if (f.max_price) data = data.filter(l => l.price <= Number(f.max_price));
        setResults(data);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  // Search on mount & when filters change
  useEffect(() => {
    doSearch(query, filters);
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (query) p.set('q', query);
    if (filters.type) p.set('type', filters.type);
    router.replace(`/search?${p.toString()}`);
    doSearch(query, filters);
  }

  function clearAll() {
    setQuery('');
    setFilters({ type:'', category:'', location:'', min_price:'', max_price:'', verified: false });
    router.replace('/search');
    doSearch('', { type:'', category:'', location:'', min_price:'', max_price:'', verified: false });
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 pt-16">
        {/* Search bar */}
        <div className="bg-white border-b border-slate-100 py-5 sticky top-16 z-20">
          <div className="container-qkit">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 flex items-center gap-3 bg-slate-100 rounded-xl px-4 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500 transition-all">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search in Kottayam — locality, taluk, listing ID…"
                  className="flex-1 py-3 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
                  aria-label="Search properties"
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button type="submit" className="btn-primary btn-md">Search</button>
              <button
                type="button"
                onClick={() => setFilterOpen(v => !v)}
                className="btn-secondary btn-md hidden sm:flex"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </form>

            {/* Inline quick filters */}
            {filterOpen && (
              <div className="mt-4 flex flex-wrap gap-3 animate-slide-down">
                <div className="flex gap-2">
                  {TRANSACTION_TYPES.map(t => (
                    <button key={t.value}
                      onClick={() => setFilters(f => ({ ...f, type: f.type === t.value ? '' : t.value }))}
                      className={cn('px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                        filters.type === t.value
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'border-slate-200 text-slate-600 hover:border-brand-300'
                      )}>
                      {t.label}
                    </button>
                  ))}
                </div>

                <select
                  className="text-xs border border-slate-200 rounded-full px-3 py-1.5 bg-white text-slate-600 outline-none focus:ring-1 focus:ring-brand-400"
                  value={filters.category}
                  onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                >
                  <option value="">All Categories</option>
                  {PROPERTY_CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
                </select>

                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-600 cursor-pointer hover:border-brand-300 transition-all">
                  <input type="checkbox" className="accent-brand-600" checked={filters.verified}
                    onChange={e => setFilters(f => ({ ...f, verified: e.target.checked }))} />
                  Verified Only
                </label>

                <input type="number" placeholder="Min ₹" className="text-xs border border-slate-200 rounded-full px-3 py-1.5 bg-white outline-none w-24 focus:ring-1 focus:ring-brand-400"
                  value={filters.min_price} onChange={e => setFilters(f => ({ ...f, min_price: e.target.value }))} />
                <input type="number" placeholder="Max ₹" className="text-xs border border-slate-200 rounded-full px-3 py-1.5 bg-white outline-none w-24 focus:ring-1 focus:ring-brand-400"
                  value={filters.max_price} onChange={e => setFilters(f => ({ ...f, max_price: e.target.value }))} />

                <button onClick={clearAll} className="text-xs text-red-500 hover:underline ml-auto">Clear all</button>
              </div>
            )}
          </div>
        </div>

        <div className="container-qkit py-8">
          {/* Results header */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-slate-600 text-sm">
              {loading ? 'Searching…' : (
                <><span className="font-semibold text-slate-900">{results.length}</span> properties{query && <> for <span className="font-semibold">"{query}"</span></>}</>
              )}
            </p>
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
              <button onClick={() => setView('grid')} className={cn('p-1.5 rounded-lg transition-colors', view === 'grid' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400')} aria-label="Grid"><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setView('list')} className={cn('p-1.5 rounded-lg transition-colors', view === 'list' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400')} aria-label="List"><List className="w-4 h-4" /></button>
            </div>
          </div>

          {loading ? (
            <div className={cn(
              view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
                : 'flex flex-col gap-4'
            )}>
              {Array.from({ length: 8 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-5">🔍</div>
              <h2 className="font-heading font-semibold text-xl text-slate-700 mb-2">No results found</h2>
              <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                Try a different search term, remove filters, or browse all properties.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={clearAll} className="btn-secondary btn-md">Clear Filters</button>
                <a href="/properties" className="btn-primary btn-md">Browse All</a>
              </div>
            </div>
          ) : (
            <div className={cn(
              view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
                : 'flex flex-col gap-4'
            )}>
              {results.map(l => <PropertyCard key={l.id} listing={l} view={view} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
