'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import {
  Search, MapPin, Home, Building2, Trees, Landmark, Store, Grid3x3,
  ChevronDown, ShieldCheck, Users, Tag, ChevronLeft, ChevronRight,
  ArrowRight, Phone, MessageCircle, Plus, Warehouse, Building, Key,
  LayoutGrid, TrendingUp, Leaf,
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
      {/* Search Card — outer div has NO overflow-hidden so dropdowns can escape */}
      <div className="bg-white rounded-2xl shadow-2xl">
        <div className="flex flex-col sm:flex-row items-stretch">
          {/* Location */}
          <div className="flex items-center gap-2 px-4 py-3.5 border-b sm:border-b-0 sm:border-r border-slate-100 flex-shrink-0 sm:min-w-[140px] rounded-tl-2xl sm:rounded-bl-2xl">
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
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-[200] animate-slide-down">
                <button onClick={() => { setPropType('Any Type'); setSelectedCategory(null); setTypeOpen(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-colors mb-1">
                  Any Type
                </button>
                {PROPERTY_TYPES.map(pt => (
                  <button key={pt.label} onClick={() => { setPropType(pt.label); setSelectedCategory(pt); setTypeOpen(false); }}
                    className={cn('w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors',
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
              <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-[200] animate-slide-down">
                {BUDGET_OPTIONS.map(opt => (
                  <button key={opt.label} onClick={() => { setBudget(opt.label); setBudgetOpen(false); }}
                    className={cn('w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors',
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
            className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-sm px-6 py-3.5 transition-colors flex-shrink-0 rounded-b-2xl sm:rounded-b-none sm:rounded-r-2xl"
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

type LocationCard = {
  name: string;
  type: 'town' | 'taluk';
  count: number;
  filterKey: string;
  filterValue: string;
};

// Curated background images keyed by lowercase location name — fallback to gradient
const LOCATION_IMAGES: Record<string, string> = {
  'kottayam':       'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=70',
  'changanassery':  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70',
  'pala':           'https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=400&q=70',
  'ettumanoor':     'https://images.unsplash.com/photo-1552083375-1447ce886485?w=400&q=70',
  'vaikom':         'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=70',
  'kanjirappally':  'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&q=70',
  'ponkunnam':      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400&q=70',
  'kaduthuruthy':   'https://images.unsplash.com/photo-1482192505345-5852310b1252?w=400&q=70',
  'erattupetta':    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=70',
  'meenachil':      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400&q=70',
  'kumarakom':      'https://images.unsplash.com/photo-1552083375-1447ce886485?w=400&q=70',
  'erumeli':        'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&q=70',
};

function getLocationImage(name: string): string {
  const key = name.toLowerCase().trim();
  // Exact match
  if (LOCATION_IMAGES[key]) return LOCATION_IMAGES[key];
  // Partial match
  const partial = Object.keys(LOCATION_IMAGES).find(k => key.includes(k) || k.includes(key));
  if (partial) return LOCATION_IMAGES[partial];
  // Default Kerala landscape
  return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70';
}

function ExploreLocations() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [locations, setLocations] = useState<LocationCard[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch('/api/locations/popular')
      .then(r => r.json())
      .then(json => setLocations(json.locations ?? []))
      .catch(() => setLocations([]))
      .finally(() => setLoading(false));
  }, []);

  function scroll(dir: 'left' | 'right') {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' });
  }

  // Skeleton cards while loading
  const skeletons = Array.from({ length: 5 });

  return (
    <section className="py-12 bg-slate-50">
      <div className="container-qkit">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="section-heading">Explore by Location</h2>
            <p className="section-sub">
              {loading ? 'Loading active areas…' : `Areas with active listings in Kottayam`}
            </p>
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
          {loading ? (
            skeletons.map((_, i) => (
              <div key={i} className="flex-shrink-0 w-40 sm:w-48 h-36 rounded-2xl skeleton" />
            ))
          ) : locations.length === 0 ? (
            <p className="text-slate-400 text-sm py-8">No locations with listings yet.</p>
          ) : (
            locations.map(loc => {
              // Build filter URL — use the correct DB column key
              const params = new URLSearchParams();
              params.set(loc.filterKey, loc.filterValue);
              const href = `/properties?${params.toString()}`;

              return (
                <Link
                  key={loc.name}
                  href={href}
                  className="flex-shrink-0 w-40 sm:w-48 relative rounded-2xl overflow-hidden group cursor-pointer"
                >
                  <div className="h-32 sm:h-36 bg-slate-200 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getLocationImage(loc.name)}
                      alt={loc.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    {/* Location name */}
                    <p className="absolute bottom-7 left-3 right-3 text-white text-sm font-bold drop-shadow leading-tight">{loc.name}</p>
                    {/* Listing count badge */}
                    <div className="absolute bottom-2 left-3 flex items-center gap-1">
                      <span className="text-white/80 text-[11px] font-medium">
                        {loc.count} {loc.count === 1 ? 'listing' : 'listings'}
                      </span>
                    </div>
                    {/* Taluk badge */}
                    {loc.type === 'taluk' && (
                      <div className="absolute top-2 right-2 bg-brand-600/80 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                        Taluk
                      </div>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Explore by Property Segment (reusable card row) ─────────────────────────

interface SegmentCard {
  label: string;
  sublabel?: string;
  href: string;
  bg: string;          // Tailwind gradient class
  icon: React.ElementType;
  iconColor: string;
  badge?: string;
}

function SegmentCardRow({
  title, subtitle, cards, bg = 'bg-white',
}: {
  title: string;
  subtitle: string;
  cards: SegmentCard[];
  bg?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -260 : 260, behavior: 'smooth' });
  }

  return (
    <section className={`py-12 ${bg}`}>
      <div className="container-qkit">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="section-heading">{title}</h2>
            <p className="section-sub">{subtitle}</p>
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
          {cards.map(card => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className="flex-shrink-0 w-44 sm:w-52 group"
              >
                <div className={`rounded-2xl p-5 flex flex-col gap-3 h-full border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 ${card.bg}`}>
                  {/* Icon circle */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-white/70 shadow-sm`}>
                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>

                  {/* Label */}
                  <div className="flex-1">
                    <p className="font-heading font-bold text-slate-900 text-sm leading-snug">{card.label}</p>
                    {card.sublabel && (
                      <p className="text-slate-500 text-xs mt-0.5">{card.sublabel}</p>
                    )}
                  </div>

                  {/* CTA row */}
                  <div className="flex items-center justify-between">
                    {card.badge ? (
                      <span className="text-[11px] font-semibold bg-white/80 text-slate-600 px-2 py-0.5 rounded-full">{card.badge}</span>
                    ) : <span />}
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Segment data ─────────────────────────────────────────────────────────────

const PROPERTY_TYPE_SEGMENTS: SegmentCard[] = [
  {
    label: 'Houses & Villas',
    sublabel: 'Detached homes & villas',
    href: '/properties?category=houses',
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    icon: Home,
    iconColor: 'text-blue-600',
    badge: 'Popular',
  },
  {
    label: 'Apartments & Flats',
    sublabel: 'Multi-storey living',
    href: '/properties?category=apartments',
    bg: 'bg-gradient-to-br from-violet-50 to-purple-50',
    icon: Building2,
    iconColor: 'text-violet-600',
  },
  {
    label: 'Residential Plots',
    sublabel: 'Land for construction',
    href: '/properties?category=residential-plots',
    bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
    icon: Leaf,
    iconColor: 'text-green-600',
  },
  {
    label: 'Commercial Properties',
    sublabel: 'Shops, offices & more',
    href: '/properties?category=commercial',
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
    icon: Store,
    iconColor: 'text-amber-600',
  },
  {
    label: 'Agricultural Land',
    sublabel: 'Farm & cultivation plots',
    href: '/properties?category=agricultural-land',
    bg: 'bg-gradient-to-br from-lime-50 to-green-50',
    icon: Trees,
    iconColor: 'text-lime-700',
  },
  {
    label: 'Industrial / Warehouse',
    sublabel: 'Factory & storage space',
    href: '/properties?category=commercial&subcategory=warehouse',
    bg: 'bg-gradient-to-br from-slate-50 to-zinc-100',
    icon: Warehouse,
    iconColor: 'text-slate-600',
  },
];

const HOUSES_VILLAS_SEGMENTS: SegmentCard[] = [
  {
    label: 'Houses for Sale',
    sublabel: 'Buy your dream home',
    href: '/properties?category=houses&type=sale',
    bg: 'bg-gradient-to-br from-green-50 to-teal-50',
    icon: Home,
    iconColor: 'text-green-600',
    badge: 'For Sale',
  },
  {
    label: 'Houses for Rent',
    sublabel: 'Monthly rental homes',
    href: '/properties?category=houses&type=rent',
    bg: 'bg-gradient-to-br from-purple-50 to-violet-50',
    icon: Key,
    iconColor: 'text-purple-600',
    badge: 'For Rent',
  },
  {
    label: 'Villas for Sale',
    sublabel: 'Premium villa properties',
    href: '/properties?category=houses&type=sale&q=villa',
    bg: 'bg-gradient-to-br from-rose-50 to-pink-50',
    icon: Building,
    iconColor: 'text-rose-600',
    badge: 'Premium',
  },
  {
    label: 'Villas for Lease',
    sublabel: 'Long-term villa lease',
    href: '/properties?category=houses&type=lease&q=villa',
    bg: 'bg-gradient-to-br from-amber-50 to-yellow-50',
    icon: Building,
    iconColor: 'text-amber-600',
    badge: 'Lease',
  },
  {
    label: '1–2 BHK Homes',
    sublabel: 'Compact & affordable',
    href: '/properties?category=houses&bedrooms=1',
    bg: 'bg-gradient-to-br from-blue-50 to-sky-50',
    icon: Home,
    iconColor: 'text-blue-600',
  },
  {
    label: '3+ BHK Homes',
    sublabel: 'Spacious family homes',
    href: '/properties?category=houses&bedrooms=3',
    bg: 'bg-gradient-to-br from-indigo-50 to-blue-50',
    icon: Home,
    iconColor: 'text-indigo-600',
    badge: 'Spacious',
  },
];

const PLOTS_SEGMENTS: SegmentCard[] = [
  {
    label: 'Plots for Sale',
    sublabel: 'Build your own home',
    href: '/properties?category=residential-plots&type=sale',
    bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
    icon: Grid3x3,
    iconColor: 'text-emerald-600',
    badge: 'For Sale',
  },
  {
    label: 'Under ₹20 Lakhs',
    sublabel: 'Budget plots & land',
    href: '/properties?category=residential-plots&price_max=2000000',
    bg: 'bg-gradient-to-br from-teal-50 to-cyan-50',
    icon: TrendingUp,
    iconColor: 'text-teal-600',
    badge: 'Affordable',
  },
  {
    label: '₹20–50 Lakhs',
    sublabel: 'Mid-range plots',
    href: '/properties?category=residential-plots&price_min=2000000&price_max=5000000',
    bg: 'bg-gradient-to-br from-lime-50 to-green-50',
    icon: Leaf,
    iconColor: 'text-lime-700',
  },
  {
    label: 'Above ₹50 Lakhs',
    sublabel: 'Premium land parcels',
    href: '/properties?category=residential-plots&price_min=5000000',
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
    icon: LayoutGrid,
    iconColor: 'text-amber-600',
    badge: 'Premium',
  },
  {
    label: 'Agricultural Land',
    sublabel: 'Farming & cultivation',
    href: '/properties?category=agricultural-land&type=sale',
    bg: 'bg-gradient-to-br from-green-50 to-lime-50',
    icon: Trees,
    iconColor: 'text-green-700',
  },
];

const COMMERCIAL_SEGMENTS: SegmentCard[] = [
  {
    label: 'Shops for Rent',
    sublabel: 'Prime retail spaces',
    href: '/properties?category=commercial&type=rent',
    bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
    icon: Store,
    iconColor: 'text-orange-600',
    badge: 'For Rent',
  },
  {
    label: 'Shops for Sale',
    sublabel: 'Own your business space',
    href: '/properties?category=commercial&type=sale',
    bg: 'bg-gradient-to-br from-red-50 to-rose-50',
    icon: Store,
    iconColor: 'text-red-600',
    badge: 'For Sale',
  },
  {
    label: 'Office Space',
    sublabel: 'Corporate & co-working',
    href: '/properties?category=commercial&q=office',
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    icon: Building2,
    iconColor: 'text-blue-600',
  },
  {
    label: 'Warehouse / Godown',
    sublabel: 'Storage & logistics',
    href: '/properties?category=commercial&q=warehouse',
    bg: 'bg-gradient-to-br from-slate-50 to-zinc-100',
    icon: Warehouse,
    iconColor: 'text-slate-600',
  },
  {
    label: 'Commercial on Lease',
    sublabel: 'Long-term commercial lease',
    href: '/properties?category=commercial&type=lease',
    bg: 'bg-gradient-to-br from-violet-50 to-purple-50',
    icon: Building,
    iconColor: 'text-violet-600',
    badge: 'Lease',
  },
];

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

        {/* ── EXPLORE BY PROPERTY TYPE ────────────────────────── */}
        <SegmentCardRow
          title="Explore by Property Type"
          subtitle="Browse every category of property in Kottayam"
          cards={PROPERTY_TYPE_SEGMENTS}
          bg="bg-white"
        />

        {/* ── HOUSES & VILLAS ─────────────────────────────────── */}
        <SegmentCardRow
          title="Houses & Villas"
          subtitle="Find the perfect home — for sale, rent or lease"
          cards={HOUSES_VILLAS_SEGMENTS}
          bg="bg-slate-50"
        />

        {/* ── RESIDENTIAL PLOTS ───────────────────────────────── */}
        <SegmentCardRow
          title="Residential Plots & Land"
          subtitle="Buy a plot and build your dream home in Kottayam"
          cards={PLOTS_SEGMENTS}
          bg="bg-white"
        />

        {/* ── COMMERCIAL PROPERTIES ───────────────────────────── */}
        <SegmentCardRow
          title="Commercial Properties"
          subtitle="Shops, offices, warehouses & commercial spaces"
          cards={COMMERCIAL_SEGMENTS}
          bg="bg-slate-50"
        />

        {/* ── HOW IT WORKS ───────────────────────────────────── */}
        <HowItWorks />

        {/* ── CTA BANNER ─────────────────────────────────────── */}
        <CTABanner />
      </main>

      <Footer />
    </>
  );
}
