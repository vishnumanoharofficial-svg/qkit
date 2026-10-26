import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import Link from 'next/link';
import type { PropertyListing } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Properties for Lease in Kottayam | qkit',
  description: 'Find long-term lease properties — offices, shops, warehouses and commercial spaces in Kottayam district on qkit.',
};

async function fetchLeaseListings(): Promise<PropertyListing[]> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || 'https://qkit-five.vercel.app';
    const res = await fetch(`${base}/api/properties?status=published&type=lease&limit=50`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json() as { data?: PropertyListing[] };
    return data.data ?? [];
  } catch {
    return [];
  }
}

export default async function LeasePage() {
  const listings = await fetchLeaseListings();

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16">
        {/* Hero banner */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-700 text-white py-12">
          <div className="container-qkit">
            <div className="flex items-center gap-2 text-amber-100 text-sm mb-3">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span>Lease</span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Properties for Lease</h1>
            <p className="text-amber-100">
              {listings.length > 0
                ? `${listings.length} lease properties in Kottayam District`
                : 'Find long-term lease properties in Kottayam District'}
            </p>
          </div>
        </div>

        {/* Listing grid */}
        <div className="container-qkit py-10">
          {listings.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-xl font-semibold text-slate-700 mb-2">No lease listings yet</h2>
              <p className="text-slate-500 mb-6">Be the first to list your property for lease in Kottayam.</p>
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
