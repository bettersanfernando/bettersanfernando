import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  ChartNoAxesCombined,
  ChevronRight,
  FileCheck2,
  FileText,
  ListChecks,
  MapPinned,
  Scale,
  ShieldCheck,
  ShoppingCart,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';

import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { getAllProjectEvidence, getProjects } from '../../data/civic/projects';
import { buildPageMetadata } from '../../lib/metadata';
import ProjectSearchInput, {
  MobileProjectSearchResults,
  ProjectSearchProvider,
} from './project-search';

export const metadata = buildPageMetadata({
  title: 'Projects',
  description:
    "Explore BetterSanFernando's Projects hub: browse verified City projects, the project map, spending, procurement records, and the evidence and methodology behind them.",
  path: '/projects',
});

// Query parameters that only ever meant something on the former /projects
// listing (moved to /projects/city-projects). A bookmarked or shared
// `/projects?status=...` URL should keep working rather than silently
// landing on the hub with its filters dropped.
const LEGACY_LISTING_PARAMS = ['q', 'status', 'barangay', 'category'] as const;

const projectCount = getProjects().length;
const evidenceCount = getAllProjectEvidence().length;

interface HubDestination {
  title: string;
  href: string;
  description: string;
  icon: LucideIcon;
}

interface HubGroup {
  title: string;
  blurb: string;
  icon: LucideIcon;
  destinations: HubDestination[];
}

const groups: HubGroup[] = [
  {
    title: 'City Projects',
    blurb:
      'The primary inventory of sourced infrastructure and public-works projects.',
    icon: Building2,
    destinations: [
      {
        title: 'Browse City Projects',
        href: '/projects/city-projects',
        description: 'Search and review sourced project records.',
        icon: ListChecks,
      },
      {
        title: 'Project Map',
        href: '/projects/map',
        description: 'Explore projects geographically across San Fernando.',
        icon: MapPinned,
      },
      {
        title: 'Project Spending',
        href: '/statistics/project-spending',
        description:
          'Review verified project cost and utilization information.',
        icon: WalletCards,
      },
    ],
  },
  {
    title: 'Procurement',
    blurb: 'Bid, award, and contract records connected to City projects.',
    icon: ShoppingCart,
    destinations: [
      {
        title: 'Procurement Overview',
        href: '/procurement',
        description: 'See how procurement records connect to city projects.',
        icon: ShoppingCart,
      },
      {
        title: 'Bid Results',
        href: '/procurement/bid-results',
        description: 'Review published procurement bid-result records.',
        icon: Scale,
      },
      {
        title: 'Contracts & Awards',
        href: '/procurement/contracts',
        description: 'Explore available contract and award records.',
        icon: FileCheck2,
      },
      {
        title: 'Procurement Statistics',
        href: '/statistics/procurement',
        description: 'Explore patterns in procurement and award records.',
        icon: ChartNoAxesCombined,
      },
    ],
  },
  {
    title: 'Evidence & Insights',
    blurb: 'Statistics, sources, and methodology behind the published data.',
    icon: ShieldCheck,
    destinations: [
      {
        title: 'Project Statistics',
        href: '/statistics/projects',
        description: 'Explore patterns in verified city project data.',
        icon: ChartNoAxesCombined,
      },
      {
        title: 'Evidence & Sources',
        href: '/projects/sources',
        description:
          'Review the records and evidence supporting project information.',
        icon: ShieldCheck,
      },
      {
        title: 'Project Methodology',
        href: '/projects/methodology',
        description: 'Learn how project records are structured and checked.',
        icon: FileText,
      },
    ],
  },
];

export default async function ProjectsHubPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  if (LEGACY_LISTING_PARAMS.some(key => params[key] !== undefined)) {
    const query = new URLSearchParams();
    for (const key of LEGACY_LISTING_PARAMS) {
      const value = params[key];
      if (typeof value === 'string') query.set(key, value);
    }
    redirect(`/projects/city-projects?${query.toString()}`);
  }

  return (
    <main className="flex-grow bg-[#f7f8fa]">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[{ label: 'Home', href: '/' }, { label: 'Projects' }]}
          />
        </div>
      </div>

      <ProjectSearchProvider>
        {/* Hero */}
        <section className="relative bg-[#002EAC] text-white">
          {/* Decorative, project/public-works-themed geometry — purely
              structural line/arc accents, never literal buildings or
              blueprints. Confined to its own absolutely positioned,
              overflow-hidden layer so it never affects the search overlay's
              positioning or the hero's actual height. */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            <div className="absolute -right-24 -top-32 hidden h-[30rem] w-[30rem] rounded-full border border-white/10 sm:block" />
            <div className="absolute -bottom-16 -left-10 hidden h-56 w-56 rounded-full border border-white/10 sm:block" />
            <div className="absolute right-10 top-10 hidden h-12 w-12 border-r border-t border-white/15 lg:block" />
            <div className="absolute bottom-8 left-8 hidden h-16 w-16 border-b border-l border-white/10 sm:block" />
          </div>

          <div className="container relative mx-auto px-4 py-12 md:py-14">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-start lg:gap-12">
              <div className="max-w-2xl">
                <p className="text-eyebrow text-blue-100">Projects</p>

                <h1 className="mt-3 text-4xl font-extrabold text-display text-white sm:text-5xl">
                  Explore City projects and public works
                </h1>

                <p className="mt-4 text-base leading-7 text-blue-100 md:text-[17px]">
                  BetterSanFernando organizes sourced City project, procurement,
                  spending, and geographic information in one place. It is not
                  the official City Government project portal — every record
                  links back to the public evidence behind it.
                </p>

                <div className="mt-5 flex flex-wrap items-center divide-x divide-white/20 text-sm font-medium text-blue-100">
                  <span className="pr-3">{projectCount} project records</span>
                  <span className="px-3">{evidenceCount} evidence records</span>
                  <span className="pl-3">Official-source data</span>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 md:p-6">
                <h2 className="text-lg font-bold text-gray-950">
                  Start exploring
                </h2>

                <div className="mt-4 space-y-1">
                  <Link
                    href="/projects/city-projects"
                    className="-mx-1 flex items-center gap-3 rounded-lg bg-[#E6F0FD] px-3 py-3 transition-colors hover:bg-[#dbe9fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066EB]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#0066EB]">
                      <ListChecks className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-gray-950">
                        Browse City Projects
                      </span>
                      <span className="mt-0.5 block text-sm text-gray-600">
                        Search and review sourced project records.
                      </span>
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-[#0066EB]"
                      aria-hidden="true"
                    />
                  </Link>

                  <Link
                    href="/projects/map"
                    className="-mx-1 flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066EB]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E6F0FD] text-[#0066EB]">
                      <MapPinned className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-gray-950">
                        Project Map
                      </span>
                      <span className="mt-0.5 block text-sm text-gray-600">
                        Explore projects geographically.
                      </span>
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-gray-400"
                      aria-hidden="true"
                    />
                  </Link>
                </div>

                <div className="mt-5 border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Quick project search
                  </h3>
                  <div className="mt-2">
                    <ProjectSearchInput />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <MobileProjectSearchResults />
      </ProjectSearchProvider>

      <div className="container mx-auto space-y-14 px-4 py-12 md:py-16">
        {/* Main directory */}
        <section aria-labelledby="projects-hub-heading">
          <p className="text-eyebrow text-[#0066EB]">Explore Projects</p>

          <h2
            id="projects-hub-heading"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
          >
            Project Information &amp; Transparency
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700">
            Browse City project records, procurement information, spending data,
            statistics, and the evidence behind them.
          </p>

          <div className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {groups.map((group, index) => {
              const GroupIcon = group.icon;
              return (
                <div
                  key={group.title}
                  className={`p-6 md:p-7 ${index > 0 ? 'border-t border-gray-200' : ''}`}
                >
                  <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8">
                    <div className="flex items-start gap-3 lg:flex-col lg:items-start">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E6F0FD] text-[#0066EB]">
                        <GroupIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div className="lg:mt-3">
                        <h3 className="text-base font-bold text-gray-950">
                          {group.title}
                        </h3>
                        <p className="mt-0.5 text-sm text-gray-600">
                          {group.blurb}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                      {group.destinations.map(destination => {
                        const Icon = destination.icon;
                        return (
                          <Link
                            key={destination.href}
                            href={destination.href}
                            className="group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-[#E6F0FD]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066EB]"
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#E6F0FD] text-[#0066EB]">
                              <Icon
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold leading-5 text-gray-900">
                                {destination.title}
                              </span>
                              <span className="mt-1 block text-xs leading-5 text-gray-500">
                                {destination.description}
                              </span>
                            </span>
                            <ChevronRight
                              className="ml-3 h-4 w-4 shrink-0 self-center text-gray-400 transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-[#0066EB] group-focus-visible:text-[#0066EB]"
                              aria-hidden="true"
                            />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Provenance / transparency ending */}
        <section
          aria-labelledby="projects-provenance-heading"
          className="grid gap-6 rounded-2xl border border-gray-200 bg-white p-6 md:p-7 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-center lg:gap-10"
        >
          <div>
            <p className="text-eyebrow text-[#0066EB]">Data Provenance</p>

            <h2
              id="projects-provenance-heading"
              className="mt-1 text-xl font-bold text-section-title text-gray-950 md:text-2xl"
            >
              About the Project Data
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
              Project information is compiled from official-source records, and
              every project page links back to the supporting evidence behind
              it. Project records, procurement records, and project
              cost-and-utilization observations are related but distinct
              datasets, each with its own denominator.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/projects/sources"
              className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:border-[#0066EB]/40 hover:bg-[#E6F0FD]/40 hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck
                  className="h-4 w-4 text-[#0066EB]"
                  aria-hidden="true"
                />
                Project Sources
              </span>
              <ChevronRight
                className="h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
            </Link>

            <Link
              href="/projects/methodology"
              className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:border-[#0066EB]/40 hover:bg-[#E6F0FD]/40 hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
            >
              <span className="flex items-center gap-2">
                <FileText
                  className="h-4 w-4 text-[#0066EB]"
                  aria-hidden="true"
                />
                Project Methodology
              </span>
              <ChevronRight
                className="h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
