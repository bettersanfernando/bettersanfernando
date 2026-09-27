import { redirect } from 'next/navigation';
import Link from '../../components/i18n/LocaleLink';
import {
  ArrowUpRight,
  Building2,
  ChevronRight,
  ShieldCheck,
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react';

import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { getAllProjectEvidence, getProjects } from '../../data/civic/projects';
import { localizeHref } from '../../i18n/locale';
import { getLocale } from '../../i18n/server';
import { buildPageMetadata } from '../../lib/metadata';
import ProjectSearchInput, {
  MobileProjectSearchResults,
  ProjectSearchProvider,
} from './project-search';
import { getPageT, type PageT } from '../../i18n/server';

export async function generateMetadata() {
  const { t, locale } = await getPageT('projects');
  return buildPageMetadata({
    title: t('Projects'),
    description: t(
      "Explore BetterSanFernando's Projects hub: browse verified City projects, the project map, spending, procurement records, and the evidence and methodology behind them."
    ),
    path: '/projects',
    locale,
  });
}

// Query parameters that only ever meant something on the former /projects
// listing (moved to /projects/city-projects). A bookmarked or shared
// `/projects?status=...` URL should keep working rather than silently
// landing on the hub with its filters dropped.
const LEGACY_LISTING_PARAMS = ['q', 'status', 'barangay', 'category'] as const;

const projectCount = getProjects().length;
const evidenceCount = getAllProjectEvidence().length;

// The shared `text-eyebrow` utility (src/index.css) sets a fairly wide
// 0.18em tracking used site-wide; tighten it locally here, matching the
// override already used on /government and /transparency.
const eyebrowTracking = { letterSpacing: '0.08em' } as const;

interface HubDestination {
  title: string;
  href: string;
  description: string;
}

interface HubGroup {
  title: string;
  blurb: string;
  icon: LucideIcon;
  destinations: HubDestination[];
}

const cityProjectsGroup = (t: PageT): HubGroup => ({
  title: t('City Projects'),
  blurb: t(
    'The primary inventory of sourced infrastructure and public-works projects.'
  ),
  icon: Building2,
  destinations: [
    {
      title: t('Browse City Projects'),
      href: '/projects/city-projects',
      description: t('Search and review sourced project records.'),
    },
    {
      title: t('Project Map'),
      href: '/projects/map',
      description: t('Explore projects geographically across San Fernando.'),
    },
    {
      title: t('Project Spending'),
      href: '/statistics/project-spending',
      description: t(
        'Review verified project cost and utilization information.'
      ),
    },
  ],
});

const supportingGroups = (t: PageT): HubGroup[] => [
  {
    title: t('Procurement'),
    blurb: t('Bid, award, and contract records connected to City projects.'),
    icon: ShoppingCart,
    destinations: [
      {
        title: t('Procurement Overview'),
        href: '/procurement',
        description: t('See how procurement records connect to city projects.'),
      },
      {
        title: t('Bid Results'),
        href: '/procurement/bid-results',
        description: t('Review published procurement bid-result records.'),
      },
      {
        title: t('Contracts & Awards'),
        href: '/procurement/contracts',
        description: t('Explore available contract and award records.'),
      },
      {
        title: t('Procurement Statistics'),
        href: '/statistics/procurement',
        description: t('Explore patterns in procurement and award records.'),
      },
    ],
  },
  {
    title: t('Evidence & Insights'),
    blurb: t('Statistics, sources, and methodology behind the published data.'),
    icon: ShieldCheck,
    destinations: [
      {
        title: t('Project Statistics'),
        href: '/statistics/projects',
        description: t('Explore patterns in verified city project data.'),
      },
      {
        title: t('Evidence & Sources'),
        href: '/projects/sources',
        description: t(
          'Review the records and evidence supporting project information.'
        ),
      },
      {
        title: t('Project Methodology'),
        href: '/projects/methodology',
        description: t('Learn how project records are structured and checked.'),
      },
    ],
  },
];

const discoveryLinks = (t: PageT): HubDestination[] => [
  {
    title: t('Browse City Projects'),
    href: '/projects/city-projects',
    description: t('Search and review sourced project records.'),
  },
  {
    title: t('Project Map'),
    href: '/projects/map',
    description: t('Explore projects geographically across San Fernando.'),
  },
];

export default async function ProjectsHubPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { t } = await getPageT('projects');
  const cityGroup = cityProjectsGroup(t);
  const CityProjectsIcon = cityGroup.icon;
  const params = await searchParams;

  if (LEGACY_LISTING_PARAMS.some(key => params[key] !== undefined)) {
    const query = new URLSearchParams();
    for (const key of LEGACY_LISTING_PARAMS) {
      const value = params[key];
      if (typeof value === 'string') query.set(key, value);
    }
    redirect(
      localizeHref(
        `/projects/city-projects?${query.toString()}`,
        await getLocale()
      )
    );
  }

  return (
    <main className="bg-white pb-16 md:pb-24">
      <ProjectSearchProvider>
        {/* Editorial page header — white canvas, breadcrumb inline above the intro */}
        <section className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-14">
            <Breadcrumbs
              className="text-xs text-gray-500"
              items={[
                { label: t('Home'), href: '/' },
                { label: t('Projects') },
              ]}
            />

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_32rem] lg:items-start lg:gap-12">
              <div className="max-w-2xl">
                <p
                  className="text-eyebrow text-[#0066EB]"
                  style={eyebrowTracking}
                >
                  {t('Projects')}
                </p>

                <h1 className="mt-3 text-3xl font-extrabold text-display text-gray-950 sm:text-4xl lg:text-5xl">
                  {t('Explore City projects and public works.')}
                </h1>

                <p className="mt-4 text-lg font-medium leading-7 text-gray-800 sm:text-xl">
                  {t(
                    'Browse sourced project records, explore projects by location, review procurement information, and trace the evidence behind each record.'
                  )}
                </p>

                <p className="mt-3 text-base leading-7 text-gray-600 md:text-[17px]">
                  {t(
                    'BetterSanFernando is independent and community-run; every record links back to the public evidence behind it.'
                  )}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-600">
                  <span>{t('{{n}} project records', { n: projectCount })}</span>
                  <span>
                    {t('{{n}} evidence records', { n: evidenceCount })}
                  </span>
                  <span>{t('Official-source data')}</span>
                </div>
              </div>

              {/* Right-side discovery module — pale blue-gray feature panel, sharp, no shadow */}
              <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
                <h2 className="text-sm font-bold text-gray-950">
                  {t('Find a project')}
                </h2>

                <div className="mt-3">
                  <ProjectSearchInput />
                </div>

                <div className="mt-4 divide-y divide-gray-200/80 border-t border-gray-200/80">
                  {discoveryLinks(t).map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group -mx-2 flex items-center justify-between gap-3 rounded-sm px-2 py-3 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066EB]"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-gray-950">
                          {link.title}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-gray-600">
                          {link.description}
                        </span>
                      </span>
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-gray-400 transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0066EB] group-focus-visible:text-[#0066EB]"
                        aria-hidden="true"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <MobileProjectSearchResults />
      </ProjectSearchProvider>

      <div className="container mx-auto space-y-8 px-4 py-8 sm:space-y-12 sm:py-12 lg:space-y-20 lg:py-20">
        {/* Main directory */}
        <section aria-labelledby="projects-hub-heading">
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            {t('Explore Projects')}
          </p>

          <h2
            id="projects-hub-heading"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
          >
            {t('Project Information & Transparency')}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            {t(
              'Browse City projects, procurement records, project spending, statistics, and supporting evidence.'
            )}
          </p>

          {/* City Projects — the main feature group: pale blue-gray, sharp, no shadow */}
          <div className="mt-7 rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6 lg:p-7">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-10">
              <div className="flex items-start gap-2.5">
                <CityProjectsIcon
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#0066EB]"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-950">
                    {cityGroup.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {cityGroup.blurb}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {cityGroup.destinations.map(destination => (
                  <Link
                    key={destination.href}
                    href={destination.href}
                    className="group flex items-center justify-between gap-3 rounded-sm border border-gray-200 bg-white px-4 py-3 transition-colors hover:border-[#0066EB]/40 hover:bg-[#0066EB]/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-gray-950">
                        {destination.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-gray-600">
                        {destination.description}
                      </span>
                    </span>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 text-gray-400 transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0066EB] group-focus-visible:text-[#0066EB]"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Procurement + Evidence & Insights — sharp bordered sections, unequal row counts allowed to size naturally */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
            {supportingGroups(t).map(group => (
              <div
                key={group.title}
                className="overflow-hidden rounded-sm border border-gray-200 bg-white"
              >
                <div className="flex items-start gap-2.5 border-b border-gray-200 px-5 py-4">
                  <group.icon
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#0066EB]"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-base font-bold text-gray-950">
                      {group.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-600">
                      {group.blurb}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {group.destinations.map(destination => (
                    <Link
                      key={destination.href}
                      href={destination.href}
                      className="group flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-[#F3F6FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066EB]"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-gray-950">
                          {destination.title}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-gray-600">
                          {destination.description}
                        </span>
                      </span>
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-gray-400 transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-[#0066EB] group-focus-visible:text-[#0066EB]"
                        aria-hidden="true"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Data Provenance — open editorial section, no outer card */}
        <section
          aria-labelledby="projects-provenance-heading"
          className="border-t border-gray-200 pt-8 sm:pt-9 lg:pt-10"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            <div className="max-w-xl">
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                {t('Data Provenance')}
              </p>

              <h2
                id="projects-provenance-heading"
                className="mt-2 text-xl font-bold text-section-title text-gray-950 md:text-2xl"
              >
                {t('About the Project Data')}
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {t(
                  'Project information is compiled from official-source records, and every project page links back to the supporting evidence behind it. Project records, procurement records, and project cost-and-utilization observations are related but distinct datasets, each with its own denominator.'
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/projects/sources"
                className="inline-flex h-10 items-center gap-2 rounded-sm border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 transition-colors hover:border-[#0066EB]/40 hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                {t('Project Sources')}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <Link
                href="/projects/methodology"
                className="inline-flex h-10 items-center gap-2 rounded-sm border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 transition-colors hover:border-[#0066EB]/40 hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                {t('Project Methodology')}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
