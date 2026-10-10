import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Home, Users, FileText, CheckCircle, XCircle,
  Clock, TrendingUp, Settings, Flag, Bell,
  BarChart3, Package, AlertTriangle, Eye
} from 'lucide-react';
import { MOCK_LISTINGS, MOCK_STATS } from '@/lib/mock-data';

export const metadata: Metadata = { title: 'Admin Dashboard | qkit' };

const ADMIN_NAV = [
  { label: 'Dashboard',      href: '/admin',              icon: BarChart3 },
  { label: 'Moderation',     href: '/admin/moderation',   icon: Clock,         badge: '7' },
  { label: 'All Listings',   href: '/admin/listings',     icon: Home },
  { label: 'Users',          href: '/admin/users',        icon: Users },
  { label: 'Categories',     href: '/admin/categories',   icon: Package },
  { label: 'Reports',        href: '/admin/reports',      icon: Flag,          badge: '3' },
  { label: 'Settings',       href: '/admin/settings',     icon: Settings },
];

const METRICS = [
  { label: 'Total Listings',   value: MOCK_STATS.total_listings.toLocaleString('en-IN'), icon: Home,        color: 'bg-brand-50 text-brand-600', sub: '+124 today' },
  { label: 'Total Users',      value: MOCK_STATS.total_users.toLocaleString('en-IN'),    icon: Users,       color: 'bg-blue-50 text-blue-600',   sub: '+38 today' },
  { label: 'Pending Review',   value: '7',                                               icon: Clock,       color: 'bg-amber-50 text-amber-700', sub: 'Needs attention' },
  { label: 'Verified',         value: MOCK_STATS.verified_listings.toLocaleString('en-IN'), icon: CheckCircle, color: 'bg-green-50 text-green-600', sub: 'of total listings' },
];

export default function AdminDashboardPage() {
  const pending  = MOCK_LISTINGS.filter(l => l.status === 'pending' || l.is_featured);
  const recent   = MOCK_LISTINGS.slice(0,5);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-slate-900 text-slate-300 flex-shrink-0">
        <div className="p-5 border-b border-slate-700">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
              <Home className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-heading font-bold text-white">qkit <span className="text-brand-400 text-xs font-normal">admin</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {ADMIN_NAV.map(({ label, href, icon: Icon, badge }) => (
            <Link key={href} href={href}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors group">
              <span className="flex items-center gap-2.5">
                <Icon className="w-4 h-4" />
                {label}
              </span>
              {badge && <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">{badge}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-700">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <Eye className="w-4 h-4" />View Site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-x-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h1 className="font-heading font-bold text-slate-900">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-500">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">A</div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {METRICS.map(m => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card">
                  <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-heading font-bold text-2xl text-slate-900">{m.value}</div>
                  <div className="text-sm text-slate-600 mt-0.5">{m.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{m.sub}</div>
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Pending moderation */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h2 className="font-heading font-semibold text-slate-900">Pending Moderation</h2>
                <Link href="/admin/moderation" className="text-xs text-brand-600 hover:underline">View All →</Link>
              </div>
              <div className="divide-y divide-slate-50">
                {MOCK_LISTINGS.slice(0,4).map(l => (
                  <div key={l.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      {l.media?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.media[0].url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{l.title}</p>
                      <p className="text-xs text-slate-500">{l.seller_name} · {l.seller_type} · {l.listing_id}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" />Approve
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors">
                        <XCircle className="w-3.5 h-3.5" />Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
              <h2 className="font-heading font-semibold text-slate-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { label: 'Manage Categories',  href: '/admin/categories', icon: Package,      color: 'text-brand-600' },
                  { label: 'Review Reports (3)',  href: '/admin/reports',    icon: Flag,         color: 'text-red-500' },
                  { label: 'Edit Pricing Plans',  href: '/admin/settings',   icon: Settings,     color: 'text-purple-600' },
                  { label: 'Manage Locations',    href: '/admin/locations',  icon: TrendingUp,   color: 'text-blue-600' },
                  { label: 'User Management',     href: '/admin/users',      icon: Users,        color: 'text-amber-600' },
                ].map(({ label, href, icon: Icon, color }) => (
                  <Link key={label} href={href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors group">
                    <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">{label}</span>
                  </Link>
                ))}
              </div>

              <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-100">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">Action Required</p>
                    <p className="text-xs text-amber-700 mt-0.5">7 listings awaiting moderation approval.</p>
                    <Link href="/admin/moderation" className="text-xs text-amber-800 font-semibold underline mt-1 block">Review now →</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent listings table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-heading font-semibold text-slate-900">Recent Listings</h2>
              <Link href="/admin/listings" className="text-xs text-brand-600 hover:underline">View All →</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-5 py-3">Property</th>
                    <th className="text-left px-5 py-3">Seller</th>
                    <th className="text-left px-5 py-3">Price</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-left px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recent.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-medium text-slate-900 max-w-xs truncate">{l.title}</p>
                          <p className="text-xs text-slate-400">{l.listing_id} · {l.category?.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-slate-700">{l.seller_name}</p>
                        <p className="text-xs text-slate-400 capitalize">{l.seller_type}</p>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-brand-600">
                        {l.price >= 100000 ? `₹${(l.price/100000).toFixed(1)}L` : `₹${l.price.toLocaleString('en-IN')}`}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`badge ${l.status === 'published' ? 'badge-brand' : l.status === 'rejected' ? 'badge-red' : 'badge-amber'}`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <Link href={`/property/${l.slug}`} target="_blank" className="text-xs text-brand-600 hover:underline">View</Link>
                          <button className="text-xs text-red-500 hover:underline">Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
