import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PropertyCard from '@/components/property/PropertyCard';
import PropertyCardSkeleton from '@/components/property/PropertyCardSkeleton';
import type { PropertyListing } from '@/lib/types';

interface PropertySectionProps {
  title: string;
  subtitle?: string;
  listings: PropertyListing[];
  viewAllHref?: string;
  loading?: boolean;
  emptyMessage?: string;
}

export default function PropertySection({
  title, subtitle, listings, viewAllHref, loading = false, emptyMessage = 'No properties found.',
}: PropertySectionProps) {
  return (
    <section className="py-12" aria-labelledby={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="container-qkit">
        <div className="flex items-end justify-between mb-7">
          <div>
            <h2 id={`section-${title.toLowerCase().replace(/\s+/g, '-')}`} className="section-heading">{title}</h2>
            {subtitle && <p className="section-sub">{subtitle}</p>}
          </div>
          {viewAllHref && (
            <Link href={viewAllHref} className="flex items-center gap-1 text-brand-600 text-sm font-medium hover:text-brand-700 transition-colors group">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <div className="text-4xl mb-3">🏠</div>
            <p className="font-medium text-slate-500">{emptyMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings.map(listing => (
              <PropertyCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
