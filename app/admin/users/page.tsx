import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, UserCheck, Shield, MoreHorizontal } from 'lucide-react';
import { timeAgo } from '@/lib/utils';

export const metadata: Metadata = { title: 'Users | qkit Admin' };

// Mock users for demonstration
const MOCK_USERS = [
  { id: 'u1', name: 'Ramesh Kumar',     phone: '9845012345', role: 'seller',  is_verified: true,  listings: 3,  created_at: new Date(Date.now() - 15*24*60*60*1000).toISOString() },
  { id: 'u2', name: 'Suresh Gowda',     phone: '9632014789', role: 'seller',  is_verified: true,  listings: 1,  created_at: new Date(Date.now() - 20*24*60*60*1000).toISOString() },
  { id: 'u3', name: 'Heritage Properties', phone: '9848022333', role: 'agent', is_verified: true,  listings: 12, created_at: new Date(Date.now() - 60*24*60*60*1000).toISOString() },
  { id: 'u4', name: 'Anita Sharma',     phone: '9741023456', role: 'seller',  is_verified: false, listings: 2,  created_at: new Date(Date.now() - 5*24*60*60*1000).toISOString() },
  { id: 'u5', name: 'BKC Realty',       phone: '9820034567', role: 'agent',   is_verified: true,  listings: 8,  created_at: new Date(Date.now() - 90*24*60*60*1000).toISOString() },
  { id: 'u6', name: 'Prakash Nair',     phone: '9497045678', role: 'buyer',   is_verified: false, listings: 0,  created_at: new Date(Date.now() - 2*24*60*60*1000).toISOString() },
];

const ROLE_STYLES: Record<string, string> = {
  buyer:       'badge-slate',
  seller:      'badge-brand',
  agent:       'badge-blue',
  builder:     'badge bg-purple-100 text-purple-700',
  moderator:   'badge-amber',
  admin:       'badge-red',
  super_admin: 'badge bg-red-200 text-red-800',
};

export default function AdminUsersPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden md:flex flex-col w-60 bg-slate-900 text-slate-300 flex-shrink-0 p-3">
        <div className="p-3 mb-4">
          <Link href="/admin" className="font-heading font-bold text-white text-lg">
            q<span className="text-brand-400">kit</span>
            <span className="text-xs text-slate-400 font-normal ml-1">admin</span>
          </Link>
        </div>
        {[['Dashboard','/admin'],['Moderation','/admin/moderation'],['All Listings','/admin/listings'],['Users','/admin/users'],['Categories','/admin/categories'],['Settings','/admin/settings']].map(([label,href]) => (
          <Link key={href} href={href} className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5 block ${href==='/admin/users'?'bg-slate-700 text-white':'hover:bg-slate-800 hover:text-white'}`}>{label}</Link>
        ))}
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <header className="bg-white border-b border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-heading font-bold text-slate-900">Users</h1>
              <p className="text-sm text-slate-500">{MOCK_USERS.length} accounts (demo)</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input placeholder="Search by name or phone…" className="bg-transparent text-sm outline-none w-44 placeholder:text-slate-400" />
              </div>
              <select className="input text-sm w-32">
                <option value="">All Roles</option>
                <option>buyer</option>
                <option>seller</option>
                <option>agent</option>
                <option>builder</option>
                <option>admin</option>
              </select>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide font-semibold">
                  <tr>
                    <th className="text-left px-5 py-3">User</th>
                    <th className="text-left px-5 py-3">Phone</th>
                    <th className="text-left px-5 py-3">Role</th>
                    <th className="text-left px-5 py-3">Listings</th>
                    <th className="text-left px-5 py-3">Verified</th>
                    <th className="text-left px-5 py-3">Joined</th>
                    <th className="text-left px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {MOCK_USERS.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">+91 {u.phone.slice(0,5)} {u.phone.slice(5)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`${ROLE_STYLES[u.role] ?? 'badge-slate'} badge capitalize`}>{u.role}</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{u.listings}</td>
                      <td className="px-5 py-3.5">
                        {u.is_verified
                          ? <span className="flex items-center gap-1 text-brand-600 text-xs font-medium"><UserCheck className="w-3.5 h-3.5" />Yes</span>
                          : <span className="text-xs text-slate-400">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-400">{timeAgo(u.created_at)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <button className="text-xs text-brand-600 hover:underline">Edit Role</button>
                          <button className="text-xs text-red-500 hover:underline">Suspend</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
