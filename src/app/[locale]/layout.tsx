import type { ReactNode } from 'react';
import '../../fonts.css';
import '../../index.css';
import Providers from './providers';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ScrollToTop from '../../components/ui/ScrollToTop';
import { getRootMetadata } from '../../lib/metadata';
import { OrganizationWebSiteJsonLd } from '../../lib/json-ld';
import { getLocale } from '../../i18n/server';

export async function generateMetadata() {
  return getRootMetadata(await getLocale());
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fil' }];
}

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
