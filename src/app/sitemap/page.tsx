import { ArrowDown, ArrowRight, ExternalLink } from 'lucide-react';
import Link from '../../components/i18n/LocaleLink';

import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { buildPageMetadata } from '../../lib/metadata';
import { getPageT, type PageT } from '../../i18n/server';

export async function generateMetadata() {
  const { t, locale } = await getPageT('sitemap');
  return buildPageMetadata({
    title: t('Site Index'),
    description: t(
      'Browse BetterSanFernando’s published sections and public-information pages. Individual records remain accessible through their respective directories and collections.'
    ),
    path: '/sitemap',
    locale,
  });
}

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

const PRIMARY_DESTINATIONS = (t: PageT) =>
  [
    {
      href: '/services',
      title: t('Services'),
      description: t('Resident-facing public services and citizen charters.'),
    },
    {
      href: '/projects',
      title: t('Projects'),
      description: t('City infrastructure, procurements, and contracts.'),
    },
    {
      href: '/government',
      title: t('Government'),
      description: t('City leadership, departments, and contacts.'),
    },
    {
      href: '/transparency',
      title: t('Transparency'),
      description: t(
        'Disclosure records, financial summaries, and data sources.'
      ),
    },
    {
      href: '/statistics',
      title: t('Statistics'),
      description: t('Civic metrics, population figures, and demographics.'),
    },
  ] as const;

const JUMP_LINKS = (t: PageT) =>
  [
    { href: '#services', label: t('Services') },
    { href: '#projects-procurement', label: t('Projects & Procurement') },
    { href: '#government', label: t('Government') },
    { href: '#legislation', label: t('Legislation') },
    { href: '#transparency', label: t('Transparency') },
    { href: '#statistics', label: t('Statistics') },
    { href: '#about-site', label: t('About This Site') },
  ] as const;

const GROUPS = (t: PageT): readonly SiteGroup[] => [
  {
    id: 'services',
    title: t('Services'),
    description: t(
      'Find resident-facing public services and service directories.'
    ),
    links: [
      {
        href: '/services',
        label: t('Services'),
        description: t(
          'Resident-facing directory of city services, procedures, and citizen charters.'
        ),
      },
    ],
  },
  {
    id: 'projects-procurement',
    title: t('Projects & Procurement'),
    description: t(
      'Browse published projects, procurement records, evidence, contracts, and project-data guidance.'
    ),
    links: [
      {
        href: '/projects',
        label: t('Projects'),
        description: t('City infrastructure and capital projects hub.'),
      },
      {
        href: '/projects/city-projects',
        label: t('City Projects'),
        description: t(
          'Searchable project directory with status and funding details.'
        ),
      },
      {
        href: '/projects/map',
        label: t('Project Distribution Map'),
        description: t(
          'Project record distribution across San Fernando’s 35 barangays.'
        ),
      },
      {
        href: '/projects/sources',
        label: t('Project Sources'),
        description: t(
          'Documentary evidence and official provenance for projects.'
        ),
      },
      {
        href: '/projects/methodology',
        label: t('Project Data Guide'),
        description: t(
          'Methodology, lifecycle stages, and money field definitions.'
        ),
      },
      {
        href: '/procurement',
        label: t('Procurement'),
        description: t('City procurement hub and bidding documentation.'),
      },
      {
        href: '/procurement/bid-results',
        label: t('Bid Results'),
        description: t(
          'Published PhilGEPS notices, abstract of bids, and awards.'
        ),
      },
      {
        href: '/procurement/contracts',
        label: t('Contracts and Awards'),
        description: t(
          'Recorded contracts, notice to proceed, and supplier awards.'
        ),
      },
    ],
  },
  {
    id: 'government',
    title: t('Government'),
    description: t(
      'Find published government offices, contact information, hotlines, barangay contacts, and official links.'
    ),
    links: [
      {
        href: '/government',
        label: t('Government'),
        description: t(
          'City leadership, branches, and civic governance overview.'
        ),
      },
      {
        href: '/government/offices',
        label: t('City Offices'),
        description: t(
          'Directory of city departments, divisions, and service units.'
        ),
      },
      {
        href: '/government/contact',
        label: t('Government Contact'),
        description: t('Official contact points and inquiry channels.'),
      },
      {
        href: '/government/hotlines',
        label: t('Emergency Hotlines'),
        description: t(
          'Critical numbers for rescue, health, and emergency response.'
        ),
      },
      {
        href: '/government/barangay-contacts',
        label: t('Barangay Contacts'),
        description: t(
          'Hall locations and official contacts for all 35 barangays.'
        ),
      },
      {
        href: '/government/links',
        label: t('Official Government Links'),
        description: t(
          'Verified directory of national and regional government portals.'
        ),
      },
    ],
  },
  {
    id: 'legislation',
    title: t('Legislation'),
    description: t(
      'Browse BetterSanFernando’s published Executive Order, Ordinance, and Resolution collections.'
    ),
    links: [
      {
        href: '/legislation',
        label: t('Legislation'),
        description: t(
          'City council legislative records and mayoral issuances hub.'
        ),
      },
      {
        href: '/legislation/executive-orders',
        label: t('Executive Orders'),
        description: t('Executive orders issued by the City Mayor.'),
      },
      {
        href: '/legislation/ordinances',
        label: t('Ordinances'),
        description: t('City council ordinances enacted into local law.'),
      },
      {
        href: '/legislation/resolutions',
        label: t('Resolutions'),
        description: t('Sangguniang Panlungsod official resolutions.'),
      },
    ],
  },
  {
    id: 'transparency',
    title: t('Transparency'),
    description: t(
      'Review disclosure records, source documentation, aggregate finance records, and BetterSanFernando’s publication process.'
    ),
    links: [
      {
        href: '/transparency',
        label: t('Transparency'),
        description: t(
          'Civic disclosure, reporting standards, and publication portal.'
        ),
      },
      {
        href: '/transparency/sources',
        label: t('Data Sources'),
        description: t(
          'Inventory of official agencies and provenance sources.'
        ),
      },
      {
        href: '/transparency/methodology',
        label: t('How We Publish Data'),
        description: t('Verification standards and data integrity principles.'),
      },
      {
        href: '/transparency/documents',
        label: t('Official Documents'),
        description: t('Repository of scanned public issuances and records.'),
      },
      {
        href: '/transparency/full-disclosure',
        label: t('Full Disclosure Reports'),
        description: t('DILG full disclosure portal compliance filings.'),
      },
      {
        href: '/transparency/finance',
        label: t('City Finances'),
        description: t(
          'Aggregate revenue, budget allocations, and expenditures.'
        ),
      },
    ],
  },
  {
    id: 'statistics',
    title: t('Statistics'),
    description: t(
      'Explore published statistical views built from BetterSanFernando’s bounded civic datasets.'
    ),
    dense: true,
    links: [
      {
        href: '/statistics',
        label: t('Statistics'),
        description: t('Central statistical hub and civic data index.'),
      },
      {
        href: '/statistics/city-profile',
        label: t('City Profile'),
        description: t(
          'Verified baseline facts, geography, and governance profile.'
        ),
      },
      {
        href: '/statistics/population',
        label: t('Population Statistics'),
        description: t(
          '2024 POPCEN population distribution across all 35 barangays.'
        ),
      },
      {
        href: '/statistics/demographics',
        label: t('Demographics'),
        description: t(
          'Age distribution, household metrics, and demographic trends.'
        ),
      },
      {
        href: '/statistics/government',
        label: t('Government Statistics'),
        description: t(
          'Directory composition, entity types, and verified relationships.'
        ),
      },
      {
        href: '/statistics/legislation',
        label: t('Legislation Statistics'),
        description: t('Summary metrics of published legislative records.'),
      },
      {
        href: '/statistics/public-records',
        label: t('Public Records Statistics'),
        description: t(
          'Public document availability and publication coverage.'
        ),
      },
      {
        href: '/statistics/projects',
        label: t('Project Statistics'),
        description: t(
          'Infrastructure projects by stage, category, and funding.'
        ),
      },
      {
        href: '/statistics/procurement',
        label: t('Procurement Statistics'),
        description: t(
          'Procurement methods, timeline metrics, and bid activity.'
        ),
      },
      {
        href: '/statistics/project-spending',
        label: t('Project Cost & Utilization'),
        description: t('Cost comparisons and NTA utilization metrics.'),
      },
      {
        href: '/barangays',
        label: t('Barangay Directory'),
        description: t(
          'Searchable 35-barangay directory with PSGC codes and population.'
        ),
      },
    ],
  },
  {
    id: 'about-site',
    title: t('About This Site'),
    description: t(
      'Learn about BetterSanFernando, accessibility, and site navigation.'
    ),
    links: [
      {
        href: '/about',
        label: t('About BetterSanFernando'),
        description: t(
          'Civic initiative mission, scope, and editorial policies.'
        ),
      },
      {
        href: '/accessibility',
        label: t('Accessibility'),
        description: t('Commitment to accessible digital civic information.'),
      },
    ],
  },
];

export default async function SiteIndex() {
  const { t } = await getPageT('sitemap');
  return (
    <main className="flex-grow bg-white">
      {/* 1. EDITORIAL HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[
              { label: t('Home'), href: '/' },
              { label: t('Site Index') },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <div className="max-w-3xl">
              <p className="text-eyebrow text-[#0066EB]">
                {t('SITE DIRECTORY')}
              </p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.02em] text-gray-950 sm:text-4xl md:text-5xl">
                {t('Site Index')}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">
                {t(
                  'Browse BetterSanFernando’s published sections and public-information pages. Individual records remain accessible through their respective directories and collections.'
                )}
              </p>
            </div>

            {/* RIGHT-SIDE SCOPE MODULE */}
            <aside
              aria-label={t('About this index')}
              className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('ABOUT THIS INDEX')}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                {t(
                  'This page lists BetterSanFernando’s major public routes for people and search engines. It complements the machine-readable XML sitemap.'
                )}
              </p>

              <div className="mt-4 border-t border-gray-200/80 pt-3">
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC]"
                >
                  <span>{t('View XML Sitemap')}</span>
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
          <p className="text-eyebrow text-[#0066EB]">{t('START HERE')}</p>
          <h2
            id="primary-destinations-heading"
            className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
          >
            {t('Primary Destinations')}
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PRIMARY_DESTINATIONS(t).map(item => (
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
                  <span>{t('Explore')}</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. JUMP TO SECTION */}
      <nav
        aria-label={t('In-page section directory')}
        className="border-b border-gray-200 bg-white py-4 sm:py-5"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm">
            <span className="font-bold uppercase tracking-wider text-gray-400">
              {t('Jump to:')}
            </span>
            {JUMP_LINKS(t).map(link => (
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
            {t('Directory Groups')}
          </h2>

          <div className="divide-y divide-gray-200 border-b border-t border-gray-200">
            {GROUPS(t).map(group => (
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
