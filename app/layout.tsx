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
  keywords: [
    'real estate Kottayam', 'property for sale Kottayam', 'property for rent Kottayam',
    'Kerala real estate', 'qkit', 'house for sale Kottayam', 'house for rent Kottayam',
    'residential plots Kottayam', 'commercial property Kottayam',
    'Changanassery', 'Pala', 'Ettumanoor', 'Vaikom', 'Kanjirappally',
  ],
  authors: [{ name: 'qkit' }],
  creator: 'qkit',
  publisher: 'qkit',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.qyukit.in'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [{ url: '/favicon-q.jpg', type: 'image/jpeg' }],
    apple: [{ url: '/favicon-q.jpg', type: 'image/jpeg' }],
    shortcut: '/favicon-q.jpg',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: 'qkit Real Estate',
    title: 'qkit — Real Estate in Kottayam District, Kerala',
    description: "Kottayam's trusted real estate marketplace — buy, sell, rent & lease properties.",
    images: [{ url: '/favicon-q.jpg', width: 1024, height: 1024, alt: 'qkit Real Estate' }],
  },
  twitter: {
    card: 'summary',
    title: 'qkit — Real Estate in Kottayam District, Kerala',
    description: "Kottayam's trusted real estate marketplace — buy, sell, rent & lease properties.",
    images: ['/favicon-q.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
