import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Pencil } from 'lucide-react';
import { getListings } from '@/lib/supabase/queries';
import { formatIndianPrice, timeAgo } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'All Listings | qkit Admin' };

const STATUS_STYLES: Record<string, string> = {
  published: 'badge-brand',
  pending:   'badge-amber',
  rejected:  'badge-red',
  draft:     'badge-slate',
  paused:    'badge bg-slate-200 text-slate-500',
  expired:   'badge bg-orange-100 text-orange-700',
  sold:      'badge bg-blue-100 text-blue-700',
};

export default async function AdminListingsPage() {
  const { data: listings, count } = await getListings({ limit: 50 });

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
              href === '/admin/listings' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 hover:text-white'
            }`}>
            {label}
          </Link>
        ))}
        <div className="mt-auto pt-3 border-t border-slate-700">
          <Link href="/admin/listings/new"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-brand-400 hover:text-white hover:bg-slate-800 transition-colors">
            <Plus className="w-4 h-4" />Add Property
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <header className="bg-white border-b border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-heading font-bold text-slate-900">All Listings</h1>
              <p className="text-sm text-slate-500 mt-0.5">{count} total properties</p>
            </div>
            <Link href="/admin/listings/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
              <Plus className="w-4 h-4" />Add Property
            </Link>
          </div>
        </header>

        <div className="p-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-5 py-3">Property</th>
                    <th className="text-left px-5 py-3">Location</th>
                    <th className="text-left px-5 py-3">Seller</th>
                    <th className="text-left px-5 py-3">Price</th>
                    <th className="text-left px-5 py-3">Type</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-left px-5 py-3">Posted</th>
                    <th className="text-left px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {listings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center">
                        <p className="text-slate-400 text-sm mb-3">No listings found.</p>
                        <Link href="/admin/listings/new"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
                          <Plus className="w-4 h-4" />Add Your First Property
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    listings.map((l: any) => (
                      <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5 max-w-[220px]">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-9 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                              {l.media?.[0] && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={l.media[0].url} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 truncate">{l.title}</p>
                              <p className="text-xs text-slate-400">{l.listing_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 text-xs">
                          {[l.locality, l.city, l.state].filter(Boolean).join(', ') ||
                           l.locality?.name || l.address_line || '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-slate-700">{l.seller_name}</p>
                          <p className="text-xs text-slate-400 capitalize">{l.seller_type}</p>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-brand-600 whitespace-nowrap">
                          {formatIndianPrice(l.price, l.price_unit)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="badge badge-slate capitalize">{l.transaction_type}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={STATUS_STYLES[l.status] || 'badge badge-slate'}>
                            {l.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                          {timeAgo(l.created_at)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/listings/${l.id}/edit`}
                              className="flex items-center gap-1 text-xs bg-brand-50 text-brand-700 hover:bg-brand-100 font-medium px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                              <Pencil className="w-3 h-3" />Edit
                            </Link>
                            <Link href={`/property/${l.slug}`} target="_blank"
                              className="text-xs text-slate-500 hover:text-brand-600 hover:underline whitespace-nowrap">
                              View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
