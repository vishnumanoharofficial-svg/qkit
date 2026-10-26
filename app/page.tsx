'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import {
  Search, MapPin, Home, Building2, Trees, Landmark, Store, Grid3x3,
  ChevronDown, ShieldCheck, Users, Tag, ChevronLeft, ChevronRight,
  ArrowRight, Phone, MessageCircle, Plus,
} from 'lucide-react';
import { cn, formatIndianPrice } from '@/lib/utils';
import type { PropertyListing } from '@/lib/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const PROPERTY_TYPES = [
  { label: 'House',      icon: Home,       slug: 'houses' },
  { label: 'Apartment',  icon: Building2,  slug: 'apartments' },
  { label: 'Villa',      icon: Home,       slug: 'houses' },
  { label: 'Land',       icon: Trees,      slug: 'residential-plots' },
  { label: 'Commercial', icon: Store,      slug: 'commercial' },
  { label: 'Plot',       icon: Grid3x3,    slug: 'residential-plots' },
];

const BUDGET_OPTIONS = [
  { label: 'Any Budget', value: '' },
  { label: 'Under ₹20 Lakhs', value: '0-2000000' },
  { label: '₹20–50 Lakhs', value: '2000000-5000000' },
  { label: '₹50 L–1 Crore', value: '5000000-10000000' },
  { label: '₹1–2 Crore', value: '10000000-20000000' },
  { label: 'Above ₹2 Crore', value: '20000000-' },
];

const KOTTAYAM_LOCATIONS = [
  { name: 'Kottayam Town',  img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=70' },
  { name: 'Changanassery',  img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70' },
  { name: 'Pala',           img: 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=400&q=70' },
  { name: 'Ettumanoor',     img: 'https://images.unsplash.com/photo-1552083375-1447ce886485?w=400&q=70' },
  { name: 'Vaikom',         img: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=70' },
  { name: 'Kanjirappally',  img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&q=70' },
  { name: 'Ponkunnam',      img: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400&q=70' },
  { name: 'Kaduthuruthy',   img: 'https://images.unsplash.com/photo-1482192505345-5852310b1252?w=400&q=70' },
];

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Verified Listings' },
  { icon: Users,       label: 'Direct Owners' },
  { icon: Tag,         label: 'No Brokerage' },
];

// ─── Hero Search Component ────────────────────────────────────────────────────

function HeroSearch() {
  const [purposeOpen, setPurposeOpen]   = useState(false);
  const [typeOpen, setTypeOpen]         = useState(false);
  const [budgetOpen, setBudgetOpen]     = useState(false);
  const [purpose, setPurpose]           = useState('Buy');
  const [propType, setPropType]         = useState('Any Type');
  const [budget, setBudget]             = useState('Any Budget');
  const [selectedCategory, setSelectedCategory] = useState<typeof PROPERTY_TYPES[number] | null>(null);

  const purposeRef = useRef<HTMLDivElement>(null);
  const typeRef    = useRef<HTMLDivElement>(null);
  const budgetRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (purposeRef.current && !purposeRef.current.contains(e.target as Node)) setPurposeOpen(false);
      if (typeRef.current && !typeRef.current.contains(e.target as Node)) setTypeOpen(false);
      if (budgetRef.current && !budgetRef.current.contains(e.target as Node)) setBudgetOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  function handleSearch() {
    const slug = selectedCategory?.slug ?? '';
    const purposeMap: Record<string, string> = { Buy: 'sale', Rent: 'rent', Lease: 'lease' };
    const type = purposeMap[purpose] ?? 'sale';
    const params = new URLSearchParams();
    if (type !== 'sale') params.set('type', type);
    if (slug) params.set('category', slug);
    const qs = params.toString();
    window.location.href = `/properties${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="w-full max-w-3xl">
      {/* Search Card */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row items-stretch">
          {/* Location */}
          <div className="flex items-center gap-2 px-4 py-3.5 border-b sm:border-b-0 sm:border-r border-slate-100 flex-shrink-0 sm:min-w-[140px]">
            <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-400 font-medium">Location</p>
              <p className="text-sm font-semibold text-slate-800">Kottayam</p>
            </div>
          </div>

          {/* Property Type */}
          <div ref={typeRef} className="relative flex-1 border-b sm:border-b-0 sm:border-r border-slate-100">
            <button
              onClick={() => { setTypeOpen(v => !v); setPurposeOpen(false); setBudgetOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors"
            >
              <Home className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 font-medium">Property Type</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{propType}</p>
              </div>
              <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform flex-shrink-0', typeOpen && 'rotate-180')} />
            </button>
            {typeOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-2xl shadow-modal border border-slate-100 p-2 z-50 animate-slide-down">
                <button onClick={() => { setPropType('Any Type'); setSelectedCategory(null); setTypeOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-colors mb-1">
                  Any Type
                </button>
                {PROPERTY_TYPES.map(pt => (
                  <button key={pt.label} onClick={() => { setPropType(pt.label); setSelectedCategory(pt); setTypeOpen(false); }}
                    className={cn('w-full text-left px-3 py-2 rounded-xl text-sm transition-colors',
                      propType === pt.label ? 'bg-brand-50 text-brand-700 font-medium' : 'text-slate-600 hover:bg-slate-50')}>
                    {pt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Budget */}
          <div ref={budgetRef} className="relative flex-1 border-b sm:border-b-0 border-slate-100">
            <button
              onClick={() => { setBudgetOpen(v => !v); setPurposeOpen(false); setTypeOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="text-slate-400 text-base flex-shrink-0">₹</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 font-medium">Budget</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{budget}</p>
              </div>
              <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform flex-shrink-0', budgetOpen && 'rotate-180')} />
            </button>
            {budgetOpen && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-2xl shadow-modal border border-slate-100 p-2 z-50 animate-slide-down">
                {BUDGET_OPTIONS.map(opt => (
                  <button key={opt.label} onClick={() => { setBudget(opt.label); setBudgetOpen(false); }}
                    className={cn('w-full text-left px-3 py-2 rounded-xl text-sm transition-colors',
                      budget === opt.label ? 'bg-brand-50 text-brand-700 font-medium' : 'text-slate-600 hover:bg-slate-50')}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm px-6 py-3.5 transition-colors flex-shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>Search Properties</span>
          </button>
        </div>
      </div>

      {/* Purpose tabs */}
      <div className="flex items-center gap-1 mt-3">
        {['Buy', 'Rent', 'Lease'].map(p => (
          <button
            key={p}
            onClick={() => setPurpose(p)}
            className={cn(
              'px-5 py-1.5 rounded-full text-sm font-semibold transition-all border',
              purpose === p
                ? 'bg-white text-brand-700 border-white shadow-sm'
                : 'text-white/80 border-white/30 hover:border-white/60 hover:text-white'
            )}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Category Icons Row ───────────────────────────────────────────────────────

function CategoryIcons() {
  const [active, setActive] = useState('House');

  return (
    <div className="flex items-center gap-4 sm:gap-8 flex-wrap">
      {PROPERTY_TYPES.map(({ label, icon: Icon, slug }) => (
        <Link
          key={label}
          href={`/properties?category=${slug}`}
          onClick={() => setActive(label)}
          className="flex flex-col items-center gap-2 group cursor-pointer"
        >
          <div className={cn(
            'w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all',
            active === label
              ? 'bg-white text-brand-600 shadow-lg scale-105'
              : 'bg-white/15 text-white hover:bg-white/25'
          )}>
            <Icon className="w-6 h-6" />
          </div>
          <span className={cn(
            'text-xs font-medium transition-colors',
            active === label ? 'text-white' : 'text-white/80'
          )}>
            {label}
          </span>
        </Link>
      ))}
    </div>
  );
}

// ─── Featured Properties Carousel ────────────────────────────────────────────

function FeaturedProperties({ listings }: { listings: PropertyListing[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: 'left' | 'right') {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  }

  if (listings.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container-qkit">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="section-heading">Featured Properties</h2>
            <p className="section-sub">Handpicked properties in Kottayam</p>
          </div>
          <Link href="/properties" className="flex items-center gap-1 text-brand-600 hover:text-brand-700 text-sm font-semibold transition-colors whitespace-nowrap">
            View All Properties <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="relative">
          {/* Prev arrow */}
          <button onClick={() => scroll('left')}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors hidden md:flex">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>

          <div ref={scrollRef}
            className="flex gap-5 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
            {listings.map(l => (
              <div key={l.id} className="flex-shrink-0 w-72 sm:w-80">
                <PropertyCard listing={l} />
              </div>
            ))}
          </div>

          {/* Next arrow */}
          <button onClick={() => scroll('right')}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors hidden md:flex">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Explore by Location ──────────────────────────────────────────────────────

function ExploreLocations() {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: 'left' | 'right') {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' });
  }

  return (
    <section className="py-12 bg-slate-50">
      <div className="container-qkit">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="section-heading">Explore by Location</h2>
            <p className="section-sub">Popular areas in Kottayam district</p>
          </div>
          <div className="hidden md:flex gap-2">
            <button onClick={() => scroll('left')} className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button onClick={() => scroll('right')} className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {KOTTAYAM_LOCATIONS.map(loc => (
            <Link
              key={loc.name}
              href={`/properties?location=${encodeURIComponent(loc.name)}`}
              className="flex-shrink-0 w-40 sm:w-48 relative rounded-2xl overflow-hidden group cursor-pointer"
            >
              <div className="h-32 sm:h-36 bg-slate-200 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={loc.img}
                  alt={loc.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <p className="absolute bottom-3 left-3 text-white text-sm font-bold drop-shadow">{loc.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    { num: '01', title: 'Search Property', desc: 'Browse thousands of verified listings in Kottayam district.', icon: Search },
    { num: '02', title: 'Contact Owner', desc: 'Call or WhatsApp the seller directly — no middlemen.', icon: Phone },
    { num: '03', title: 'Visit & Finalize', desc: 'Visit the property and close the deal at your terms.', icon: ShieldCheck },
  ];

  return (
    <section className="py-14 bg-white border-t border-slate-100">
      <div className="container-qkit">
        <div className="text-center mb-10">
          <h2 className="section-heading">How It Works</h2>
          <p className="section-sub">Find your property in 3 simple steps</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map(({ num, title, desc, icon: Icon }) => (
            <div key={num} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-8 h-8 text-brand-600" />
              </div>
              <p className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-1">{num}</p>
              <h3 className="font-heading font-bold text-slate-900 text-lg mb-2">{title}</h3>
              <p className="text-slate-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

function CTABanner() {
  return (
    <section className="py-14 bg-brand-600">
      <div className="container-qkit text-center">
        <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white mb-3">
          Want to Sell or Rent Your Property?
        </h2>
        <p className="text-brand-100 text-base sm:text-lg mb-8 max-w-xl mx-auto">
          Post your property for free and reach thousands of genuine buyers in Kottayam.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/post-property"
            className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-colors text-base">
            <Plus className="w-5 h-5" />
            Post Property Free
          </Link>
          <Link href="/properties"
            className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-base">
            Browse Properties
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch('/api/properties?status=published&limit=10&sort=newest')
      .then(r => r.json())
      .then(res => setListings(res.data ?? []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />

      <main>
        {/* ── HERO ──────────────────────────────────────────── */}
        <section className="relative min-h-[90vh] md:min-h-screen flex flex-col justify-center pt-16 overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0 bg-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1920&q=80"
              alt="Kottayam Kerala"
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 md:bg-gradient-to-r md:from-black/70 md:via-black/50 md:to-transparent" />
          </div>

          <div className="relative container-qkit py-16 md:py-24">
            <div className="max-w-2xl">
              {/* Eyebrow */}
              <p className="text-brand-300 text-sm sm:text-base font-semibold uppercase tracking-[0.2em] mb-3">
                Find Your Perfect Property in
              </p>

              {/* Headline */}
              <h1 className="font-heading font-extrabold text-5xl sm:text-6xl md:text-7xl text-white leading-tight mb-4">
                Kottayam
              </h1>

              {/* Sub */}
              <p className="text-slate-200 text-base sm:text-lg mb-10 max-w-lg leading-relaxed">
                Buy, Rent or Lease properties across Kottayam district.<br className="hidden sm:block" />
                Trusted listings. Verified owners. Hassle-free experience.
              </p>

              {/* Search bar */}
              <HeroSearch />
            </div>

            {/* Category icons */}
            <div className="mt-10 md:mt-14">
              <CategoryIcons />
            </div>
          </div>

          {/* Trust badges */}
          <div className="relative bg-black/40 backdrop-blur-sm border-t border-white/10">
            <div className="container-qkit py-4">
              <div className="flex items-center justify-end gap-6 sm:gap-10 flex-wrap">
                {TRUST_BADGES.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-white text-sm font-medium">
                    <Icon className="w-4 h-4 text-brand-300" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURED PROPERTIES ────────────────────────────── */}
        {loading ? (
          <section className="py-12 bg-white">
            <div className="container-qkit">
              <div className="h-8 skeleton w-48 mb-2 rounded" />
              <div className="h-4 skeleton w-36 mb-8 rounded" />
              <div className="flex gap-5 overflow-hidden">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex-shrink-0 w-72 h-80 skeleton rounded-2xl" />
                ))}
              </div>
            </div>
          </section>
        ) : (
          <FeaturedProperties listings={listings} />
        )}

        {/* ── EXPLORE BY LOCATION ────────────────────────────── */}
        <ExploreLocations />

        {/* ── HOW IT WORKS ───────────────────────────────────── */}
        <HowItWorks />

        {/* ── CTA BANNER ─────────────────────────────────────── */}
        <CTABanner />
      </main>

      <Footer />
    </>
  );
}
