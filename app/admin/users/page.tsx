import type { Metadata } from 'next';
import Link from 'next/link';
import { UserCheck, Shield } from 'lucide-react';
import { getUsers } from '@/lib/supabase/queries';
import { timeAgo } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Users | qkit Admin' };

export default async function AdminUsersPage() {
  const { data: users, count } = await getUsers(100);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden md:flex flex-col w-60 bg-slate-900 text-slate-300 flex-shrink-0 p-3">
        <div className="p-3 mb-4">
          <Link href="/admin" className="font-heading font-bold text-white text-lg">
            q<span className="text-brand-400">kit</span>
            <span className="text-xs text-slate-400 font-normal ml-1">admin</span>
          </Link>
        </div>
        {[
          ['Dashboard',    '/admin'],
          ['Moderation',   '/admin/moderation'],
          ['All Listings', '/admin/listings'],
          ['Users',        '/admin/users'],
          ['Settings',     '/admin/settings'],
        ].map(([label, href]) => (
          <Link key={href} href={href}
            className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5 block ${
              href === '/admin/users' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 hover:text-white'
            }`}>
            {label}
          </Link>
        ))}
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <header className="bg-white border-b border-slate-100 px-6 py-4">
          <h1 className="font-heading font-bold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500 mt-0.5">{count} registered users</p>
        </header>

        <div className="p-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
            {users.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <Shield className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p>No users have registered yet.</p>
                <p className="text-xs mt-1">Users will appear here once they sign up on the website.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-5 py-3">User</th>
                      <th className="text-left px-5 py-3">Contact</th>
                      <th className="text-left px-5 py-3">Role</th>
                      <th className="text-left px-5 py-3">Joined</th>
                      <th className="text-left px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map((user: any) => {
                      const name = user.full_name || user.name || user.email || 'Anonymous';
                      const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                      return (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {initials}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{name}</p>
                                <p className="text-xs text-slate-400">{user.id?.slice(0, 8)}…</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="text-slate-700">{user.email || '—'}</p>
                            <p className="text-xs text-slate-400">{user.phone || user.phone_number || '—'}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`badge capitalize ${
                              user.role === 'admin' ? 'badge-red' :
                              user.role === 'agent' || user.role === 'builder' ? 'badge-blue' :
                              'badge-slate'
                            }`}>
                              {user.role || 'user'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-400">
                            {user.created_at ? timeAgo(user.created_at) : '—'}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              {user.is_verified ? (
                                <span className="flex items-center gap-1 badge badge-brand">
                                  <UserCheck className="w-3 h-3" />Verified
                                </span>
                              ) : (
                                <span className="badge badge-slate">Unverified</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
