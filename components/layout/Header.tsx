'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search, MapPin, Menu, X, ChevronDown,
  Heart, Bell, User, Plus, LogOut, Settings,
  Home, Building2, Warehouse, TreePine, Factory
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { POPULAR_CITIES } from '@/lib/constants';

const NAV_LINKS = [
  { label: 'Buy',        href: '/buy',        icon: Home },
  { label: 'Rent',       href: '/rent',       icon: null },
  { label: 'Lease',      href: '/lease',      icon: null },
  { label: 'Commercial', href: '/commercial', icon: Building2 },
];

export default function Header() {
  const [pathname, setPathname] = useState('');
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cityOpen, setCityOpen]     = useState(false);
  const [selectedCity, setSelectedCity] = useState('All India');
  const [searchQuery, setSearchQuery] = useState('');
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPathname(window.location.pathname);
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100'
            : 'bg-white border-b border-slate-100'
        )}
      >
        <div className="container-qkit">
          <div className="flex items-center gap-3 h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-brand-700 transition-colors">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-slate-900 tracking-tight">
                q<span className="text-brand-600">kit</span>
              </span>
            </Link>

            {/* City selector */}
            <div ref={cityRef} className="relative hidden md:block">
              <button
                onClick={() => setCityOpen(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all text-sm font-medium"
                aria-expanded={cityOpen}
                aria-haspopup="listbox"
              >
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span className="max-w-[100px] truncate">{selectedCity}</span>
                <ChevronDown className={cn('w-3 h-3 transition-transform', cityOpen && 'rotate-180')} />
              </button>

              {cityOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-modal border border-slate-100 p-2 animate-slide-down">
                  <button
                    onClick={() => { setSelectedCity('All India'); setCityOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-colors mb-1"
                  >
                    🇳 All India
                  </button>
                  <p className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">Popular Cities</p>
                  <div className="grid grid-cols-2 gap-0.5">
                    {POPULAR_CITIES.slice(0, 10).map(city => (
                      <button
                        key={city}
                        onClick={() => { setSelectedCity(city); setCityOpen(false); }}
                        className={cn(
                          'text-left px-3 py-2 rounded-lg text-sm transition-colors',
                          selectedCity === city
                            ? 'bg-brand-50 text-brand-700 font-medium'
                            : 'text-slate-600 hover:bg-slate-50'
                        )}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search bar — desktop */}
            <div className="flex-1 hidden lg:flex items-center gap-0 bg-slate-100 rounded-xl overflow-hidden border border-transparent focus-within:border-brand-400 focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-slate-400 ml-4 flex-shrink-0" />
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by city, locality, landmark or listing ID…"
                className="flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    pathname?.startsWith(href)
                      ? 'text-brand-600 bg-brand-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2 ml-auto md:ml-0">
              {/* Post Property CTA */}
              <Link
                href="/post-property"
                className="hidden sm:flex btn-primary btn-md text-sm"
                aria-label="Post a property"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">Post Property</span>
              </Link>

              {/* Favorites */}
              <Link
                href="/dashboard/favorites"
                className="p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors relative"
                aria-label="Saved properties"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* Login / Profile */}
              <Link
                href="/login"
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all text-sm font-medium"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(v => !v)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-slate-100 shadow-lg animate-slide-down">
            {/* Mobile search */}
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-3 bg-slate-100 rounded-xl px-4 py-3">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search properties…"
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
                />
              </div>
            </div>

            {/* Mobile nav */}
            <nav className="p-4 space-y-1" aria-label="Mobile navigation">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    pathname?.startsWith(href)
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {label}
                </Link>
              ))}

              <div className="border-t border-slate-100 pt-3 mt-3 space-y-1">
                <Link href="/post-property" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-brand-600 bg-brand-50">
                  <Plus className="w-4 h-4" />
                  Post Property
                </Link>
                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <User className="w-4 h-4" />
                  My Dashboard
                </Link>
                <Link href="/dashboard/favorites" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <Heart className="w-4 h-4" />
                  Saved Properties
                </Link>
                <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <LogOut className="w-4 h-4" />
                  Login / Register
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Header spacer */}
      <div className="h-16" aria-hidden />
    </>
  );
}
