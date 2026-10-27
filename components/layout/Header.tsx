'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, X, Heart, User, Plus, LogOut, LayoutDashboard,
  Home, List, MessageCircle, ChevronDown,
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Home',            href: '/' },
  { label: 'Buy',             href: '/buy' },
  { label: 'Rent',            href: '/rent' },
  { label: 'Lease',           href: '/lease' },
  { label: 'Property Owners', href: '/post-property' },
  { label: 'About',           href: '/about' },
  { label: 'Contact',         href: '/contact' },
];

interface AuthUser { id: string; name?: string; phone?: string; avatar_url?: string; }

function getInitials(name?: string): string {
  if (!name?.trim()) return '?';
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function Header() {
  const pathname  = usePathname();
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [user, setUser]               = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(({ user }) => setUser(user ?? null))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

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

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-200',
          scrolled ? 'bg-white shadow-md border-b border-slate-100' : 'bg-white border-b border-slate-100'
        )}
      >
        <div className="container-qkit">
          <div className="flex items-center h-16 gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0 group">
              <Image
                src="/logo.png"
                alt="qKIT Real Estate"
                width={120}
                height={40}
                className="h-9 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1" aria-label="Main navigation">
              {NAV_LINKS.map(({ label, href }) => {
                const isActive = href === '/' ? pathname === '/' : pathname?.startsWith(href);
                return (
                  <Link key={href} href={href}
                    className={cn(
                      'px-3 py-5 text-sm font-medium transition-colors whitespace-nowrap border-b-2',
                      isActive
                        ? 'text-brand-600 border-brand-600'
                        : 'text-slate-600 hover:text-brand-600 border-transparent hover:border-brand-300'
                    )}>
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <Link href="/dashboard/favorites"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:text-brand-600 transition-colors text-sm font-medium">
                <Heart className="w-4 h-4" />
                <span className="hidden md:inline">Saved</span>
              </Link>

              {authLoading ? (
                <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
              ) : user ? (
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setProfileOpen(v => !v)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-all"
                    aria-expanded={profileOpen}
                  >
                    {user.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar_url} alt={user.name ?? 'Profile'} className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-200" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-brand-200">
                        {getInitials(user.name)}
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[80px] truncate">
                      {user.name?.split(' ')[0] ?? 'Me'}
                    </span>
                    <ChevronDown className={cn('w-3.5 h-3.5 text-slate-400 transition-transform hidden sm:block', profileOpen && 'rotate-180')} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-modal border border-slate-100 p-2 z-50 animate-slide-down">
                      <div className="px-3 py-2 mb-1 border-b border-slate-100">
                        <p className="font-semibold text-slate-900 text-sm truncate">{user.name ?? 'User'}</p>
                        <p className="text-xs text-slate-400 truncate">{user.phone ?? ''}</p>
                      </div>
                      {[
                        { href: '/dashboard',          icon: LayoutDashboard, label: 'Dashboard' },
                        { href: '/dashboard/listings', icon: List,            label: 'My Properties' },
                        { href: '/dashboard/favorites',icon: Heart,           label: 'Saved Properties' },
                        { href: '/dashboard/enquiries',icon: MessageCircle,   label: 'My Enquiries' },
                      ].map(({ href, icon: Icon, label }) => (
                        <Link key={href} href={href} onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors">
                          <Icon className="w-4 h-4" /> {label}
                        </Link>
                      ))}
                      <hr className="my-1 border-slate-100" />
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:text-brand-600 transition-colors text-sm font-medium">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              )}

              <Link href="/post-property"
                className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Post Property</span>
              </Link>

              <button onClick={() => setMobileOpen(v => !v)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}>
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-hidden />
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-slate-100 shadow-lg animate-slide-down max-h-[calc(100vh-4rem)] overflow-y-auto">
            {user && (
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-brand-50">
                <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {getInitials(user.name)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">{user.name ?? 'User'}</p>
                  <p className="text-xs text-slate-500 truncate">{user.phone ?? ''}</p>
                </div>
              </div>
            )}

            <nav className="p-4 space-y-0.5">
              {NAV_LINKS.map(({ label, href }) => {
                const isActive = href === '/' ? pathname === '/' : pathname?.startsWith(href);
                return (
                  <Link key={href} href={href}
                    className={cn('flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50')}>
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 pt-2 border-t border-slate-100 space-y-2">
              {user ? (
                <>
                  <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-700 hover:bg-slate-50">
                    <LayoutDashboard className="w-4 h-4 text-slate-400" /> Dashboard
                  </Link>
                  <Link href="/dashboard/listings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-700 hover:bg-slate-50">
                    <List className="w-4 h-4 text-slate-400" /> My Properties
                  </Link>
                  <Link href="/dashboard/enquiries" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-700 hover:bg-slate-50">
                    <MessageCircle className="w-4 h-4 text-slate-400" /> My Enquiries
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <Link href="/login"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-brand-600 text-brand-600 text-sm font-semibold hover:bg-brand-50 transition-colors">
                  <User className="w-4 h-4" /> Login / Register
                </Link>
              )}
              <Link href="/post-property"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors">
                <Plus className="w-4 h-4" /> Post Property Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
