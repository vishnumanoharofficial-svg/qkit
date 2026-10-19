'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ChevronDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { POPULAR_CITIES, TRANSACTION_TYPES } from '@/lib/constants';

const POPULAR_SEARCHES = [
  '2 BHK in Bangalore', 'Villa in Hyderabad', 'Office space in Mumbai', 'Plot in Chennai', 'Farm land in Kerala',
];

const STATS = [
  { value: '14,800+', label: 'Active Listings' },
  { value: '380+',    label: 'Cities Covered' },
  { value: '52,000+', label: 'Happy Users' },
  { value: '3,900+',  label: 'Verified Properties' },
];

export default function Hero() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('sale');
  const [query, setQuery]         = useState('');
  const [city, setCity]           = useState('');
  const [cityOpen, setCityOpen]   = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (query) p.set('q', query);
    if (city)  p.set('city', city);
    p.set('type', activeTab);
    router.push(`/search?${p.toString()}`);
  }

  return (
    <section className="relative hero-gradient" aria-label="Property search">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100/60 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/50 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
      </div>

      <div className="container-qkit relative py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6 animate-fade-in">
            <TrendingUp className="w-4 h-4" />
            India's Trusted Property Marketplace
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-4 leading-tight text-balance animate-slide-up">
            Find Your <span className="gradient-text">Perfect</span> Property
          </h1>
          <p className="text-slate-500 text-lg md:text-xl mb-10 max-w-2xl mx-auto text-balance">
            Buy, Sell, Rent or Lease — Residential, Commercial &amp; Agricultural properties across India.
          </p>

          {/* Search card */}
          <div className="bg-white rounded-3xl shadow-modal border border-slate-100 animate-slide-up">
            {/* Tabs */}
            <div className="flex border-b border-slate-100" role="tablist">
              {TRANSACTION_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setActiveTab(value)}
                  role="tab"
                  aria-selected={activeTab === value}
                  className={cn(
                    'flex-1 py-3.5 text-sm font-semibold transition-all relative',
                    activeTab === value ? 'text-brand-600 bg-brand-50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {label}
                  {activeTab === value && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSearch} className="p-4 md:p-5">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* City selector */}
                <div className="relative sm:w-44 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setCityOpen(v => !v)}
                    className="w-full flex items-center gap-2 px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 hover:border-brand-300 hover:bg-white transition-all"
                  >
                    <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span className="flex-1 text-left truncate">{city || 'Select City'}</span>
                    <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform flex-shrink-0', cityOpen && 'rotate-180')} />
                  </button>
                  {cityOpen && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-modal border border-slate-100 p-2 z-50 animate-slide-down max-h-72 overflow-y-auto">
                      <button type="button" onClick={() => { setCity(''); setCityOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-brand-50 hover:text-brand-700">🇳 All India</button>
                      <p className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Popular Cities</p>
                      <div className="grid grid-cols-2 gap-0.5 max-h-48 overflow-y-auto">
                        {POPULAR_CITIES.map(c => (
                          <button key={c} type="button" onClick={() => { setCity(c); setCityOpen(false); }}
                            className={cn('text-left px-3 py-2 rounded-lg text-sm transition-colors', city===c ? 'bg-brand-50 text-brand-700 font-medium' : 'text-slate-600 hover:bg-slate-50')}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Query */}
                <div className="flex-1 flex items-center gap-2 px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-brand-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-100 transition-all">
                  <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input type="search" value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="Search by locality, landmark, PIN code…"
                    className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
                    aria-label="Search properties" />
                </div>

                <button type="submit" className="btn-primary btn-lg flex-shrink-0">
                  <Search className="w-4 h-4" /> Search
                </button>
              </div>
            </form>
          </div>

          {/* Trending tags */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Trending:</span>
            {POPULAR_SEARCHES.map(term => (
              <button key={term} onClick={() => setQuery(term)}
                className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-600 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all shadow-sm">
                {term}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map(s => (
              <div key={s.label} className="glass rounded-2xl py-4 px-3">
                <div className="font-heading font-bold text-2xl text-brand-600">{s.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
