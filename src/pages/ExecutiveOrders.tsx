import { useMemo } from 'react';
import { ExternalLink, FileText, Search as SearchIcon } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { Card, CardContent } from '@bettergov/kapwa/card';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Heading } from '../components/ui/Heading';
import Section from '../components/ui/Section';
import { Text } from '../components/ui/Text';
import SEO from '../components/SEO';
import {
  getExecutiveOrders,
  type LegislationRecord,
} from '../data/civic/legislation';

type SortOrder = 'newest' | 'oldest' | 'reference';

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

function matchesQuery(order: LegislationRecord, query: string): boolean {
  const normalizedQuery = query.toLowerCase();

  return [
    order.document_number,
    order.title,
    order.issuer_name,
    order.issuer_title,
    order.issuing_body,
  ].some(value => value?.toLowerCase().includes(normalizedQuery));
}

function getSourceLabel(order: LegislationRecord): string {
  return order.source_authority === 'PRIMARY_OFFICIAL'
    ? 'Primary official source'
    : 'Official reference';
}

export default function ExecutiveOrders() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [sort, setSort] = useQueryState('sort', {
    defaultValue: 'newest' as SortOrder,
  });
  const executiveOrders = getExecutiveOrders();

  const visibleOrders = useMemo(() => {
    const filtered = query.trim()
      ? executiveOrders.filter(order => matchesQuery(order, query.trim()))
      : [...executiveOrders];

    return filtered.sort((left, right) => {
      if (sort === 'reference') {
        return left.document_number.localeCompare(right.document_number);
      }

      const direction = sort === 'oldest' ? 1 : -1;
      return (
        (left.date_issued ?? '').localeCompare(right.date_issued ?? '') *
        direction
      );
    });
  }, [executiveOrders, query, sort]);

  return (
    <>
      <SEO
        title="Executive Orders"
        description="Browse the Executive Orders currently verified and published by BetterSanFernando, with links to their official sources."
        keywords="executive orders, City of San Fernando, Pampanga, legislation, official records"
      />
      <main className="flex-grow">
        <Section className="p-3 mb-12">
          <Breadcrumbs
            className="mb-8"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Legislation', href: '/legislation' },
              { label: 'Executive Orders' },
            ]}
          />

          <div className="max-w-3xl">
            <Heading>Executive Orders</Heading>
            <Text className="max-w-2xl text-gray-700 mb-6">
              Browse Executive Order metadata and follow links to the official
              records that support it.
            </Text>
          </div>

          <aside
            className="mb-8 max-w-4xl rounded-xl border border-primary-200 bg-primary-50 p-5"
            aria-labelledby="coverage-heading"
          >
            <Heading
              level={2}
              className="text-lg mb-2 leading-snug text-primary-900"
            >
              <span id="coverage-heading">Coverage of this collection</span>
            </Heading>
            <Text className="max-w-3xl mb-0 text-primary-900">
              These {executiveOrders.length} records are the currently verified,
              captured archive subset approved for publication by
              BetterSanFernando. This is not a complete historical collection.
              An order missing here may still have been issued by the City.
            </Text>
          </aside>

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xl">
              <SearchIcon
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={event => setQuery(event.target.value || null)}
                placeholder="Search reference, title, or issuer"
                aria-label="Search Executive Orders"
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <label className="sr-only" htmlFor="executive-order-sort">
              Sort Executive Orders
            </label>
            <select
              id="executive-order-sort"
              value={sort}
              onChange={event =>
                setSort((event.target.value as SortOrder) || null)
              }
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="reference">Reference number</option>
            </select>
          </div>

          <Text size="sm" className="mb-4 text-gray-600" aria-live="polite">
            Showing {visibleOrders.length} of {executiveOrders.length} published
            records
          </Text>

          {visibleOrders.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center text-sm text-gray-600">
              No Executive Orders match your search.
            </div>
          ) : (
            <div className="space-y-4">
              {visibleOrders.map(order => {
                const sourceUrl =
                  order.official_page_url ?? order.reference_url;

                return (
                  <Card key={order.id} className="mb-0">
                    <CardContent>
                      <article aria-label={order.document_number}>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-800">
                            Executive Order
                          </span>
                          <span className="font-mono text-sm font-semibold text-gray-800">
                            {order.document_number}
                          </span>
                        </div>

                        {order.title && (
                          <h2 className="text-base font-semibold leading-relaxed text-gray-900">
                            {order.title}
                          </h2>
                        )}

                        <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                          {order.date_issued && (
                            <div>
                              <dt className="text-gray-600">Date issued</dt>
                              <dd className="font-medium text-gray-900">
                                <time dateTime={order.date_issued}>
                                  {formatDate(order.date_issued)}
                                </time>
                              </dd>
                            </div>
                          )}
                          <div>
                            <dt className="text-gray-600">Issuing body</dt>
                            <dd className="font-medium text-gray-900">
                              {order.issuing_body}
                            </dd>
                          </div>
                          {order.issuer_name && (
                            <div>
                              <dt className="text-gray-600">Issuer</dt>
                              <dd className="font-medium text-gray-900">
                                {order.issuer_name}
                                {order.issuer_title &&
                                  `, ${order.issuer_title}`}
                              </dd>
                            </div>
                          )}
                        </dl>

                        <div className="mt-5 border-t border-gray-200 pt-4">
                          <h3 className="text-sm font-semibold text-gray-900">
                            Source and document availability
                          </h3>
                          <div className="mt-2 flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
                            <span className="text-gray-700">
                              Evidence: {getSourceLabel(order)}
                            </span>
                            <span className="flex items-center gap-1.5 text-gray-700">
                              <FileText
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                              Full text:{' '}
                              {order.full_text_available &&
                              order.official_pdf_url
                                ? 'Available as an official PDF'
                                : 'Not available in this published record'}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium">
                            {sourceUrl && (
                              <a
                                href={sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-primary-700 hover:text-primary-900 hover:underline"
                              >
                                View official source
                                <ExternalLink
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              </a>
                            )}
                            {order.full_text_available &&
                              order.official_pdf_url && (
                                <a
                                  href={order.official_pdf_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-primary-700 hover:text-primary-900 hover:underline"
                                >
                                  Read full text (PDF)
                                  <ExternalLink
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                </a>
                              )}
                          </div>
                        </div>
                      </article>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </Section>
      </main>
    </>
  );
}
