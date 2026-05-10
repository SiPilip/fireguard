import type { Metadata, Viewport } from 'next';
import { Poppins, Roboto } from 'next/font/google';
import './globals.css';

export const dynamic = 'force-dynamic';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.fireguard-palembang.my.id'),
  title: {
    default: 'FireGuard Plaju Darat, Palembang - Sistem Cepat Tanggap Kebakaran',
    template: '%s | FireGuard Palembang'
  },
  description: 'FireGuard adalah sistem peringatan dini dan pelaporan kebakaran real-time untuk wilayah Plaju Darat, Palembang. Lindungi lingkungan Anda dengan respon cepat dan akurat.',
  applicationName: 'FireGuard Palembang',
  authors: [{ name: 'FireGuard Team', url: 'https://www.fireguard-palembang.my.id' }],
  generator: 'Next.js',
  keywords: ['kebakaran', 'palembang', 'emergency', 'fire', 'report', 'pemadam', 'plaju', 'darurat', 'tanggap darurat', 'pemadam kebakaran palembang'],
  referrer: 'origin-when-cross-origin',
  creator: 'FireGuard Team',
  publisher: 'FireGuard Plaju Darat',
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  manifest: '/manifest.json', // Basic manifest for SEO/icons
  openGraph: {
    title: 'FireGuard Plaju Darat, Palembang',
    description: 'Sistem Cepat Tanggap Kebakaran Plaju Darat, Palembang - Laporkan insiden secara instan.',
    url: 'https://www.fireguard-palembang.my.id',
    siteName: 'FireGuard',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FireGuard Plaju Darat, Palembang',
    description: 'Sistem Cepat Tanggap Kebakaran Real-time untuk wilayah Plaju.',
    creator: '@fireguard_id', // Placeholder
  },
  alternates: {
    canonical: '/',
  },
  category: 'emergency service',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#ef4444',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>

        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
      </head>
      <body className={`${poppins.variable} ${roboto.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
