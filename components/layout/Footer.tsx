import Link from 'next/link';
import { Home, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const FOOTER_LINKS = {
  'Buy Property': [
    { label: 'Flats & Apartments', href: '/buy/apartments' },
    { label: 'Independent Houses', href: '/buy/houses' },
    { label: 'Villas', href: '/buy/villas' },
    { label: 'Residential Plots', href: '/buy/plots' },
    { label: 'Commercial Spaces', href: '/commercial' },
    { label: 'Agricultural Land', href: '/buy/agricultural' },
  ],
  'Rent Property': [
    { label: 'Apartments for Rent', href: '/rent/apartments' },
    { label: 'Houses for Rent', href: '/rent/houses' },
    { label: 'Office Spaces', href: '/rent/offices' },
    { label: 'Shops & Showrooms', href: '/rent/shops' },
    { label: 'Warehouse / Godown', href: '/rent/warehouses' },
    { label: 'PG / Flatmates', href: '/rent/pg' },
  ],
  'Popular Cities': [
    { label: 'Mumbai Properties', href: '/search?city=mumbai' },
    { label: 'Bangalore Properties', href: '/search?city=bangalore' },
    { label: 'Delhi NCR Properties', href: '/search?city=delhi' },
    { label: 'Hyderabad Properties', href: '/search?city=hyderabad' },
    { label: 'Chennai Properties', href: '/search?city=chennai' },
    { label: 'Pune Properties', href: '/search?city=pune' },
  ],
  'Company': [
    { label: 'About qkit', href: '/about' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'List Your Property', href: '/post-property' },
    { label: 'Agent Registration', href: '/register/agent' },
    { label: 'Builder Registration', href: '/register/builder' },
    { label: 'Advertise With Us', href: '/advertise' },
  ],
  'Help & Legal': [
    { label: 'Help Centre', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refund' },
    { label: 'Report a Problem', href: '/report' },
  ],
};

const POPULAR_SEARCHES = [
  '2 BHK flats in Bangalore', '3 BHK apartments in Mumbai',
  'Villas in Hyderabad', 'Commercial plots in Chennai',
  'Agricultural land in Kerala', 'Office space in Pune',
  'Shops for rent in Delhi', 'Warehouse in Ahmedabad',
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300" role="contentinfo">
      {/* Main footer content */}
      <div className="container-qkit py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-white">
                q<span className="text-brand-400">kit</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              India's trusted real estate marketplace. Connecting property owners, buyers, tenants and real estate professionals across the country.
            </p>
            <div className="space-y-2 text-sm">
              <a href="mailto:support@qkit.in" className="flex items-center gap-2 text-slate-400 hover:text-brand-400 transition-colors">
                <Mail className="w-4 h-4" />
                support@qkit.in
              </a>
              <a href="tel:+918000000000" className="flex items-center gap-2 text-slate-400 hover:text-brand-400 transition-colors">
                <Phone className="w-4 h-4" />
                +91 8000 000 000
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
                      className="text-sm text-slate-400 hover:text-brand-400 transition-colors leading-snug"
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
          <h3 className="font-heading font-semibold text-white text-sm mb-4">Popular Searches</h3>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map(term => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="px-3 py-1.5 rounded-full bg-slate-800 text-xs text-slate-400 hover:bg-slate-700 hover:text-slate-300 transition-colors"
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
          <p>© {year} qkit. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/refund" className="hover:text-slate-300 transition-colors">Refunds</Link>
            <Link href="/sitemap.xml" className="hover:text-slate-300 transition-colors">Sitemap</Link>
          </div>
          <p className="text-slate-600">Made with ♥ for India</p>
        </div>
      </div>
    </footer>
  );
}
