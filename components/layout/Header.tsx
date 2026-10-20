'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search, MapPin, Menu, X, ChevronDown,
  Heart, User, Plus, LogOut, LayoutDashboard,
  Home, Building2, List,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Buy',        href: '/buy' },
  { label: 'Rent',       href: '/rent' },
  { label: 'Lease',      href: '/lease' },
  { label: 'Commercial', href: '/commercial' },
];

interface AuthUser {
  id: string;
  name?: string;
  phone?: string;
  avatar_url?: string;
}

function getInitials(name?: string): string {
  if (!name?.trim()) return '?';
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Header() {
  const [pathname, setPathname]         = useState('');
  const [scrolled, setScrolled]         = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [user, setUser]                 = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading]   = useState(true);
  const [profileOpen, setProfileOpen]   = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // ── Fetch current session user ──────────────────────────────────────────
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(({ user }) => setUser(user ?? null))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  // ── Scroll + pathname ───────────────────────────────────────────────────
  useEffect(() => {
    setPathname(window.location.pathname);
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // ── Close profile dropdown on outside click ─────────────────────────────
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  async function handleLogout() {
    await fetch('/api/auth/me', { method: 'POST' });
    setUser(null);
    setProfileOpen(false);
    window.location.href = '/';
  }

  // ── Auth button (right side) ─────────────────────────────────────────────
  const AuthButton = () => {
    if (authLoading) {
      return <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse" />;
    }

    if (!user) {
      return (
        <Link
          href="/login"
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all text-sm font-medium"
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Login</span>
        </Link>
      );
    }

    const initials = getInitials(user.name);

    return (
      <div ref={profileRef} className="relative">
        <button
          onClick={() => setProfileOpen(v => !v)}
          className="flex items-center gap-2 rounded-xl hover:bg-slate-100 transition-all p-1 pr-2"
          aria-expanded={profileOpen}
          aria-haspopup="true"
        >
          {/* Avatar */}
          {user.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={user.avatar_url}
              alt={user.name ?? 'Profile'}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-brand-200">
              {initials}
            </div>
          )}
          <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[80px] truncate">
            {user.name?.split(' ')[0] ?? 'Me'}
          </span>
          <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform hidden sm:block', profileOpen && 'rotate-180')} />
        </button>

        {/* Profile dropdown */}
        {profileOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-modal border border-slate-100 p-2 z-50 animate-slide-down">
            {/* User info */}
            <div className="px-3 py-2 mb-1 border-b border-slate-100">
              <p className="font-semibold text-slate-900 text-sm truncate">{user.name ?? 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user.phone ? `+91 ${user.phone}` : ''}</p>
            </div>

            <Link href="/dashboard" onClick={() => setProfileOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors">
              <LayoutDashboard className="w-4 h-4" /> My Dashboard
            </Link>
            <Link href="/dashboard/listings" onClick={() => setProfileOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors">
              <List className="w-4 h-4" /> My Listings
            </Link>
            <Link href="/dashboard/favorites" onClick={() => setProfileOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors">
              <Heart className="w-4 h-4" /> Saved Properties
            </Link>

            <div className="border-t border-slate-100 mt-1 pt-1">
              <button onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <header className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100'
          : 'bg-white border-b border-slate-100'
      )}>
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

            {/* Search bar — desktop */}
            <div className="flex-1 hidden lg:flex items-center gap-0 bg-slate-100 rounded-xl overflow-hidden border border-transparent focus-within:border-brand-400 focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-slate-400 ml-4 flex-shrink-0" />
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search locality, town, panchayat or listing ID…"
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
                <Link key={href} href={href}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    pathname?.startsWith(href)
                      ? 'text-brand-600 bg-brand-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )}>
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2 ml-auto md:ml-0">
              <Link href="/post-property"
                className="hidden sm:flex btn-primary btn-md text-sm"
                aria-label="Post a property">
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">Post Property</span>
              </Link>

              <Link href="/dashboard/favorites"
                className="p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                aria-label="Saved properties">
                <Heart className="w-5 h-5" />
              </Link>

              {/* Auth button — Login or Avatar */}
              <AuthButton />

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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-hidden />
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-slate-100 shadow-lg animate-slide-down">
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-3 bg-slate-100 rounded-xl px-4 py-3">
                <Search className="w-4 h-4 text-slate-400" />
                <input type="search" placeholder="Search properties…"
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none" />
              </div>
            </div>
            <nav className="p-4 space-y-1" aria-label="Mobile navigation">
              {NAV_LINKS.map(({ label, href }) => (
                <Link key={href} href={href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    pathname?.startsWith(href) ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'
                  )}>
                  {label}
                </Link>
              ))}
              <div className="border-t border-slate-100 pt-3 mt-3 space-y-1">
                <Link href="/post-property" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-brand-600 bg-brand-50">
                  <Plus className="w-4 h-4" /> Post Property
                </Link>
                {user ? (
                  <>
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                      <LayoutDashboard className="w-4 h-4" /> My Dashboard
                    </Link>
                    <Link href="/dashboard/favorites" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                      <Heart className="w-4 h-4" /> Saved Properties
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full text-left">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <User className="w-4 h-4" /> Login / Register
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}

      <div className="h-16" aria-hidden />
    </>
  );
}
