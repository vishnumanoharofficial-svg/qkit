import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import CategoryCards from '@/components/home/CategoryCards';
import PropertySection from '@/components/home/PropertySection';
import HowItWorks from '@/components/home/HowItWorks';
import { MOCK_LISTINGS } from '@/lib/mock-data';
import Link from 'next/link';
import { Plus, Users, Building, UserCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'qkit — Find Your Perfect Property in India',
  description: "India's premium real estate marketplace. Buy, sell, rent or lease property across India.",
};

const TRENDING_CITIES = [
  { name: 'Bangalore', count: '2,400+', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400' },
  { name: 'Mumbai',    count: '3,100+', img: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400' },
  { name: 'Hyderabad', count: '1,800+', img: 'https://images.unsplash.com/photo-1588416936097-41850ab3d86d?w=400' },
  { name: 'Chennai',   count: '1,200+', img: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400' },
  { name: 'Pune',      count: '950+',   img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400' },
  { name: 'Kochi',     count: '680+',   img: 'https://images.unsplash.com/photo-1602050758792-12478a46bf95?w=400' },
];

export default function HomePage() {
  const featured   = MOCK_LISTINGS.filter(l => l.is_featured);
  const recent     = MOCK_LISTINGS.slice(0, 4);
  const forSale    = MOCK_LISTINGS.filter(l => l.transaction_type === 'sale');
  const forRent    = MOCK_LISTINGS.filter(l => l.transaction_type === 'rent');
  const commercial = MOCK_LISTINGS.filter(l => l.category_id === 'cat-commercial');
  const verified   = MOCK_LISTINGS.filter(l => l.is_verified);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <CategoryCards />

        <PropertySection
          title="Featured Properties"
          subtitle="Handpicked premium listings"
          listings={featured}
          viewAllHref="/properties?featured=true"
        />

        <PropertySection
          title="Recently Added"
          subtitle="Fresh listings in the last 7 days"
          listings={recent}
          viewAllHref="/properties?sort=newest"
        />

        {/* Trending Cities */}
        <section className="py-14 bg-white" aria-labelledby="cities-heading">
          <div className="container-qkit">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 id="cities-heading" className="section-heading">Trending Locations</h2>
                <p className="section-sub">Most searched cities this week</p>
              </div>
              <Link href="/search" className="text-brand-600 text-sm font-medium hover:underline hidden sm:block">All Cities →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {TRENDING_CITIES.map(city => (
                <Link key={city.name} href={`/search?city=${city.name.toLowerCase()}`}
                  className="group relative overflow-hidden rounded-2xl aspect-square shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={city.img} alt={city.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <p className="font-heading font-bold text-sm leading-tight">{city.name}</p>
                    <p className="text-xs text-white/80">{city.count} listings</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <PropertySection
          title="Properties for Sale"
          subtitle="Residential &amp; commercial properties"
          listings={forSale}
          viewAllHref="/buy"
        />

        <PropertySection
          title="Verified Properties"
          subtitle="Listings with owner-verified details"
          listings={verified}
          viewAllHref="/properties?verified=true"
        />

        <PropertySection
          title="Rental Properties"
          subtitle="Ready to move-in rentals"
          listings={forRent}
          viewAllHref="/rent"
        />

        <PropertySection
          title="Commercial Opportunities"
          subtitle="Offices, shops, warehouses &amp; more"
          listings={commercial}
          viewAllHref="/commercial"
        />

        {/* Seller types CTA strip */}
        <section className="py-14 bg-white" aria-label="List your property">
          <div className="container-qkit">
            <div className="text-center mb-10">
              <h2 className="section-heading">List with qkit</h2>
              <p className="section-sub">Free listings for owners · Professional tools for agents &amp; builders</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: UserCheck, title: 'Property Owner',   sub: 'List your property for free in under 2 minutes.', cta: 'List as Owner',    href: '/post-property?type=owner',   color: 'bg-brand-600' },
                { icon: Users,     title: 'Agent / Broker',   sub: 'Manage multiple listings and track leads from one dashboard.', cta: 'Register as Agent', href: '/register/agent',      color: 'bg-blue-600' },
                { icon: Building,  title: 'Builder / Developer', sub: 'Bulk upload projects and manage inventory at scale.', cta: 'Builder Panel', href: '/register/builder',    color: 'bg-purple-600' },
              ].map(({ icon: Icon, title, sub, cta, href, color }) => (
                <div key={title} className="card p-7 flex flex-col items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-slate-900 mb-1">{title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{sub}</p>
                  </div>
                  <Link href={href} className="btn-outline btn-md mt-auto">
                    <Plus className="w-4 h-4" />{cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <HowItWorks />

        {/* Bottom CTA */}
        <section className="py-16 bg-brand-600" aria-label="Get started">
          <div className="container-qkit text-center text-white">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Perfect Property?</h2>
            <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">Join over 52,000 users who trust qkit for all their real estate needs across India.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/properties" className="btn bg-white text-brand-600 hover:bg-brand-50 btn-xl font-semibold">Browse Properties</Link>
              <Link href="/post-property" className="btn border-2 border-white text-white hover:bg-brand-700 btn-xl font-semibold"><Plus className="w-5 h-5" />Post Free Listing</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
