import type { Metadata } from 'next';
import Link from 'next/link';
import { Save } from 'lucide-react';

export const metadata: Metadata = { title: 'Platform Settings | qkit Admin' };

const SETTINGS_SECTIONS = [
  {
    title: 'Listing Settings',
    fields: [
      { key: 'free_listing_limit',  label: 'Free Listings per User',   value: '3',     type: 'number', help: 'Number of free listings allowed per user account.' },
      { key: 'listing_expiry_days', label: 'Listing Expiry (days)',    value: '90',    type: 'number', help: 'Listings auto-expire after this many days.' },
      { key: 'auto_publish',        label: 'Auto-Publish Listings',    value: 'false', type: 'select', options: ['true','false'], help: 'If true, listings go live immediately. If false, they require moderation.' },
      { key: 'max_images',          label: 'Max Images per Listing',   value: '20',    type: 'number', help: 'Maximum photos allowed per property listing.' },
    ],
  },
  {
    title: 'Pricing (₹)',
    fields: [
      { key: 'featured_price_7d',    label: 'Featured Listing — 7 Days',   value: '499',  type: 'number', help: 'Price in INR for 7-day featured placement.' },
      { key: 'featured_price_30d',   label: 'Featured Listing — 30 Days',  value: '1499', type: 'number', help: 'Price in INR for 30-day featured placement.' },
      { key: 'homepage_banner_price', label: 'Homepage Banner',            value: '2999', type: 'number', help: 'Price in INR for homepage banner advertising.' },
    ],
  },
  {
    title: 'Contact & Brand',
    fields: [
      { key: 'site_name',      label: 'Site Name',       value: 'qkit',              type: 'text', help: '' },
      { key: 'tagline',        label: 'Tagline',         value: 'Find Your Perfect Property', type: 'text', help: '' },
      { key: 'support_email',  label: 'Support Email',   value: 'support@qkit.in',   type: 'text', help: '' },
      { key: 'support_phone',  label: 'Support Phone',   value: '+91 8000 000 000',  type: 'text', help: '' },
    ],
  },
];

export default function AdminSettingsPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden md:flex flex-col w-60 bg-slate-900 text-slate-300 flex-shrink-0 p-3">
        <div className="p-3 mb-4">
          <Link href="/admin" className="font-heading font-bold text-white text-lg">
            q<span className="text-brand-400">kit</span> <span className="text-xs text-slate-400 font-normal">admin</span>
          </Link>
        </div>
        {[['Dashboard','/admin'],['Moderation','/admin/moderation'],['All Listings','/admin/listings'],['Users','/admin/users'],['Categories','/admin/categories'],['Settings','/admin/settings']].map(([label,href]) => (
          <Link key={href} href={href} className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5 block ${href==='/admin/settings'?'bg-slate-700 text-white':'hover:bg-slate-800 hover:text-white'}`}>{label}</Link>
        ))}
      </aside>

      <main className="flex-1">
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-slate-900">Platform Settings</h1>
            <p className="text-sm text-slate-500 mt-0.5">Changes are saved to the database and reflect immediately.</p>
          </div>
        </header>

        <div className="p-6 max-w-2xl space-y-8">
          {SETTINGS_SECTIONS.map(section => (
            <div key={section.title} className="card p-6">
              <h2 className="font-heading font-semibold text-slate-900 mb-5">{section.title}</h2>
              <div className="space-y-4">
                {section.fields.map(field => (
                  <div key={field.key}>
                    <label className="label">{field.label}</label>
                    {field.type === 'select' ? (
                      <select defaultValue={field.value} className="input">
                        {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={field.type} defaultValue={field.value} className="input" />
                    )}
                    {field.help && <p className="text-xs text-slate-400 mt-1">{field.help}</p>}
                  </div>
                ))}
              </div>
              <button className="btn-primary btn-md mt-6">
                <Save className="w-4 h-4" />Save {section.title}
              </button>
            </div>
          ))}

          <div className="card p-6 border-red-100">
            <h2 className="font-heading font-semibold text-slate-900 mb-2">Danger Zone</h2>
            <p className="text-sm text-slate-500 mb-4">These actions are irreversible. Use with caution.</p>
            <div className="space-y-3">
              <button className="btn-danger btn-md">Expire All Listings Older Than 90 Days</button>
              <button className="btn bg-slate-700 text-white hover:bg-slate-800 btn-md">Export All Data (CSV)</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
