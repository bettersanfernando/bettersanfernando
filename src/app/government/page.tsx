import Link from 'next/link';
import {
  Building2,
  ChevronRight,
  ExternalLink,
  FileCheck2,
  FileText,
  Info,
  Landmark,
  Phone,
  Scale,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';

import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { getBarangays } from '../../data/civic/demographics';
import { getGovernmentSummary } from '../../data/civic/governmentSummary';
import { getOfficialLinks } from '../../data/civic/governmentOfficialLinks';
import { buildPageMetadata } from '../../lib/metadata';

export const metadata = buildPageMetadata({
  title: 'Government',
  description:
    'Find currently published government office, contact, legislation, and public-information resources for the City of San Fernando, Pampanga.',
  path: '/government',
});

const summary = getGovernmentSummary();
const barangayCount = getBarangays().length;
const officialLinkCount = getOfficialLinks().length;

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

const cityGovernmentGroup: HubGroup = {
  title: 'City Government',
  blurb: 'Verified office identities and how to reach them.',
  icon: Landmark,
  destinations: [
    {
      title: 'City Offices',
      href: '/government/offices',
      description: 'Find city departments, offices, and available information.',
      icon: Building2,
    },
    {
      title: 'Contact the City',
      href: '/government/contact',
      description: 'Find verified official City Government contact channels.',
      icon: Phone,
    },
  ],
};

const sideGroups: HubGroup[] = [
  {
    title: 'Legislation',
    blurb: 'Bounded executive-order, ordinance, and resolution archives.',
    icon: Scale,
    destinations: [
      {
        title: 'Executive Orders',
        href: '/legislation/executive-orders',
        description: 'Browse verified executive-order records.',
        icon: FileText,
      },
      {
        title: 'Ordinances',
        href: '/legislation/ordinances',
        description: 'Browse verified city ordinance records.',
        icon: FileText,
      },
      {
        title: 'Resolutions',
        href: '/legislation/resolutions',
        description: 'Browse verified city resolution records.',
        icon: FileCheck2,
      },
    ],
  },
  {
    title: 'Public Information',
    blurb: 'Hotlines, barangay contacts, and official government links.',
    icon: Info,
    destinations: [
      {
        title: 'Hotlines & Contacts',
        href: '/government/hotlines',
        description: 'Access verified official hotlines and public contacts.',
        icon: Phone,
      },
      {
        title: 'Barangay Contacts',
        href: '/government/barangay-contacts',
        description:
          'Find published Barangay Secretary and BHERT contacts by barangay.',
        icon: UsersRound,
      },
      {
        title: 'Official Government Links',
        href: '/government/links',
        description:
          'Visit verified official government websites and resources.',
        icon: ExternalLink,
      },
    ],
  },
];

export default function GovernmentHubPage() {
  return (
    <main className="flex-grow bg-[#f7f8fa]">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[{ label: 'Home', href: '/' }, { label: 'Government' }]}
          />
        </div>
      </div>

      {/* Hero */}
      <section className="relative bg-[#002EAC] text-white">
        {/* Decorative, civic-institution-themed geometry — restrained arcs
            and a thin column motif suggesting public architecture, never a
            literal seal or building. Confined to its own absolutely
            positioned, overflow-hidden layer so it never affects layout. */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute -right-28 -top-28 hidden h-[28rem] w-[28rem] rounded-full border border-white/10 sm:block" />
          <div className="absolute -bottom-20 -left-16 hidden h-64 w-64 rounded-full border border-white/10 sm:block" />
          <div className="absolute left-8 top-8 hidden h-14 w-14 border-l border-t border-white/15 lg:block" />
          <div className="pointer-events-none absolute bottom-0 right-16 hidden gap-3 sm:flex lg:right-24">
            <div className="h-24 w-px bg-white/15" />
            <div className="h-32 w-px bg-white/15" />
            <div className="h-24 w-px bg-white/15" />
            <div className="h-32 w-px bg-white/15" />
          </div>
        </div>

        <div className="container relative mx-auto px-4 py-12 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start lg:gap-12">
            <div className="max-w-2xl">
              <p className="text-eyebrow text-blue-100">Government</p>

              <h1 className="mt-3 text-4xl font-extrabold text-display text-white sm:text-5xl">
                Understand your City Government
              </h1>

              <p className="mt-4 text-base leading-7 text-blue-100 md:text-[17px]">
                BetterSanFernando organizes public information about City
                offices, contacts, legislation, and barangay and official
                government resources. It is not the official City Government
                website — follow linked sources to confirm information directly
                with the City.
              </p>

              <div className="mt-5 flex flex-wrap items-center divide-x divide-white/20 text-sm font-medium text-blue-100">
                <span className="pr-3">
                  {summary.officeRecords} city offices
                </span>
                <span className="px-3">{barangayCount} barangays</span>
                <span className="pl-3">
                  {officialLinkCount} official government links
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 md:p-6">
              <h2 className="text-lg font-bold text-gray-950">
                Start exploring
              </h2>

              <div className="mt-4 space-y-1">
                <Link
                  href="/government/offices"
                  className="group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-[#E6F0FD]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066EB]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E6F0FD] text-[#0066EB]">
                    <Building2 className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-gray-950">
                      City Offices
                    </span>
                    <span className="mt-0.5 block text-sm text-gray-600">
                      Browse departments and office information.
                    </span>
                  </span>
                  <ChevronRight
                    className="ml-3 h-4 w-4 shrink-0 self-center text-gray-400 transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-[#0066EB] group-focus-visible:text-[#0066EB]"
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  href="/government/contact"
                  className="group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-[#E6F0FD]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066EB]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E6F0FD] text-[#0066EB]">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-gray-950">
                      Contact the City
                    </span>
                    <span className="mt-0.5 block text-sm text-gray-600">
                      Find verified official contact channels.
                    </span>
                  </span>
                  <ChevronRight
                    className="ml-3 h-4 w-4 shrink-0 self-center text-gray-400 transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-[#0066EB] group-focus-visible:text-[#0066EB]"
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  href="/government/barangay-contacts"
                  className="group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-[#E6F0FD]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066EB]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E6F0FD] text-[#0066EB]">
                    <UsersRound className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-gray-950">
                      Barangay Contacts
                    </span>
                    <span className="mt-0.5 block text-sm text-gray-600">
                      Find Barangay Secretary and BHERT contacts.
                    </span>
                  </span>
                  <ChevronRight
                    className="ml-3 h-4 w-4 shrink-0 self-center text-gray-400 transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-[#0066EB] group-focus-visible:text-[#0066EB]"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto space-y-14 px-4 py-12 md:py-16">
        {/* Main directory */}
        <section aria-labelledby="government-hub-heading">
          <p className="text-eyebrow text-[#0066EB]">Explore Government</p>

          <h2
            id="government-hub-heading"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
          >
            Government Information &amp; Public Access
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700">
            Browse City offices, legislation, and public-information resources
            currently published by BetterSanFernando.
          </p>

          {/* City Government — full-width feature band */}
          <div className="mt-7 rounded-2xl border border-gray-200 bg-white p-6 md:p-7">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-center lg:gap-8">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F0FD] text-[#0066EB]">
                  <cityGovernmentGroup.icon
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-gray-950">
                    {cityGovernmentGroup.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {cityGovernmentGroup.blurb}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-[#E6F0FD] px-2.5 py-0.5 text-xs font-semibold text-[#0066EB]">
                      {summary.officeRecords} City Offices
                    </span>
                    <span className="inline-flex items-center rounded-full bg-[#E6F0FD] px-2.5 py-0.5 text-xs font-semibold text-[#0066EB]">
                      {barangayCount} Barangays
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {cityGovernmentGroup.destinations.map(destination => {
                  const Icon = destination.icon;
                  return (
                    <Link
                      key={destination.href}
                      href={destination.href}
                      className="group flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 transition-colors hover:border-[#0066EB]/30 hover:bg-[#E6F0FD]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066EB]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#E6F0FD] text-[#0066EB]">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold leading-5 text-gray-900">
                          {destination.title}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-gray-500">
                          {destination.description}
                        </span>
                      </span>
                      <ChevronRight
                        className="ml-2 h-4 w-4 shrink-0 self-center text-gray-400 transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-[#0066EB] group-focus-visible:text-[#0066EB]"
                        aria-hidden="true"
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legislation + Public Information — equal-weight supporting cards */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {sideGroups.map(group => {
              const GroupIcon = group.icon;
              return (
                <div
                  key={group.title}
                  className="rounded-2xl border border-gray-200 bg-white p-6"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E6F0FD] text-[#0066EB]">
                      <GroupIcon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-gray-950">
                        {group.title}
                      </h3>
                      <p className="mt-0.5 text-sm text-gray-600">
                        {group.blurb}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    {group.destinations.map(destination => {
                      const Icon = destination.icon;
                      return (
                        <Link
                          key={destination.href}
                          href={destination.href}
                          className="group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-[#E6F0FD]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066EB]"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#E6F0FD] text-[#0066EB]">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold leading-5 text-gray-900">
                              {destination.title}
                            </span>
                            <span className="mt-0.5 block text-xs leading-5 text-gray-500">
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
              );
            })}
          </div>
        </section>

        {/* Official Channels — soft-blue action strip */}
        <section
          aria-labelledby="government-closing-heading"
          className="flex flex-col gap-6 rounded-2xl bg-[#E6F0FD] p-6 md:flex-row md:items-center md:justify-between md:gap-8 md:p-7"
        >
          <div className="max-w-xl">
            <p className="text-eyebrow text-[#0066EB]">Official Channels</p>

            <h2
              id="government-closing-heading"
              className="mt-1 text-xl font-bold text-section-title text-gray-950 md:text-2xl"
            >
              Use the City&rsquo;s official channels when it matters
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-700">
              For formal transactions, requests, and urgent concerns, use the
              appropriate official City or government channel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/government/contact"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0066EB] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] focus-visible:ring-offset-2"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Contact the City
            </Link>

            <Link
              href="/government/links"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#0066EB]/20 bg-white px-4 text-sm font-semibold text-gray-900 transition-colors hover:border-[#0066EB]/40 hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Official Government Links
            </Link>

            <Link
              href="/government/hotlines"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#0066EB]/20 bg-white px-4 text-sm font-semibold text-gray-900 transition-colors hover:border-[#0066EB]/40 hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Emergency Hotlines
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
