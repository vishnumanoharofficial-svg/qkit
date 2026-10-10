import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export const metadata: Metadata = { title: 'Contact Us | qkit' };

const CONTACT_INFO = [
  { icon: Mail,    label: 'Email',    value: 'support@qkit.in',    href: 'mailto:support@qkit.in' },
  { icon: Phone,   label: 'Phone',    value: '+91 80000 00000',     href: 'tel:+918000000000' },
  { icon: MapPin,  label: 'Address',  value: 'Bangalore, Karnataka, India', href: null },
  { icon: Clock,   label: 'Hours',    value: 'Mon–Sat, 9 AM–6 PM IST', href: null },
];

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-12">
        <div className="container-qkit max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="section-heading">Contact Us</h1>
            <p className="section-sub">We're here to help. Reach us any time.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact form */}
            <div className="card p-7">
              <h2 className="font-heading font-semibold text-slate-900 mb-5">Send a Message</h2>
              <form className="space-y-4">
                <div>
                  <label className="label">Your Name</label>
                  <input className="input" placeholder="Full name" required />
                </div>
                <div>
                  <label className="label">Phone or Email</label>
                  <input className="input" placeholder="Phone number or email address" required />
                </div>
                <div>
                  <label className="label">Subject</label>
                  <select className="input">
                    <option>General Enquiry</option>
                    <option>Listing Issue</option>
                    <option>Payment Support</option>
                    <option>Account Help</option>
                    <option>Report Fraud</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea className="input min-h-[120px] resize-none" placeholder="Describe your issue or question…" required />
                </div>
                <button type="submit" className="btn-primary btn-lg w-full">
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact info + FAQ links */}
            <div className="space-y-5">
              <div className="card p-6">
                <h2 className="font-heading font-semibold text-slate-900 mb-4">Get in Touch</h2>
                <div className="space-y-4">
                  {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
                        {href ? (
                          <a href={href} className="text-sm text-slate-700 hover:text-brand-600 transition-colors">{value}</a>
                        ) : (
                          <p className="text-sm text-slate-700">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h2 className="font-heading font-semibold text-slate-900 mb-4">Quick Help</h2>
                <div className="space-y-2 text-sm">
                  {[
                    'How do I post a property for free?',
                    'How do I contact a property seller?',
                    'How do I report a suspicious listing?',
                    'How do I cancel or edit my listing?',
                    'What payment methods are accepted?',
                  ].map(q => (
                    <button key={q} className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-brand-50 hover:text-brand-700 text-slate-600 transition-colors text-sm">
                      → {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
