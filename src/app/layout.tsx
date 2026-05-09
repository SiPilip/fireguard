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
  title: 'FireGuard Plaju Darat, Palembang',
  description: 'Sistem Cepat Tanggap Kebakaran Plaju Darat, Palembang - Laporkan dan  pantau insiden kebakaran secara real-time',
  icons: {
    icon: '/favicon.png',
  },
  applicationName: 'FireGuard Plaju Darat, Palembang',
  keywords: ['kebakaran', 'palembang', 'emergency', 'fire', 'report', 'pemadam'],
  authors: [{ name: 'FireGuard Team' }],
  creator: 'FireGuard Team',
  publisher: 'FireGuard Plaju Darat, Palembang',
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    title: 'FireGuard Plaju Darat, Palembang',
    description: 'Sistem Cepat Tanggap Kebakaran Plaju Darat, Palembang',
    type: 'website',
    locale: 'id_ID',
    siteName: 'FireGuard Plaju Darat, Palembang',
  },
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
