import type { ReactNode } from 'react';
import '../fonts.css';
import '../index.css';
import Providers from './providers';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ScrollToTop from '../components/ui/ScrollToTop';
import { getRootMetadata } from '../lib/metadata';
import { OrganizationWebSiteJsonLd } from '../lib/json-ld';
import { getLocale } from '../i18n/server';

export async function generateMetadata() {
  return getRootMetadata(await getLocale());
}

// Same shell composition and order as src/App.tsx's
// <div className="min-h-screen flex flex-col"><Navbar/><ScrollToTop/>
// {routes}<Footer/></div>, minus HelmetProvider (react-helmet-async has no
// role once Next's own Metadata API takes over in Batch 6) and react-router's
// Router/Routes (this batch ports the shell only, not page routes).
export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const language = await getLocale();

  return (
    <html lang={language}>
      <body>
        <OrganizationWebSiteJsonLd locale={language} />
        <Providers locale={language}>
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
