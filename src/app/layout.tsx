import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import '../fonts.css';
import '../index.css';
import Providers from './providers';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ScrollToTop from '../components/ui/ScrollToTop';
import { getRootMetadata } from '../lib/metadata';
import { OrganizationWebSiteJsonLd } from '../lib/json-ld';
import { isLanguage } from '../i18n/locale';

export async function generateMetadata() {
  const locale = (await headers()).get('x-bsf-locale');
  return getRootMetadata(
    isLanguage(locale ?? undefined) ? (locale as 'en' | 'fil') : 'en'
  );
}

// Same shell composition and order as src/App.tsx's
// <div className="min-h-screen flex flex-col"><Navbar/><ScrollToTop/>
// {routes}<Footer/></div>, minus HelmetProvider (react-helmet-async has no
// role once Next's own Metadata API takes over in Batch 6) and react-router's
// Router/Routes (this batch ports the shell only, not page routes).
export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const locale = (await headers()).get('x-bsf-locale');
  const language = isLanguage(locale ?? undefined)
    ? (locale as 'en' | 'fil')
    : 'en';

  return (
    <html lang={language}>
      <body>
        <OrganizationWebSiteJsonLd />
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
