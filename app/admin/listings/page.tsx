import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, Filter, MoreHorizontal } from 'lucide-react';
import { MOCK_LISTINGS } from '@/lib/mock-data';
import { formatIndianPrice, timeAgo } from '@/lib/utils';

export const metadata: Metadata = { title: 'All Listings | qkit Admin' };

const STATUS_STYLES: Record<string, string> = {
  published: 'badge-brand',
  pending:   'badge-amber',
  rejected:  'badge-red',
  draft:     'badge-slate',
  paused:    'badge bg-slate-200 text-slate-500',
  expired:   'badge bg-orange-100 text-orange-700',
};

export default function AdminListingsPage() {
  // In production this is paginated + server-fetched from Supabase
  const listings = MOCK_LISTINGS;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden md:flex flex-col w-60 bg-slate-900 text-slate-300 flex-shrink-0 p-3">
        <div className="p-3 mb-4">
          <Link href="/admin" className="font-heading font-bold text-white text-lg">
            q<span className="text-brand-400">kit</span>
            <span className="text-xs text-slate-400 font-normal ml-1">admin</span>
          </Link>
        </div>
        {[['Dashboard','/admin'],['Moderation','/admin/moderation'],['All Listings','/admin/listings'],['Users','/admin/users'],['Categories','/admin/categories'],['Settings','/admin/settings']].map(([label,href]) => (
          <Link key={href} href={href} className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5 block ${href==='/admin/listings'?'bg-slate-700 text-white':'hover:bg-slate-800 hover:text-white'}`}>{label}</Link>
        ))}
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <header className="bg-white border-b border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-heading font-bold text-slate-900">All Listings</h1>
              <p className="text-sm text-slate-500">{listings.length} total (showing demo data)</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input placeholder="Search listings…" className="bg-transparent text-sm outline-none w-40 text-slate-700 placeholder:text-slate-400" />
              </div>
              <select className="input text-sm w-36">
                <option value="">All Status</option>
                <option>published</option>
                <option>pending</option>
                <option>rejected</option>
                <option>expired</option>
              </select>
              <select className="input text-sm w-36">
                <option value="">All Types</option>
                <option>sale</option>
                <option>rent</option>
                <option>lease</option>
              </select>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide font-semibold">
                  <tr>
                    <th className="text-left px-5 py-3">Property</th>
                    <th className="text-left px-5 py-3">Seller</th>
                    <th className="text-left px-5 py-3">Type</th>
                    <th className="text-left px-5 py-3">Price</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-left px-5 py-3">Posted</th>
                    <th className="text-left px-5 py-3">Views</th>
                    <th className="text-left px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {listings.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-8 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                            {l.media?.[0] && <img src={l.media[0].url} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 max-w-xs truncate">{l.title}</p>
                            <p className="text-xs text-slate-400">{l.listing_id} · {l.category?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-slate-700">{l.seller_name}</p>
                        <p className="text-xs text-slate-400 capitalize">{l.seller_type}</p>
                      </td>
                      <td className="px-5 py-3.5 capitalize text-slate-600">{l.transaction_type}</td>
                      <td className="px-5 py-3.5 font-semibold text-brand-600 whitespace-nowrap">
                        {formatIndianPrice(l.price, l.price_unit)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`${STATUS_STYLES[l.status] ?? 'badge-slate'} badge`}>{l.status}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">{timeAgo(l.created_at)}</td>
                      <td className="px-5 py-3.5 text-slate-600">{l.views_count.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <Link href={`/property/${l.slug}`} target="_blank" className="text-xs text-brand-600 hover:underline whitespace-nowrap">View</Link>
                          <button className="text-xs text-red-500 hover:underline">Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination stub */}
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
              <span>Showing {listings.length} of {listings.length} listings</span>
              <div className="flex gap-1">
                {[1,2,3].map(p => (
                  <button key={p} className={`w-8 h-8 rounded-lg text-sm transition-colors ${p===1?'bg-brand-600 text-white':'hover:bg-slate-100 text-slate-600'}`}>{p}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
