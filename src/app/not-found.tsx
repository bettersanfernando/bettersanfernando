import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// App Router's not-found convention file — rendered for every notFound()
// call (unknown service/project/office/category) and for any unmatched
// URL, always with a real HTTP 404 status. Named not-found.page.tsx, not
// not-found.tsx, per the temporary pageExtensions workaround (next.config.ts).
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

const RECOVERY_ACTIONS = [
  {
    href: '/search',
    label: 'Search BetterSanFernando',
    primary: true,
  },
  {
    href: '/',
    label: 'Return home',
    primary: false,
  },
] as const;

const EXPLORATION_DESTINATIONS = [
  {
    href: '/services',
    title: 'Services',
    description:
      'Browse published procedures, requirements, fees, and processing information.',
  },
  {
    href: '/projects',
    title: 'Projects',
    description:
      'Explore published municipal project records and supporting evidence.',
  },
  {
    href: '/government',
    title: 'Government',
    description:
      'Find City offices, contacts, hotlines, and government information.',
  },
  {
    href: '/barangays',
    title: 'Barangays',
    description: 'Explore San Fernando’s published barangay information.',
  },
] as const;

export default function NotFound() {
  const [primaryAction, secondaryAction] = RECOVERY_ACTIONS;

  return (
    <main className="flex-grow bg-white">
      <div className="container mx-auto px-4 pt-12 pb-[104px] sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-36">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[6fr_4fr] lg:gap-14 xl:gap-16">
          {/* Left Column: Error story and primary recovery actions */}
          <div className="max-w-xl">
            <p
              className="select-none font-mono text-7xl font-bold tracking-tight text-[#0066EB] sm:text-8xl lg:text-[120px] lg:leading-none"
              aria-hidden="true"
            >
              404
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
              We couldn’t find that page.
            </h1>
            <p className="mt-3.5 text-sm leading-relaxed text-gray-600 sm:text-base sm:leading-7">
              The address may have changed, the page may no longer be published,
              or the record may not be part of BetterSanFernando’s current
              public collection.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href={primaryAction.href}
                className="group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-sm bg-[#0066EB] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0052BC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066EB]"
              >
                <span>{primaryAction.label}</span>
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>

              <Link
                href={secondaryAction.href}
                className="group inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-sm border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 hover:text-gray-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066EB]"
              >
                <span>{secondaryAction.label}</span>
                <ArrowRight
                  className="h-3.5 w-3.5 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-700"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>

          {/* Right Column: Keep Exploring navigation panel */}
          <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6 lg:p-7">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#0066EB]">
              KEEP EXPLORING
            </p>

            <div className="mt-4 divide-y divide-gray-100">
              {EXPLORATION_DESTINATIONS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group -mx-2.5 flex items-center justify-between rounded-sm px-2.5 py-3.5 text-left transition-colors hover:bg-[#F3F6FB] sm:-mx-3 sm:px-3"
                >
                  <div className="min-w-0 pr-4">
                    <span className="block text-sm font-semibold text-gray-900 transition-colors group-hover:text-[#0066EB] sm:text-base">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-gray-600">
                      {item.description}
                    </span>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 flex-shrink-0 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:text-[#0066EB]"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
