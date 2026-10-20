'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { MessageCircle, Phone, CheckCircle, Clock, LogIn, Loader2 } from 'lucide-react';
import { timeAgo, formatIndianPrice } from '@/lib/utils';

interface AuthUser { id: string; name?: string; }
interface Enquiry {
  id: string;
  buyer_name?: string;
  buyer_phone?: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  created_at: string;
  listing?: {
    title: string;
    price: number;
    price_unit: string;
    town_panchayat?: string;
  };
}

const STATUS_STYLES: Record<string, string> = {
  new:     'badge bg-amber-100 text-amber-700',
  read:    'badge bg-slate-100 text-slate-600',
  replied: 'badge badge-brand',
};
const STATUS_ICONS = { new: Clock, read: CheckCircle, replied: CheckCircle };

export default function EnquiriesPage() {
  const [user, setUser]               = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [enquiries, setEnquiries]     = useState<Enquiry[]>([]);
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(({ user }) => setUser(user ?? null))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/enquiries?seller_id=${user.id}&limit=50`)
      .then(r => r.json())
      .then(res => setEnquiries(res.data ?? []))
      .catch(() => setEnquiries([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) return (
    <><Header />
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </main>
      <Footer /></>
  );

  if (!user) return (
    <><Header />
      <main className="min-h-screen flex items-center justify-center py-20 px-4">
        <div className="card p-10 max-w-sm w-full text-center">
          <LogIn className="w-12 h-12 text-brand-400 mx-auto mb-4" />
          <h2 className="font-heading font-bold text-xl text-slate-900 mb-2">Please log in</h2>
          <p className="text-slate-500 text-sm mb-6">Log in to see enquiries on your properties.</p>
          <Link href="/login" className="btn-primary btn-md w-full justify-center">Go to Login</Link>
        </div>
      </main>
      <Footer /></>
  );

  return (
    <><Header />
      <main className="min-h-screen bg-slate-50 py-10">
        <div className="container-qkit max-w-3xl">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-2xl text-slate-900">Enquiries</h1>
            <p className="text-slate-500 text-sm mt-1">
              {loading ? 'Loading…' : `${enquiries.length} enquir${enquiries.length === 1 ? 'y' : 'ies'} received`}
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="card p-5 space-y-3">
                  <div className="skeleton h-4 rounded w-1/3" />
                  <div className="skeleton h-3 rounded w-2/3" />
                  <div className="skeleton h-12 rounded-xl" />
                </div>
              ))}
            </div>
          ) : enquiries.length === 0 ? (
            <div className="card p-16 text-center">
              <MessageCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-slate-700 mb-2">No enquiries yet</h3>
              <p className="text-slate-500 text-sm">When buyers contact you about your listings, their messages will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {enquiries.map(enq => {
                const StatusIcon = STATUS_ICONS[enq.status] ?? Clock;
                return (
                  <div key={enq.id} className="card p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm">{enq.buyer_name ?? 'Anonymous Buyer'}</p>
                        {enq.listing?.title && (
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            Re: <span className="text-brand-600">{enq.listing.title}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={STATUS_STYLES[enq.status] ?? STATUS_STYLES.new}>
                          <StatusIcon className="w-3 h-3" />
                          {enq.status}
                        </span>
                        <span className="text-xs text-slate-400">{timeAgo(enq.created_at)}</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3 mb-4">
                      &ldquo;{enq.message}&rdquo;
                    </p>

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <p className="text-xs text-slate-400">
                        {enq.listing?.price
                          ? `${formatIndianPrice(enq.listing.price, enq.listing.price_unit as 'total' | 'per_month' | 'per_sqft' | 'per_year')} · ${enq.listing.town_panchayat ?? ''}`
                          : ''}
                      </p>
                      {enq.buyer_phone && (
                        <div className="flex gap-2">
                          <a
                            href={`https://wa.me/91${enq.buyer_phone}?text=${encodeURIComponent(`Hi ${enq.buyer_name ?? ''}, thanks for your enquiry about ${enq.listing?.title ?? 'the property'}.`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="btn-secondary btn-sm text-green-700 hover:bg-green-50"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                          <a href={`tel:${enq.buyer_phone}`} className="btn-primary btn-sm">
                            <Phone className="w-3.5 h-3.5" /> Call
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer /></>
  );
}
