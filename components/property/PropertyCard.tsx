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
  view?: 'grid' | 'list';
  isFavorited?: boolean;
}

const TX_BADGE: Record<string, { label: string; cls: string }> = {
  sale:  { label: 'For Sale',  cls: 'bg-green-500 text-white' },
  rent:  { label: 'For Rent',  cls: 'bg-purple-600 text-white' },
  lease: { label: 'For Lease', cls: 'bg-amber-500 text-white' },
};

/** Extract BHK count from title string e.g. "3 BHK House..." → "3" */
function extractBHK(title: string, attrs?: Record<string, string | number | boolean>): string {
  if (attrs?.bedrooms) return String(attrs.bedrooms);
  const m = title.match(/(\d+)\s*BHK/i);
  return m ? m[1] : '';
}

/** Extract bathroom count from title e.g. "2 BHK - 1 Bathroom" → "1" */
function extractBath(title: string, attrs?: Record<string, string | number | boolean>): string {
  if (attrs?.bathrooms) return String(attrs.bathrooms);
  const m = title.match(/(\d+)\s*Bath(?:room)?/i);
  return m ? m[1] : '';
}

/** Pick the most specific local area to display (NOT city — that's too generic) */
function getLocation(listing: PropertyListing & { city?: string; town_panchayat?: string; taluk?: string; address_line?: string }): string {
  // 1. town_panchayat is the exact local area (e.g. "Ettumanoor", "Nagampadom")
  if (listing.town_panchayat) return listing.town_panchayat;

  // 2. address_line first segment often contains the locality
  //    e.g. "Nagampadom, Kottayam, Kerala" → "Nagampadom"
  if (listing.address_line) {
    const first = listing.address_line.split(/[,\n]/)[0].trim();
    if (first && first.toLowerCase() !== 'kottayam') return first;
  }

  // 3. taluk as last resort (skip city — it's usually just "Kottayam")
  return listing.taluk || 'Kottayam';
}

export default function PropertyCard({
  listing, className, showActions = true, view = 'grid', isFavorited = false,
}: PropertyCardProps) {
  const [saved, setSaved]       = useState(isFavorited);
  const [imgError, setImgError] = useState(false);

  const badge    = TX_BADGE[listing.transaction_type] ?? TX_BADGE.sale;
  const images   = listing.media?.filter(m => m.url) ?? [];
  const imgUrl   = images[0]?.url ?? null;
  const imgCount = images.length;

  const attrs     = listing.attributes as Record<string, string | number | boolean> | undefined;
  const bedrooms  = extractBHK(listing.title, attrs);
  const bathrooms = extractBath(listing.title, attrs);
  const location  = getLocation(listing as PropertyListing & { city?: string; town_panchayat?: string; taluk?: string; address_line?: string });

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
      {/* ── Image ── */}
      <div className="relative h-48 bg-slate-100 overflow-hidden flex-shrink-0">
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

      {/* ── Body ── */}
      <div className="p-4 flex flex-col flex-1">

        {/* Title */}
        <h3 className="font-heading font-semibold text-slate-900 text-sm leading-snug line-clamp-2 mb-2">
          {listing.title}
        </h3>

        {/* ── Location ── always visible */}
        <div className="flex items-center gap-1 text-slate-500 text-xs mb-2.5">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-brand-500" />
          <span className="line-clamp-1 font-medium">{location}</span>
        </div>

        {/* ── Price ── */}
        <p className="font-heading font-bold text-brand-600 text-lg mb-3">
          {formatIndianPrice(listing.price, listing.price_unit as 'total' | 'per_month' | 'per_sqft' | 'per_year')}
        </p>

        {/* ── Specs row: BHK · Baths · Sqft — always shown, dash if missing ── */}
        <div className="flex items-center gap-0 mb-4 bg-slate-50 rounded-xl px-3 py-2">
          {/* BHK */}
          <div className="flex-1 flex flex-col items-center gap-0.5 border-r border-slate-200">
            <BedDouble className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-xs font-semibold text-slate-800">
              {bedrooms ? `${bedrooms} BHK` : '—'}
            </span>
          </div>
          {/* Baths */}
          <div className="flex-1 flex flex-col items-center gap-0.5 border-r border-slate-200">
            <Bath className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-xs font-semibold text-slate-800">
              {bathrooms ? `${bathrooms} Bath` : '—'}
            </span>
          </div>
          {/* Area */}
          <div className="flex-1 flex flex-col items-center gap-0.5">
            <Move className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-xs font-semibold text-slate-800">
              {listing.area > 0 ? formatArea(listing.area, listing.area_unit) : '—'}
            </span>
          </div>
        </div>

        <div className="flex-1" />

        {/* ── Call / WhatsApp buttons ── */}
        {showActions && (
          <div className="flex gap-2 mb-2">
            <a
              href={`tel:${listing.seller_phone}`}
              onClick={e => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
            >
              <Phone className="w-3.5 h-3.5" /> Call
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
          </div>
        )}

        {/* ── View Details ── */}
        <Link
          href={`/property/${listing.slug}`}
          className="text-center text-xs text-brand-600 hover:text-brand-700 font-semibold hover:underline transition-colors py-1"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}
