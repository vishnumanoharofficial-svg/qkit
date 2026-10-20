'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Home, Heart, MessageCircle, Eye, TrendingUp, Plus, Loader2, LogIn } from 'lucide-react';
import { formatIndianPrice, timeAgo } from '@/lib/utils';

interface AuthUser { id: string; name?: string; phone?: string; }
interface Listing {
  id: string; title: string; status: string;
  transaction_type: string; price: number; price_unit: string;
  created_at: string; views_count: number; enquiries_count: number;
  taluk?: string; town_panchayat?: string; locality?: string;
  media?: { url: string }[];
}
interface DashStats {
  listingsCount: number;
  totalViews: number;
  enquiriesCount: number;
  savedCount: number;
}

export default function DashboardPage() {
  const [user, setUser]               = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [stats, setStats]             = useState<DashStats>({ listingsCount: 0, totalViews: 0, enquiriesCount: 0, savedCount: 0 });
  const [listings, setListings]       = useState<Listing[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Step 1: get session user
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(({ user }) => setUser(user ?? null))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  // Step 2: once we have user, fetch their real data
  useEffect(() => {
    if (!user) return;
    setDataLoading(true);

    Promise.all([
      fetch(`/api/properties?user_id=${user.id}&limit=3`).then(r => r.json()).catch(() => ({ data: [], total: 0 })),
      fetch(`/api/enquiries?seller_id=${user.id}&count=true`).then(r => r.json()).catch(() => ({ count: 0 })),
      fetch(`/api/favorites?user_id=${user.id}&count=true`).then(r => r.json()).catch(() => ({ count: 0 })),
    ]).then(([propsRes, enqRes, favRes]) => {
      const myListings: Listing[] = propsRes.data ?? [];
      const totalViews = myListings.reduce((sum: number, l: Listing) => sum + (l.views_count ?? 0), 0);
      setListings(myListings);
      setStats({
        listingsCount:  propsRes.total ?? myListings.length,
        totalViews,
        enquiriesCount: enqRes.count  ?? 0,
        savedCount:     favRes.count  ?? 0,
      });
    }).finally(() => setDataLoading(false));
  }, [user]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </main>
        <Footer />
      </>
    );
  }

  // ── Not logged in ────────────────────────────────────────────────────────
  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center py-20 px-4">
          <div className="card p-10 max-w-sm w-full text-center">
            <LogIn className="w-12 h-12 text-brand-400 mx-auto mb-4" />
            <h2 className="font-heading font-bold text-xl text-slate-900 mb-2">Please log in</h2>
            <p className="text-slate-500 text-sm mb-6">You need to be logged in to view your dashboard.</p>
            <Link href="/login" className="btn-primary btn-md w-full justify-center">Go to Login</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const STAT_CARDS = [
    { icon: Home,          label: 'My Listings',  value: stats.listingsCount,  href: '/dashboard/listings',  color: 'bg-brand-50 text-brand-600' },
    { icon: Eye,           label: 'Total Views',   value: stats.totalViews,     href: '/dashboard/analytics', color: 'bg-blue-50 text-blue-600' },
    { icon: MessageCircle, label: 'Enquiries',     value: stats.enquiriesCount, href: '/dashboard/enquiries', color: 'bg-amber-50 text-amber-600' },
    { icon: Heart,         label: 'Saved',         value: stats.savedCount,     href: '/dashboard/favorites', color: 'bg-pink-50 text-pink-600' },
  ];

  const txLabel = (type: string) =>
    type === 'sale' ? 'For Sale' : type === 'rent' ? 'For Rent' : 'For Lease';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-10">
        <div className="container-qkit">

          {/* Greeting */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="font-heading font-bold text-2xl text-slate-900">
                Welcome back{user.name ? `, ${user.name.split(' ')[0]}` : ''}!
              </h1>
              <p className="text-slate-500 text-sm mt-1">Here's an overview of your activity.</p>
            </div>
            <Link href="/post-property" className="btn-primary btn-md">
              <Plus className="w-4 h-4" /> Post Property
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {STAT_CARDS.map(s => {
              const Icon = s.icon;
              return (
                <Link key={s.label} href={s.href} className="card p-5 hover:shadow-card-hover transition-all group">
                  <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-heading font-bold text-2xl text-slate-900">
                    {dataLoading ? <span className="skeleton inline-block w-8 h-7 rounded" /> : s.value}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                </Link>
              );
            })}
          </div>

          {/* My Listings */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-semibold text-lg text-slate-900">My Listings</h2>
              <Link href="/dashboard/listings" className="text-brand-600 text-sm hover:underline">View All →</Link>
            </div>

            {dataLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2].map(i => (
                  <div key={i} className="card p-4 space-y-3">
                    <div className="skeleton h-36 rounded-xl" />
                    <div className="skeleton h-4 rounded w-3/4" />
                    <div className="skeleton h-3 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="card p-12 text-center">
                <Home className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-slate-700 mb-2">No listings yet</h3>
                <p className="text-slate-500 text-sm mb-5">Post your first property listing for free.</p>
                <Link href="/post-property" className="btn-primary btn-md inline-flex">
                  <Plus className="w-4 h-4" /> Post Property
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {listings.map(l => (
                  <div key={l.id} className="card overflow-hidden">
                    {/* Thumbnail */}
                    <div className="relative h-36 bg-slate-100">
                      {l.media?.[0]?.url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={l.media[0].url} alt={l.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">🏠</div>
                      )}
                      <span className={`absolute top-2 left-2 badge text-xs font-semibold ${
                        l.transaction_type === 'sale' ? 'bg-brand-600 text-white' :
                        l.transaction_type === 'rent' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                      }`}>
                        {txLabel(l.transaction_type)}
                      </span>
                      <span className={`absolute top-2 right-2 badge text-xs ${
                        l.status === 'published' ? 'badge-brand' :
                        l.status === 'pending'   ? 'badge-amber' : 'badge-slate'
                      }`}>
                        {l.status === 'published' ? 'Live' : l.status === 'pending' ? 'Under Review' : l.status}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 mb-1">{l.title}</h3>
                      <p className="text-xs text-slate-500 mb-1">
                        {[l.town_panchayat, l.taluk, 'Kottayam'].filter(Boolean).join(', ')}
                      </p>
                      <p className="font-heading font-bold text-brand-600 text-base mb-2">
                        {formatIndianPrice(l.price, l.price_unit as 'total' | 'per_month' | 'per_sqft' | 'per_year')}
                      </p>
                      <div className="flex gap-3 text-xs text-slate-400 mb-3">
                        <span>👁 {l.views_count ?? 0} views</span>
                        <span>💬 {l.enquiries_count ?? 0} enquiries</span>
                        <span>{timeAgo(l.created_at)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/seller/edit/${l.id}`} className="flex-1 btn-secondary btn-sm text-xs justify-center">Edit</Link>
                        <button className="flex-1 btn-secondary btn-sm text-xs text-red-600 hover:bg-red-50 justify-center">Pause</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Saved Properties',   href: '/dashboard/favorites',  icon: Heart,          desc: 'Properties you bookmarked' },
              { label: 'Enquiries Received', href: '/dashboard/enquiries',  icon: MessageCircle,  desc: 'Messages from interested buyers' },
              { label: 'View Analytics',     href: '/dashboard/analytics',  icon: TrendingUp,     desc: 'Listing views and lead stats' },
            ].map(({ label, href, icon: Icon, desc }) => (
              <Link key={label} href={href} className="card p-5 hover:shadow-card-hover transition-all flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
