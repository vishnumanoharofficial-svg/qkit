'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MapPin, Phone, MessageCircle, Camera, BedDouble, Bath, Move } from 'lucide-react';
import { cn, formatIndianPrice, formatArea, buildWhatsAppUrl } from '@/lib/utils';
import type { PropertyListing } from '@/lib/types';

interface PropertyCardProps {
  listing: PropertyListing & {
    media?: { url: string; is_primary?: boolean }[];
    attributes?: Record<string, string | number | boolean>;
  };
  className?: string;
  showActions?: boolean;
  /** Optional: grid vs list view mode (used by listing/search pages) */
  view?: 'grid' | 'list';
  /** Optional: pre-set saved/favorited state */
  isFavorited?: boolean;
}

const TX_BADGE: Record<string, { label: string; cls: string }> = {
  sale:  { label: 'For Sale',  cls: 'bg-green-500 text-white' },
  rent:  { label: 'For Rent',  cls: 'bg-purple-600 text-white' },
  lease: { label: 'For Lease', cls: 'bg-amber-500 text-white' },
};

export default function PropertyCard({ listing, className, showActions = true, view = 'grid', isFavorited = false }: PropertyCardProps) {
  const [saved, setSaved]       = useState(isFavorited);
  const [imgError, setImgError] = useState(false);

  const badge    = TX_BADGE[listing.transaction_type] ?? TX_BADGE.sale;
  const images   = listing.media?.filter(m => m.url) ?? [];
  const imgUrl   = images[0]?.url ?? null;
  const imgCount = images.length;

  const attrs      = (listing.attributes ?? {}) as Record<string, string | number | boolean>;
  const bedrooms   = attrs.bedrooms  as string | undefined;
  const bathrooms  = attrs.bathrooms as string | undefined;

  const locationText = [
    listing.town_panchayat,
    listing.taluk,
    listing.address_line,
  ].filter(Boolean).join(', ') || 'Kottayam District, Kerala';

  const whatsappMsg = `Hi, I'm interested in your property: ${listing.title} (${listing.listing_id}). Please share more details.`;
  const whatsappUrl = buildWhatsAppUrl(listing.seller_phone, whatsappMsg);

  async function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSaved(v => !v);
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listing.id }),
      });
    } catch { /* ignore */ }
  }

  return (
    <div className={cn(
      'bg-white rounded-2xl overflow-hidden shadow-card border border-slate-100',
      'hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 flex flex-col',
      className
    )}>
      {/* Image */}
      <div className="relative h-52 bg-slate-100 overflow-hidden flex-shrink-0">
        {imgUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
            <div className="text-5xl">🏠</div>
            <p className="text-xs text-slate-400">No photo</p>
          </div>
        )}

        {/* For Sale / Rent / Lease badge */}
        <div className="absolute top-3 left-3">
          <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full shadow-sm', badge.cls)}>
            {badge.label}
          </span>
        </div>

        {/* Save / Heart */}
        <button
          onClick={handleSave}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          aria-label={saved ? 'Unsave' : 'Save property'}
        >
          <Heart className={cn('w-4 h-4 transition-colors', saved ? 'fill-red-500 text-red-500' : 'text-slate-400')} />
        </button>

        {/* Photo count */}
        {imgCount > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
            <Camera className="w-3 h-3" /> {imgCount}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-heading font-semibold text-slate-900 text-sm leading-snug line-clamp-2 mb-1.5">
          {listing.title}
        </h3>

        {/* Location */}
        <div className="flex items-start gap-1 text-slate-500 text-xs mb-2">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-px text-brand-400" />
          <span className="line-clamp-1">{locationText}</span>
        </div>

        {/* Price */}
        <p className="font-heading font-bold text-brand-600 text-xl mb-3">
          {formatIndianPrice(listing.price, listing.price_unit as 'total' | 'per_month' | 'per_sqft' | 'per_year')}
        </p>

        {/* Specs */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 flex-wrap">
          {bedrooms && (
            <span className="flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5 text-slate-400" /> {bedrooms} BHK
            </span>
          )}
          {listing.area > 0 && (
            <span className="flex items-center gap-1">
              <Move className="w-3.5 h-3.5 text-slate-400" /> {formatArea(listing.area, listing.area_unit)}
            </span>
          )}
          {bathrooms && (
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-slate-400" /> {bathrooms} Bath
            </span>
          )}
        </div>

        <div className="flex-1" />

        {/* Call / WhatsApp buttons */}
        {showActions && (
          <div className="flex gap-2">
            <a
              href={`tel:${listing.seller_phone}`}
              onClick={e => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
            >
              <Phone className="w-4 h-4" /> Call
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </div>
        )}

        {/* View Details */}
        <Link
          href={`/property/${listing.slug}`}
          className="mt-2 text-center text-xs text-brand-600 hover:text-brand-700 font-medium hover:underline transition-colors"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}
