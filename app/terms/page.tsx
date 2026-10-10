import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = { title: 'Terms of Service | qkit' };

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-12">
        <div className="container-qkit max-w-3xl">
          <div className="card p-8 md:p-12">
            <h1 className="font-heading font-bold text-3xl text-slate-900 mb-2">Terms of Service</h1>
            <p className="text-slate-400 text-sm mb-8">Last updated: October 2026</p>

            <div className="prose prose-slate max-w-none space-y-6 text-sm text-slate-600 leading-relaxed">
              <section>
                <h2 className="font-heading font-semibold text-lg text-slate-900 mb-2">1. Acceptance of Terms</h2>
                <p>By accessing or using qkit ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.</p>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-lg text-slate-900 mb-2">2. Platform Role</h2>
                <p>qkit is an online marketplace that connects property sellers, landlords, agents, and builders with potential buyers and tenants. qkit does not own, manage, or control any property listed on the Platform. qkit is not a party to any transaction between users.</p>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-lg text-slate-900 mb-2">3. Listings</h2>
                <p>By posting a listing, you confirm that:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>You are the owner or authorised representative of the property.</li>
                  <li>All information provided is accurate and not misleading.</li>
                  <li>The listing does not violate any applicable laws or regulations.</li>
                  <li>You will not post duplicate, fraudulent, or spam listings.</li>
                </ul>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-lg text-slate-900 mb-2">4. User Responsibilities</h2>
                <p>Users are solely responsible for verifying property ownership, title documents, legal approvals, and any other details before completing a transaction. qkit does not verify the accuracy of listing information unless explicitly marked as "Verified".</p>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-lg text-slate-900 mb-2">5. Prohibited Content</h2>
                <p>You may not post listings that are discriminatory, fraudulent, duplicate, or that contain false pricing, fabricated approvals, or misleading photographs.</p>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-lg text-slate-900 mb-2">6. Payments</h2>
                <p>Premium listing fees are collected via Razorpay. All payments are final unless a refund is requested within 48 hours and the service has not been activated. Refund requests are processed at qkit's discretion.</p>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-lg text-slate-900 mb-2">7. Intellectual Property</h2>
                <p>The qkit brand, logo, design, and code are proprietary. Property photos uploaded by users remain their property. By uploading, you grant qkit a non-exclusive licence to display them on the Platform.</p>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-lg text-slate-900 mb-2">8. Limitation of Liability</h2>
                <p>qkit shall not be liable for any loss or damage arising from transactions conducted through the Platform, inaccurate listing information, or actions taken by other users.</p>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-lg text-slate-900 mb-2">9. Changes to Terms</h2>
                <p>qkit reserves the right to update these Terms at any time. Continued use of the Platform after changes constitutes acceptance.</p>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-lg text-slate-900 mb-2">10. Contact</h2>
                <p>For queries regarding these Terms, contact us at <a href="mailto:legal@qkit.in" className="text-brand-600 hover:underline">legal@qkit.in</a>.</p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
