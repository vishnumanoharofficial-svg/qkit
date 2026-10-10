'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart, Share2, Phone, MessageCircle, CheckCircle,
  Eye, MapPin, Home, Ruler, Camera, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { cn, formatIndianPrice, formatArea, timeAgo } from '@/lib/utils';
import type { PropertyListing } from '@/lib/types';

interface PropertyCardProps {
  listing: PropertyListing;
  view?: 'grid' | 'list';
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

const TRANSACTION_COLORS: Record<string, string> = {
  sale:    'badge-brand',
  rent:    'badge-blue',
  lease:   'badge bg-purple-100 text-purple-700',
  auction: 'badge-amber',
};
const TRANSACTION_LABELS: Record<string, string> = {
  sale: 'For Sale', rent: 'For Rent', lease: 'For Lease', auction: 'Auction',
};
const SELLER_LABELS: Record<string, string> = {
  owner: 'Owner', agent: 'Agent', builder: 'Builder',
};

export default function PropertyCard({ listing, view = 'grid', onFavorite, isFavorited = false }: PropertyCardProps) {
  const [currentImg, setCurrentImg] = useState(0);
  const [favored, setFavored]       = useState(isFavorited);
  const [imgError, setImgError]     = useState(false);

  const images     = listing.media?.filter(m => m.type === 'image') ?? [];
  const primaryImg = images[currentImg]?.url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600';
  const priceDisplay = formatIndianPrice(listing.price, listing.price_unit);
  const areaDisplay  = formatArea(listing.area, listing.area_unit);
  const cityName     = listing.locality?.city?.name ?? '';
  const localityName = listing.locality?.name ?? '';
  const waMsg        = encodeURIComponent(`Hi, I saw your property on qkit: ${listing.title}. Please share more details.`);

  function handleFav(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    setFavored(v => !v); onFavorite?.(listing.id);
  }
  function prev(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    setCurrentImg(v => (v === 0 ? images.length - 1 : v - 1));
  }
  function next(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    setCurrentImg(v => (v === images.length - 1 ? 0 : v + 1));
  }
  function handleShare(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (navigator.share) navigator.share({ title: listing.title, url: `/property/${listing.slug}` });
    else navigator.clipboard?.writeText(`${window.location.origin}/property/${listing.slug}`);
  }

  const imgSrc = imgError ? 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600' : primaryImg;

  if (view === 'list') {
    return (
      <Link href={`/property/${listing.slug}`} className="block">
        <article className="card-hover flex flex-col sm:flex-row overflow-hidden group">
          <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
            <Image src={imgSrc} alt={listing.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" onError={() => setImgError(true)} sizes="(max-width:640px) 100vw,256px" />
            <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
              <span className={TRANSACTION_COLORS[listing.transaction_type]}>{TRANSACTION_LABELS[listing.transaction_type]}</span>
              {listing.is_featured && <span className="badge-featured">⭐ Featured</span>}
            </div>
            {images.length > 1 && <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 text-white rounded-full px-2 py-0.5 text-xs"><Camera className="w-3 h-3" />{images.length}</div>}
          </div>
          <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-heading font-semibold text-slate-900 text-base leading-tight line-clamp-2">{listing.title}</h3>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={handleFav} className="p-1.5 rounded-lg hover:bg-slate-100" aria-label="Save"><Heart className={cn('w-4 h-4', favored ? 'fill-red-500 text-red-500' : 'text-slate-400')} /></button>
                  <button onClick={handleShare} className="p-1.5 rounded-lg hover:bg-slate-100" aria-label="Share"><Share2 className="w-4 h-4 text-slate-400" /></button>
                </div>
              </div>
              <div className="flex items-center gap-1 text-slate-500 text-sm mt-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                <span className="truncate">{[localityName, cityName].filter(Boolean).join(', ')}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" />{areaDisplay}</span>
                {listing.attributes?.bedrooms && <span className="flex items-center gap-1"><Home className="w-3.5 h-3.5" />{listing.attributes.bedrooms} BHK</span>}
                {listing.attributes?.floor && <span>Floor {listing.attributes.floor}</span>}
                {listing.attributes?.furnishing && <span className="capitalize">{String(listing.attributes.furnishing).replace('-', ' ')}</span>}
              </div>
            </div>
            <div className="flex items-end justify-between mt-4">
              <div>
                <div className="font-heading font-bold text-xl text-brand-600">{priceDisplay}{listing.negotiable && <span className="text-xs text-slate-400 font-normal ml-1">Negotiable</span>}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">{SELLER_LABELS[listing.seller_type]} · {timeAgo(listing.created_at)}</span>
                  {listing.is_verified && <span className="badge-verified"><CheckCircle className="w-3 h-3" />Verified</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`https://wa.me/91${listing.seller_phone}?text=${waMsg}`} onClick={e => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm text-green-700 hover:bg-green-50"><MessageCircle className="w-3.5 h-3.5" />WhatsApp</a>
                <a href={`tel:${listing.seller_phone}`} onClick={e => e.stopPropagation()} className="btn-primary btn-sm"><Phone className="w-3.5 h-3.5" />Call</a>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/property/${listing.slug}`} className="block h-full">
      <article className="card-hover overflow-hidden group flex flex-col h-full">
        <div className="relative h-52 flex-shrink-0 overflow-hidden bg-slate-100">
          <Image src={imgSrc} alt={listing.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" onError={() => setImgError(true)} sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw" />
          {images.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Prev"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Next"><ChevronRight className="w-4 h-4" /></button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.slice(0,5).map((_,i) => <div key={i} className={cn('w-1.5 h-1.5 rounded-full transition-all', i===currentImg ? 'bg-white w-3' : 'bg-white/60')} />)}
              </div>
            </>
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <span className={TRANSACTION_COLORS[listing.transaction_type]}>{TRANSACTION_LABELS[listing.transaction_type]}</span>
            {listing.is_featured && <span className="badge-featured">⭐ Featured</span>}
            {listing.is_promoted && !listing.is_featured && <span className="badge bg-orange-100 text-orange-700"><Zap className="w-3 h-3" />Promoted</span>}
          </div>
          <div className="absolute top-3 right-3 flex gap-1.5">
            <button onClick={handleFav} className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white" aria-label="Save"><Heart className={cn('w-4 h-4', favored ? 'fill-red-500 text-red-500' : 'text-slate-500')} /></button>
            <button onClick={handleShare} className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white" aria-label="Share"><Share2 className="w-4 h-4 text-slate-500" /></button>
          </div>
          {images.length > 1 && <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 text-white rounded-full px-2 py-0.5 text-xs"><Camera className="w-3 h-3" />{images.length}</div>}
        </div>

        <div className="flex flex-col flex-1 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-heading font-bold text-xl text-brand-600">{priceDisplay}{listing.negotiable && <span className="ml-1 text-xs text-slate-400 font-normal">Negotiable</span>}</span>
            {listing.is_verified && <span className="badge-verified"><CheckCircle className="w-3 h-3" />Verified</span>}
          </div>
          <h3 className="font-heading font-semibold text-slate-800 text-sm leading-snug line-clamp-2 mb-2">{listing.title}</h3>
          <div className="flex items-center gap-1 text-slate-500 text-xs mb-3">
            <MapPin className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
            <span className="truncate">{[localityName, cityName].filter(Boolean).join(', ')}</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mb-3">
            <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{areaDisplay}</span>
            {listing.attributes?.bedrooms && <span className="flex items-center gap-1"><Home className="w-3 h-3" />{listing.attributes.bedrooms} BHK</span>}
            {listing.attributes?.floor && <span>Floor {listing.attributes.floor}</span>}
            {listing.attributes?.facing && <span>{String(listing.attributes.facing)}-facing</span>}
          </div>
          <div className="border-t border-slate-100 mt-auto pt-3 flex items-center justify-between text-xs text-slate-400">
            <span className={cn('px-2 py-0.5 rounded-full font-medium', listing.seller_type==='owner' ? 'bg-brand-50 text-brand-600' : listing.seller_type==='agent' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600')}>{SELLER_LABELS[listing.seller_type]}</span>
            <div className="flex items-center gap-3">
              <span>{timeAgo(listing.created_at)}</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{listing.views_count.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); window.open(`https://wa.me/91${listing.seller_phone}?text=${waMsg}`, '_blank', 'noopener,noreferrer'); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 border border-green-100"
              aria-label="WhatsApp"
            ><MessageCircle className="w-3.5 h-3.5" />WhatsApp</button>
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); window.location.href = `tel:${listing.seller_phone}`; }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-brand-600 text-white text-xs font-medium hover:bg-brand-700"
              aria-label="Call"
            ><Phone className="w-3.5 h-3.5" />Contact</button>
          </div>
        </div>
      </article>
    </Link>
  );
}
