import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MOCK_LISTINGS } from '@/lib/mock-data';
import PropertyCard from '@/components/property/PropertyCard';
import Link from 'next/link';
import {
  BarChart3, TrendingUp, Eye, MessageCircle, Home, Plus,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';

export const metadata: Metadata = { title: 'Analytics | qkit Dashboard' };

const MY_LISTINGS = MOCK_LISTINGS.slice(0, 2);

const ANALYTICS_DATA = [
  { label: 'This Week', views: 234, enquiries: 8, calls: 5 },
  { label: 'Last Week', views: 189, enquiries: 6, calls: 4 },
];

export default function AnalyticsPage() {
  const thisWeek = ANALYTICS_DATA[0];
  const lastWeek = ANALYTICS_DATA[1];
  const viewsDiff = ((thisWeek.views - lastWeek.views) / lastWeek.views * 100).toFixed(0);
  const enquiriesDiff = ((thisWeek.enquiries - lastWeek.enquiries) / lastWeek.enquiries * 100).toFixed(0);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-10">
        <div className="container-qkit">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="font-heading font-bold text-2xl text-slate-900">Listing Analytics</h1>
              <p className="text-slate-500 text-sm mt-1">Track views, enquiries and leads for your listings</p>
            </div>
            <Link href="/post-property" className="btn-primary btn-md">
              <Plus className="w-4 h-4" />Add Listing
            </Link>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Eye,           label: 'Views This Week',    value: thisWeek.views,     diff: viewsDiff,      up: true },
              { icon: MessageCircle, label: 'Enquiries',          value: thisWeek.enquiries, diff: enquiriesDiff,  up: true },
              { icon: Home,          label: 'Active Listings',    value: MY_LISTINGS.length, diff: null, up: null },
              { icon: TrendingUp,    label: 'Avg. Daily Views',   value: Math.round(thisWeek.views / 7), diff: null, up: null },
            ].map(({ icon: Icon, label, value, diff, up }) => (
              <div key={label} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  {diff !== null && (
                    <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-green-600' : 'text-red-500'}`}>
                      {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {diff}%
                    </span>
                  )}
                </div>
                <div className="font-heading font-bold text-2xl text-slate-900">{value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Per-listing breakdown */}
          <div className="card p-6 mb-8">
            <h2 className="font-heading font-semibold text-slate-900 mb-5">Performance by Listing</h2>
            <div className="space-y-4">
              {MY_LISTINGS.map(l => (
                <div key={l.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                    {l.media?.[0] && <img src={l.media[0].url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{l.title}</p>
                    <p className="text-xs text-slate-500">{l.listing_id}</p>
                  </div>
                  <div className="hidden sm:grid grid-cols-3 gap-6 text-center flex-shrink-0">
                    <div>
                      <div className="font-bold text-slate-900">{l.views_count}</div>
                      <div className="text-xs text-slate-400">Views</div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{l.enquiries_count}</div>
                      <div className="text-xs text-slate-400">Enquiries</div>
                    </div>
                    <div>
                      <div className={`font-bold ${l.status === 'published' ? 'text-brand-600' : 'text-amber-600'}`}>{l.status}</div>
                      <div className="text-xs text-slate-400">Status</div>
                    </div>
                  </div>
                  <Link href={`/property/${l.slug}`} target="_blank" className="text-xs text-brand-600 hover:underline flex-shrink-0">
                    View →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="card p-6 bg-brand-50 border-brand-100">
            <h3 className="font-heading font-semibold text-brand-900 mb-3">💡 Tips to Get More Enquiries</h3>
            <ul className="space-y-2 text-sm text-brand-800">
              <li>📸 Add at least 5 high-quality photos — listings with photos get 5× more views.</li>
              <li>✅ Get your listing verified to build buyer trust and appear in "Verified" filter.</li>
              <li>⭐ Upgrade to a Featured listing to appear at the top of search results.</li>
              <li>📍 Add an accurate locality for better search visibility.</li>
              <li>💬 Respond to enquiries within 2 hours for the best conversion rate.</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
