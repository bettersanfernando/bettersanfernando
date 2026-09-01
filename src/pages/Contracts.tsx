import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQueryState } from 'nuqs';
import {
  FileCheck2,
  FileQuestion,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Heading } from '../components/ui/Heading';
import Section from '../components/ui/Section';
import SEO from '../components/SEO';
import EvidenceSourceLinks from '../components/projects/EvidenceSourceLinks';
import {
  CONTRACT_RECORD_SORTS,
  filterAndSortContractRecords,
  getAwardAndContractRecords,
  getContractsSummary,
  hasContractAmount,
  type ContractRecordSort,
} from '../data/civic/contracts';
import { getProjects } from '../data/civic/projects';
import { getEvidenceSourceLabel } from '../data/civic/sources';
import { formatIsoDate, formatPeso } from '../lib/utils';

const PAGE_SIZE = 25;

const RELATED_PAGES = [
  { label: 'Bid Results', href: '/procurement/bid-results' },
  { label: 'City Projects', href: '/projects' },
  { label: 'Project evidence sources', href: '/projects/sources' },
  { label: 'Project methodology', href: '/projects/methodology' },
  { label: 'Project statistics', href: '/statistics/projects' },
  { label: 'Published data sources', href: '/transparency/sources' },
  { label: 'Transparency methodology', href: '/transparency/methodology' },
] as const;

function authorityLabel(authority: string) {
  return authority === 'PRIMARY_OFFICIAL_CSFP'
    ? 'Primary official · City of San Fernando'
    : 'Primary official';
}

export default function Contracts() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [lifecycle, setLifecycle] = useQueryState('lifecycle', {
    defaultValue: '',
  });
  const [year, setYear] = useQueryState('year', { defaultValue: '' });
  const [contractNumber, setContractNumber] = useQueryState('number', {
    defaultValue: '',
  });
  const [contractAmount, setContractAmount] = useQueryState('amount', {
    defaultValue: '',
  });
  const [sort, setSort] = useQueryState('sort', {
    defaultValue: 'date-desc',
  });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const projects = getProjects();
  const records = useMemo(() => getAwardAndContractRecords(), []);
  const summary = useMemo(
    () => getContractsSummary(records, projects.length),
    [projects.length, records]
  );
  const years = useMemo(
    () =>
      [...new Set(records.map(record => record.project.year))].sort(
        (a, b) => b - a
      ),
    [records]
  );
  const filtered = useMemo(
    () =>
      filterAndSortContractRecords(records, {
        query,
        lifecycle:
          lifecycle === 'AWARDED' || lifecycle === 'CONTRACTED'
            ? lifecycle
            : '',
        year,
        contractNumber:
          contractNumber === 'available' || contractNumber === 'unavailable'
            ? contractNumber
            : '',
        contractAmount:
          contractAmount === 'available' || contractAmount === 'unavailable'
            ? contractAmount
            : '',
        sort: CONTRACT_RECORD_SORTS.includes(sort as ContractRecordSort)
          ? (sort as ContractRecordSort)
          : 'date-desc',
      }),
    [contractAmount, contractNumber, lifecycle, query, records, sort, year]
  );

  const hasFilters = Boolean(
    query || lifecycle || year || contractNumber || contractAmount
  );
  const resetVisibleCount = () => setVisibleCount(PAGE_SIZE);
  const clearFilters = () => {
    setQuery(null);
    setLifecycle(null);
    setYear(null);
    setContractNumber(null);
    setContractAmount(null);
    resetVisibleCount();
  };

  return (
    <>
      <SEO
        title="Contracts and Awards"
        description="Browse the award and contract lifecycle evidence published for BetterSanFernando's bounded infrastructure and public-works project subset."
        keywords="contracts, awards, procurement, infrastructure projects, City of San Fernando Pampanga"
      />
      <main className="flex-grow">
        <Section className="p-3 mb-12">
          <Breadcrumbs
            className="mb-8"
            items={[
              { label: 'Home', href: '/' },
              { label: 'City Projects', href: '/projects' },
              { label: 'Contracts and Awards' },
            ]}
          />

          <header className="max-w-3xl">
            <Heading>Contracts and awards</Heading>
            <p className="text-lg leading-8 text-gray-700">
              Explore the published award and contract records connected to
              BetterSanFernando&apos;s verified infrastructure and public-works
              subset. Contract execution is shown only where the canonical
              project lifecycle supports it.
            </p>
          </header>

          <div className="mt-8 border-y border-gray-200 bg-gray-50">
            <dl className="grid grid-cols-2 lg:grid-cols-5">
              {[
                ['Published projects', summary.totalPublishedProjects],
                ['Awarded', summary.awarded],
                ['Contracted', summary.contracted],
                ['With contract amount', summary.withContractAmount],
                ['With contract number', summary.withContractNumber],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`p-4 sm:p-5 ${index % 2 === 1 ? 'border-l border-gray-200' : ''} ${index > 1 ? 'border-t border-gray-200 lg:border-t-0' : ''} ${index > 0 ? 'lg:border-l lg:border-gray-200' : ''}`}
                >
                  <dt className="text-sm leading-5 text-gray-700">{label}</dt>
                  <dd className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <aside
            className="mt-8 grid overflow-hidden rounded-xl bg-primary-900 text-white md:grid-cols-2"
            aria-labelledby="lifecycle-distinction"
          >
            <div className="p-5 md:p-6">
              <h2 id="lifecycle-distinction" className="text-xl font-bold">
                Award does not equal contract
              </h2>
              <p className="mt-2 text-sm leading-6 text-primary-100">
                An award decision identifies the selected bidder or awardee. It
                does not, by itself, establish that an executed contract exists.
              </p>
            </div>
            <dl className="grid border-t border-primary-700 sm:grid-cols-2 md:border-l md:border-t-0">
              <div className="p-5">
                <dt className="font-bold">AWARDED</dt>
                <dd className="mt-1 text-sm leading-6 text-primary-100">
                  Published evidence establishes an award decision.
                </dd>
              </div>
              <div className="border-t border-primary-700 p-5 sm:border-l sm:border-t-0">
                <dt className="font-bold">CONTRACTED</dt>
                <dd className="mt-1 text-sm leading-6 text-primary-100">
                  Published evidence supports an executed contract.
                </dd>
              </div>
            </dl>
          </aside>

          <section aria-labelledby="contracts-browser" className="mt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2
                  id="contracts-browser"
                  className="text-2xl font-bold text-gray-900"
                >
                  Published award and contract records
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
                Search and filter records
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                <label className="relative md:col-span-2 xl:col-span-2">
                  <span className="sr-only">
                    Search award and contract records
                  </span>
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
                    placeholder="Project, contractor, identifier, or evidence ID"
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </label>
                <label>
                  <span className="sr-only">Lifecycle</span>
                  <select
                    value={lifecycle}
                    onChange={event => {
                      setLifecycle(event.target.value || null);
                      resetVisibleCount();
                    }}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="">All award/contract records</option>
                    <option value="AWARDED">Awarded only</option>
                    <option value="CONTRACTED">Contracted</option>
                  </select>
                </label>
                <label>
                  <span className="sr-only">Project year</span>
                  <select
                    value={year}
                    onChange={event => {
                      setYear(event.target.value || null);
                      resetVisibleCount();
                    }}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="">All project years</option>
                    {years.map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="sr-only">Contract number availability</span>
                  <select
                    value={contractNumber}
                    onChange={event => {
                      setContractNumber(event.target.value || null);
                      resetVisibleCount();
                    }}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="">Any contract number</option>
                    <option value="available">Number available</option>
                    <option value="unavailable">Number unavailable</option>
                  </select>
                </label>
                <label>
                  <span className="sr-only">Contract amount availability</span>
                  <select
                    value={contractAmount}
                    onChange={event => {
                      setContractAmount(event.target.value || null);
                      resetVisibleCount();
                    }}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="">Any contract amount</option>
                    <option value="available">Amount available</option>
                    <option value="unavailable">Amount unavailable</option>
                  </select>
                </label>
                <label className="md:col-span-2 xl:col-span-2">
                  <span className="sr-only">Sort records</span>
                  <select
                    value={sort}
                    onChange={event => {
                      setSort(event.target.value || null);
                      resetVisibleCount();
                    }}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="date-desc">Newest relevant date</option>
                    <option value="date-asc">Oldest relevant date</option>
                    <option value="contract-amount-desc">
                      Contract amount: high to low
                    </option>
                    <option value="contract-amount-asc">
                      Contract amount: low to high
                    </option>
                    <option value="winning-bid-desc">
                      Winning bid: high to low
                    </option>
                    <option value="title-asc">Project title A–Z</option>
                    <option value="contract-number-asc">
                      Contract number A–Z
                    </option>
                  </select>
                </label>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="mt-5 border border-dashed border-gray-300 px-5 py-12 text-center">
                <FileQuestion
                  className="mx-auto h-7 w-7 text-gray-600"
                  aria-hidden="true"
                />
                <h3 className="mt-3 font-semibold text-gray-900">
                  No award or contract records match
                </h3>
                <p className="mt-1 text-sm text-gray-700">
                  Try a broader search or clear the active filters.
                </p>
              </div>
            ) : (
              <ol className="mt-5 divide-y divide-gray-200 border-y border-gray-200">
                {filtered
                  .slice(0, visibleCount)
                  .map(({ project, sourceEvidence }) => {
                    const isContracted =
                      project.lifecycle_status === 'CONTRACTED';
                    return (
                      <li
                        key={project.id}
                        className="grid min-w-0 gap-5 py-6 lg:grid-cols-[11rem_minmax(0,1fr)_18rem] lg:gap-7"
                      >
                        <div className="min-w-0">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${isContracted ? 'bg-success-100 text-success-800' : 'bg-warning-100 text-warning-900'}`}
                          >
                            <FileCheck2
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            {project.lifecycle_status}
                          </span>
                          <p className="mt-3 text-sm leading-6 text-gray-700">
                            {isContracted
                              ? 'Published evidence supports an executed contract.'
                              : 'Contract execution is not established in the current public dataset.'}
                          </p>
                          <dl className="mt-4 text-xs">
                            <dt className="text-gray-600">
                              {isContracted && project.contract_effectivity_date
                                ? 'Contract effectivity'
                                : project.award_date
                                  ? 'Award date'
                                  : 'Record status date'}
                            </dt>
                            <dd className="mt-0.5 font-medium text-gray-900">
                              {formatIsoDate(
                                isContracted &&
                                  project.contract_effectivity_date
                                  ? project.contract_effectivity_date
                                  : (project.award_date ?? project.status_as_of)
                              )}
                            </dd>
                          </dl>
                        </div>

                        <div className="min-w-0">
                          <h3>
                            <Link
                              to={`/projects/${project.id}`}
                              className="font-semibold leading-6 text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
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
                          <p className="mt-2 text-sm text-gray-700">
                            {project.barangay
                              ? `Barangay ${project.barangay}`
                              : 'Barangay not attributed'}
                          </p>

                          <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
                            <div>
                              <dt className="text-gray-600">APP Code (PAP)</dt>
                              <dd className="mt-0.5 break-words font-mono text-gray-900">
                                {project.identifiers.app_code ??
                                  'Not available'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-gray-600">
                                BAC / control reference
                              </dt>
                              <dd className="mt-0.5 break-words font-mono text-gray-900">
                                {project.identifiers.bid_reference ??
                                  'Not available'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-gray-600">
                                PhilGEPS reference
                              </dt>
                              <dd className="mt-0.5 break-words font-mono text-gray-900">
                                {project.identifiers.philgeps_reference ??
                                  'Not available'}
                              </dd>
                            </div>
                          </dl>

                          <dl className="mt-5 grid gap-4 border-t border-gray-200 pt-4 sm:grid-cols-2 xl:grid-cols-4">
                            <div>
                              <dt className="text-xs leading-5 text-gray-600">
                                Approved Budget for the Contract (ABC)
                              </dt>
                              <dd className="mt-1 text-sm font-bold tabular-nums text-gray-900">
                                {formatPeso(project.approved_budget_abc)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs leading-5 text-gray-600">
                                Winning bid amount
                              </dt>
                              <dd className="mt-1 text-sm font-bold tabular-nums text-gray-900">
                                {formatPeso(project.winning_bid_amount)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs leading-5 text-gray-600">
                                Contract amount
                              </dt>
                              <dd className="mt-1 text-sm font-bold tabular-nums text-gray-900">
                                {formatPeso(project.contract_amount)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs leading-5 text-gray-600">
                                Contractor / awardee
                              </dt>
                              <dd className="mt-1 text-sm font-semibold text-gray-900">
                                {project.contractor ?? 'Not available'}
                              </dd>
                            </div>
                          </dl>
                        </div>

                        <div className="min-w-0 border-t border-gray-200 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                          <dl className="text-sm">
                            <dt className="font-semibold text-gray-900">
                              Contract number
                            </dt>
                            <dd className="mt-1 break-words font-mono text-gray-800">
                              {project.identifiers.contract_number ??
                                'Not available in current public data'}
                            </dd>
                          </dl>

                          {hasContractAmount(project) && !isContracted && (
                            <p className="mt-3 rounded-lg bg-warning-50 p-3 text-xs leading-5 text-warning-900">
                              A contract amount field is published for this
                              award record, but contract execution is not
                              established by its canonical lifecycle.
                            </p>
                          )}

                          <div className="mt-5 border-t border-gray-200 pt-4">
                            {sourceEvidence ? (
                              <>
                                <p className="mb-2 break-words text-xs leading-5 text-gray-600">
                                  Evidence ID:{' '}
                                  <span className="font-mono text-gray-800">
                                    {sourceEvidence.id}
                                  </span>
                                  <span className="block">
                                    Source identifier:{' '}
                                    {sourceEvidence.source_identifier}
                                  </span>
                                  <span className="block">
                                    {authorityLabel(
                                      sourceEvidence.source_authority
                                    )}{' '}
                                    · {getEvidenceSourceLabel(sourceEvidence)}
                                  </span>
                                </p>
                                <EvidenceSourceLinks
                                  evidence={sourceEvidence}
                                />
                              </>
                            ) : (
                              <p className="text-sm text-gray-700">
                                No public source link recorded.
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
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
            aria-labelledby="contracts-coverage"
          >
            <h2
              id="contracts-coverage"
              className="text-xl font-bold text-gray-900"
            >
              Coverage and interpretation
            </h2>
            <div className="mt-3 grid gap-4 text-sm leading-6 text-gray-700 md:grid-cols-3">
              <p>
                This is a bounded infrastructure and public-works subset, not a
                complete archive of all City Government contracts. Missing
                values remain unknown rather than inferred.
              </p>
              <p>
                Award evidence does not equal contract execution. Contract
                evidence does not by itself establish Notice to Proceed,
                physical progress, completion, payment, or actual expenditure.
              </p>
              <p>
                A contract amount is not actual expenditure. Absence of contract
                evidence here does not prove that no contract exists.
              </p>
            </div>
          </aside>

          <section
            className="mt-10 max-w-5xl"
            aria-labelledby="bid-results-distinction"
          >
            <h2
              id="bid-results-distinction"
              className="text-lg font-bold text-gray-900"
            >
              Bid results and contracts answer different questions
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              Bid Results publishes procurement-result and winning-bid evidence.
              This archive shows award and contract lifecycle records while
              keeping executed contracts separate from award-only records.
            </p>
            <Link
              to="/procurement/bid-results"
              className="mt-3 inline-flex text-sm font-semibold text-primary-700 underline decoration-primary-200 underline-offset-4 hover:text-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Browse Bid Results
            </Link>
          </section>

          <nav
            className="mt-10"
            aria-label="Related procurement and project pages"
          >
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
