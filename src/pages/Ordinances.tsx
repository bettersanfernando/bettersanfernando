import { useMemo } from 'react';
import { ExternalLink, FileCheck2, FileText, Search } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { Link } from 'react-router';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Heading } from '../components/ui/Heading';
import Section from '../components/ui/Section';
import { Text } from '../components/ui/Text';
import SEO from '../components/SEO';
import {
  getLegislationSourceUrl,
  getOrdinances,
  hasLegislationFullText,
  type LegislationRecord,
} from '../data/civic/legislation';

type AvailabilityFilter = 'all' | 'full-text' | 'reference-only';
type SortOrder = 'newest' | 'oldest' | 'identifier';

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

function getDisplayTitle(ordinance: LegislationRecord): string | null {
  return ordinance.official_title ?? ordinance.official_alias ?? null;
}

function matchesQuery(ordinance: LegislationRecord, query: string): boolean {
  const normalizedQuery = query.toLowerCase();

  return [
    ordinance.document_number,
    ordinance.official_title,
    ordinance.official_alias,
    ordinance.described_context,
    ordinance.described_subject,
    ordinance.year.toString(),
  ].some(value => value?.toLowerCase().includes(normalizedQuery));
}

function getSourceAuthorityLabel(ordinance: LegislationRecord): string {
  return ordinance.source_authority === 'PRIMARY_OFFICIAL'
    ? 'Primary official source'
    : 'Secondary official source';
}

export default function Ordinances() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [availability, setAvailability] = useQueryState('availability', {
    defaultValue: 'all' as AvailabilityFilter,
  });
  const [sort, setSort] = useQueryState('sort', {
    defaultValue: 'newest' as SortOrder,
  });
  const ordinances = getOrdinances();
  const fullTextCount = ordinances.filter(hasLegislationFullText).length;
  const referenceOnlyCount = ordinances.length - fullTextCount;

  const visibleOrdinances = useMemo(() => {
    const normalizedQuery = query.trim();
    const filtered = ordinances.filter(ordinance => {
      const matchesAvailability =
        availability === 'all' ||
        (availability === 'full-text' && hasLegislationFullText(ordinance)) ||
        (availability === 'reference-only' &&
          !hasLegislationFullText(ordinance));

      return (
        matchesAvailability &&
        (!normalizedQuery || matchesQuery(ordinance, normalizedQuery))
      );
    });

    return filtered.sort((left, right) => {
      if (sort === 'identifier') {
        return left.document_number.localeCompare(right.document_number);
      }

      const direction = sort === 'oldest' ? 1 : -1;
      return (
        (left.date_adopted ?? `${left.year}`).localeCompare(
          right.date_adopted ?? `${right.year}`
        ) * direction
      );
    });
  }, [availability, ordinances, query, sort]);

  return (
    <>
      <SEO
        title="Ordinances"
        description="Browse the City of San Fernando ordinance records currently verified and published by BetterSanFernando."
        keywords="ordinances, City of San Fernando, Pampanga, legislation, public records"
      />
      <main className="flex-grow">
        <Section className="p-3 mb-12">
          <Breadcrumbs
            className="mb-8"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Legislation', href: '/legislation' },
              { label: 'Ordinances' },
            ]}
          />

          <header className="max-w-3xl">
            <Heading>Ordinances</Heading>
            <Text className="mb-8 max-w-2xl text-gray-700">
              Browse every ordinance record that BetterSanFernando has currently
              verified and approved for public release. Full-text availability
              varies by record.
            </Text>
          </header>

          <dl className="mb-8 grid overflow-hidden rounded-xl border border-gray-200 bg-gray-50 sm:grid-cols-3">
            <div className="p-5 sm:border-r sm:border-gray-200">
              <dt className="text-sm text-gray-600">Published records</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
                {ordinances.length}
              </dd>
            </div>
            <div className="border-t border-gray-200 p-5 sm:border-r sm:border-t-0">
              <dt className="text-sm text-gray-600">Full text available</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
                {fullTextCount}
              </dd>
            </div>
            <div className="border-t border-gray-200 p-5 sm:border-t-0">
              <dt className="text-sm text-gray-600">Reference record only</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
                {referenceOnlyCount}
              </dd>
            </div>
          </dl>

          <div className="mb-6 grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_auto_auto]">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                aria-hidden="true"
              />
              <label className="sr-only" htmlFor="ordinance-search">
                Search ordinances
              </label>
              <input
                id="ordinance-search"
                type="search"
                value={query}
                onChange={event => setQuery(event.target.value || null)}
                placeholder="Search number, title, subject, or year"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <label className="grid gap-1 text-xs font-medium text-gray-700">
              Availability
              <select
                value={availability}
                onChange={event =>
                  setAvailability(
                    (event.target.value as AvailabilityFilter) || null
                  )
                }
                className="min-w-48 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All records</option>
                <option value="full-text">Full text available</option>
                <option value="reference-only">Reference record only</option>
              </select>
            </label>

            <label className="grid gap-1 text-xs font-medium text-gray-700">
              Sort by
              <select
                value={sort}
                onChange={event =>
                  setSort((event.target.value as SortOrder) || null)
                }
                className="min-w-40 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="identifier">Ordinance number</option>
              </select>
            </label>
          </div>

          <Text size="sm" className="mb-4 text-gray-600" aria-live="polite">
            Showing {visibleOrdinances.length} of {ordinances.length} published
            records
          </Text>

          {visibleOrdinances.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 px-5 py-12 text-center">
              <p className="font-medium text-gray-900">No ordinances found</p>
              <p className="mt-1 text-sm text-gray-600">
                Try a different search or availability filter.
              </p>
            </div>
          ) : (
            <ol className="divide-y divide-gray-200 border-y border-gray-200">
              {visibleOrdinances.map(ordinance => {
                const title = getDisplayTitle(ordinance);
                const sourceUrl = getLegislationSourceUrl(ordinance);
                const hasFullText = hasLegislationFullText(ordinance);
                const description =
                  ordinance.described_context ?? ordinance.described_subject;

                return (
                  <li key={ordinance.id} className="py-6 first:pt-5">
                    <article aria-labelledby={`${ordinance.id}-title`}>
                      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_15rem]">
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="break-all font-mono text-sm font-semibold text-primary-800">
                              Ordinance No. {ordinance.document_number}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                hasFullText
                                  ? 'bg-success-100 text-success-800'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {hasFullText ? (
                                <FileCheck2
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              ) : (
                                <FileText
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              )}
                              {hasFullText
                                ? 'Full text available'
                                : 'Reference record only'}
                            </span>
                          </div>

                          <h2
                            id={`${ordinance.id}-title`}
                            className="max-w-4xl text-base font-semibold leading-relaxed text-gray-900 sm:text-lg"
                          >
                            {title ?? `Ordinance ${ordinance.document_number}`}
                          </h2>

                          {description && description !== title && (
                            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-700">
                              {description}
                            </p>
                          )}

                          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm">
                            <div>
                              <dt className="text-gray-600">
                                {ordinance.date_adopted
                                  ? 'Date adopted'
                                  : 'Year'}
                              </dt>
                              <dd className="font-medium text-gray-900">
                                {ordinance.date_adopted ? (
                                  <time dateTime={ordinance.date_adopted}>
                                    {formatDate(ordinance.date_adopted)}
                                  </time>
                                ) : (
                                  ordinance.year
                                )}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-gray-600">Issuing body</dt>
                              <dd className="font-medium text-gray-900">
                                {ordinance.issuing_body}
                              </dd>
                            </div>
                          </dl>
                        </div>

                        <div className="border-t border-gray-200 pt-4 text-sm md:border-l md:border-t-0 md:pl-5 md:pt-0">
                          <p className="font-semibold text-gray-900">
                            Source and document
                          </p>
                          <p className="mt-1 text-gray-700">
                            Evidence: {getSourceAuthorityLabel(ordinance)}
                          </p>
                          <p className="mt-1 text-gray-700">
                            {hasFullText
                              ? 'Full text is available as an official PDF.'
                              : 'Full text is not currently available in BetterSanFernando.'}
                          </p>
                          <div className="mt-3 flex flex-col items-start gap-2 font-medium">
                            {sourceUrl && (
                              <a
                                href={sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-primary-700 underline-offset-4 hover:text-primary-900 hover:underline"
                              >
                                View source evidence
                                <ExternalLink
                                  className="h-4 w-4 shrink-0"
                                  aria-hidden="true"
                                />
                              </a>
                            )}
                            {hasFullText && ordinance.official_pdf_url && (
                              <a
                                href={ordinance.official_pdf_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-primary-700 underline-offset-4 hover:text-primary-900 hover:underline"
                              >
                                Read full text (PDF)
                                <ExternalLink
                                  className="h-4 w-4 shrink-0"
                                  aria-hidden="true"
                                />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          )}

          <aside
            className="mt-10 max-w-4xl rounded-xl border border-primary-200 bg-primary-50 p-5"
            aria-labelledby="ordinance-coverage-heading"
          >
            <Heading
              level={2}
              className="text-lg mb-2 leading-snug text-primary-900"
            >
              <span id="ordinance-coverage-heading">
                About this archive's coverage
              </span>
            </Heading>
            <Text className="max-w-3xl mb-0 text-primary-900">
              This is the ordinance set BetterSanFernando can currently verify
              and publish safely, not a complete history of City ordinances.
              Absence from this archive does not prove that an ordinance does
              not exist. Some records have supporting references without full
              text in the current public export.
            </Text>
          </aside>

          <nav className="mt-8" aria-label="Related legislation">
            <p className="text-sm font-semibold text-gray-900">
              Related legislation
            </p>
            <Link
              to="/legislation/executive-orders"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 underline-offset-4 hover:text-primary-900 hover:underline"
            >
              Browse Executive Orders
            </Link>
          </nav>
        </Section>
      </main>
    </>
  );
}
