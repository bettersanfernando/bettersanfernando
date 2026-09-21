import { ArrowDown, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { buildPageMetadata } from '../../lib/metadata';

export const metadata = buildPageMetadata({
  title: 'Site Index',
  description:
    'Browse BetterSanFernando’s published sections and public-information pages. Individual records remain accessible through their respective directories and collections.',
  path: '/sitemap',
});

interface SiteLink {
  href: string;
  label: string;
  description?: string;
}

interface SiteGroup {
  id: string;
  title: string;
  description: string;
  dense?: boolean;
  links: readonly SiteLink[];
}

const PRIMARY_DESTINATIONS = [
  {
    href: '/services',
    title: 'Services',
    description: 'Resident-facing public services and citizen charters.',
  },
  {
    href: '/projects',
    title: 'Projects',
    description: 'City infrastructure, procurements, and contracts.',
  },
  {
    href: '/government',
    title: 'Government',
    description: 'City leadership, departments, and contacts.',
  },
  {
    href: '/transparency',
    title: 'Transparency',
    description: 'Disclosure records, financial summaries, and data sources.',
  },
  {
    href: '/statistics',
    title: 'Statistics',
    description: 'Civic metrics, population figures, and demographics.',
  },
] as const;

const JUMP_LINKS = [
  { href: '#services', label: 'Services' },
  { href: '#projects-procurement', label: 'Projects & Procurement' },
  { href: '#government', label: 'Government' },
  { href: '#legislation', label: 'Legislation' },
  { href: '#transparency', label: 'Transparency' },
  { href: '#statistics', label: 'Statistics' },
  { href: '#about-site', label: 'About This Site' },
] as const;

const GROUPS: readonly SiteGroup[] = [
  {
    id: 'services',
    title: 'Services',
    description:
      'Find resident-facing public services and service directories.',
    links: [
      {
        href: '/services',
        label: 'Services',
        description:
          'Resident-facing directory of city services, procedures, and citizen charters.',
      },
    ],
  },
  {
    id: 'projects-procurement',
    title: 'Projects & Procurement',
    description:
      'Browse published projects, procurement records, evidence, contracts, and project-data guidance.',
    links: [
      {
        href: '/projects',
        label: 'Projects',
        description: 'City infrastructure and capital projects hub.',
      },
      {
        href: '/projects/city-projects',
        label: 'City Projects',
        description:
          'Searchable project directory with status and funding details.',
      },
      {
        href: '/projects/map',
        label: 'Project Distribution Map',
        description:
          'Project record distribution across San Fernando’s 35 barangays.',
      },
      {
        href: '/projects/sources',
        label: 'Project Sources',
        description:
          'Documentary evidence and official provenance for projects.',
      },
      {
        href: '/projects/methodology',
        label: 'Project Data Guide',
        description:
          'Methodology, lifecycle stages, and money field definitions.',
      },
      {
        href: '/procurement',
        label: 'Procurement',
        description: 'City procurement hub and bidding documentation.',
      },
      {
        href: '/procurement/bid-results',
        label: 'Bid Results',
        description:
          'Published PhilGEPS notices, abstract of bids, and awards.',
      },
      {
        href: '/procurement/contracts',
        label: 'Contracts and Awards',
        description:
          'Recorded contracts, notice to proceed, and supplier awards.',
      },
    ],
  },
  {
    id: 'government',
    title: 'Government',
    description:
      'Find published government offices, contact information, hotlines, barangay contacts, and official links.',
    links: [
      {
        href: '/government',
        label: 'Government',
        description:
          'City leadership, branches, and civic governance overview.',
      },
      {
        href: '/government/offices',
        label: 'City Offices',
        description:
          'Directory of city departments, divisions, and service units.',
      },
      {
        href: '/government/contact',
        label: 'Government Contact',
        description: 'Official contact points and inquiry channels.',
      },
      {
        href: '/government/hotlines',
        label: 'Emergency Hotlines',
        description:
          'Critical numbers for rescue, health, and emergency response.',
      },
      {
        href: '/government/barangay-contacts',
        label: 'Barangay Contacts',
        description:
          'Hall locations and official contacts for all 35 barangays.',
      },
      {
        href: '/government/links',
        label: 'Official Government Links',
        description:
          'Verified directory of national and regional government portals.',
      },
    ],
  },
  {
    id: 'legislation',
    title: 'Legislation',
    description:
      'Browse BetterSanFernando’s published Executive Order, Ordinance, and Resolution collections.',
    links: [
      {
        href: '/legislation',
        label: 'Legislation',
        description:
          'City council legislative records and mayoral issuances hub.',
      },
      {
        href: '/legislation/executive-orders',
        label: 'Executive Orders',
        description: 'Executive orders issued by the City Mayor.',
      },
      {
        href: '/legislation/ordinances',
        label: 'Ordinances',
        description: 'City council ordinances enacted into local law.',
      },
      {
        href: '/legislation/resolutions',
        label: 'Resolutions',
        description: 'Sangguniang Panlungsod official resolutions.',
      },
    ],
  },
  {
    id: 'transparency',
    title: 'Transparency',
    description:
      'Review disclosure records, source documentation, aggregate finance records, and BetterSanFernando’s publication process.',
    links: [
      {
        href: '/transparency',
        label: 'Transparency',
        description:
          'Civic disclosure, reporting standards, and publication portal.',
      },
      {
        href: '/transparency/sources',
        label: 'Data Sources',
        description: 'Inventory of official agencies and provenance sources.',
      },
      {
        href: '/transparency/methodology',
        label: 'How We Publish Data',
        description: 'Verification standards and data integrity principles.',
      },
      {
        href: '/transparency/documents',
        label: 'Official Documents',
        description: 'Repository of scanned public issuances and records.',
      },
      {
        href: '/transparency/full-disclosure',
        label: 'Full Disclosure Reports',
        description: 'DILG full disclosure portal compliance filings.',
      },
      {
        href: '/transparency/finance',
        label: 'City Finances',
        description: 'Aggregate revenue, budget allocations, and expenditures.',
      },
    ],
  },
  {
    id: 'statistics',
    title: 'Statistics',
    description:
      'Explore published statistical views built from BetterSanFernando’s bounded civic datasets.',
    dense: true,
    links: [
      {
        href: '/statistics',
        label: 'Statistics',
        description: 'Central statistical hub and civic data index.',
      },
      {
        href: '/statistics/city-profile',
        label: 'City Profile',
        description:
          'Verified baseline facts, geography, and governance profile.',
      },
      {
        href: '/statistics/population',
        label: 'Population Statistics',
        description:
          '2024 POPCEN population distribution across all 35 barangays.',
      },
      {
        href: '/statistics/demographics',
        label: 'Demographics',
        description:
          'Age distribution, household metrics, and demographic trends.',
      },
      {
        href: '/statistics/government',
        label: 'Government Statistics',
        description:
          'Directory composition, entity types, and verified relationships.',
      },
      {
        href: '/statistics/legislation',
        label: 'Legislation Statistics',
        description: 'Summary metrics of published legislative records.',
      },
      {
        href: '/statistics/public-records',
        label: 'Public Records Statistics',
        description: 'Public document availability and publication coverage.',
      },
      {
        href: '/statistics/projects',
        label: 'Project Statistics',
        description: 'Infrastructure projects by stage, category, and funding.',
      },
      {
        href: '/statistics/procurement',
        label: 'Procurement Statistics',
        description: 'Procurement methods, timeline metrics, and bid activity.',
      },
      {
        href: '/statistics/project-spending',
        label: 'Project Cost & Utilization',
        description: 'Cost comparisons and NTA utilization metrics.',
      },
      {
        href: '/barangays',
        label: 'Barangay Directory',
        description:
          'Searchable 35-barangay directory with PSGC codes and population.',
      },
    ],
  },
  {
    id: 'about-site',
    title: 'About This Site',
    description:
      'Learn about BetterSanFernando, accessibility, and site navigation.',
    links: [
      {
        href: '/about',
        label: 'About BetterSanFernando',
        description: 'Civic initiative mission, scope, and editorial policies.',
      },
      {
        href: '/accessibility',
        label: 'Accessibility',
        description: 'Commitment to accessible digital civic information.',
      },
    ],
  },
];

export default function SiteIndex() {
  return (
    <main className="flex-grow bg-white">
      {/* 1. EDITORIAL HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[{ label: 'Home', href: '/' }, { label: 'Site Index' }]}
          />

          <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <div className="max-w-3xl">
              <p className="text-eyebrow text-[#0066EB]">SITE DIRECTORY</p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.02em] text-gray-950 sm:text-4xl md:text-5xl">
                Site Index
              </h1>
              <p className="mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">
                Browse BetterSanFernando’s published sections and
                public-information pages. Individual records remain accessible
                through their respective directories and collections.
              </p>
            </div>

            {/* RIGHT-SIDE SCOPE MODULE */}
            <aside
              aria-label="About this index"
              className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                ABOUT THIS INDEX
              </p>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                This page lists BetterSanFernando’s major public routes for
                people and search engines. It complements the machine-readable
                XML sitemap.
              </p>

              <div className="mt-4 border-t border-gray-200/80 pt-3">
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC]"
                >
                  <span>View XML Sitemap</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 2. PRIMARY DESTINATIONS */}
      <section
        className="border-b border-gray-200 bg-white py-8 sm:py-10"
        aria-labelledby="primary-destinations-heading"
      >
        <div className="container mx-auto px-4">
          <p className="text-eyebrow text-[#0066EB]">START HERE</p>
          <h2
            id="primary-destinations-heading"
            className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
          >
            Primary Destinations
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PRIMARY_DESTINATIONS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 transition-colors hover:border-[#0066EB] hover:bg-[#F3F6FB]"
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-950 transition-colors group-hover:text-[#0066EB]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    {item.description}
                  </p>
                </div>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                  <span>Explore</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. JUMP TO SECTION */}
      <nav
        aria-label="In-page section directory"
        className="border-b border-gray-200 bg-white py-4 sm:py-5"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm">
            <span className="font-bold uppercase tracking-wider text-gray-400">
              Jump to:
            </span>
            {JUMP_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1 font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
              >
                <span>{link.label}</span>
                <ArrowDown
                  className="h-3 w-3 text-gray-400"
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* 4. FULL-WIDTH GROUPED DIRECTORY ROWS */}
      <section
        className="bg-white py-10 sm:py-12 lg:py-16"
        aria-labelledby="directory-groups-heading"
      >
        <div className="container mx-auto px-4">
          <h2 id="directory-groups-heading" className="sr-only">
            Directory Groups
          </h2>

          <div className="divide-y divide-gray-200 border-b border-t border-gray-200">
            {GROUPS.map(group => (
              <div
                key={group.id}
                id={group.id}
                className="scroll-mt-24 py-8 sm:py-10 lg:grid lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-12"
              >
                {/* Left Column (25-30%) */}
                <div className="mb-6 lg:mb-0">
                  <h3 className="text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl">
                    {group.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                    {group.description}
                  </p>
                </div>

                {/* Right Column (70-75%) */}
                <div>
                  <ul
                    className={`grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 ${
                      group.dense ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
                    }`}
                  >
                    {group.links.map(link => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="group -mx-2.5 block rounded-sm p-2.5 transition-colors hover:bg-[#F3F6FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                        >
                          <div className="flex items-center gap-1.5 text-sm font-bold text-[#0066EB] group-hover:text-[#0052BC]">
                            <span>{link.label}</span>
                            <ArrowRight
                              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </div>
                          {link.description && (
                            <p className="mt-1 text-xs leading-relaxed text-gray-600">
                              {link.description}
                            </p>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
