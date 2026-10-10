import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MessageCircle, Phone, CheckCircle, Clock, XCircle } from 'lucide-react';
import { timeAgo, formatIndianPrice } from '@/lib/utils';
import { MOCK_LISTINGS } from '@/lib/mock-data';

export const metadata: Metadata = { title: 'Enquiries | qkit' };

// Mock enquiries for demonstration
const MOCK_ENQUIRIES = MOCK_LISTINGS.slice(0, 4).map((l, i) => ({
  id: `enq-${i}`,
  listing: l,
  buyer_name: ['Rahul Sharma', 'Priya Nair', 'Arun Kumar', 'Meena Iyer'][i],
  buyer_phone: ['9876543210', '9845012345', '9741023456', '9632014789'][i],
  message: ['Very interested, please call me.', 'Is the price negotiable?', 'Can I schedule a visit this weekend?', 'Please share more photos.'][i],
  status: ['new', 'read', 'replied', 'new'][i] as 'new'|'read'|'replied',
  created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
}));

const STATUS_STYLES: Record<string, string> = {
  new:     'badge bg-amber-100 text-amber-700',
  read:    'badge bg-slate-100 text-slate-600',
  replied: 'badge badge-brand',
};
const STATUS_ICONS = { new: Clock, read: CheckCircle, replied: CheckCircle };

export default function EnquiriesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-10">
        <div className="container-qkit max-w-3xl">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-2xl text-slate-900">Enquiries</h1>
            <p className="text-slate-500 text-sm mt-1">{MOCK_ENQUIRIES.length} total enquiries received</p>
          </div>

          {MOCK_ENQUIRIES.length === 0 ? (
            <div className="card p-16 text-center">
              <MessageCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-slate-700 mb-2">No enquiries yet</h3>
              <p className="text-slate-500 text-sm">When buyers contact you, their messages will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {MOCK_ENQUIRIES.map(enq => {
                const StatusIcon = STATUS_ICONS[enq.status];
                return (
                  <div key={enq.id} className="card p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm">{enq.buyer_name}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          Re: <span className="text-brand-600">{enq.listing.title}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={STATUS_STYLES[enq.status]}>
                          <StatusIcon className="w-3 h-3" />
                          {enq.status}
                        </span>
                        <span className="text-xs text-slate-400">{timeAgo(enq.created_at)}</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3 mb-4">
                      "{enq.message}"
                    </p>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-400">
                        Property: {formatIndianPrice(enq.listing.price, enq.listing.price_unit)} ·{' '}
                        {enq.listing.locality?.city?.name}
                      </p>
                      <div className="flex gap-2">
                        <a href={`https://wa.me/91${enq.buyer_phone}?text=${encodeURIComponent(`Hi ${enq.buyer_name}, thanks for your enquiry about ${enq.listing.title}.`)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="btn-secondary btn-sm text-green-700 hover:bg-green-50">
                          <MessageCircle className="w-3.5 h-3.5" />WhatsApp
                        </a>
                        <a href={`tel:${enq.buyer_phone}`} className="btn-primary btn-sm">
                          <Phone className="w-3.5 h-3.5" />Call
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
