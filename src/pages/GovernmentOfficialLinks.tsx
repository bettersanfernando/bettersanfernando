import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  Globe,
  Landmark,
  RotateCcw,
  Search,
} from 'lucide-react';
import { Link } from 'react-router';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import {
  getOfficialLinks,
  getOfficialLinksMetadata,
  type OfficialLink,
} from '../data/civic/governmentOfficialLinks';

type ChannelFilter =
  | 'ALL'
  | 'OFFICIAL_WEBSITE'
  | 'OFFICIAL_DIGITAL_SERVICE'
  | 'OFFICIAL_FACEBOOK_PAGE';

const links = getOfficialLinks();
const metadata = getOfficialLinksMetadata();

const channelGroupOrder: Array<{
  type:
    'OFFICIAL_WEBSITE' | 'OFFICIAL_DIGITAL_SERVICE' | 'OFFICIAL_FACEBOOK_PAGE';
  label: string;
}> = [
  { type: 'OFFICIAL_WEBSITE', label: 'Official websites' },
  { type: 'OFFICIAL_DIGITAL_SERVICE', label: 'Digital services' },
  { type: 'OFFICIAL_FACEBOOK_PAGE', label: 'Facebook pages' },
];

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function matchesQuery(link: OfficialLink, query: string): boolean {
  const normalized = query.toLowerCase();
  return [
    link.owning_entity,
    link.office_acronym,
    link.label,
    link.public_purpose,
    link.url,
  ]
    .filter((value): value is string => Boolean(value))
    .some(value => value.toLowerCase().includes(normalized));
}

function LinkCard({ link }: { link: OfficialLink }) {
  const hasConflict =
    link.verification_status ===
    'CURRENT_VERIFIED_NAMING_OR_REORG_CONFLICT_UNRESOLVED';

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-[0_8px_28px_rgba(0,41,94,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-gray-900">{link.label}</h3>
            {link.office_acronym && (
              <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-800">
                {link.office_acronym}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-gray-700">{link.owning_entity}</p>
        </div>
        {hasConflict && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-100 px-2.5 py-1 text-xs font-bold text-warning-900">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            Naming/reorganization unresolved
          </span>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-gray-700">
        {link.public_purpose}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open the official ${link.label} destination (opens in a new tab)`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-800 underline-offset-4 hover:underline"
        >
          <Globe className="h-4 w-4 shrink-0" aria-hidden="true" />
          {hostnameOf(link.url)}
          <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        </a>
        <span className="text-xs text-gray-600">
          Verified {link.verified_at}
        </span>
      </div>

      {link.limitation_note && (
        <p className="mt-3 border-t border-gray-100 pt-3 text-xs leading-relaxed text-gray-600">
          {link.limitation_note}
        </p>
      )}
    </article>
  );
}

export default function GovernmentOfficialLinks() {
  const [query, setQuery] = useState('');
  const [channel, setChannel] = useState<ChannelFilter>('ALL');
  const hasFilters = Boolean(query.trim() || channel !== 'ALL');

  const filteredLinks = useMemo(() => {
    const normalizedQuery = query.trim();
    return links.filter(link => {
      const matchesChannel = channel === 'ALL' || link.channel_type === channel;
      return (
        matchesChannel &&
        (!normalizedQuery || matchesQuery(link, normalizedQuery))
      );
    });
  }, [query, channel]);

  const groupedLinks = channelGroupOrder
    .map(group => ({
      ...group,
      items: filteredLinks.filter(link => link.channel_type === group.type),
    }))
    .filter(group => group.items.length > 0);

  function resetFilters() {
    setQuery('');
    setChannel('ALL');
  }

  return (
    <>
      <SEO
        title="Official Government Links"
        description="Find verified official City Government of San Fernando, Pampanga websites, digital-service portals, and institutional Facebook pages."
        keywords="San Fernando Pampanga official website, city government links, official Facebook page"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/government/links`}
        siteName="BetterSanFernando"
      />
      <main className="flex-grow bg-gray-50">
        <section className="border-b border-primary-100 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <Breadcrumbs
              className="mb-8"
              items={[
                { label: 'Home', href: '/' },
                { label: 'Government', href: '/government' },
                { label: 'Official Government Links' },
              ]}
            />
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="max-w-3xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
                  <Landmark className="h-6 w-6" aria-hidden="true" />
                </div>
                <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                  Official Government Links
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
                  Verified official City Government websites, digital-service
                  portals, and institutional Facebook pages.
                </p>
              </div>
              <aside className="rounded-xl bg-primary-50 p-5 text-sm leading-relaxed text-primary-900">
                <p className="font-semibold">Independent civic directory</p>
                <p className="mt-1">
                  BetterSanFernando is community-run and not the official City
                  Government website. Every link below leads to a City
                  Government-owned destination, not to BetterSanFernando.
                </p>
              </aside>
            </div>

            <dl className="mt-9 grid grid-cols-2 border-y border-gray-200 lg:grid-cols-4">
              {[
                ['Total links', metadata.recordCount],
                [
                  'Official websites',
                  metadata.channelTypeBreakdown.OFFICIAL_WEBSITE ?? 0,
                ],
                [
                  'Digital services',
                  metadata.channelTypeBreakdown.OFFICIAL_DIGITAL_SERVICE ?? 0,
                ],
                [
                  'Facebook pages',
                  metadata.channelTypeBreakdown.OFFICIAL_FACEBOOK_PAGE ?? 0,
                ],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`p-4 sm:p-5 ${index % 2 === 1 ? 'border-l border-gray-200' : ''} ${index > 1 ? 'border-t border-gray-200 lg:border-t-0' : ''} ${index > 0 ? 'lg:border-l lg:border-gray-200' : ''}`}
                >
                  <dt className="text-sm leading-5 text-gray-600">{label}</dt>
                  <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8 md:py-10">
          <div
            className="flex items-start gap-3 rounded-xl bg-warning-50 p-5 text-sm leading-6 text-warning-900"
            role="note"
          >
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <p>{metadata.overallPublicLimitation}</p>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-8 md:pb-10">
          <div className="grid gap-4 rounded-xl bg-primary-900 p-4 text-white shadow-[0_8px_28px_rgba(0,41,94,0.14)] md:grid-cols-[minmax(15rem,1fr)_14rem_auto] md:items-end md:p-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-primary-50">
                Search office, acronym, label, purpose, or URL
              </span>
              <span className="relative block">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="e.g. CDRRMO, permits, or cityofsanfernando.gov.ph"
                  className="min-h-11 w-full rounded-lg border border-primary-700 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
                />
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-primary-50">
                Channel type
              </span>
              <select
                value={channel}
                onChange={event =>
                  setChannel(event.target.value as ChannelFilter)
                }
                className="min-h-11 w-full rounded-lg border border-primary-700 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
              >
                <option value="ALL">All channels</option>
                <option value="OFFICIAL_WEBSITE">Official websites</option>
                <option value="OFFICIAL_DIGITAL_SERVICE">
                  Digital services
                </option>
                <option value="OFFICIAL_FACEBOOK_PAGE">Facebook pages</option>
              </select>
            </label>
            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasFilters}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>

          <p
            className="mt-4 text-sm font-semibold text-gray-800"
            aria-live="polite"
          >
            Showing {filteredLinks.length} of {metadata.recordCount} links
          </p>

          {groupedLinks.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
              <p className="font-medium text-gray-900">
                No official link matches these filters
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Try a different search term or reset the filters.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-8">
              {groupedLinks.map(group => (
                <div key={group.type}>
                  <h2 className="mb-3 text-xl font-bold text-gray-900">
                    {group.label}{' '}
                    <span className="text-base font-normal text-gray-600">
                      ({group.items.length})
                    </span>
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {group.items.map(link => (
                      <LinkCard key={link.id} link={link} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="mt-8 max-w-3xl text-sm leading-6 text-gray-600">
            Absence of an office or channel from this directory does not prove
            that it lacks an official page — it means BetterSanFernando has not
            yet independently verified one. Need contact details instead of web
            destinations?{' '}
            <Link
              to="/government/offices"
              className="font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
            >
              Government Offices
            </Link>
            ,{' '}
            <Link
              to="/government/hotlines"
              className="font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
            >
              Government Hotlines
            </Link>
            , and{' '}
            <Link
              to="/government/barangay-contacts"
              className="font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
            >
              Barangay Contacts
            </Link>{' '}
            list phone numbers and addresses; this page does not.
          </p>
        </section>
      </main>
    </>
  );
}
