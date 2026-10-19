import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { getListings } from '@/lib/supabase/queries';
import { formatIndianPrice, timeAgo } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Moderation Queue | qkit Admin' };

export default async function AdminModerationPage() {
  const { data: pendingListings, count } = await getListings({ status: 'pending', limit: 50 });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden md:flex flex-col w-60 bg-slate-900 text-slate-300 flex-shrink-0 p-3">
        <div className="p-3 mb-4">
          <Link href="/admin" className="font-heading font-bold text-white text-lg">
            q<span className="text-brand-400">kit</span>
            <span className="text-xs text-slate-400 font-normal ml-1">admin</span>
          </Link>
        </div>
        {[
          ['Dashboard',    '/admin'],
          ['Moderation',   '/admin/moderation'],
          ['All Listings', '/admin/listings'],
          ['Users',        '/admin/users'],
          ['Settings',     '/admin/settings'],
        ].map(([label, href]) => (
          <Link key={href} href={href}
            className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5 block ${
              href === '/admin/moderation' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 hover:text-white'
            }`}>
            {label}
          </Link>
        ))}
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <header className="bg-white border-b border-slate-100 px-6 py-4">
          <h1 className="font-heading font-bold text-slate-900">
            Moderation Queue
            {count > 0 && (
              <span className="ml-2 inline-flex items-center justify-center min-w-[1.5rem] h-6 rounded-full bg-amber-500 text-white text-xs font-bold px-1.5">
                {count}
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Review and approve or reject submitted listings</p>
        </header>

        <div className="p-6">
          {pendingListings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h2 className="font-heading font-semibold text-slate-900 mb-1">All caught up!</h2>
              <p className="text-slate-500 text-sm">No listings are pending review right now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingListings.map((listing: any) => (
                <div key={listing.id} className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                  <div className="flex flex-col sm:flex-row gap-4 p-5">
                    {/* Image */}
                    <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      {listing.media?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={listing.media[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Eye className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 text-sm">{listing.title}</h3>
                        <span className="badge badge-amber capitalize">{listing.transaction_type}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">
                        {[listing.locality, listing.city, listing.state].filter(Boolean).join(', ') || listing.address_line || 'Location not specified'}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                        <span className="font-semibold text-brand-600 text-sm">{formatIndianPrice(listing.price, listing.price_unit)}</span>
                        <span>·</span>
                        <span>{listing.area} {listing.area_unit}</span>
                        <span>·</span>
                        <span className="capitalize">{listing.seller_type}: <strong className="text-slate-700">{listing.seller_name}</strong></span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(listing.created_at)}</span>
                      </div>
                      {listing.description && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{listing.description}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2 flex-shrink-0">
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors">
                        <CheckCircle className="w-4 h-4" />Approve
                      </button>
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors">
                        <XCircle className="w-4 h-4" />Reject
                      </button>
                      <Link href={`/property/${listing.slug}`} target="_blank"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors">
                        <Eye className="w-4 h-4" />Preview
                      </Link>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-400">
                    <span>ID: <span className="font-mono font-medium text-slate-600">{listing.listing_id}</span></span>
                    <span>·</span>
                    <span>Category: <span className="capitalize">{listing.category_slug || '—'}</span></span>
                    <span>·</span>
                    <span>Phone: {listing.seller_phone}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
