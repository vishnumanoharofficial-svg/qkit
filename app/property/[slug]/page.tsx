'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  MapPin, CheckCircle, Phone, MessageCircle, Share2,
  Flag, Calendar, Eye, Loader2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { formatIndianPrice, formatArea, timeAgo, buildWhatsAppUrl, formatPhoneDisplay, maskPhone } from '@/lib/utils';
import type { PropertyListing } from '@/lib/types';

type MediaItem = { url: string; is_primary?: boolean; type?: string; sort_order?: number };

type PageData = {
  listing: PropertyListing & {
    media?: MediaItem[];
    attributes?: Record<string, string | number | boolean>;
    taluk?: string;
    town_panchayat?: string;
    city?: string;
    category_slug?: string;
  };
  similar: PropertyListing[];
};

const TX_LABELS: Record<string, string> = {
  sale: 'For Sale', rent: 'For Rent', lease: 'For Lease', auction: 'Auction',
};

function Detail({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-800 capitalize">{value}</p>
    </div>
  );
}

export default function PropertyDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [data, setData]         = useState<PageData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setActiveIdx(0);
    fetch(`/api/property/${encodeURIComponent(slug)}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(json => {
        if (json?.listing) setData(json as PageData);
        else if (json) setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const prevImage = useCallback(() =>
    setActiveIdx(i => (i === 0 ? (data?.listing.media?.length ?? 1) - 1 : i - 1)),
    [data]);
  const nextImage = useCallback(() =>
    setActiveIdx(i => (i === (data?.listing.media?.length ?? 1) - 1 ? 0 : i + 1)),
    [data]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-16 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-brand-600 mx-auto mb-3" />
            <p className="text-slate-500">Loading property details…</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (notFound || !data) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-16 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h1 className="font-heading text-2xl font-bold text-slate-900 mb-2">Property Not Found</h1>
            <p className="text-slate-500 mb-6">This listing may have been removed or the link is incorrect.</p>
            <Link href="/properties" className="btn-primary btn-lg inline-flex">Browse All Properties</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const { listing, similar } = data;
  const images        = listing.media?.filter(m => m.url) ?? [];
  const totalImages   = images.length;
  const activeImage   = images[activeIdx] ?? images[0];
  const priceDisplay  = formatIndianPrice(listing.price, listing.price_unit);
  const areaDisplay   = formatArea(listing.area, listing.area_unit);
  const locationParts = [
    listing.town_panchayat,
    listing.taluk,
    listing.city,
    'Kottayam District',
    'Kerala',
  ].filter(Boolean) as string[];
  const locationDisplay = locationParts.join(', ');

  const waMsg = `Hi, I found your property on qkit (ID: ${listing.listing_id}) - ${listing.title}. I am interested, please share more details.`;
  const waUrl = buildWhatsAppUrl(listing.seller_phone, waMsg);
  const attrs = listing.attributes ?? {};

  const txColor = listing.transaction_type === 'sale'
    ? 'bg-green-500'
    : listing.transaction_type === 'rent'
      ? 'bg-purple-600'
      : 'bg-amber-500';

  return (
    <>
      <Header />
      <main className="min-h-screen pb-28 lg:pb-12 pt-16">

        {/* Breadcrumb */}
        <div className="bg-white border-b border-slate-100 py-3">
          <div className="container-qkit text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-brand-600">Home</Link>
            <span>/</span>
            <Link href="/properties" className="hover:text-brand-600">Properties</Link>
            <span>/</span>
            <span className="text-slate-700 truncate max-w-[200px] sm:max-w-xs">{listing.title}</span>
          </div>
        </div>

        <div className="container-qkit py-5 lg:py-8">
          <div className="grid lg:grid-cols-3 gap-5 lg:gap-8">

            {/* ── LEFT COLUMN: Images + Details ── */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">

              {/* ── Image Gallery ── */}
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                {/* Main image */}
                <div className="relative bg-slate-100" style={{ aspectRatio: '16/9' }}>
                  {activeImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={activeImage.url}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-300 text-6xl">🏠</div>
                  )}

                  {/* Transaction badge */}
                  <span className={`absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full ${txColor}`}>
                    {TX_LABELS[listing.transaction_type] ?? listing.transaction_type}
                  </span>

                  {/* Verified / Featured badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                    {listing.is_featured && <span className="badge-featured text-xs">⭐ Featured</span>}
                    {listing.is_verified && (
                      <span className="badge-verified text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />Verified
                      </span>
                    )}
                  </div>

                  {/* Prev / Next arrows — shown only when multiple images */}
                  {totalImages > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors active:scale-95"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors active:scale-95"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Photo counter */}
                  {totalImages > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs rounded-full px-2.5 py-1">
                      {activeIdx + 1} / {totalImages}
                    </div>
                  )}
                </div>

                {/* Thumbnails strip — clicking selects that image */}
                {totalImages > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                    {images.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveIdx(i)}
                        className={`relative flex-shrink-0 rounded-xl overflow-hidden transition-all focus:outline-none ${
                          i === activeIdx
                            ? 'ring-2 ring-brand-500 ring-offset-1 opacity-100'
                            : 'opacity-60 hover:opacity-90 hover:ring-2 hover:ring-brand-300'
                        }`}
                        style={{ width: 72, height: 52 }}
                        aria-label={`View photo ${i + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Title + Price (mobile only — shown above details) ── */}
              <div className="lg:hidden bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h1 className="font-heading font-bold text-lg text-slate-900 leading-tight">{listing.title}</h1>
                  <button
                    className="p-2 rounded-xl hover:bg-slate-100 flex-shrink-0"
                    aria-label="Share"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: listing.title, url: window.location.href });
                      } else {
                        navigator.clipboard?.writeText(window.location.href);
                      }
                    }}
                  >
                    <Share2 className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                <div className="font-heading font-bold text-2xl text-brand-600 mb-1">{priceDisplay}</div>
                {listing.negotiable && <span className="badge-slate text-xs">Negotiable</span>}
                {locationDisplay && (
                  <div className="flex items-start gap-1.5 text-slate-500 text-sm mt-2">
                    <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{locationDisplay}</span>
                  </div>
                )}
              </div>

              {/* ── Property Details ── */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 lg:p-6">
                <h2 className="font-heading font-semibold text-slate-900 mb-4">Property Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Detail label="Property Type" value={listing.category_slug ?? listing.category?.name} />
                  <Detail label="Transaction" value={TX_LABELS[listing.transaction_type]} />
                  <Detail label="Total Area" value={areaDisplay} />
                  {attrs.bedrooms  && <Detail label="Bedrooms"     value={`${attrs.bedrooms} BHK`} />}
                  {attrs.bathrooms && <Detail label="Bathrooms"    value={String(attrs.bathrooms)} />}
                  {attrs.floor     && <Detail label="Floor"        value={`${attrs.floor} of ${attrs.total_floors ?? '?'}`} />}
                  {attrs.furnishing && <Detail label="Furnishing"  value={String(attrs.furnishing).replace('-', ' ')} />}
                  {attrs.parking   && <Detail label="Parking"      value={String(attrs.parking)} />}
                  {attrs.facing    && <Detail label="Facing"       value={String(attrs.facing)} />}
                  {attrs.age       && <Detail label="Property Age" value={String(attrs.age)} />}
                  {attrs.frontage  && <Detail label="Frontage"     value={String(attrs.frontage)} />}
                  {attrs.road_width && <Detail label="Road Width"  value={String(attrs.road_width)} />}
                  {attrs.zoning    && <Detail label="Zoning"       value={String(attrs.zoning)} />}
                </div>
              </div>

              {/* ── Description ── */}
              {listing.description && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 lg:p-6">
                  <h2 className="font-heading font-semibold text-slate-900 mb-3">About this Property</h2>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
                </div>
              )}

              {/* ── Location ── */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 lg:p-6">
                <h2 className="font-heading font-semibold text-slate-900 mb-3">Location</h2>
                {locationDisplay && (
                  <div className="flex items-start gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-600 text-sm">{locationDisplay}</p>
                  </div>
                )}
                <div className="h-40 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200">
                  <div className="text-center">
                    <MapPin className="w-7 h-7 mx-auto mb-1.5 text-brand-400" />
                    <p className="text-sm font-medium">Kottayam District, Kerala</p>
                    <p className="text-xs text-slate-400">Map view coming soon</p>
                  </div>
                </div>
              </div>

              {/* ── Meta ── */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 px-1 pb-2">
                <span>Listing ID: <strong className="text-slate-600">{listing.listing_id}</strong></span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Posted {timeAgo(listing.created_at)}</span>
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{(listing.views_count ?? 0).toLocaleString('en-IN')} views</span>
                <Link href="#" className="flex items-center gap-1 text-red-400 hover:text-red-600 ml-auto">
                  <Flag className="w-3.5 h-3.5" />Report
                </Link>
              </div>
            </div>

            {/* ── RIGHT COLUMN: Sidebar (desktop) / Below content (mobile) ── */}
            <div className="space-y-4 lg:space-y-5">

              {/* Price card — desktop only */}
              <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h1 className="font-heading font-bold text-lg text-slate-900 leading-tight line-clamp-3">{listing.title}</h1>
                  <button
                    className="p-2 rounded-xl hover:bg-slate-100 flex-shrink-0"
                    aria-label="Share"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: listing.title, url: window.location.href });
                      } else {
                        navigator.clipboard?.writeText(window.location.href);
                      }
                    }}
                  >
                    <Share2 className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
                <div className="font-heading font-bold text-3xl text-brand-600 mb-1">{priceDisplay}</div>
                {listing.negotiable && <span className="badge-slate text-xs">Negotiable</span>}
                {locationDisplay && (
                  <div className="flex items-center gap-2 text-slate-500 text-sm mt-3">
                    <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    <span className="line-clamp-2">{locationDisplay}</span>
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
                  <span>{listing.listing_id}</span>
                  <span>{timeAgo(listing.created_at)}</span>
                </div>
              </div>

              {/* Seller / Contact card */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 lg:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center font-heading font-bold text-brand-600 text-lg flex-shrink-0">
                    {listing.seller_name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{listing.seller_name}</p>
                    <p className="text-xs text-slate-500 capitalize">{listing.seller_type}</p>
                  </div>
                  {listing.is_verified && (
                    <span className="badge-verified ml-auto flex items-center gap-1 text-xs flex-shrink-0">
                      <CheckCircle className="w-3 h-3" />Verified
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-500 mb-4">
                  📞 {maskPhone(listing.seller_phone)}&nbsp;·&nbsp;{listing.enquiries_count ?? 0} enquiries
                </p>

                <div className="space-y-2.5">
                  <a href={`tel:${listing.seller_phone}`} className="btn-primary btn-lg w-full">
                    <Phone className="w-4 h-4" />
                    Call {formatPhoneDisplay(listing.seller_phone)}
                  </a>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-green-500 text-green-700 font-semibold text-sm hover:bg-green-50 transition-colors active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp Enquiry
                  </a>
                </div>
              </div>

              {/* Safety tip */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                <p className="font-semibold mb-1">⚠️ Safety Tip</p>
                <p>Never pay any advance money without visiting the property in person and verifying ownership documents.</p>
              </div>
            </div>
          </div>

          {/* ── Similar Properties ── */}
          {similar.length > 0 && (
            <div className="mt-10 lg:mt-12">
              <h2 className="font-heading font-bold text-xl lg:text-2xl text-slate-900 mb-5">Similar Properties</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {similar.map(l => {
                  const sim = l as typeof l & { taluk?: string; town_panchayat?: string; media?: { url: string }[] };
                  return (
                    <Link key={l.id} href={`/property/${l.slug}`} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group block hover:shadow-md transition-shadow">
                      <div className="relative bg-slate-100" style={{ aspectRatio: '4/3' }}>
                        {sim.media?.[0]?.url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={sim.media[0].url}
                            alt={l.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-300 text-4xl">🏠</div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-slate-900 text-sm line-clamp-1 mb-1">{l.title}</p>
                        <p className="text-brand-600 font-bold text-sm">{formatIndianPrice(l.price, l.price_unit)}</p>
                        <p className="text-xs text-slate-400 mt-1">{sim.town_panchayat ?? sim.taluk ?? 'Kottayam'}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Mobile sticky bottom CTA ── */}
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-slate-200 px-4 py-3 flex gap-3 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
          <a href={`tel:${listing.seller_phone}`} className="flex-1 btn-primary btn-md text-sm justify-center">
            <Phone className="w-4 h-4" />Call
          </a>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-green-500 text-green-700 font-semibold text-sm hover:bg-green-50 active:scale-[0.98] transition-all"
          >
            <MessageCircle className="w-4 h-4" />WhatsApp
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
