import { Search, FileText, Phone, CheckCircle } from 'lucide-react';

const BUYER_STEPS = [
  { icon: Search,      title: 'Search & Filter',    desc: 'Search by city, locality, price, category. Advanced filters narrow results instantly.' },
  { icon: FileText,    title: 'Browse Listings',    desc: 'View photos, specs, seller profile. Save favourites for later comparison.' },
  { icon: Phone,       title: 'Contact & Visit',    desc: 'Call or WhatsApp the seller directly. Schedule a site visit at your convenience.' },
  { icon: CheckCircle, title: 'Finalise the Deal',  desc: 'Negotiate, agree terms, and complete the transaction with your legal advisor.' },
];
const SELLER_STEPS = [
  { icon: FileText,    title: 'List for Free',       desc: 'Post your property in 2 simple steps in under 2 minutes.' },
  { icon: Search,      title: 'Add Photos',          desc: 'Upload photos from your phone. More photos = more enquiries.' },
  { icon: Phone,       title: 'Receive Enquiries',   desc: 'Buyers contact you directly. Manage leads from your dashboard.' },
  { icon: CheckCircle, title: 'Close the Deal',      desc: 'Mark your property sold, rented or leased when done.' },
];

const STEP_COLORS = [
  'bg-brand-50 text-brand-600',
  'bg-blue-50 text-blue-600',
  'bg-amber-50 text-amber-600',
  'bg-green-50 text-green-600',
];

function StepList({ steps }: { steps: typeof BUYER_STEPS }) {
  return (
    <div className="grid gap-6">
      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <div key={i} className="flex gap-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${STEP_COLORS[i]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">{i+1}</span>
                <h3 className="font-heading font-semibold text-slate-900 text-sm">{step.title}</h3>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="py-16 bg-slate-50" aria-labelledby="how-heading">
      <div className="container-qkit">
        <div className="text-center mb-12">
          <h2 id="how-heading" className="section-heading">How qkit Works</h2>
          <p className="section-sub">Simple, transparent and fast — for everyone</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card p-7">
            <div className="flex items-center gap-3 mb-7">
              <span className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center text-lg">👥</span>
              <div>
                <h3 className="font-heading font-bold text-lg text-slate-900">For Buyers & Tenants</h3>
                <p className="text-xs text-slate-500">Find your ideal property</p>
              </div>
            </div>
            <StepList steps={BUYER_STEPS} />
          </div>
          <div className="card p-7">
            <div className="flex items-center gap-3 mb-7">
              <span className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg">🏠</span>
              <div>
                <h3 className="font-heading font-bold text-lg text-slate-900">For Sellers & Landlords</h3>
                <p className="text-xs text-slate-500">Reach thousands of buyers</p>
              </div>
            </div>
            <StepList steps={SELLER_STEPS} />
          </div>
        </div>
      </div>
    </section>
  );
}
