import Link from 'next/link';
import { PROPERTY_CATEGORIES } from '@/lib/constants';

export default function CategoryCards() {
  return (
    <section className="py-14 bg-white" aria-labelledby="categories-heading">
      <div className="container-qkit">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 id="categories-heading" className="section-heading">Browse by Category</h2>
            <p className="section-sub">Find the right type of property for your needs</p>
          </div>
          <Link href="/properties" className="text-brand-600 text-sm font-medium hover:underline hidden sm:block">View All →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
          {PROPERTY_CATEGORIES.map(cat => (
            <Link key={cat.slug} href={`/${cat.slug}`}
              className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-slate-50 hover:bg-brand-50 border border-slate-100 hover:border-brand-200 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5">
              <span className="text-3xl transition-transform duration-200 group-hover:scale-110" role="img" aria-label={cat.label}>{cat.icon}</span>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-brand-700 text-center leading-tight transition-colors">{cat.label}</span>
            </Link>
          ))}
        </div>
        <div className="mt-4 sm:hidden text-center">
          <Link href="/properties" className="text-brand-600 text-sm font-medium hover:underline">View all categories →</Link>
        </div>
      </div>
    </section>
  );
}
