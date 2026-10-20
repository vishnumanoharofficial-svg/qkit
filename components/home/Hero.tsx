'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ChevronDown, Sparkles, ArrowRight, Building2, TreePine, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TRANSACTION_TYPES } from '@/lib/constants';
import {
  KOTTAYAM_POPULAR_AREAS,
  ALL_KOTTAYAM_LOCATIONS,
  DISTRICT,
  STATE,
} from '@/lib/constants/kottayam-locations';

const POPULAR_SEARCHES = [
  'Plots in Kottayam',
  'House for sale in Changanassery',
  'Land in Pala',
  'Apartment in Ettumanoor',
  'Agricultural land in Kanjirappally',
];

const STATS = [
  { value: '500+',  label: 'Active Listings',    icon: '🏠' },
  { value: '80+',   label: 'Localities Covered', icon: '📍' },
  { value: '100%',  label: 'Kottayam District',  icon: '✅' },
  { value: '₹0',    label: 'Brokerage Fee',      icon: '🤝' },
];

const HIGHLIGHTS = [
  { icon: Home,      label: 'Residential',  color: 'text-brand-600',   bg: 'bg-brand-50'   },
  { icon: Building2, label: 'Commercial',   color: 'text-blue-600',    bg: 'bg-blue-50'    },
  { icon: TreePine,  label: 'Agricultural', color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

export default function Hero() {
  const router = useRouter();
  const [activeTab, setActiveTab]       = useState('sale');
  const [query, setQuery]               = useState('');
  const [localityOpen, setLocalityOpen] = useState(false);
  const [localitySearch, setLocalitySearch] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('');
  const localityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (localityRef.current && !localityRef.current.contains(e.target as Node)) {
        setLocalityOpen(false);
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const filteredLocalities = localitySearch.trim().length >= 1
    ? ALL_KOTTAYAM_LOCATIONS
        .filter(l => l.toLowerCase().includes(localitySearch.toLowerCase()))
        .slice(0, 20)
    : [];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (query)            p.set('q', query);
    if (selectedLocality) p.set('locality', selectedLocality);
    p.set('type', activeTab);
    p.set('district', DISTRICT);
    router.push(`/search?${p.toString()}`);
  }

  function pickLocality(name: string) {
    setSelectedLocality(name);
    setLocalitySearch(name);
    setLocalityOpen(false);
  }

  return (
    <section className="relative overflow-hidden" aria-label="Property search">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" aria-hidden />

      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-brand-200/40 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-200/40 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-brand-100/50 rounded-full blur-2xl" />
      </div>

      <div className="container-qkit relative py-14 md:py-22">
        <div className="max-w-4xl mx-auto text-center">

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-brand-200 text-brand-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-5 shadow-sm animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            Now Live &mdash; {DISTRICT} District, {STATE}
          </div>

          {/* Heading */}
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-4 leading-[1.1] text-balance animate-slide-up">
            Your Property Journey<br />
            Starts in{' '}
            <span className="relative inline-block">
              <span className="gradient-text">Kottayam</span>
              {/* underline accent */}
              <svg className="absolute -bottom-1 left-0 w-full h-2" viewBox="0 0 240 8" fill="none" aria-hidden>
                <path d="M2 6 Q60 2 120 5 Q180 8 238 3" stroke="#10b981" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
              </svg>
            </span>
          </h1>

          <p className="text-slate-500 text-lg md:text-xl mb-4 max-w-2xl mx-auto text-balance">
            Kerala&apos;s most trusted platform for buying, selling, renting &amp; leasing
            properties across <strong className="text-slate-700">Kottayam District</strong> &mdash;
            Changanassery, Pala, Vaikom, Ettumanoor, Erattupetta &amp; more.
          </p>

          {/* Property type highlight pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {HIGHLIGHTS.map(({ icon: Icon, label, color, bg }) => (
              <span
                key={label}
                className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold', bg, color)}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
              🌾 Agricultural
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
              🏕️ Plots &amp; Land
            </span>
          </div>

          {/* ── Search card ──────────────────────────────────────────────── */}
          <div className="bg-white rounded-3xl shadow-modal border border-slate-100 animate-slide-up">

            {/* Buy / Rent / Lease tabs */}
            <div className="flex border-b border-slate-100" role="tablist">
              {TRANSACTION_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActiveTab(value)}
                  role="tab"
                  aria-selected={activeTab === value}
                  className={cn(
                    'flex-1 py-3.5 text-sm font-semibold transition-all relative',
                    activeTab === value
                      ? 'text-brand-600 bg-brand-50'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {label}
                  {activeTab === value && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Search form */}
            <form onSubmit={handleSearch} className="p-4 md:p-5">
              <div className="flex flex-col sm:flex-row gap-3">

                {/* Locality dropdown — Kottayam district only */}
                <div ref={localityRef} className="relative sm:w-52 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setLocalityOpen(v => !v)}
                    className="w-full flex items-center gap-2 px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 hover:border-brand-300 hover:bg-white transition-all"
                    aria-expanded={localityOpen}
                    aria-haspopup="listbox"
                  >
                    <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span className="flex-1 text-left truncate">
                      {selectedLocality || 'All Kottayam'}
                    </span>
                    <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform flex-shrink-0', localityOpen && 'rotate-180')} />
                  </button>

                  {localityOpen && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-modal border border-slate-100 p-2 z-50 animate-slide-down">
                      {/* Type-ahead search */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl mb-2">
                        <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <input
                          autoFocus
                          type="text"
                          value={localitySearch}
                          onChange={e => setLocalitySearch(e.target.value)}
                          placeholder="Type locality, town, panchayat…"
                          className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
                        />
                      </div>

                      {/* All Kottayam option */}
                      <button type="button"
                        onClick={() => { setSelectedLocality(''); setLocalitySearch(''); setLocalityOpen(false); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-brand-50 hover:text-brand-700 font-medium mb-1"
                      >
                        📍 All Kottayam District
                      </button>

                      {filteredLocalities.length > 0 ? (
                        <div className="max-h-52 overflow-y-auto space-y-0.5" role="listbox">
                          {filteredLocalities.map(loc => (
                            <button key={loc} type="button"
                              role="option"
                              aria-selected={selectedLocality === loc}
                              onClick={() => pickLocality(loc)}
                              className={cn(
                                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                                selectedLocality === loc
                                  ? 'bg-brand-50 text-brand-700 font-semibold'
                                  : 'text-slate-600 hover:bg-slate-50'
                              )}
                            >
                              {loc}
                            </button>
                          ))}
                        </div>
                      ) : localitySearch.trim().length === 0 ? (
                        /* Popular areas grid when no search text */
                        <div>
                          <p className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Popular Areas
                          </p>
                          <div className="grid grid-cols-2 gap-0.5 max-h-52 overflow-y-auto">
                            {KOTTAYAM_POPULAR_AREAS.map(a => (
                              <button key={a.name} type="button"
                                onClick={() => pickLocality(a.name)}
                                className={cn(
                                  'text-left px-3 py-2 rounded-lg text-sm transition-colors',
                                  selectedLocality === a.name
                                    ? 'bg-brand-50 text-brand-700 font-semibold'
                                    : 'text-slate-600 hover:bg-slate-50'
                                )}
                              >
                                {a.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="px-3 py-3 text-sm text-slate-400 text-center">No locations found</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Keyword / free-text */}
                <div className="flex-1 flex items-center gap-2 px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-brand-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-100 transition-all">
                  <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input
                    type="search"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Plot, house, apartment, land…"
                    className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
                    aria-label="Search properties"
                  />
                </div>

                <button type="submit" className="btn-primary btn-lg flex-shrink-0 gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </form>
          </div>
          {/* ─────────────────────────────────────────────────────────────── */}

          {/* Trending quick searches */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Trending:</span>
            {POPULAR_SEARCHES.map(term => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-600 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all shadow-sm"
              >
                {term}
              </button>
            ))}
          </div>

          {/* Stats bar */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map(s => (
              <div key={s.label} className="glass rounded-2xl py-5 px-3">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="font-heading font-bold text-2xl text-brand-600">{s.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Post property CTA */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/post-property"
              className="btn-primary btn-lg gap-2 shadow-lg shadow-brand-200/50 hover:shadow-brand-300/60 transition-shadow"
            >
              <Sparkles className="w-4 h-4" />
              Post Your Property — Free
              <ArrowRight className="w-4 h-4" />
            </a>
            <p className="text-xs text-slate-400">No broker. No commission. Ready in 2 minutes.</p>
          </div>

        </div>
      </div>
    </section>
  );
}
