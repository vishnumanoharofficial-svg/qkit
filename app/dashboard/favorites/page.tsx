import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { MOCK_LISTINGS } from '@/lib/mock-data';
import PropertyCard from '@/components/property/PropertyCard';

export const metadata: Metadata = { title: 'Saved Properties | qkit' };

export default function FavoritesPage() {
  // In production this would be fetched from DB using auth session
  const favorites = MOCK_LISTINGS.slice(0, 3);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-10">
        <div className="container-qkit">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-2xl text-slate-900">Saved Properties</h1>
            <p className="text-slate-500 text-sm mt-1">{favorites.length} properties saved</p>
          </div>

          {favorites.length === 0 ? (
            <div className="card p-16 text-center">
              <Heart className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-slate-700 mb-2">No saved properties yet</h3>
              <p className="text-slate-500 text-sm mb-6">Tap the heart icon on any property to save it here.</p>
              <Link href="/properties" className="btn-primary btn-md inline-flex">Browse Properties</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {favorites.map(l => (
                <PropertyCard key={l.id} listing={l} isFavorited />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
