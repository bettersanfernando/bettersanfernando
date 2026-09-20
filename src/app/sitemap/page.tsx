import Link from 'next/link';
import { LayoutList } from 'lucide-react';
import Breadcrumbs from '../../components/ui/Breadcrumbs';

import { buildPageMetadata } from '../../lib/metadata';

export const metadata = buildPageMetadata({
  title: 'Site Index',
  description:
    'A full index of BetterSanFernando pages, grouped by section — Services, Projects, Government, Legislation, Transparency, and Statistics.',
  path: '/sitemap',
});

// Every canonical hub/leaf route from src/app/sitemap.ts's STATIC_ROUTES,
// grouped for human browsing. Dynamic leaves (service details, individual
// projects, individual offices) are reachable from their section's hub
// page rather than enumerated here — an HTML index links hubs, not every
// record, the same way the XML sitemap covers records without duplicating
// this page's job. /search is deliberately excluded (noindex — see
// src/app/search/page.tsx).
const groups: readonly {
  title: string;
  links: readonly { href: string; label: string }[];
}[] = [
  {
    title: 'Services',
    links: [{ href: '/services', label: 'Services' }],
  },
  {
    title: 'Projects & Procurement',
    links: [
      { href: '/projects', label: 'Projects' },
      { href: '/projects/city-projects', label: 'City Projects' },
      { href: '/projects/map', label: 'Project distribution by barangay' },
      { href: '/projects/sources', label: 'Project Sources' },
      { href: '/projects/methodology', label: 'Project Methodology' },
      { href: '/procurement', label: 'Procurement' },
      { href: '/procurement/bid-results', label: 'Bid Results' },
      { href: '/procurement/contracts', label: 'Contracts and Awards' },
    ],
  },
  {
    title: 'Government',
    links: [
      { href: '/government', label: 'Government' },
      { href: '/government/offices', label: 'City Offices' },
      { href: '/government/contact', label: 'Government Contact' },
      { href: '/government/hotlines', label: 'Emergency Hotlines' },
      { href: '/government/barangay-contacts', label: 'Barangay Contacts' },
      { href: '/government/links', label: 'Official Government Links' },
    ],
  },
  {
    title: 'Legislation',
    links: [
      { href: '/legislation', label: 'Legislation' },
      { href: '/legislation/executive-orders', label: 'Executive Orders' },
      { href: '/legislation/ordinances', label: 'Ordinances' },
      { href: '/legislation/resolutions', label: 'Resolutions' },
    ],
  },
  {
    title: 'Transparency',
    links: [
      { href: '/transparency', label: 'Transparency' },
      { href: '/transparency/sources', label: 'Transparency Sources' },
      { href: '/transparency/methodology', label: 'Transparency Methodology' },
      { href: '/transparency/documents', label: 'Official Documents' },
      {
        href: '/transparency/full-disclosure',
        label: 'Full Disclosure Reports',
      },
      { href: '/transparency/finance', label: 'City Finances' },
    ],
  },
  {
    title: 'Statistics',
    links: [
      { href: '/statistics', label: 'Statistics' },
      { href: '/statistics/city-profile', label: 'City profile' },
      { href: '/statistics/population', label: 'Population Statistics' },
      { href: '/statistics/demographics', label: 'Demographics' },
      { href: '/statistics/government', label: 'Government Statistics' },
      { href: '/statistics/legislation', label: 'Legislation Statistics' },
      {
        href: '/statistics/public-records',
        label: 'Public Records Statistics',
      },
      { href: '/statistics/projects', label: 'Project Statistics' },
      { href: '/statistics/procurement', label: 'Procurement Statistics' },
      {
        href: '/statistics/project-spending',
        label: 'Project Cost & Utilization',
      },
      { href: '/barangays', label: 'Barangay directory' },
    ],
  },
  {
    title: 'About this site',
    links: [
      { href: '/about', label: 'About BetterSanFernando' },
      { href: '/accessibility', label: 'Accessibility' },
    ],
  },
];

export default function SiteIndex() {
  return (
    <main className="flex-grow bg-gray-50">
      <section className="border-b border-primary-100 bg-white">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <Breadcrumbs
            className="mb-8"
            items={[{ label: 'Home', href: '/' }, { label: 'Site Index' }]}
          />
          <header className="max-w-3xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
              <LayoutList className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
              Site index
            </h1>
            <p className="mt-4 max-w-[68ch] text-base leading-relaxed text-gray-700 md:text-lg">
              Every published BetterSanFernando section, grouped for quick
              browsing. Individual service, project, and office records are
              reachable from their section page below.
            </p>
          </header>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map(group => (
            <div key={group.title}>
              <h2 className="text-lg font-bold text-gray-900">{group.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {group.links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
