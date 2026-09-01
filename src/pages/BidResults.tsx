import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQueryState } from 'nuqs';
import { FileSearch, Search, SlidersHorizontal, X } from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Heading } from '../components/ui/Heading';
import Section from '../components/ui/Section';
import SEO from '../components/SEO';
import EvidenceSourceLinks from '../components/projects/EvidenceSourceLinks';
import {
  BID_RESULT_SORTS,
  filterAndSortBidResults,
  getBidResultEvidence,
  getBidResultsSummary,
  type BidResultSort,
} from '../data/civic/bidResults';
import { getEvidenceSourceLabel, hasAttachment } from '../data/civic/sources';
import { formatIsoDate, formatPeso } from '../lib/utils';

const PAGE_SIZE = 25;

const RELATED_PAGES = [
  { label: 'City Projects', href: '/projects' },
  { label: 'Project evidence sources', href: '/projects/sources' },
  { label: 'Project methodology', href: '/projects/methodology' },
  { label: 'Project statistics', href: '/statistics/projects' },
  { label: 'Published data sources', href: '/transparency/sources' },
  { label: 'Transparency methodology', href: '/transparency/methodology' },
] as const;

export default function BidResults() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [year, setYear] = useQueryState('year', { defaultValue: '' });
  const [approvedBudget, setApprovedBudget] = useQueryState('abc', {
    defaultValue: '',
  });
  const [sort, setSort] = useQueryState('sort', {
    defaultValue: 'date-desc',
  });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const records = useMemo(() => getBidResultEvidence(), []);
  const summary = useMemo(() => getBidResultsSummary(records), [records]);
  const years = useMemo(
    () =>
      [...new Set(records.map(record => record.facts.reportYear))].sort(
        (a, b) => b - a
      ),
    [records]
  );
  const filtered = useMemo(
    () =>
      filterAndSortBidResults(records, {
        query,
        year,
        approvedBudget:
          approvedBudget === 'available' || approvedBudget === 'unavailable'
            ? approvedBudget
            : '',
        sort: BID_RESULT_SORTS.includes(sort as BidResultSort)
          ? (sort as BidResultSort)
          : 'date-desc',
      }),
    [approvedBudget, query, records, sort, year]
  );

  const hasFilters = Boolean(query || year || approvedBudget);
  const resetVisibleCount = () => setVisibleCount(PAGE_SIZE);
  const clearFilters = () => {
    setQuery(null);
    setYear(null);
    setApprovedBudget(null);
    resetVisibleCount();
  };

  return (
    <>
      <SEO
        title="Bid Results"
        description="Browse published bid-result evidence connected to BetterSanFernando's verified infrastructure and public-works project subset."
        keywords="bid results, procurement, infrastructure projects, City of San Fernando Pampanga, public records"
      />
      <main className="flex-grow">
        <Section className="p-3 mb-12">
          <Breadcrumbs
            className="mb-8"
            items={[
              { label: 'Home', href: '/' },
              { label: 'City Projects', href: '/projects' },
              { label: 'Bid Results' },
            ]}
          />

          <header className="max-w-3xl">
            <Heading>Bid Results</Heading>
            <p className="text-lg leading-8 text-gray-700">
              Browse the published bid-result evidence connected to
              BetterSanFernando&apos;s verified infrastructure and public-works
              project subset. Each record shows only the procurement facts its
              evidence establishes.
            </p>
          </header>

          <div className="mt-8 border-y border-gray-200 bg-gray-50">
            <dl className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {[
                ['Bid-result records', summary.totalRecords],
                ['Projects represented', summary.projectsRepresented],
                ['With ABC', summary.withApprovedBudget],
                ['With winning bid', summary.withWinningBid],
                ['With winning bidder', summary.withWinningBidder],
                ['With document', summary.withAttachment],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`p-4 sm:p-5 ${index % 2 === 1 ? 'border-l border-gray-200' : ''} ${index > 1 ? 'border-t border-gray-200 lg:border-t-0' : ''} ${index > 0 ? 'xl:border-l xl:border-gray-200' : ''}`}
                >
                  <dt className="text-sm leading-5 text-gray-700">{label}</dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <section aria-labelledby="bid-results-browser" className="mt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2
                  id="bid-results-browser"
                  className="text-2xl font-bold text-gray-900"
                >
                  Published records
                </h2>
                <p className="mt-1 text-sm text-gray-700" aria-live="polite">
                  Showing {Math.min(visibleCount, filtered.length)} of{' '}
                  {filtered.length} matching records
                </p>
              </div>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary-700 underline decoration-primary-200 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  <X className="h-4 w-4" aria-hidden="true" /> Clear filters
                </button>
              )}
            </div>

            <div className="mt-4 border border-gray-300 bg-gray-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Search and filter bid results
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_repeat(3,minmax(10rem,auto))]">
                <label className="relative md:col-span-2 xl:col-span-1">
                  <span className="sr-only">Search bid results</span>
                  <Search
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={event => {
                      setQuery(event.target.value || null);
                      resetVisibleCount();
                    }}
                    placeholder="Project, bidder, BAC reference, or record ID"
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </label>

                <label>
                  <span className="sr-only">Document year</span>
                  <select
                    value={year}
                    onChange={event => {
                      setYear(event.target.value || null);
                      resetVisibleCount();
                    }}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="">All document years</option>
                    {years.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="sr-only">ABC availability</span>
                  <select
                    value={approvedBudget}
                    onChange={event => {
                      setApprovedBudget(event.target.value || null);
                      resetVisibleCount();
                    }}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="">Any ABC availability</option>
                    <option value="available">ABC available</option>
                    <option value="unavailable">ABC unavailable</option>
                  </select>
                </label>

                <label>
                  <span className="sr-only">Sort bid results</span>
                  <select
                    value={sort}
                    onChange={event => {
                      setSort(event.target.value || null);
                      resetVisibleCount();
                    }}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="date-desc">Newest document date</option>
                    <option value="date-asc">Oldest document date</option>
                    <option value="bid-desc">Winning bid: high to low</option>
                    <option value="bid-asc">Winning bid: low to high</option>
                    <option value="identifier-asc">
                      Source identifier A–Z
                    </option>
                  </select>
                </label>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="mt-5 border border-dashed border-gray-300 px-5 py-12 text-center">
                <FileSearch
                  className="mx-auto h-7 w-7 text-gray-600"
                  aria-hidden="true"
                />
                <h3 className="mt-3 font-semibold text-gray-900">
                  No bid-result records match
                </h3>
                <p className="mt-1 text-sm text-gray-700">
                  Try a broader search or clear the active filters.
                </p>
              </div>
            ) : (
              <ol className="mt-5 divide-y divide-gray-200 border-y border-gray-200">
                {filtered
                  .slice(0, visibleCount)
                  .map(({ evidence, project, facts }) => (
                    <li
                      key={evidence.id}
                      className="grid min-w-0 gap-5 py-6 lg:grid-cols-[12rem_minmax(0,1fr)_18rem] lg:gap-7"
                    >
                      <div className="min-w-0 text-sm">
                        <p className="font-semibold text-gray-900">
                          BAC / control reference
                        </p>
                        <p className="mt-1 break-words font-mono text-primary-800">
                          {facts.bacReference}
                        </p>
                        <dl className="mt-4 space-y-3 text-xs">
                          <div>
                            <dt className="text-gray-600">Document date</dt>
                            <dd className="mt-0.5 font-medium text-gray-900">
                              {formatIsoDate(facts.biddingDate)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-gray-600">
                              Evidence record ID
                            </dt>
                            <dd className="mt-0.5 break-words font-mono text-gray-900">
                              {evidence.id}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-gray-600">Source identifier</dt>
                            <dd className="mt-0.5 break-words font-mono text-gray-900">
                              {evidence.source_identifier}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <div className="min-w-0">
                        <h3>
                          <Link
                            to={`/projects/${project.id}`}
                            className="font-semibold leading-6 text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                            aria-label={`View project: ${project.project_name}`}
                          >
                            {project.project_name}
                          </Link>
                        </h3>
                        <p className="mt-1 break-words text-xs text-gray-600">
                          BetterSanFernando project ID:{' '}
                          <span className="font-mono text-gray-800">
                            {project.id}
                          </span>
                        </p>
                        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <dt className="font-medium text-gray-900">
                              Winning bidder
                            </dt>
                            <dd className="mt-1 leading-6 text-gray-700">
                              {facts.winningBidder ?? 'Not specified'}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium text-gray-900">
                              Location in evidence
                            </dt>
                            <dd className="mt-1 leading-6 text-gray-700">
                              {facts.location ?? 'Not specified'}
                            </dd>
                          </div>
                        </dl>
                        <Link
                          to={`/projects/${project.id}`}
                          className="mt-4 inline-flex text-sm font-semibold text-primary-700 underline decoration-primary-200 underline-offset-4 hover:text-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                        >
                          View project
                        </Link>
                      </div>

                      <div className="min-w-0 border-t border-gray-200 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-1">
                          <div>
                            <dt className="text-xs leading-5 text-gray-600">
                              Approved Budget for the Contract (ABC)
                            </dt>
                            <dd className="mt-1 break-words text-sm font-bold tabular-nums text-gray-900">
                              {formatPeso(facts.approvedBudgetAbc)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs leading-5 text-gray-600">
                              Winning bid amount
                            </dt>
                            <dd className="mt-1 break-words text-sm font-bold tabular-nums text-gray-900">
                              {formatPeso(facts.winningBidAmount)}
                            </dd>
                          </div>
                        </dl>

                        <div className="mt-5 border-t border-gray-200 pt-4">
                          <p className="mb-2 text-xs leading-5 text-gray-600">
                            Primary official · City of San Fernando ·{' '}
                            {getEvidenceSourceLabel(evidence)}
                          </p>
                          <EvidenceSourceLinks evidence={evidence} />
                          <p className="mt-2 text-xs text-gray-600">
                            {hasAttachment(evidence)
                              ? 'Source document available'
                              : 'Source page only'}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
              </ol>
            )}

            {visibleCount < filtered.length && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount(count => count + PAGE_SIZE)}
                  className="rounded-md border border-primary-700 bg-white px-5 py-2.5 text-sm font-bold text-primary-700 hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  Show 25 more records
                </button>
              </div>
            )}
          </section>

          <aside
            className="mt-14 max-w-5xl border-t border-gray-300 pt-7"
            aria-labelledby="bid-results-coverage"
          >
            <h2
              id="bid-results-coverage"
              className="text-xl font-bold text-gray-900"
            >
              Coverage and interpretation
            </h2>
            <div className="mt-3 grid gap-4 text-sm leading-6 text-gray-700 md:grid-cols-3">
              <p>
                This archive covers published BID_RESULTS evidence connected to
                BetterSanFernando&apos;s bounded infrastructure and public-works
                project dataset, not all City Government procurement.
              </p>
              <p>
                A winning bid amount is not a contract amount. A contract amount
                is not actual expenditure, and a bid result does not by itself
                establish an executed contract or project completion.
              </p>
              <p>
                Each record supports only the fields it establishes. Absence
                here does not prove that a procurement event did not occur.
              </p>
            </div>
          </aside>

          <nav className="mt-10" aria-label="Related project and data pages">
            <h2 className="text-lg font-bold text-gray-900">Related pages</h2>
            <ul className="mt-3 flex max-w-5xl flex-wrap gap-x-6 gap-y-3 text-sm">
              {RELATED_PAGES.map(page => (
                <li key={page.href}>
                  <Link
                    to={page.href}
                    className="font-semibold text-primary-700 underline decoration-primary-200 underline-offset-4 hover:text-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                  >
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Section>
      </main>
    </>
  );
}
