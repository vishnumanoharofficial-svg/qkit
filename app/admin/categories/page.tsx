import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Edit2, ToggleLeft, ToggleRight, GripVertical } from 'lucide-react';
import { PROPERTY_CATEGORIES } from '@/lib/constants';

export const metadata: Metadata = { title: 'Manage Categories | qkit Admin' };

export default function CategoriesAdminPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden md:flex flex-col w-60 bg-slate-900 text-slate-300 flex-shrink-0 p-3">
        <div className="p-3 mb-4">
          <Link href="/admin" className="font-heading font-bold text-white text-lg">
            q<span className="text-brand-400">kit</span> <span className="text-xs text-slate-400 font-normal">admin</span>
          </Link>
        </div>
        {[
          ['Dashboard', '/admin'], ['Moderation', '/admin/moderation'],
          ['All Listings', '/admin/listings'], ['Users', '/admin/users'],
          ['Categories', '/admin/categories'], ['Settings', '/admin/settings'],
        ].map(([label, href]) => (
          <Link key={href} href={href}
            className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5 block ${href === '/admin/categories' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
            {label}
          </Link>
        ))}
      </aside>

      <main className="flex-1">
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-slate-900">Property Categories</h1>
            <p className="text-sm text-slate-500 mt-0.5">Add, edit, reorder or disable categories. Changes reflect instantly on the site.</p>
          </div>
          <button className="btn-primary btn-md">
            <Plus className="w-4 h-4" />Add Category
          </button>
        </header>

        <div className="p-6">
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center text-xs font-semibold text-slate-500 uppercase tracking-wide gap-4">
              <span className="w-6" />
              <span className="flex-1">Category</span>
              <span className="w-24 text-center">Listings</span>
              <span className="w-20 text-center">Status</span>
              <span className="w-24" />
            </div>
            <div className="divide-y divide-slate-50">
              {PROPERTY_CATEGORIES.map((cat, i) => (
                <div key={cat.slug} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 group transition-colors">
                  {/* Drag handle */}
                  <GripVertical className="w-4 h-4 text-slate-300 cursor-grab flex-shrink-0" />

                  {/* Icon + name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl flex-shrink-0">{cat.icon}</span>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{cat.label}</p>
                      <p className="text-xs text-slate-400">{cat.description}</p>
                    </div>
                  </div>

                  {/* Mock listing count */}
                  <div className="w-24 text-center text-sm text-slate-600 font-medium">
                    {(Math.random() * 2000 + 100).toFixed(0)}
                  </div>

                  {/* Toggle */}
                  <div className="w-20 flex justify-center">
                    <button className="flex items-center gap-1.5 text-xs font-medium text-brand-600">
                      <ToggleRight className="w-5 h-5" />
                      Active
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="w-24 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700" title="Edit">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-4">
            💡 Drag rows to reorder. Changes to category names and visibility reflect on the public site immediately.
            Dynamic field definitions per category can be managed from the category edit panel.
          </p>
        </div>
      </main>
    </div>
  );
}
