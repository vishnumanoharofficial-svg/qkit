import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';

const FOOTER_LINKS = {
  'Buy Property': [
    { label: 'Houses & Villas',    href: '/buy' },
    { label: 'Apartments & Flats', href: '/buy' },
    { label: 'Residential Plots',  href: '/buy' },
    { label: 'Commercial Spaces',  href: '/commercial' },
    { label: 'Agricultural Land',  href: '/buy' },
    { label: 'Industrial Land',    href: '/buy' },
  ],
  'Rent & Lease': [
    { label: 'Apartments for Rent', href: '/rent' },
    { label: 'Houses for Rent',     href: '/rent' },
    { label: 'Office Spaces',       href: '/rent' },
    { label: 'Shops & Showrooms',   href: '/rent' },
    { label: 'Warehouse / Godown',  href: '/lease' },
    { label: 'Long-Term Lease',     href: '/lease' },
  ],
  'Kottayam Areas': [
    { label: 'Kottayam Town',   href: '/search?location=kottayam-town' },
    { label: 'Changanassery',   href: '/search?location=changanassery' },
    { label: 'Pala',            href: '/search?location=pala' },
    { label: 'Ettumanoor',      href: '/search?location=ettumanoor' },
    { label: 'Vaikom',          href: '/search?location=vaikom' },
    { label: 'Kanjirappally',   href: '/search?location=kanjirappally' },
  ],
  'Company': [
    { label: 'About qkit',          href: '/about' },
    { label: 'How It Works',        href: '/#how-it-works' },
    { label: 'List Your Property',  href: '/post-property' },
    { label: 'Contact Us',          href: '/contact' },
    { label: 'Privacy Policy',      href: '/privacy' },
    { label: 'Terms of Service',    href: '/terms' },
  ],
};

const POPULAR_SEARCHES = [
  '2 BHK flats in Kottayam', 'Houses for sale in Changanassery',
  'Plots in Pala', 'Commercial space in Kottayam Town',
  'Agricultural land in Kanjirappally', 'Office space in Kottayam',
  'Apartments for rent in Ettumanoor', 'Warehouse in Vaikom',
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300" role="contentinfo">
      {/* Main footer content */}
      <div className="container-qkit py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <Image
                src="/logo.png"
                alt="qKIT Real Estate"
                width={110}
                height={36}
                className="h-8 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Kottayam District's trusted real estate marketplace. Connecting property owners, buyers and tenants directly — no brokers.
            </p>
            <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-2">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>Kottayam District, Kerala</span>
            </div>
            <div className="space-y-2 text-sm">
              <a href="mailto:qkitcontact@gmail.com" className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors">
                <Mail className="w-4 h-4" />
                qkitcontact@gmail.com
              </a>
              <a href="tel:+919400000000" className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors">
                <Phone className="w-4 h-4" />
                +91 94000 00000
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="font-heading font-semibold text-white text-sm mb-4">{heading}</h3>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-slate-400 hover:text-blue-400 transition-colors leading-snug"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Popular searches */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <h3 className="font-heading font-semibold text-white text-sm mb-4">Popular Searches in Kottayam</h3>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map(term => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="px-3 py-1.5 rounded-full bg-slate-800 text-xs text-slate-400 hover:bg-blue-900 hover:text-blue-300 transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="container-qkit py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {year} qkit Real Estate. All rights reserved. Phase 1 — Kottayam District, Kerala.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
          </div>
          <p className="text-slate-600">Made with ♥ in Kerala, India</p>
        </div>
      </div>
    </footer>
  );
}
