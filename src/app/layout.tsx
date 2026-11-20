import type { Metadata } from 'next';
import './globals.css';
import { LiteModeProvider } from '@/context/LiteModeContext';
import { Header } from '@/components/layout/Header';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://delsublog.ng'),
  title: {
    default: 'Delsu Abraka Blog | Delsu Abraka Update Blog TV',
    template: '%s | Delsu Abraka Blog',
  },
  description:
    'Delta State University (DELSU Abraka) premier digital media outlet and newsroom. Verified Senate updates, campus admissions, SUG gist, and breaking Nigerian news in tech, entertainment, business, and sports.',
  keywords: [
    'DELSU',
    'Delta State University',
    'Abraka',
    'DELSU Abraka Blog',
    'Delsu Abraka Update Blog TV',
    'DELSU News',
    'Nigeria News',
    'TechCabal',
    'Zikoko',
    'Afrobeats',
    'Super Eagles',
    'Japa Nigeria',
    'Lagos Fintech',
  ],
  authors: [{ name: 'DELSU Editorial Desk' }],
  creator: 'Delsu Abraka Update Blog TV',
  publisher: 'Delsu Abraka Digital Media',
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://delsublog.ng',
    siteName: 'Delsu Abraka Blog TV',
    title: 'Delsu Abraka Blog | Premier Delta State University & Naija Media',
    description:
      'Verified campus Senate updates, admissions gist, student lifestyle, and breaking Nigerian news.',
    images: [
      {
        url: '/logo.jpg',
        width: 800,
        height: 600,
        alt: 'Delsu Abraka Update Blog TV',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Delsu Abraka Blog TV',
    description:
      'Verified Delta State University Abraka news, student updates, and Nigerian current affairs.',
    images: ['/logo.jpg'],
    creator: '@DelsuAbrakaBlog',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-white text-zinc-900 antialiased selection:bg-red-100 selection:text-red-800">
        <LiteModeProvider>
          {/* Top Bar with Breaking Ticker, WAT Clock, and Lite Mode toggle */}
          <Header />
          
          {/* Sticky Navigation Bar */}
          <Navbar />

          {/* Main Content Viewport */}
          <main className="flex-1">
            {children}
          </main>

          {/* Global Footer */}
          <Footer />
        </LiteModeProvider>
      </body>
    </html>
  );
}
