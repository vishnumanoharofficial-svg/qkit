import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = { title: 'Privacy Policy | qkit' };

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-12">
        <div className="container-qkit max-w-3xl">
          <div className="card p-8 md:p-12">
            <h1 className="font-heading font-bold text-3xl text-slate-900 mb-2">Privacy Policy</h1>
            <p className="text-slate-400 text-sm mb-8">Last updated: October 2026</p>

            <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
              <section>
                <h2 className="font-heading font-semibold text-lg text-slate-900 mb-2">1. Information We Collect</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Account data:</strong> Phone number, name, email (optional).</li>
                  <li><strong>Listing data:</strong> Property details, photos, and location you provide.</li>
                  <li><strong>Usage data:</strong> Pages visited, search queries, device and browser info.</li>
                  <li><strong>Payment data:</strong> Processed securely by Razorpay. qkit does not store card details.</li>
                </ul>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-lg text-slate-900 mb-2">2. How We Use Your Information</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li>To create and manage your account.</li>
                  <li>To display your property listings to prospective buyers or tenants.</li>
                  <li>To send OTP for authentication (we do not send marketing SMS without consent).</li>
                  <li>To improve the Platform through aggregated analytics.</li>
                  <li>To comply with legal obligations.</li>
                </ul>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-lg text-slate-900 mb-2">3. Phone Number Privacy</h2>
                <p>Your phone number is masked in public listings (e.g. +91 98XXX X2345). The full number is only revealed when a buyer actively clicks "Contact". You may request full removal at any time.</p>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-lg text-slate-900 mb-2">4. Data Sharing</h2>
                <p>We do not sell your personal data. We share data only with:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Supabase (database and auth infrastructure).</li>
                  <li>Razorpay (payment processing).</li>
                  <li>MSG91 (OTP delivery).</li>
                  <li>Law enforcement when required by applicable Indian law.</li>
                </ul>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-lg text-slate-900 mb-2">5. Data Retention</h2>
                <p>Account data is retained while your account is active. Closed listings are archived for 12 months for dispute resolution. You may request full deletion of your account and data by contacting us.</p>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-lg text-slate-900 mb-2">6. Cookies</h2>
                <p>We use essential cookies for authentication sessions. No third-party tracking or advertising cookies are used.</p>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-lg text-slate-900 mb-2">7. Your Rights</h2>
                <p>Under applicable data protection law, you have the right to access, correct, or delete your personal data. Contact <a href="mailto:privacy@qkit.in" className="text-brand-600 hover:underline">privacy@qkit.in</a> to exercise these rights.</p>
              </section>

              <section>
                <h2 className="font-heading font-semibold text-lg text-slate-900 mb-2">8. Contact</h2>
                <p>For privacy concerns: <a href="mailto:privacy@qkit.in" className="text-brand-600 hover:underline">privacy@qkit.in</a></p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
