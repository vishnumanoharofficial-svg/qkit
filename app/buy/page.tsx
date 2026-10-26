import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import Link from 'next/link';
import type { PropertyListing } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Properties for Sale in Kottayam | qkit',
  description: 'Browse properties for sale in Kottayam district — houses, apartments, villas, plots and commercial spaces on qkit.',
};

async function fetchSaleListings(): Promise<PropertyListing[]> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || 'https://qkit-five.vercel.app';
    const res = await fetch(`${base}/api/properties?status=published&type=sale&limit=50`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json() as { data?: PropertyListing[] };
    return data.data ?? [];
  } catch {
    return [];
  }
}

export default async function BuyPage() {
  const listings = await fetchSaleListings();

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
        {/* Hero banner */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12">
          <div className="container-qkit">
            <div className="flex items-center gap-2 text-blue-200 text-sm mb-3">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span>Buy</span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Properties for Sale</h1>
            <p className="text-blue-100">
              {listings.length > 0
                ? `${listings.length} properties available in Kottayam District`
                : 'Find your dream property in Kottayam District'}
            </p>
          </div>
        </div>

        {/* Listing grid */}
        <div className="container-qkit py-10">
          {listings.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🏠</div>
              <h2 className="text-xl font-semibold text-slate-700 mb-2">No sale listings yet</h2>
              <p className="text-slate-500 mb-6">Be the first to list your property for sale in Kottayam.</p>
              <Link href="/post-property" className="btn-primary btn-lg inline-flex">
                + Post Property
              </Link>
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
