import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MOCK_LISTINGS } from '@/lib/mock-data';
import PropertyCard from '@/components/property/PropertyCard';
import Link from 'next/link';
import { Plus, Edit2, Pause, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatIndianPrice, timeAgo } from '@/lib/utils';

export const metadata: Metadata = { title: 'My Listings | qkit Dashboard' };

const STATUS_CONFIG: Record<string, { label: string; class: string; icon: React.ElementType }> = {
  published: { label: 'Live',    class: 'badge-brand',  icon: CheckCircle },
  pending:   { label: 'Pending', class: 'badge-amber',  icon: Clock },
  rejected:  { label: 'Rejected',class: 'badge-red',    icon: XCircle },
  draft:     { label: 'Draft',   class: 'badge-slate',  icon: Clock },
  paused:    { label: 'Paused',  class: 'badge-slate',  icon: Pause },
  expired:   { label: 'Expired', class: 'badge bg-orange-100 text-orange-700', icon: XCircle },
};

export default function MyListingsPage() {
  const listings = MOCK_LISTINGS.slice(0, 4);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-10">
        <div className="container-qkit">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="font-heading font-bold text-2xl text-slate-900">My Listings</h1>
              <p className="text-slate-500 text-sm mt-1">{listings.length} properties · 2 active · 1 pending</p>
            </div>
            <Link href="/post-property" className="btn-primary btn-md">
              <Plus className="w-4 h-4" />Add Listing
            </Link>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {['All', 'Live', 'Pending', 'Draft', 'Paused', 'Expired'].map(tab => (
              <button key={tab}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${tab === 'All' ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200 text-slate-600 hover:border-brand-300'}`}>
                {tab}
              </button>
            ))}
          </div>

          {listings.length === 0 ? (
            <div className="card p-16 text-center">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="font-heading font-semibold text-slate-700 mb-2">No listings yet</h3>
              <p className="text-slate-500 text-sm mb-6">Post your first property for free in under 2 minutes.</p>
              <Link href="/post-property" className="btn-primary btn-md inline-flex"><Plus className="w-4 h-4" />Post Property</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map(l => {
                const statusCfg = STATUS_CONFIG[l.status] ?? STATUS_CONFIG.draft;
                const StatusIcon = statusCfg.icon;
                return (
                  <div key={l.id} className="card p-5">
                    <div className="flex gap-4 flex-wrap sm:flex-nowrap">
                      {/* Thumbnail */}
                      <div className="w-28 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                        {l.media?.[0] && <img src={l.media[0].url} alt="" className="w-full h-full object-cover" />}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 justify-between">
                          <h2 className="font-semibold text-slate-900 leading-tight text-sm line-clamp-2">{l.title}</h2>
                          <span className={`${statusCfg.class} badge flex items-center gap-1 flex-shrink-0`}>
                            <StatusIcon className="w-3 h-3" />{statusCfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {l.listing_id} · {l.locality?.city?.name} · {formatIndianPrice(l.price, l.price_unit)}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-400">
                          <span>👁 {l.views_count} views</span>
                          <span>💬 {l.enquiries_count} enquiries</span>
                          <span>Posted {timeAgo(l.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 flex-wrap">
                      <Link href={`/property/${l.slug}`} target="_blank"
                        className="text-xs text-brand-600 hover:underline font-medium">
                        View Listing →
                      </Link>
                      <div className="flex gap-2 ml-auto">
                        <button className="btn-secondary btn-sm text-xs">
                          <Pause className="w-3.5 h-3.5" />Pause
                        </button>
                        <Link href={`/seller/edit/${l.id}`} className="btn-secondary btn-sm text-xs">
                          <Edit2 className="w-3.5 h-3.5" />Edit
                        </Link>
                        <button className="btn-primary btn-sm text-xs">
                          ⭐ Promote
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
