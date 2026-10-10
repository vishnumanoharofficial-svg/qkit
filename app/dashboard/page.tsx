import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MOCK_LISTINGS } from '@/lib/mock-data';
import PropertyCard from '@/components/property/PropertyCard';
import Link from 'next/link';
import { Home, Heart, MessageCircle, Eye, TrendingUp, Plus } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Dashboard | qkit' };

const STATS = [
  { icon: Home,          label: 'My Listings',   value: '2',   href: '/dashboard/listings',  color: 'bg-brand-50 text-brand-600' },
  { icon: Eye,           label: 'Total Views',    value: '831', href: '/dashboard/analytics', color: 'bg-blue-50 text-blue-600' },
  { icon: MessageCircle, label: 'Enquiries',      value: '33',  href: '/dashboard/enquiries', color: 'bg-amber-50 text-amber-600' },
  { icon: Heart,         label: 'Saved',          value: '12',  href: '/dashboard/favorites', color: 'bg-pink-50 text-pink-600' },
];

export default function DashboardPage() {
  const myListings = MOCK_LISTINGS.slice(0,2);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-10">
        <div className="container-qkit">
          {/* Greeting */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="font-heading font-bold text-2xl text-slate-900">My Dashboard</h1>
              <p className="text-slate-500 text-sm mt-1">Welcome back! Here's an overview of your activity.</p>
            </div>
            <Link href="/post-property" className="btn-primary btn-md">
              <Plus className="w-4 h-4" />Post Property
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {STATS.map(s => {
              const Icon = s.icon;
              return (
                <Link key={s.label} href={s.href} className="card p-5 hover:shadow-card-hover transition-all group">
                  <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-heading font-bold text-2xl text-slate-900">{s.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                </Link>
              );
            })}
          </div>

          {/* My listings */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-semibold text-lg text-slate-900">My Listings</h2>
              <Link href="/dashboard/listings" className="text-brand-600 text-sm hover:underline">View All →</Link>
            </div>
            {myListings.length === 0 ? (
              <div className="card p-12 text-center">
                <Home className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-slate-700 mb-2">No listings yet</h3>
                <p className="text-slate-500 text-sm mb-5">Post your first property listing for free.</p>
                <Link href="/post-property" className="btn-primary btn-md inline-flex"><Plus className="w-4 h-4" />Post Property</Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {myListings.map(l => (
                  <div key={l.id} className="relative">
                    <PropertyCard listing={l} />
                    <div className="absolute top-16 left-3 right-3 flex gap-2 z-10">
                      <Link href={`/seller/edit/${l.id}`} className="flex-1 btn-secondary btn-sm justify-center text-xs shadow-sm">Edit</Link>
                      <button className="flex-1 btn-secondary btn-sm justify-center text-xs text-red-600 hover:bg-red-50 shadow-sm">Pause</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Saved Properties',   href: '/dashboard/favorites',   icon: Heart,          desc: 'Properties you bookmarked' },
              { label: 'Enquiries Received', href: '/dashboard/enquiries',   icon: MessageCircle,  desc: 'Messages from interested buyers' },
              { label: 'View Analytics',     href: '/dashboard/analytics',   icon: TrendingUp,     desc: 'Listing views and lead stats' },
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
