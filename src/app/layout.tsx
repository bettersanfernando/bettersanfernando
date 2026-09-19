import type { ReactNode } from 'react';
import '../fonts.css';
import '../index.css';
import Providers from './providers';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ScrollToTop from '../components/ui/ScrollToTop';
import { getRootMetadata } from '../lib/metadata';
import { WebSiteJsonLd } from '../lib/json-ld';

export const metadata = getRootMetadata();

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
        <WebSiteJsonLd />
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
