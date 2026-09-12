import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  FolderKanban,
  RotateCcw,
  Search,
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import {
  getCoveredProjectIds,
  getLatestObservationForProject,
  getObservationsForProject,
  getProjectCostUtilizationMetadata,
  getProjectCostUtilizationObservations,
  getRepeatedObservationProjectIds,
  type ProjectCostUtilizationObservation,
} from '../data/civic/projectCostUtilization';
import { getProjectById, getProjects } from '../data/civic/projects';
import { formatUnstatedAmount } from '../lib/utils';

const observations = getProjectCostUtilizationObservations();
const metadata = getProjectCostUtilizationMetadata(getProjects().length);
const coveredProjectIds = getCoveredProjectIds();
const repeatedProjectIds = getRepeatedObservationProjectIds();

function projectName(projectId: string): string {
  return getProjectById(projectId)?.project_name ?? projectId;
}

function periodLabel(observation: ProjectCostUtilizationObservation): string {
  return `${observation.reporting_year} Q${observation.reporting_quarter}`;
}

function sourceLink(observation: ProjectCostUtilizationObservation): {
  url: string;
  kind: 'page' | 'attachment';
} {
  return observation.official_page_url
    ? { url: observation.official_page_url, kind: 'page' }
    : { url: observation.official_attachment_url, kind: 'attachment' };
}

function PercentBar({
  label,
  value,
  colorClassName,
}: {
  label: string;
  value: number | null;
  colorClassName: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="font-semibold text-gray-700">{label}</span>
        <span className="font-bold tabular-nums text-gray-900">
          {value === null ? 'Not available' : `${value}%`}
        </span>
      </div>
      <div
        className="mt-1 h-2.5 overflow-hidden rounded-full bg-gray-200"
        role="img"
        aria-label={`${label}: ${value === null ? 'not available' : `${value} percent`}`}
      >
        {value !== null && (
          <div
            className={`h-full rounded-full ${colorClassName}`}
            style={{ width: `${value}%` }}
          />
        )}
      </div>
    </div>
  );
}

function SourceLinkAnchor({
  observation,
}: {
  observation: ProjectCostUtilizationObservation;
}) {
  const { url, kind } = sourceLink(observation);
  const name = projectName(observation.canonical_project_id);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open the official ${kind === 'page' ? 'source page' : 'source attachment'} for ${name}, ${periodLabel(observation)} (opens in a new tab)`}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
    >
      <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {kind === 'page' ? 'Official source page' : 'Official source document'}
      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
    </a>
  );
}

type YearFilter = 'ALL' | number;
type QuarterFilter = 'ALL' | number;

const COMPARISON_PREVIEW_COUNT = 6;
const OBSERVATIONS_PER_PAGE = 10;

export default function ProjectSpendingStatistics() {
  const [query, setQuery] = useState('');
  const [year, setYear] = useState<YearFilter>('ALL');
  const [quarter, setQuarter] = useState<QuarterFilter>('ALL');
  const [page, setPage] = useState(1);
  const [showAllComparisons, setShowAllComparisons] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    repeatedProjectIds[0] ?? coveredProjectIds[0] ?? ''
  );

  const years = useMemo(
    () =>
      [...new Set(observations.map(o => o.reporting_year))].sort(
        (a, b) => b - a
      ),
    []
  );

  const hasFilters = Boolean(
    query.trim() || year !== 'ALL' || quarter !== 'ALL'
  );

  const filteredObservations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return observations.filter(observation => {
      const matchesYear = year === 'ALL' || observation.reporting_year === year;
      const matchesQuarter =
        quarter === 'ALL' || observation.reporting_quarter === quarter;
      const matchesQuery =
        !normalizedQuery ||
        projectName(observation.canonical_project_id)
          .toLowerCase()
          .includes(normalizedQuery) ||
        observation.canonical_project_id
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesYear && matchesQuarter && matchesQuery;
    });
  }, [query, year, quarter]);

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function updateYear(value: YearFilter) {
    setYear(value);
    setPage(1);
  }

  function updateQuarter(value: QuarterFilter) {
    setQuarter(value);
    setPage(1);
  }

  const totalPages = Math.max(
    1,
    Math.ceil(filteredObservations.length / OBSERVATIONS_PER_PAGE)
  );
  const currentPage = Math.min(page, totalPages);
  const pagedObservations = filteredObservations.slice(
    (currentPage - 1) * OBSERVATIONS_PER_PAGE,
    currentPage * OBSERVATIONS_PER_PAGE
  );

  function resetFilters() {
    setQuery('');
    setYear('ALL');
    setQuarter('ALL');
    setPage(1);
  }

  const latestByProject = useMemo(
    () =>
      coveredProjectIds
        .map(projectId => getLatestObservationForProject(projectId))
        .filter(
          (observation): observation is ProjectCostUtilizationObservation =>
            Boolean(observation)
        )
        .sort((a, b) =>
          projectName(a.canonical_project_id).localeCompare(
            projectName(b.canonical_project_id)
          )
        ),
    []
  );

  const visibleComparisons = showAllComparisons
    ? latestByProject
    : latestByProject.slice(0, COMPARISON_PREVIEW_COUNT);

  const selectedProjectObservations = useMemo(
    () => getObservationsForProject(selectedProjectId),
    [selectedProjectId]
  );
  const selectedLatestObservation = selectedProjectObservations.at(-1);

  // Observations for one project never span more than one reporting year in
  // the current export, but group by year defensively so a future multi-year
  // repeat is rendered as separate within-year trends, never one continuous
  // cross-year line.
  const selectedProjectByYear = useMemo(() => {
    const byYear = new Map<number, ProjectCostUtilizationObservation[]>();
    for (const observation of selectedProjectObservations) {
      const list = byYear.get(observation.reporting_year) ?? [];
      list.push(observation);
      byYear.set(observation.reporting_year, list);
    }
    return [...byYear.entries()].sort(([a], [b]) => b - a);
  }, [selectedProjectObservations]);

  return (
    <>
      <SEO
        title="Project Cost & Utilization"
        description="Verified, source-reported cost-utilization observations for a bounded subset of BetterSanFernando's published city projects."
        keywords="San Fernando Pampanga project cost, National Tax Allotment utilization, project utilization report"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/statistics/project-spending`}
        siteName="BetterSanFernando"
      />
      <main className="flex-grow bg-gray-50">
        <section className="border-b border-primary-100 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <Breadcrumbs
              className="mb-8"
              items={[
                { label: 'Home', href: '/' },
                { label: 'Statistics', href: '/statistics' },
                { label: 'Project Cost & Utilization' },
              ]}
            />
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="max-w-3xl">
                <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                  Project Cost & Utilization
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
                  Source-reported, year-to-date cost-utilization observations
                  for a bounded subset of published city projects.
                </p>
                <p className="mt-3 max-w-2xl text-sm font-semibold text-gray-800">
                  {metadata.uniqueProjectCount} projects with verified
                  utilization observations out of{' '}
                  {metadata.canonicalProjectCount} projects tracked by
                  BetterSanFernando.
                </p>
                <Link
                  to="/projects"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary-300 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50"
                >
                  <FolderKanban className="h-4 w-4" aria-hidden="true" />
                  Browse all {metadata.canonicalProjectCount} projects
                </Link>
              </div>
              <aside className="rounded-xl bg-warning-50 p-5 text-sm leading-relaxed text-warning-900">
                <p className="font-semibold">Verified partial collection</p>
                <p className="mt-1">
                  This is not a citywide spending report — it covers{' '}
                  {metadata.uniqueProjectCount} of{' '}
                  {metadata.canonicalProjectCount} published projects.
                </p>
              </aside>
            </div>

            <dl className="mt-9 grid grid-cols-2 border-y border-gray-200 lg:grid-cols-3">
              {[
                ['Verified observations', metadata.recordCount],
                [
                  'Projects represented',
                  `${metadata.uniqueProjectCount} of ${metadata.canonicalProjectCount}`,
                ],
                [
                  'Projects with repeated observations',
                  metadata.repeatedObservationProjectCount,
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
            <p>{metadata.coverageLimitation}</p>
          </div>
        </section>

        <section
          className="border-y border-gray-200 bg-white"
          aria-labelledby="explore-heading"
        >
          <div className="container mx-auto px-4 py-10 md:py-12">
            <h2
              id="explore-heading"
              className="text-2xl font-bold text-gray-900"
            >
              Explore a project
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700">
              Select a project to see its latest verified observation and its
              within-year history. Quarters are non-additive and are never
              summed into a total; observations from different years are never
              connected into one continuous trend.
            </p>
            <label className="mt-5 block max-w-md">
              <span className="mb-2 block text-sm font-semibold text-gray-900">
                Select a project
              </span>
              <select
                value={selectedProjectId}
                onChange={event => setSelectedProjectId(event.target.value)}
                className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
              >
                {coveredProjectIds
                  .map(projectId => ({
                    projectId,
                    name: projectName(projectId),
                  }))
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(({ projectId, name }) => (
                    <option key={projectId} value={projectId}>
                      {name}
                      {repeatedProjectIds.includes(projectId)
                        ? ''
                        : ' (single observation)'}
                    </option>
                  ))}
              </select>
            </label>

            {selectedLatestObservation && (
              <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Link
                    to={`/projects/${selectedLatestObservation.canonical_project_id}`}
                    className="font-bold text-gray-900 underline decoration-primary-300 underline-offset-4 hover:text-primary-800"
                  >
                    {projectName(
                      selectedLatestObservation.canonical_project_id
                    )}
                  </Link>
                  <span className="text-xs font-semibold text-gray-600">
                    Latest: {periodLabel(selectedLatestObservation)} ·{' '}
                    {selectedLatestObservation.status_remarks}
                  </span>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <PercentBar
                    label="Cost incurred to date (derived)"
                    value={
                      selectedLatestObservation.cost_incurred_to_date_percent_derived
                    }
                    colorClassName="bg-primary-600"
                  />
                  <PercentBar
                    label="Physical completion (source-reported)"
                    value={
                      selectedLatestObservation.physical_completion_percent
                    }
                    colorClassName="bg-success-600"
                  />
                </div>
              </div>
            )}

            {selectedProjectObservations.length <= 1 ? (
              <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white px-5 py-8 text-center">
                <p className="font-medium text-gray-900">
                  No within-year history is available
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  This project has only one verified observation.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-6">
                {selectedProjectByYear.map(([observationYear, list]) => {
                  const earlierInYear = list.filter(
                    observation =>
                      observation.id !== selectedLatestObservation?.id
                  );
                  if (earlierInYear.length === 0) return null;
                  return (
                    <div
                      key={observationYear}
                      className="rounded-xl bg-gray-50 p-5"
                    >
                      <h3 className="text-sm font-bold text-gray-900">
                        Earlier in {observationYear}
                      </h3>
                      <div className="mt-3 space-y-4">
                        {earlierInYear.map(observation => (
                          <div key={observation.id}>
                            <p className="text-xs font-semibold text-gray-600">
                              Q{observation.reporting_quarter} ·{' '}
                              {observation.status_remarks}
                            </p>
                            <div className="mt-1 grid gap-3 sm:grid-cols-2">
                              <PercentBar
                                label="Cost incurred to date (derived)"
                                value={
                                  observation.cost_incurred_to_date_percent_derived
                                }
                                colorClassName="bg-primary-600"
                              />
                              <PercentBar
                                label="Physical completion (source-reported)"
                                value={observation.physical_completion_percent}
                                colorClassName="bg-success-600"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section
          className="container mx-auto px-4 py-10 md:py-12"
          aria-labelledby="latest-comparison-heading"
        >
          <h2
            id="latest-comparison-heading"
            className="text-2xl font-bold text-gray-900"
          >
            Projects with verified utilization observations
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700">
            Each project's most recently reported observation, compared as
            percentages only. Total Cost Incurred to Date is a year-to-date
            figure, not proof of cash payment; physical completion is a
            source-reported observation, not independent field verification.
            This is not a ranking — projects are listed alphabetically.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {visibleComparisons.map(observation => (
              <div
                key={observation.canonical_project_id}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Link
                    to={`/projects/${observation.canonical_project_id}`}
                    className="text-sm font-bold text-gray-900 underline decoration-primary-300 underline-offset-4 hover:text-primary-800"
                  >
                    {projectName(observation.canonical_project_id)}
                  </Link>
                  <span className="text-xs font-semibold text-gray-600">
                    Latest: {periodLabel(observation)}
                  </span>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <PercentBar
                    label="Cost incurred to date (derived)"
                    value={observation.cost_incurred_to_date_percent_derived}
                    colorClassName="bg-primary-600"
                  />
                  <PercentBar
                    label="Physical completion (source-reported)"
                    value={observation.physical_completion_percent}
                    colorClassName="bg-success-600"
                  />
                </div>
              </div>
            ))}
          </div>
          {latestByProject.length > COMPARISON_PREVIEW_COUNT && (
            <button
              type="button"
              onClick={() => setShowAllComparisons(current => !current)}
              aria-expanded={showAllComparisons}
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
            >
              {showAllComparisons
                ? 'Show fewer'
                : `View all ${latestByProject.length} projects`}
            </button>
          )}
        </section>

        <section
          className="border-y border-gray-200 bg-white"
          aria-labelledby="observations-heading"
        >
          <div className="container mx-auto px-4 py-10 md:py-12">
            <h2
              id="observations-heading"
              className="text-2xl font-bold text-gray-900"
            >
              Source observations
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700">
              All {metadata.recordCount} verified observations, filterable and
              paginated.
            </p>
            <div className="mt-5 grid gap-4 rounded-xl bg-primary-900 p-4 text-white md:grid-cols-[minmax(15rem,1fr)_10rem_10rem_auto] md:items-end md:p-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-primary-50">
                  Search project
                </span>
                <span className="relative block">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={event => updateQuery(event.target.value)}
                    placeholder="e.g. Calulut, road, canal"
                    className="min-h-11 w-full rounded-lg border border-primary-700 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
                  />
                </span>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-primary-50">
                  Year
                </span>
                <select
                  value={year}
                  onChange={event =>
                    updateYear(
                      event.target.value === 'ALL'
                        ? 'ALL'
                        : Number(event.target.value)
                    )
                  }
                  className="min-h-11 w-full rounded-lg border border-primary-700 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
                >
                  <option value="ALL">All years</option>
                  {years.map(y => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-primary-50">
                  Quarter
                </span>
                <select
                  value={quarter}
                  onChange={event =>
                    updateQuarter(
                      event.target.value === 'ALL'
                        ? 'ALL'
                        : Number(event.target.value)
                    )
                  }
                  className="min-h-11 w-full rounded-lg border border-primary-700 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
                >
                  <option value="ALL">All quarters</option>
                  {[1, 2, 3, 4].map(q => (
                    <option key={q} value={q}>
                      Q{q}
                    </option>
                  ))}
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
              Showing {filteredObservations.length} of {metadata.recordCount}{' '}
              observations
            </p>

            {filteredObservations.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
                <p className="font-medium text-gray-900">
                  No observation matches these filters
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Try a different search term or reset the filters.
                </p>
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
                  <thead className="bg-gray-50 text-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Project
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Period
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Total cost
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Total cost incurred to date
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Cost incurred (derived %)
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Physical completion
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Source
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pagedObservations.map(observation => (
                      <tr key={observation.id}>
                        <td className="max-w-[16rem] px-4 py-3">
                          <Link
                            to={`/projects/${observation.canonical_project_id}`}
                            className="font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                          >
                            {projectName(observation.canonical_project_id)}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                          {periodLabel(observation)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                          {formatUnstatedAmount(observation.total_cost)}
                          <span className="block text-xs text-gray-500">
                            Currency not stated in source
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                          {formatUnstatedAmount(
                            observation.total_cost_incurred_to_date
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                          {observation.cost_incurred_to_date_percent_derived ===
                          null
                            ? 'Not available'
                            : `${observation.cost_incurred_to_date_percent_derived}%`}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                          {observation.physical_completion_percent}%
                        </td>
                        <td className="max-w-[12rem] px-4 py-3 text-gray-700">
                          {observation.status_remarks}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <SourceLinkAnchor observation={observation} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredObservations.length > 0 && totalPages > 1 && (
              <nav
                className="mt-4 flex items-center justify-between gap-3"
                aria-label="Source observations pagination"
              >
                <button
                  type="button"
                  onClick={() => setPage(current => Math.max(1, current - 1))}
                  disabled={currentPage <= 1}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Previous
                </button>
                <span className="text-sm text-gray-700" aria-hidden="true">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPage(current => Math.min(totalPages, current + 1))
                  }
                  disabled={currentPage >= totalPages}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </nav>
            )}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-10 md:pb-14">
          <h2 className="text-lg font-bold text-gray-900">
            How to read these observations
          </h2>
          <div className="mt-3 max-w-3xl space-y-2 text-sm leading-6 text-gray-700">
            <p>
              Every figure here is year-to-date, as published by the source
              document for that specific quarter. Observations from different
              quarters are not additive and must never be summed into a total;
              BetterSanFernando does not publish a citywide, cross-project, or
              cross-year total from this dataset.
            </p>
            <p>
              Total Cost Incurred to Date is not proof of cash payment,
              contractor disbursement, or completed expenditure. Currency is not
              stated in the source documents — amounts are shown as plain
              numbers, never as PHP or peso figures. Physical completion and
              status remarks are transcribed from the official source, not
              independently verified in the field.
            </p>
            <p>
              Missing values are shown as "Not available," never as zero.
              Coverage is limited to {metadata.uniqueProjectCount} of{' '}
              {metadata.canonicalProjectCount} published projects; absence from
              this page does not mean a project has no cost or utilization
              activity.
            </p>
          </div>
          <p className="mt-5 text-sm">
            <Link
              to="/statistics/projects"
              className="font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
            >
              View overall Project Statistics
            </Link>
            {' · '}
            <Link
              to="/statistics/procurement"
              className="font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
            >
              View Procurement Statistics
            </Link>
            {' · '}
            <Link
              to="/projects"
              className="font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
            >
              Browse City Projects
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}
