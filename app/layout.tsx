import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'qkit — Real Estate in Kottayam District, Kerala',
    template: '%s | qkit Real Estate',
  },
  description:
    "Kottayam District's trusted real estate marketplace. Buy, sell, rent and lease residential, commercial, agricultural and industrial properties in Kottayam, Kerala.",
  keywords: ['real estate Kottayam', 'property for sale Kottayam', 'property for rent Kottayam', 'Kerala real estate', 'qkit', 'Changanassery', 'Pala', 'Ettumanoor'],
  authors: [{ name: 'qkit' }],
  creator: 'qkit',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'qkit',
    title: 'qkit — Real Estate in Kottayam District, Kerala',
    description: "Kottayam's trusted real estate marketplace — buy, sell, rent & lease properties.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563eb',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
