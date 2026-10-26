import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { createClient } from '@supabase/supabase-js';
import {
  MapPin, CheckCircle, Phone, MessageCircle, Share2,
  Flag, Calendar, Eye,
} from 'lucide-react';
import { formatIndianPrice, formatArea, timeAgo, buildWhatsAppUrl, formatPhoneDisplay, maskPhone } from '@/lib/utils';
import type { PropertyListing } from '@/lib/types';

interface Props {
  params: { slug: string };
}

async function getListing(slug: string): Promise<PropertyListing | null> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data, error } = await supabase
      .from('property_listings')
      .select('*, media:property_media(url,is_primary,type,sort_order)')
      .eq('slug', slug)
      .single();
    if (error || !data) return null;
    return data as PropertyListing;
  } catch {
    return null;
  }
}

async function getSimilar(listing: PropertyListing): Promise<PropertyListing[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data } = await supabase
      .from('property_listings')
      .select('*, media:property_media(url,is_primary)')
      .eq('status', 'published')
      .eq('transaction_type', listing.transaction_type)
      .neq('id', listing.id)
      .limit(4);
    return (data ?? []) as PropertyListing[];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListing(params.slug);
  if (!listing) return { title: 'Property Not Found | qkit Real Estate' };
  const location = [listing.taluk, 'Kottayam'].filter(Boolean).join(', ');
  return {
    title: `${listing.title} | qkit Real Estate`,
    description: listing.description?.slice(0, 160) ?? `${listing.title} — ${location}`,
    openGraph: {
      title: listing.title,
      description: listing.description?.slice(0, 160),
      images: listing.media?.[0]?.url ? [listing.media[0].url] : [],
    },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const listing = await getListing(params.slug);
  if (!listing) notFound();

  const similar       = await getSimilar(listing);
  const images        = listing.media?.filter((m: { url: string; type?: string }) => m.url) ?? [];
  const priceDisplay  = formatIndianPrice(listing.price, listing.price_unit);
  const areaDisplay   = formatArea(listing.area, listing.area_unit);
  // Kottayam fields: taluk, town_panchayat, city stored directly on the listing
  const locationParts = [
    listing.town_panchayat,
    listing.taluk,
    'Kottayam District',
    'Kerala',
  ].filter(Boolean);
  const locationDisplay = locationParts.join(', ');

  const waMsg = `Hi, I found your property on qkit (ID: ${listing.listing_id}) - ${listing.title}. I am interested, please share more details.`;
  const waUrl = buildWhatsAppUrl(listing.seller_phone, waMsg);

  const txLabels: Record<string, string> = { sale: 'For Sale', rent: 'For Rent', lease: 'For Lease', auction: 'Auction' };
  const attrs = listing.attributes as Record<string, string | number | boolean> | undefined;

  return (
    <>
      <Header />
      <main className="min-h-screen pb-24 pt-16">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-slate-100 py-3">
          <div className="container-qkit text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-brand-600">Home</Link>
            <span>/</span>
            <Link href="/properties" className="hover:text-brand-600">Properties</Link>
            <span>/</span>
            <span className="text-slate-700 truncate max-w-xs">{listing.title}</span>
          </div>
        </div>

        <div className="container-qkit py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Images + Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image gallery */}
              <div className="card overflow-hidden">
                <div className="relative h-72 sm:h-96 bg-slate-100">
                  {images[0] ? (
                    <Image
                      src={(images[0] as { url: string }).url}
                      alt={listing.title}
                      fill
                      className="object-cover"
                      sizes="(max-width:1024px) 100vw, 66vw"
                      priority
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-300 text-6xl">🏠</div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {listing.is_featured && <span className="badge-featured text-sm">⭐ Featured</span>}
                    {listing.is_verified && (
                      <span className="badge-verified text-sm flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />Verified
                      </span>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs rounded-full px-3 py-1">
                      1 / {images.length} photos
                    </div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar">
                    {images.slice(1).map((img, i) => (
                      <div key={i} className="relative w-24 h-16 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-brand-400 transition-all">
                        <Image src={(img as { url: string }).url} alt={`Photo ${i+2}`} fill className="object-cover" sizes="96px" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Title + price (mobile) */}
              <div className="lg:hidden card p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h1 className="font-heading font-bold text-xl text-slate-900 leading-tight">{listing.title}</h1>
                  <button className="p-2 rounded-xl hover:bg-slate-100" aria-label="Share"><Share2 className="w-5 h-5 text-slate-500" /></button>
                </div>
                <div className="font-heading font-bold text-3xl text-brand-600 mb-1">{priceDisplay}</div>
                {listing.negotiable && <span className="badge-slate">Negotiable</span>}
                <div className="flex items-center gap-2 text-slate-500 text-sm mt-3">
                  <MapPin className="w-4 h-4 text-brand-500" />
                  <span>{locationDisplay}</span>
                </div>
              </div>

              {/* Key details card */}
              <div className="card p-6">
                <h2 className="font-heading font-semibold text-slate-900 mb-5">Property Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Detail label="Property Type" value={listing.category_slug || listing.category?.name} />
                  <Detail label="Transaction" value={txLabels[listing.transaction_type]} />
                  <Detail label="Total Area" value={areaDisplay} />
                  {attrs?.bedrooms && <Detail label="Bedrooms" value={`${attrs.bedrooms} BHK`} />}
                  {attrs?.bathrooms && <Detail label="Bathrooms" value={String(attrs.bathrooms)} />}
                  {attrs?.floor && <Detail label="Floor" value={`${attrs.floor} of ${attrs.total_floors || '?'}`} />}
                  {attrs?.furnishing && <Detail label="Furnishing" value={String(attrs.furnishing).replace('-',' ')} />}
                  {attrs?.parking && <Detail label="Parking" value={String(attrs.parking)} />}
                  {attrs?.facing && <Detail label="Facing" value={String(attrs.facing)} />}
                  {attrs?.age && <Detail label="Property Age" value={String(attrs.age)} />}
                  {attrs?.frontage && <Detail label="Frontage" value={String(attrs.frontage)} />}
                  {attrs?.road_width && <Detail label="Road Width" value={String(attrs.road_width)} />}
                  {attrs?.zoning && <Detail label="Zoning" value={String(attrs.zoning)} />}
                  {attrs?.crop && <Detail label="Crop Type" value={String(attrs.crop)} />}
                  {attrs?.irrigation && <Detail label="Irrigation" value={String(attrs.irrigation)} />}
                </div>
              </div>

              {/* Description */}
              {listing.description && (
                <div className="card p-6">
                  <h2 className="font-heading font-semibold text-slate-900 mb-4">About this Property</h2>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
                </div>
              )}

              {/* Location */}
              <div className="card p-6">
                <h2 className="font-heading font-semibold text-slate-900 mb-4">Location</h2>
                <div className="flex items-start gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-600 text-sm">{locationDisplay}</p>
                </div>
                <div className="h-48 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-brand-400" />
                    <p className="text-sm font-medium">Kottayam District, Kerala</p>
                    <p className="text-xs text-slate-400">Map view coming soon</p>
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 px-1">
                <span>Listing ID: <strong className="text-slate-600">{listing.listing_id}</strong></span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Posted {timeAgo(listing.created_at)}</span>
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{(listing.views_count ?? 0).toLocaleString('en-IN')} views</span>
                <Link href="#" className="flex items-center gap-1 text-red-400 hover:text-red-600 ml-auto"><Flag className="w-3.5 h-3.5" />Report</Link>
              </div>
            </div>

            {/* Right: Contact sidebar */}
            <div className="space-y-5">
              {/* Price (desktop) */}
              <div className="hidden lg:block card p-6">
                <div className="font-heading font-bold text-3xl text-brand-600 mb-1">{priceDisplay}</div>
                {listing.negotiable && <span className="badge-slate text-xs">Negotiable</span>}
                <div className="flex items-center gap-2 text-slate-500 text-sm mt-3">
                  <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  <span className="line-clamp-2">{locationDisplay}</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
                  <span>{listing.listing_id}</span>
                  <span>{timeAgo(listing.created_at)}</span>
                </div>
              </div>

              {/* Seller card */}
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center font-heading font-bold text-brand-600 text-lg">
                    {listing.seller_name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{listing.seller_name}</p>
                    <p className="text-xs text-slate-500 capitalize">{listing.seller_type}</p>
                  </div>
                  {listing.is_verified && (
                    <span className="badge-verified ml-auto flex items-center gap-1">
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
                    Call {formatPhoneDisplay(listing.seller_phone).slice(0, 10)}…
                  </a>
                  <a href={waUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-green-500 text-green-700 font-semibold text-sm hover:bg-green-50 transition-colors">
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

          {/* Similar properties */}
          {similar.length > 0 && (
            <div className="mt-12">
              <h2 className="font-heading font-bold text-2xl text-slate-900 mb-6">Similar Properties</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {similar.map(l => (
                  <Link key={l.id} href={`/property/${l.slug}`} className="card card-hover overflow-hidden group block">
                    <div className="relative h-40 bg-slate-100">
                      {l.media?.[0]?.url ? (
                        <Image src={(l.media[0] as { url: string }).url} alt={l.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width:640px) 100vw, 25vw" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-300 text-4xl">🏠</div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-slate-900 text-sm line-clamp-1 mb-1">{l.title}</p>
                      <p className="text-brand-600 font-bold text-sm">{formatIndianPrice(l.price, l.price_unit)}</p>
                      <p className="text-xs text-slate-400 mt-1">{l.taluk || 'Kottayam'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile sticky CTA */}
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-slate-100 px-4 py-3 flex gap-3 z-30">
          <a href={`tel:${listing.seller_phone}`} className="flex-1 btn-primary btn-lg text-sm">
            <Phone className="w-4 h-4" />Call
          </a>
          <a href={waUrl} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-green-500 text-green-700 font-semibold text-sm hover:bg-green-50">
            <MessageCircle className="w-4 h-4" />WhatsApp
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-800 capitalize">{value}</p>
    </div>
  );
}
