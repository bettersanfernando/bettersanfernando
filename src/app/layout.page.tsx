import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../fonts.css';
import '../index.css';
import Providers from './providers';
import Navbar from '../components/layout/Navbar.next';
import Footer from '../components/layout/Footer.next';
import ScrollToTop from '../components/ui/ScrollToTop.next';

// Batch 6 owns real metadata (canonical URLs, OG tags, metadataBase). This
// placeholder only satisfies the App Router's required `metadata` export.
export const metadata: Metadata = {
  title: 'BetterSanFernando — Next.js migration foundation',
};

// Same shell composition and order as src/App.tsx's
// <div className="min-h-screen flex flex-col"><Navbar/><ScrollToTop/>
// {routes}<Footer/></div>, minus HelmetProvider (react-helmet-async has no
// role once Next's own Metadata API takes over in Batch 6) and react-router's
// Router/Routes (this batch ports the shell only, not page routes).
export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <ScrollToTop />
            {children}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
