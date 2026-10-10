import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MOCK_LISTINGS } from '@/lib/mock-data';
import PropertyCard from '@/components/property/PropertyCard';

export const metadata: Metadata = {
  title: 'Properties for Sale in India | qkit',
  description: 'Browse properties for sale across India — apartments, houses, villas, plots and commercial spaces on qkit.',
};

export default function BuyPage() {
  const listings = MOCK_LISTINGS.filter(l => l.transaction_type === 'sale' && l.status === 'published');
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="bg-gradient-to-br from-brand-50 to-white border-b border-slate-100 py-10">
          <div className="container-qkit">
            <h1 className="font-heading text-3xl font-bold text-slate-900 mb-2">Properties for Sale</h1>
            <p className="text-slate-500">{listings.length} properties available across India</p>
          </div>
        </div>
        <div className="container-qkit py-10">
          {listings.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <div className="text-5xl mb-4">🏠</div><p>No sale listings available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {listings.map(l => <PropertyCard key={l.id} listing={l} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
