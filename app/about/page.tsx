import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export const metadata: Metadata = { title: 'About qkit | India\'s Real Estate Marketplace' };

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="hero-gradient py-16 md:py-24 border-b border-slate-100">
          <div className="container-qkit max-w-3xl text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
              India's <span className="gradient-text">Simplest</span> Property Marketplace
            </h1>
            <p className="text-slate-500 text-lg leading-relaxed max-w-2xl mx-auto">
              qkit was built with a single belief: finding or listing a property should be as simple as ordering food online. No confusing forms. No hidden charges. No middlemen you don't need.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 bg-white">
          <div className="container-qkit max-w-4xl">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="section-heading mb-4">Our Mission</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  We believe every Indian family deserves a fair, transparent, and stress-free way to find or sell their home. Whether you're a farmer selling land, a family buying their first flat, or a business looking for office space — qkit is built for you.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  We connect property owners directly with buyers and tenants, with no mandatory brokerage, no fake listings, and no pressure.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '14,800+', label: 'Active Listings' },
                  { value: '380+',    label: 'Cities' },
                  { value: '52,000+', label: 'Registered Users' },
                  { value: '3,900+',  label: 'Verified Properties' },
                ].map(s => (
                  <div key={s.label} className="card p-5 text-center">
                    <div className="font-heading font-bold text-3xl text-brand-600">{s.value}</div>
                    <div className="text-sm text-slate-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-slate-50">
          <div className="container-qkit max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="section-heading">What We Stand For</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { emoji: '🤝', title: 'Transparency',  desc: 'No hidden fees, no fake listings. What you see is what you get — every time.' },
                { emoji: '🏠', title: 'Accessibility', desc: 'Free listings for all owners. No registration barrier to browse. Mobile-first for everyone.' },
                { emoji: '🔒', title: 'Safety',        desc: 'Listings are moderated. Seller contacts are protected. Your data is never sold.' },
              ].map(v => (
                <div key={v.title} className="card p-6 text-center">
                  <span className="text-4xl block mb-4">{v.emoji}</span>
                  <h3 className="font-heading font-bold text-slate-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-brand-600 text-white">
          <div className="container-qkit text-center">
            <h2 className="font-heading text-3xl font-bold mb-4">Join the qkit Community</h2>
            <p className="text-brand-100 mb-8 max-w-xl mx-auto">Start browsing free, or post your first listing in under 2 minutes.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/properties" className="btn bg-white text-brand-600 hover:bg-brand-50 btn-lg font-semibold">Browse Properties</Link>
              <Link href="/post-property" className="btn border-2 border-white text-white hover:bg-brand-700 btn-lg font-semibold">Post Free Listing</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
