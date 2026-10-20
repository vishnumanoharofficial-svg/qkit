'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Plus, Edit2, Pause, CheckCircle, XCircle, Clock, Loader2, LogIn, Home } from 'lucide-react';
import { formatIndianPrice, timeAgo } from '@/lib/utils';

interface AuthUser { id: string; name?: string; }
interface Listing {
  id: string; title: string; status: string;
  transaction_type: string; price: number; price_unit: string;
  created_at: string; views_count: number; enquiries_count: number;
  listing_id?: string; slug?: string;
  taluk?: string; town_panchayat?: string;
  media?: { url: string }[];
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  published: { label: 'Live',    cls: 'badge-brand',  icon: CheckCircle },
  pending:   { label: 'Pending', cls: 'badge-amber',  icon: Clock },
  rejected:  { label: 'Rejected',cls: 'badge bg-red-100 text-red-700',   icon: XCircle },
  draft:     { label: 'Draft',   cls: 'badge-slate',  icon: Clock },
  paused:    { label: 'Paused',  cls: 'badge-slate',  icon: Pause },
  expired:   { label: 'Expired', cls: 'badge bg-orange-100 text-orange-700', icon: XCircle },
};

const TX_LABELS: Record<string, string> = {
  sale: 'For Sale', rent: 'For Rent', lease: 'For Lease',
};

export default function MyListingsPage() {
  const [user, setUser]             = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [listings, setListings]     = useState<Listing[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(false);
  const [filter, setFilter]         = useState('All');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(({ user }) => setUser(user ?? null))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const statusParam = filter === 'All' ? '' : `&status=${filter.toLowerCase()}`;
    fetch(`/api/properties?user_id=${user.id}&limit=50${statusParam}`)
      .then(r => r.json())
      .then(res => { setListings(res.data ?? []); setTotal(res.total ?? 0); })
      .catch(() => { setListings([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [user, filter]);

  if (authLoading) return (
    <><Header />
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </main>
      <Footer /></>
  );

  if (!user) return (
    <><Header />
      <main className="min-h-screen flex items-center justify-center py-20 px-4">
        <div className="card p-10 max-w-sm w-full text-center">
          <LogIn className="w-12 h-12 text-brand-400 mx-auto mb-4" />
          <h2 className="font-heading font-bold text-xl text-slate-900 mb-2">Please log in</h2>
          <p className="text-slate-500 text-sm mb-6">You need to be logged in to view your listings.</p>
          <Link href="/login" className="btn-primary btn-md w-full justify-center">Go to Login</Link>
        </div>
      </main>
      <Footer /></>
  );

  return (
    <><Header />
      <main className="min-h-screen bg-slate-50 py-10">
        <div className="container-qkit">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="font-heading font-bold text-2xl text-slate-900">My Listings</h1>
              <p className="text-slate-500 text-sm mt-1">
                {loading ? 'Loading…' : `${total} propert${total === 1 ? 'y' : 'ies'}`}
              </p>
            </div>
            <Link href="/post-property" className="btn-primary btn-md">
              <Plus className="w-4 h-4" /> Add Listing
            </Link>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {['All', 'Live', 'Pending', 'Draft', 'Paused', 'Expired'].map(tab => (
              <button key={tab} onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  filter === tab ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200 text-slate-600 hover:border-brand-300'
                }`}>
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="card p-5 flex gap-4">
                  <div className="skeleton w-28 h-20 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 rounded w-2/3" />
                    <div className="skeleton h-3 rounded w-1/3" />
                    <div className="skeleton h-3 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="card p-16 text-center">
              <Home className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-slate-700 mb-2">No listings yet</h3>
              <p className="text-slate-500 text-sm mb-6">Post your first property for free in under 2 minutes.</p>
              <Link href="/post-property" className="btn-primary btn-md inline-flex"><Plus className="w-4 h-4" /> Post Property</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map(l => {
                const cfg = STATUS_CONFIG[l.status] ?? STATUS_CONFIG.draft;
                const StatusIcon = cfg.icon;
                return (
                  <div key={l.id} className="card p-5">
                    <div className="flex gap-4 flex-wrap sm:flex-nowrap">
                      <div className="w-28 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                        {l.media?.[0]?.url
                          ? /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={l.media[0].url} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-3xl">🏠</div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 justify-between">
                          <h2 className="font-semibold text-slate-900 leading-tight text-sm line-clamp-2">{l.title}</h2>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className={`${cfg.cls} badge flex items-center gap-1`}>
                              <StatusIcon className="w-3 h-3" /> {cfg.label}
                            </span>
                            <span className="badge badge-slate text-xs">{TX_LABELS[l.transaction_type] ?? l.transaction_type}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {[l.listing_id, l.town_panchayat, 'Kottayam'].filter(Boolean).join(' · ')} · {formatIndianPrice(l.price, l.price_unit as 'total' | 'per_month' | 'per_sqft' | 'per_year')}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-400">
                          <span>👁 {l.views_count ?? 0} views</span>
                          <span>💬 {l.enquiries_count ?? 0} enquiries</span>
                          <span>Posted {timeAgo(l.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 flex-wrap">
                      {l.slug && (
                        <Link href={`/property/${l.slug}`} target="_blank"
                          className="text-xs text-brand-600 hover:underline font-medium">View Listing →</Link>
                      )}
                      <div className="flex gap-2 ml-auto">
                        <button className="btn-secondary btn-sm text-xs"><Pause className="w-3.5 h-3.5" /> Pause</button>
                        <Link href={`/seller/edit/${l.id}`} className="btn-secondary btn-sm text-xs"><Edit2 className="w-3.5 h-3.5" /> Edit</Link>
                        <button className="btn-primary btn-sm text-xs">⭐ Promote</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer /></>
  );
}
