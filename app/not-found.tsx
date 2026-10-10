import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center py-20 px-4 bg-slate-50">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">🏚️</div>
          <h1 className="font-heading font-bold text-3xl text-slate-900 mb-3">Page Not Found</h1>
          <p className="text-slate-500 mb-8">The property or page you're looking for doesn't exist or may have been removed.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/" className="btn-primary btn-lg">Go Home</Link>
            <Link href="/properties" className="btn-secondary btn-lg">Browse Properties</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
