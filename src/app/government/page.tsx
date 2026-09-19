import {
  ArrowUpRight,
  ChevronRight,
  Info,
  Scale,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

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

// The shared `text-eyebrow` utility (src/index.css) sets a fairly wide
// 0.18em tracking used site-wide; tighten it locally here, matching the
// override already piloted on /transparency, rather than editing the
// shared utility and affecting every other page's eyebrows.
const eyebrowTracking = { letterSpacing: '0.08em' } as const;

interface HubDestination {
  title: string;
  href: string;
  description: string;
}

interface HubGroup {
  title: string;
  blurb: string;
  icon?: LucideIcon;
  destinations: HubDestination[];
}

const quickLinks: HubDestination[] = [
  {
    title: 'City Offices',
    href: '/government/offices',
    description: 'Browse departments and office information.',
  },
  {
    title: 'Contact the City',
    href: '/government/contact',
    description: 'Find verified official contact channels.',
  },
  {
    title: 'Barangay Contacts',
    href: '/government/barangay-contacts',
    description: 'Find Barangay Secretary and BHERT contacts.',
  },
];

const cityGovernmentGroup: HubGroup = {
  title: 'City Government',
  blurb: 'Verified office identities and how to reach them.',
  destinations: [
    {
      title: 'City Offices',
      href: '/government/offices',
      description: 'Find city departments, offices, and available information.',
    },
    {
      title: 'Contact the City',
      href: '/government/contact',
      description: 'Find verified official City Government contact channels.',
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
      },
      {
        title: 'Ordinances',
        href: '/legislation/ordinances',
        description: 'Browse verified city ordinance records.',
      },
      {
        title: 'Resolutions',
        href: '/legislation/resolutions',
        description: 'Browse verified city resolution records.',
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
      },
      {
        title: 'Barangay Contacts',
        href: '/government/barangay-contacts',
        description:
          'Find published Barangay Secretary and BHERT contacts by barangay.',
      },
      {
        title: 'Official Government Links',
        href: '/government/links',
        description:
          'Visit verified official government websites and resources.',
      },
    ],
  },
];

export default function GovernmentHubPage() {
  return (
    <main className="bg-white pb-16 md:pb-24">
      {/* Editorial page header — white canvas, breadcrumb inline above the intro */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-14">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[{ label: 'Home', href: '/' }, { label: 'Government' }]}
          />

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-12">
            <div className="max-w-2xl">
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                Government
              </p>

              <h1 className="mt-3 text-3xl font-extrabold text-display text-gray-950 sm:text-4xl lg:text-5xl">
                Understand your City Government.
              </h1>

              <p className="mt-4 text-lg font-medium leading-7 text-gray-800 sm:text-xl">
                Find City offices, public contacts, legislation, barangay
                information, and official government resources in one place.
              </p>

              <p className="mt-3 text-base leading-7 text-gray-600 md:text-[17px]">
                BetterSanFernando is independent and community-run, not the
                official City Government website.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-600">
                <span>{summary.officeRecords} City offices</span>
                <span>{barangayCount} barangays</span>
                <span>{officialLinkCount} official government links</span>
              </div>
            </div>

            {/* Right-side supporting module — pale blue-gray feature panel, sharp, no shadow */}
            <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
              <p className="text-eyebrow text-gray-500" style={eyebrowTracking}>
                Start With What You Need
              </p>

              <div className="mt-3 divide-y divide-gray-200/80 border-t border-gray-200/80">
                {quickLinks.map((link, index) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group -mx-2 flex items-center gap-3 rounded-sm px-2 py-3 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066EB]"
                  >
                    <span
                      className="text-xs font-bold tabular-nums text-[#0066EB]"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
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

      <div className="container mx-auto space-y-8 px-4 py-8 sm:space-y-12 sm:py-12 lg:space-y-20 lg:py-20">
        {/* Main directory */}
        <section aria-labelledby="government-hub-heading">
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            Explore Government
          </p>

          <h2
            id="government-hub-heading"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
          >
            Government Information &amp; Public Access
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            Browse City offices, legislation, and public-information resources
            currently published by BetterSanFernando.
          </p>

          {/* City Government — the main feature block: pale blue-gray, thin blue left rule */}
          <div className="mt-7 rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6 lg:p-7">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-10">
              <div>
                <h3 className="text-lg font-bold text-gray-950">
                  {cityGovernmentGroup.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {cityGovernmentGroup.blurb}
                </p>
                <p className="mt-3 text-sm font-medium text-gray-700">
                  {summary.officeRecords} City offices · {barangayCount}{' '}
                  barangays
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {cityGovernmentGroup.destinations.map(destination => (
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

          {/* Legislation + Public Information — sharp bordered sections, one header icon each */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {sideGroups.map(group => {
              const GroupIcon = group.icon;
              return (
                <div
                  key={group.title}
                  className="overflow-hidden rounded-sm border border-gray-200 bg-white"
                >
                  <div className="flex items-start gap-2.5 border-b border-gray-200 px-5 py-4">
                    {GroupIcon && (
                      <GroupIcon
                        className="mt-0.5 h-4 w-4 shrink-0 text-[#0066EB]"
                        aria-hidden="true"
                      />
                    )}
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
              );
            })}
          </div>
        </section>

        {/* Official Channels — pale blue-gray feature strip, thin blue left rule, no shadow */}
        <section
          aria-labelledby="official-channels-heading"
          className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-6 sm:p-7 lg:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-xl">
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                Official Channels
              </p>

              <h2
                id="official-channels-heading"
                className="mt-2 text-xl font-bold text-section-title text-gray-950 md:text-2xl"
              >
                Use the City&rsquo;s official channels when it matters.
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                For formal transactions, requests, and urgent concerns, continue
                through the appropriate official City or government channel.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/government/contact"
                className="inline-flex h-10 items-center gap-2 rounded-sm bg-[#0066EB] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] focus-visible:ring-offset-2"
              >
                Contact the City
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <Link
                href="/government/links"
                className="inline-flex h-10 items-center gap-2 rounded-sm border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 transition-colors hover:border-[#0066EB]/40 hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                Official Government Links
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <Link
                href="/government/hotlines"
                className="inline-flex h-10 items-center gap-2 rounded-sm border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 transition-colors hover:border-[#0066EB]/40 hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                Emergency Hotlines
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
