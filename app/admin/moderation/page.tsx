import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MOCK_LISTINGS } from '@/lib/mock-data';
import { CheckCircle, XCircle, Eye, Clock, MoreHorizontal } from 'lucide-react';
import { formatIndianPrice, timeAgo } from '@/lib/utils';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Moderation Queue | qkit Admin' };

const STATUS_MAP: Record<string, { label: string; class: string }> = {
  published: { label: 'Published', class: 'badge-brand' },
  pending:   { label: 'Pending',   class: 'badge-amber' },
  rejected:  { label: 'Rejected',  class: 'badge-red' },
  draft:     { label: 'Draft',     class: 'badge-slate' },
};

export default function ModerationPage() {
  // In production these come from DB filtered by status=pending
  const queue = MOCK_LISTINGS.map((l, i) => ({ ...l, status: i % 3 === 0 ? 'pending' : 'published' as any }));
  const pending = queue.filter(l => l.status === 'pending');
  const recent  = queue.filter(l => l.status !== 'pending').slice(0, 8);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar same structure as admin dashboard */}
      <aside className="hidden md:flex flex-col w-60 bg-slate-900 text-slate-300 flex-shrink-0 p-3">
        <div className="p-3 mb-4">
          <Link href="/admin" className="font-heading font-bold text-white text-lg">
            q<span className="text-brand-400">kit</span> <span className="text-xs text-slate-400 font-normal">admin</span>
          </Link>
        </div>
        {[
          ['Dashboard', '/admin'],
          ['Moderation', '/admin/moderation'],
          ['All Listings', '/admin/listings'],
          ['Users', '/admin/users'],
          ['Categories', '/admin/categories'],
          ['Settings', '/admin/settings'],
        ].map(([label, href]) => (
          <Link key={href} href={href}
            className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5 ${href === '/admin/moderation' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
            {label}
          </Link>
        ))}
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <header className="bg-white border-b border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading font-bold text-slate-900">Moderation Queue</h1>
              <p className="text-sm text-slate-500 mt-0.5">{pending.length} listings awaiting review</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge-amber">{pending.length} Pending</span>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Pending */}
          {pending.length === 0 ? (
            <div className="card p-16 text-center">
              <CheckCircle className="w-12 h-12 text-brand-400 mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-slate-700">All caught up!</h3>
              <p className="text-slate-500 text-sm mt-1">No listings pending review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="font-heading font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                Pending Review ({pending.length})
              </h2>
              {pending.map(l => (
                <div key={l.id} className="card p-5">
                  <div className="flex gap-4 flex-wrap">
                    {/* Thumbnail */}
                    <div className="w-28 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      {l.media?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.media[0].url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">{l.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {l.listing_id} · {l.category?.name} · {l.seller_name} ({l.seller_type})
                          </p>
                        </div>
                        <span className={STATUS_MAP[l.status]?.class + ' badge flex-shrink-0'}>
                          {STATUS_MAP[l.status]?.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                        <span>{formatIndianPrice(l.price, l.price_unit)}</span>
                        <span>{l.area} {l.area_unit}</span>
                        <span>{l.locality?.city?.name}</span>
                        <span>Posted {timeAgo(l.created_at)}</span>
                        <span>{l.media?.length ?? 0} photos</span>
                      </div>

                      {l.description && (
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2">{l.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                    <Link href={`/property/${l.slug}`} target="_blank"
                      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-600 transition-colors">
                      <Eye className="w-3.5 h-3.5" />Preview
                    </Link>
                    <div className="flex gap-2 ml-auto">
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors border border-red-100">
                        <XCircle className="w-3.5 h-3.5" />Reject
                      </button>
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" />Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recently moderated */}
          <div>
            <h2 className="font-heading font-semibold text-slate-900 mb-4">Recently Moderated</h2>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide font-semibold">
                    <tr>
                      <th className="text-left px-5 py-3">Listing</th>
                      <th className="text-left px-5 py-3">Seller</th>
                      <th className="text-left px-5 py-3">Status</th>
                      <th className="text-left px-5 py-3">Date</th>
                      <th className="text-left px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recent.map(l => (
                      <tr key={l.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-slate-900 max-w-xs truncate text-sm">{l.title}</p>
                          <p className="text-xs text-slate-400">{l.listing_id}</p>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-600 capitalize">{l.seller_name} · {l.seller_type}</td>
                        <td className="px-5 py-3.5">
                          <span className={`${STATUS_MAP[l.status]?.class} badge`}>{STATUS_MAP[l.status]?.label}</span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-400">{timeAgo(l.created_at)}</td>
                        <td className="px-5 py-3.5">
                          <Link href={`/property/${l.slug}`} target="_blank" className="text-xs text-brand-600 hover:underline">View</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
