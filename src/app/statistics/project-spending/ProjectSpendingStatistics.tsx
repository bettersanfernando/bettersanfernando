'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  FileText,
  Info,
  Link2,
  RotateCcw,
  Search,
  SearchX,
} from 'lucide-react';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getCoveredProjectIds,
  getLatestObservationForProject,
  getObservationsForProject,
  getProjectCostUtilizationMetadata,
  getProjectCostUtilizationObservations,
  getRepeatedObservationProjectIds,
  type ProjectCostUtilizationObservation,
} from '../../../data/civic/projectCostUtilization';
import { getProjectById, getProjects } from '../../../data/civic/projects';
import { formatUnstatedAmount } from '../../../lib/utils';

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
      {kind === 'page' ? (
        <Link2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      )}
      {kind === 'page' ? 'Official source page' : 'Official source document'}
      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
    </a>
  );
}

function compareNullableNumber(
  a: number | null,
  b: number | null,
  direction: 'asc' | 'desc'
): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return direction === 'desc' ? b - a : a - b;
}

// ---------------------------------------------------------------------------
// Dataset coverage bar — represents ONLY how much of the canonical project
// collection has a verified observation. Never implies spending/completion.
// ---------------------------------------------------------------------------
function CoverageBar({
  represented,
  total,
}: {
  represented: number;
  total: number;
}) {
  const percent = total > 0 ? (represented / total) * 100 : 0;
  return (
    <div>
      <div
        className="h-3 w-full overflow-hidden rounded-sm bg-gray-100"
        role="img"
        aria-label={`${represented} of ${total} published projects represented, ${percent.toFixed(1)} percent`}
      >
        <div
          className="h-full rounded-sm bg-[#0066EB]"
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
        <span
          className="inline-block h-2 w-2 shrink-0 rounded-sm bg-[#0066EB]"
          aria-hidden="true"
        />
        Represented
        <span
          className="ml-3 inline-block h-2 w-2 shrink-0 rounded-sm bg-gray-100"
          aria-hidden="true"
        />
        Remaining
      </div>
    </div>
  );
}

const DISTRIBUTION_RANGES = [
  '0–24%',
  '25–49%',
  '50–74%',
  '75–99%',
  '100% or more',
] as const;

function bucketIndex(value: number): number {
  if (value >= 100) return 4;
  if (value >= 75) return 3;
  if (value >= 50) return 2;
  if (value >= 25) return 1;
  return 0;
}

function buildDistribution(
  values: readonly number[]
): { label: string; count: number }[] {
  const counts = DISTRIBUTION_RANGES.map(label => ({ label, count: 0 }));
  for (const value of values) counts[bucketIndex(value)].count += 1;
  return counts;
}

function DistributionBars({
  title,
  counts,
  unavailableCount,
}: {
  title: string;
  counts: { label: string; count: number }[];
  unavailableCount?: number;
}) {
  const max = Math.max(1, ...counts.map(c => c.count));
  return (
    <div>
      <p className="text-sm font-bold text-gray-900">{title}</p>
      <div
        className="mt-3 space-y-2"
        role="img"
        aria-label={`${title} distribution: ${counts.map(c => `${c.label}, ${c.count} projects`).join('; ')}`}
      >
        {counts.map(c => (
          <div key={c.label} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-gray-600">
              {c.label}
            </span>
            <span className="h-4 flex-1 overflow-hidden rounded-sm bg-gray-100">
              <span
                className="block h-full rounded-sm bg-[#0066EB]"
                style={{ width: `${(c.count / max) * 100}%` }}
              />
            </span>
            <span className="w-6 shrink-0 text-right text-xs font-semibold tabular-nums text-gray-900">
              {c.count}
            </span>
          </div>
        ))}
      </div>
      {typeof unavailableCount === 'number' && unavailableCount > 0 && (
        <p className="mt-2 text-xs text-gray-500">
          Cost percentage unavailable: {unavailableCount} project
          {unavailableCount === 1 ? '' : 's'}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reporting-period coverage bar chart — answers "when does this dataset have
// observations", not spending totals.
// ---------------------------------------------------------------------------
function PeriodCoverageChart({
  periods,
}: {
  periods: { label: string; count: number }[];
}) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...periods.map(p => p.count));

  return (
    <div>
      <div
        className="grid grid-cols-[repeat(auto-fit,minmax(3.5rem,1fr))] items-end gap-3 sm:gap-5"
        role="img"
        aria-label={`Verified observation counts across ${periods.length} reporting periods`}
      >
        {periods.map((p, i) => (
          <button
            key={p.label}
            type="button"
            className="flex min-w-0 flex-col items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            aria-label={`${p.label}: ${p.count} verified observation${p.count === 1 ? '' : 's'}`}
          >
            <span className="text-xs font-semibold tabular-nums text-gray-900">
              {p.count}
            </span>
            <span className="flex h-36 w-full max-w-12 items-end rounded-sm bg-gray-100">
              <span
                className={`block w-full rounded-sm ${active === i ? 'bg-[#0052BC]' : 'bg-[#0066EB]'}`}
                style={{ height: `${(p.count / max) * 100}%` }}
              />
            </span>
            <span className="whitespace-nowrap text-xs text-gray-600">
              {p.label}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-3 min-h-[2.5rem] text-sm text-gray-700">
        {active !== null ? (
          <p>
            <strong className="font-bold text-gray-900">
              {periods[active].label}
            </strong>
            : {periods[active].count} verified observation
            {periods[active].count === 1 ? '' : 's'}
          </p>
        ) : (
          <p className="text-xs text-gray-500">
            Hover or focus a bar for its reporting-period detail.
          </p>
        )}
      </div>
    </div>
  );
}

function ObservationHistoryYearGroup({
  year,
  observations: yearObservations,
  showYear,
}: {
  year: number;
  observations: ProjectCostUtilizationObservation[];
  showYear: boolean;
}) {
  return (
    <div>
      {showYear && <p className="text-sm font-bold text-gray-900">{year}</p>}
      <ol
        className={`${showYear ? 'mt-2' : ''} divide-y divide-gray-200 border-y border-gray-200`}
      >
        {yearObservations.map(observation => {
          const source = sourceLink(observation);
          return (
            <li
              key={observation.id}
              className="grid gap-3 py-4 text-sm sm:grid-cols-[5rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.25fr)_auto] sm:items-center"
            >
              <p className="font-semibold text-gray-900">
                {periodLabel(observation)}
              </p>
              <p>
                <span className="block text-xs text-gray-500 sm:hidden">
                  Cost incurred
                </span>
                <span className="font-medium tabular-nums text-gray-900">
                  {observation.cost_incurred_to_date_percent_derived === null
                    ? 'Not available'
                    : `${observation.cost_incurred_to_date_percent_derived}%`}
                </span>
              </p>
              <p>
                <span className="block text-xs text-gray-500 sm:hidden">
                  Physical completion
                </span>
                <span className="font-medium tabular-nums text-gray-900">
                  {observation.physical_completion_percent}%
                </span>
              </p>
              <p>
                <span className="block text-xs text-gray-500 sm:hidden">
                  Status
                </span>
                <span className="text-gray-700">
                  {observation.status_remarks}
                </span>
              </p>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open official source for ${periodLabel(observation)} (opens in a new tab)`}
                className="inline-flex items-center gap-1 font-semibold text-[#0066EB] hover:text-[#0052BC]"
              >
                <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                Official source
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

type YearFilter = 'ALL' | number;
type QuarterFilter = 'ALL' | number;
type SnapshotSort =
  | 'period-desc'
  | 'name-asc'
  | 'completion-desc'
  | 'completion-asc'
  | 'cost-desc'
  | 'cost-asc';

const SNAPSHOT_SORTS: { value: SnapshotSort; label: string }[] = [
  { value: 'period-desc', label: 'Latest reporting period' },
  { value: 'name-asc', label: 'Project A–Z' },
  { value: 'completion-desc', label: 'Highest physical completion' },
  { value: 'completion-asc', label: 'Lowest physical completion' },
  { value: 'cost-desc', label: 'Highest cost-incurred %' },
  { value: 'cost-asc', label: 'Lowest cost-incurred %' },
];

const SNAPSHOTS_PER_PAGE = 10;
const OBSERVATIONS_PER_PAGE = 10;

const selectClass =
  'h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-2 focus:ring-[#0066EB]/20';

export default function ProjectSpendingStatistics() {
  // Detailed source-observation filters
  const [query, setQuery] = useState('');
  const [year, setYear] = useState<YearFilter>('ALL');
  const [quarter, setQuarter] = useState<QuarterFilter>('ALL');
  const [page, setPage] = useState(1);

  // One latest observation per represented project
  const [snapshotQuery, setSnapshotQuery] = useState('');
  const [snapshotSort, setSnapshotSort] = useState<SnapshotSort>('period-desc');
  const [snapshotPage, setSnapshotPage] = useState(1);

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    repeatedProjectIds[0] ?? coveredProjectIds[0] ?? ''
  );
  const [projectPickerQuery, setProjectPickerQuery] = useState('');
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);

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
  function resetFilters() {
    setQuery('');
    setYear('ALL');
    setQuarter('ALL');
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

  // One latest observation per represented project - feeds the distribution
  // charts and the snapshot directory alike.
  const latestByProject = useMemo(
    () =>
      coveredProjectIds
        .map(projectId => getLatestObservationForProject(projectId))
        .filter(
          (observation): observation is ProjectCostUtilizationObservation =>
            Boolean(observation)
        ),
    []
  );

  const costDistribution = useMemo(() => {
    const values = latestByProject
      .map(o => o.cost_incurred_to_date_percent_derived)
      .filter((v): v is number => v !== null);
    return {
      buckets: buildDistribution(values),
      unavailable: latestByProject.length - values.length,
    };
  }, [latestByProject]);

  const completionDistribution = useMemo(
    () =>
      buildDistribution(
        latestByProject.map(o => o.physical_completion_percent)
      ),
    [latestByProject]
  );

  const periodCoverage = useMemo(() => {
    const counts = new Map<
      string,
      { year: number; quarter: number; count: number }
    >();
    for (const o of observations) {
      const key = `${o.reporting_year}-${o.reporting_quarter}`;
      const entry = counts.get(key);
      if (entry) entry.count += 1;
      else
        counts.set(key, {
          year: o.reporting_year,
          quarter: o.reporting_quarter,
          count: 1,
        });
    }
    return [...counts.values()]
      .sort((a, b) => a.year - b.year || a.quarter - b.quarter)
      .map(entry => ({
        label: `${entry.year} Q${entry.quarter}`,
        count: entry.count,
      }));
  }, []);

  const filteredSnapshots = useMemo(() => {
    const q = snapshotQuery.trim().toLowerCase();
    return q
      ? latestByProject.filter(o =>
          projectName(o.canonical_project_id).toLowerCase().includes(q)
        )
      : latestByProject;
  }, [snapshotQuery, latestByProject]);

  const sortedSnapshots = useMemo(() => {
    const copy = [...filteredSnapshots];
    switch (snapshotSort) {
      case 'name-asc':
        copy.sort((a, b) =>
          projectName(a.canonical_project_id).localeCompare(
            projectName(b.canonical_project_id)
          )
        );
        break;
      case 'completion-desc':
        copy.sort(
          (a, b) =>
            b.physical_completion_percent - a.physical_completion_percent
        );
        break;
      case 'completion-asc':
        copy.sort(
          (a, b) =>
            a.physical_completion_percent - b.physical_completion_percent
        );
        break;
      case 'cost-desc':
        copy.sort((a, b) =>
          compareNullableNumber(
            a.cost_incurred_to_date_percent_derived,
            b.cost_incurred_to_date_percent_derived,
            'desc'
          )
        );
        break;
      case 'cost-asc':
        copy.sort((a, b) =>
          compareNullableNumber(
            a.cost_incurred_to_date_percent_derived,
            b.cost_incurred_to_date_percent_derived,
            'asc'
          )
        );
        break;
      case 'period-desc':
      default:
        copy.sort(
          (a, b) =>
            b.reporting_year - a.reporting_year ||
            b.reporting_quarter - a.reporting_quarter
        );
    }
    return copy;
  }, [filteredSnapshots, snapshotSort]);

  function updateSnapshotQuery(value: string) {
    setSnapshotQuery(value);
    setSnapshotPage(1);
  }
  function updateSnapshotSort(value: SnapshotSort) {
    setSnapshotSort(value);
    setSnapshotPage(1);
  }

  const snapshotTotalPages = Math.max(
    1,
    Math.ceil(sortedSnapshots.length / SNAPSHOTS_PER_PAGE)
  );
  const snapshotCurrentPage = Math.min(snapshotPage, snapshotTotalPages);
  const pagedSnapshots = sortedSnapshots.slice(
    (snapshotCurrentPage - 1) * SNAPSHOTS_PER_PAGE,
    snapshotCurrentPage * SNAPSHOTS_PER_PAGE
  );

  const selectedProjectObservations = useMemo(
    () => getObservationsForProject(selectedProjectId),
    [selectedProjectId]
  );
  const selectedLatestObservation = selectedProjectObservations.at(-1);

  const representedProjects = useMemo(
    () =>
      coveredProjectIds
        .map(projectId => {
          const project = getProjectById(projectId);
          return {
            id: projectId,
            name: projectName(projectId),
            barangay: project?.barangay,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    []
  );
  const matchingProjects = useMemo(() => {
    const query = projectPickerQuery.trim().toLowerCase();
    return (
      query
        ? representedProjects.filter(
            project =>
              project.name.toLowerCase().includes(query) ||
              project.barangay?.toLowerCase().includes(query)
          )
        : representedProjects
    ).slice(0, 8);
  }, [projectPickerQuery, representedProjects]);

  function selectProject(projectId: string) {
    setSelectedProjectId(projectId);
    setProjectPickerQuery('');
    setProjectPickerOpen(false);
    setActiveProjectIndex(0);
  }

  // Observations for one project never span more than one reporting year in
  // the current export, but group by year defensively so a future multi-year
  // repeat renders as separate within-year trends, never one continuous
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

  const coveragePercent =
    metadata.canonicalProjectCount > 0
      ? (metadata.uniqueProjectCount / metadata.canonicalProjectCount) * 100
      : 0;

  return (
    <main className="flex-grow bg-white pb-16 md:pb-24">
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Projects', href: '/projects' },
              { label: 'Project Cost & Utilization' },
            ]}
          />

          <div className="mt-6 max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">Project Statistics</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-[-0.02em] text-gray-950 md:text-5xl">
              Project Cost &amp; Utilization
            </h1>
            <p className="mt-5 text-base leading-7 text-gray-700 md:text-lg">
              Explore source-reported cost-utilization and physical-completion
              observations for the subset of published City projects with
              verified records.
            </p>
            <p className="mt-3 text-sm text-gray-600">
              This is a partial project dataset, not a citywide spending total.
            </p>
            <Link
              href="/projects/city-projects"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] hover:text-[#0052BC]"
            >
              Browse all {metadata.canonicalProjectCount} projects →
            </Link>
          </div>

          <dl className="mt-8 grid grid-cols-1 gap-6 border-y border-gray-200 py-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-gray-200">
            <div className="sm:pr-6">
              <dt className="text-sm text-gray-600">Verified observations</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums text-gray-950">
                {metadata.recordCount}
              </dd>
            </div>
            <div className="sm:px-6">
              <dt className="text-sm text-gray-600">Projects represented</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums text-gray-950">
                {metadata.uniqueProjectCount}
              </dd>
            </div>
            <div className="sm:pl-6">
              <dt className="text-sm text-gray-600">
                Projects with repeated observations
              </dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums text-gray-950">
                {metadata.repeatedObservationProjectCount}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Dataset coverage + About this dataset */}
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          <section
            aria-labelledby="coverage-heading"
            className="h-full rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6"
          >
            <p className="text-eyebrow text-[#0066EB]">Dataset Coverage</p>
            <h2
              id="coverage-heading"
              className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
            >
              How much of the project collection is represented?
            </h2>
            <p className="mt-4 text-2xl font-bold tabular-nums text-gray-950">
              {metadata.uniqueProjectCount} of {metadata.canonicalProjectCount}{' '}
              published projects
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {coveragePercent.toFixed(1)}% of the current project collection
            </p>
            <div className="mt-5">
              <CoverageBar
                represented={metadata.uniqueProjectCount}
                total={metadata.canonicalProjectCount}
              />
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
              <div>
                <dt className="text-xs text-gray-600">Represented</dt>
                <dd className="mt-1 text-xl font-bold tabular-nums text-gray-950">
                  {metadata.uniqueProjectCount}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-600">Not represented</dt>
                <dd className="mt-1 text-xl font-bold tabular-nums text-gray-950">
                  {metadata.canonicalProjectCount - metadata.uniqueProjectCount}
                </dd>
              </div>
            </dl>
            <p className="mt-5 text-sm leading-6 text-gray-700">
              Projects without a verified cost-utilization observation are still
              part of the City Projects collection. They are not included in the
              analysis on this page.
            </p>
          </section>

          <section
            aria-labelledby="about-dataset-heading"
            className="h-full rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6"
          >
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-[#0066EB]" aria-hidden="true" />
              <h2
                id="about-dataset-heading"
                className="text-base font-bold text-gray-900"
              >
                About this dataset
              </h2>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  What this page covers
                </h3>
                <p className="mt-1 text-sm leading-6 text-gray-700">
                  This page includes only projects with a verified
                  cost-utilization observation. It does not represent all City
                  projects or total City spending.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Cost incurred
                </h3>
                <p className="mt-1 text-sm leading-6 text-gray-700">
                  The percentage is calculated from the total cost and cost
                  incurred to date reported in the official source. It does not
                  confirm that a payment or disbursement was made.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Physical completion
                </h3>
                <p className="mt-1 text-sm leading-6 text-gray-700">
                  The percentage comes directly from the official source.
                  BetterSanFernando does not independently inspect or verify
                  construction progress.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Reporting periods
                </h3>
                <p className="mt-1 text-sm leading-6 text-gray-700">
                  Each observation shows year-to-date figures for that reporting
                  period. Quarterly values should not be added together.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Currency
                </h3>
                <p className="mt-1 text-sm leading-6 text-gray-700">
                  The source does not state a currency unit, so monetary amounts
                  are shown without a currency symbol.
                </p>
              </div>
            </div>
          </section>
        </div>

        <section
          aria-labelledby="distribution-heading"
          className="mt-10 border-t border-gray-200 pt-8"
        >
          <p className="text-eyebrow text-[#0066EB]">Latest Observations</p>
          <h2
            id="distribution-heading"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
          >
            Where the latest project observations fall
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Each represented project contributes its most recent verified
            observation.
          </p>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            These ranges show where each project&apos;s latest reported
            percentages fall. The bars show the number of projects in each
            range, not an assessment of the projects.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <DistributionBars
              title="Cost incurred"
              counts={costDistribution.buckets}
              unavailableCount={costDistribution.unavailable}
            />
            <DistributionBars
              title="Physical completion"
              counts={completionDistribution}
            />
          </div>
        </section>

        <section
          aria-labelledby="period-coverage-heading"
          className="mt-10 border-t border-gray-200 pt-8"
        >
          <p className="text-eyebrow text-[#0066EB]">Reporting Coverage</p>
          <h2
            id="period-coverage-heading"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
          >
            Verified observations by reporting period
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            See how many verified observations are available for each reporting
            quarter.
          </p>
          <div className="mt-6">
            <PeriodCoverageChart periods={periodCoverage} />
          </div>
        </section>

        {/* Project observation history */}
        <section
          aria-labelledby="explore-heading"
          className="mt-10 border-t border-gray-200 pt-8"
        >
          <h2
            id="explore-heading"
            className="text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
          >
            Project observation history
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Select a project to compare its verified reporting periods. Each
            observation contains year-to-date figures, so compare the periods
            rather than adding them together.
          </p>
          <div className="relative mt-5 max-w-2xl">
            <span className="mb-2 block text-sm font-semibold text-gray-900">
              Select a project
            </span>
            <input
              id="project-history-picker"
              type="search"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={projectPickerOpen}
              aria-controls="project-history-options"
              aria-activedescendant={
                projectPickerOpen && matchingProjects[activeProjectIndex]
                  ? `project-history-option-${matchingProjects[activeProjectIndex].id}`
                  : undefined
              }
              value={
                projectPickerOpen
                  ? projectPickerQuery
                  : projectName(selectedProjectId)
              }
              placeholder="Search project name..."
              onFocus={() => {
                setProjectPickerQuery('');
                setProjectPickerOpen(true);
                setActiveProjectIndex(0);
              }}
              onChange={event => {
                setProjectPickerQuery(event.target.value);
                setProjectPickerOpen(true);
                setActiveProjectIndex(0);
              }}
              onKeyDown={event => {
                if (event.key === 'Escape') {
                  setProjectPickerOpen(false);
                  setProjectPickerQuery('');
                } else if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  if (!projectPickerOpen) {
                    setProjectPickerOpen(true);
                    setActiveProjectIndex(0);
                  } else {
                    setActiveProjectIndex(index =>
                      Math.min(
                        index + 1,
                        Math.max(0, matchingProjects.length - 1)
                      )
                    );
                  }
                } else if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  setActiveProjectIndex(index => Math.max(0, index - 1));
                } else if (
                  event.key === 'Enter' &&
                  projectPickerOpen &&
                  matchingProjects[activeProjectIndex]
                ) {
                  event.preventDefault();
                  selectProject(matchingProjects[activeProjectIndex].id);
                }
              }}
              className="h-10 w-full truncate rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-2 focus:ring-[#0066EB]/20"
            />
            {projectPickerOpen && (
              <div
                id="project-history-options"
                role="listbox"
                aria-label="Matching projects"
                className="absolute z-10 mt-1 max-h-80 w-full overflow-y-auto rounded-sm border border-gray-300 bg-white py-1 shadow-sm"
              >
                {matchingProjects.length > 0 ? (
                  <>
                    {matchingProjects.map((project, index) => (
                      <button
                        key={project.id}
                        id={`project-history-option-${project.id}`}
                        type="button"
                        role="option"
                        aria-selected={index === activeProjectIndex}
                        onMouseDown={event => event.preventDefault()}
                        onClick={() => selectProject(project.id)}
                        className={`block w-full px-3 py-2 text-left text-sm ${index === activeProjectIndex ? 'bg-[#F3F6FB] text-[#0052BC]' : 'text-gray-900 hover:bg-[#F3F6FB]'}`}
                      >
                        <span className="block truncate font-semibold">
                          {project.name}
                        </span>
                        {project.barangay && (
                          <span className="mt-0.5 block text-xs text-gray-600">
                            {project.barangay}
                          </span>
                        )}
                      </button>
                    ))}
                    {representedProjects.length > matchingProjects.length && (
                      <p className="px-3 py-2 text-xs text-gray-500">
                        Keep typing to narrow results.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="px-3 py-3 text-sm text-gray-600">
                    No represented projects match your search.
                  </p>
                )}
              </div>
            )}
          </div>

          {selectedLatestObservation && (
            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
              <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-5">
                <div>
                  <p className="font-bold text-gray-900">
                    {projectName(
                      selectedLatestObservation.canonical_project_id
                    )}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Latest period:{' '}
                    <span className="font-semibold text-gray-900">
                      {periodLabel(selectedLatestObservation)}
                    </span>
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500">Cost incurred</p>
                    <p className="mt-0.5 text-xl font-bold tabular-nums text-gray-950">
                      {selectedLatestObservation.cost_incurred_to_date_percent_derived ===
                      null
                        ? 'Not available'
                        : `${selectedLatestObservation.cost_incurred_to_date_percent_derived}%`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Physical completion</p>
                    <p className="mt-0.5 text-xl font-bold tabular-nums text-gray-950">
                      {selectedLatestObservation.physical_completion_percent}%
                    </p>
                  </div>
                </div>
                <p className="mt-4 border-t border-gray-200 pt-3 text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">
                    Source-reported status
                  </span>{' '}
                  {selectedLatestObservation.status_remarks}
                </p>
                <Link
                  href={`/projects/${selectedLatestObservation.canonical_project_id}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] hover:text-[#0052BC]"
                >
                  View project details →
                </Link>
              </div>
              <div>
                <p className="text-eyebrow text-[#0066EB]">
                  Available reporting periods
                </p>
                <div className="mt-4 hidden grid-cols-[5rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.25fr)_auto] gap-3 border-y border-gray-200 py-2 text-xs font-semibold text-gray-600 sm:grid">
                  <span>Period</span>
                  <span>Cost incurred</span>
                  <span>Physical completion</span>
                  <span>Status</span>
                  <span>Source</span>
                </div>
                {selectedProjectObservations.length === 1 && (
                  <p className="mt-3 text-sm text-gray-600">
                    Only one verified observation is currently available for
                    this project.
                  </p>
                )}
                <div className="mt-4 space-y-6">
                  {selectedProjectByYear.map(([observationYear, list]) => (
                    <ObservationHistoryYearGroup
                      key={observationYear}
                      year={observationYear}
                      observations={list}
                      showYear={selectedProjectByYear.length > 1}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Browse projects with utilization data */}
        <section
          aria-labelledby="snapshots-heading"
          className="mt-12 border-t border-gray-200 pt-10"
        >
          <h2
            id="snapshots-heading"
            className="text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
          >
            Browse projects with utilization data
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Each project appears once using its most recent verified
            observation.
            <span className="hidden" aria-hidden="true">
              a ranking of project performance — sort by whichever measure is
              useful to you.
            </span>
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="search"
              value={snapshotQuery}
              onChange={event => updateSnapshotQuery(event.target.value)}
              placeholder="Search projects…"
              aria-label="Search projects"
              className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-2 focus:ring-[#0066EB]/20 sm:max-w-md"
            />
            <label className="w-full sm:w-60">
              <span className="sr-only">Sort projects</span>
              <select
                value={snapshotSort}
                onChange={event =>
                  updateSnapshotSort(event.target.value as SnapshotSort)
                }
                className={selectClass}
              >
                {SNAPSHOT_SORTS.map(option => (
                  <option key={option.value} value={option.value}>
                    Sort: {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {sortedSnapshots.length === 0 ? (
            <div className="mt-5 border border-gray-200 px-6 py-12 text-center">
              <SearchX
                className="mx-auto h-7 w-7 text-gray-400"
                aria-hidden="true"
              />
              <h3 className="mt-3 text-base font-bold text-gray-900">
                No projects match your search.
              </h3>
              <button
                type="button"
                onClick={() => updateSnapshotQuery('')}
                className="mt-4 inline-flex items-center rounded-sm bg-[#0066EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0052BC]"
              >
                Clear search
              </button>
            </div>
          ) : (
            <>
              <ol className="mt-5 divide-y divide-gray-200 border-y border-gray-200">
                {pagedSnapshots.map(observation => (
                  <li
                    key={observation.canonical_project_id}
                    className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_7rem_7rem_9rem_7rem] sm:items-center sm:gap-4"
                  >
                    <Link
                      href={`/projects/${observation.canonical_project_id}`}
                      className="min-w-0 truncate text-sm font-bold text-gray-900 hover:text-[#0066EB]"
                    >
                      {projectName(observation.canonical_project_id)}
                    </Link>
                    <span className="text-xs text-gray-600 sm:text-sm">
                      {periodLabel(observation)}
                    </span>
                    <span className="text-xs tabular-nums text-gray-700 sm:text-sm">
                      {observation.cost_incurred_to_date_percent_derived ===
                      null
                        ? 'Not available'
                        : `${observation.cost_incurred_to_date_percent_derived}%`}
                    </span>
                    <span className="min-w-0 truncate text-xs text-gray-600 sm:text-sm">
                      {observation.status_remarks}
                    </span>
                    <Link
                      href={`/projects/${observation.canonical_project_id}`}
                      className="text-xs font-semibold text-[#0066EB] hover:text-[#0052BC] sm:justify-self-end sm:text-sm"
                    >
                      View project →
                    </Link>
                  </li>
                ))}
              </ol>

              <p className="mt-3 text-sm text-gray-600">
                Showing {(snapshotCurrentPage - 1) * SNAPSHOTS_PER_PAGE + 1}–
                {Math.min(
                  snapshotCurrentPage * SNAPSHOTS_PER_PAGE,
                  sortedSnapshots.length
                )}{' '}
                of {sortedSnapshots.length} projects
              </p>

              {snapshotTotalPages > 1 && (
                <nav
                  aria-label="Project utilization data pagination"
                  className="mt-4 flex items-center justify-between gap-4"
                >
                  <button
                    type="button"
                    disabled={snapshotCurrentPage === 1}
                    onClick={() => setSnapshotPage(snapshotCurrentPage - 1)}
                    className="inline-flex h-9 items-center gap-1 rounded-sm border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 enabled:cursor-pointer enabled:hover:border-[#0066EB] enabled:hover:bg-[#F3F6FB] enabled:hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    Previous
                  </button>
                  <p className="text-sm text-gray-600">
                    Page {snapshotCurrentPage} of {snapshotTotalPages}
                  </p>
                  <button
                    type="button"
                    disabled={snapshotCurrentPage === snapshotTotalPages}
                    onClick={() => setSnapshotPage(snapshotCurrentPage + 1)}
                    className="inline-flex h-9 items-center gap-1 rounded-sm border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 enabled:cursor-pointer enabled:hover:border-[#0066EB] enabled:hover:bg-[#F3F6FB] enabled:hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </nav>
              )}
            </>
          )}
        </section>

        {/* Detailed source observations */}
        <section
          aria-labelledby="observations-heading"
          className="mt-12 border-t border-gray-200 pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]">Detailed data</p>
          <h2
            id="observations-heading"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
          >
            Detailed source observations
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Browse every verified reporting-period observation used on this
            page. A project may appear more than once when observations were
            published for different quarters.
          </p>

          <details className="group mt-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-sm border border-gray-300 bg-[#F3F6FB] px-4 py-3 text-sm font-semibold text-gray-900 hover:border-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]">
              View all {metadata.recordCount} source observations
              <ChevronDown
                className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="mt-5 grid grid-cols-1 gap-3 rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 md:grid-cols-[minmax(14rem,1fr)_9rem_9rem_auto] md:items-end">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-700">
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
                    className="h-10 w-full rounded-sm border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-2 focus:ring-[#0066EB]/20"
                  />
                </span>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-gray-700">
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
                  className={selectClass}
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
                <span className="mb-1.5 block text-xs font-semibold text-gray-700">
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
                  className={selectClass}
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
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-sm border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-900 hover:border-[#0066EB] hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>

            <p className="mt-4 text-sm text-gray-600" aria-live="polite">
              Showing {filteredObservations.length} of {metadata.recordCount}{' '}
              observations
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Currency unit is not stated in the source.
            </p>

            {filteredObservations.length === 0 ? (
              <div className="mt-4 border border-gray-200 px-5 py-12 text-center">
                <p className="font-medium text-gray-900">
                  No observation matches these filters
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Try a different search term or reset the filters.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="mt-6 hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
                    <thead className="border-y border-gray-200 text-gray-700">
                      <tr>
                        <th scope="col" className="py-2.5 pr-4 font-semibold">
                          Project
                        </th>
                        <th scope="col" className="py-2.5 pr-4 font-semibold">
                          Period
                        </th>
                        <th scope="col" className="py-2.5 pr-4 font-semibold">
                          Total cost
                        </th>
                        <th scope="col" className="py-2.5 pr-4 font-semibold">
                          Cost incurred to date
                        </th>
                        <th scope="col" className="py-2.5 pr-4 font-semibold">
                          Cost incurred %
                        </th>
                        <th scope="col" className="py-2.5 pr-4 font-semibold">
                          Physical completion %
                        </th>
                        <th scope="col" className="py-2.5 pr-4 font-semibold">
                          Status
                        </th>
                        <th scope="col" className="py-2.5 font-semibold">
                          Source
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pagedObservations.map(observation => (
                        <tr key={observation.id}>
                          <td className="max-w-[16rem] py-3 pr-4">
                            <Link
                              href={`/projects/${observation.canonical_project_id}`}
                              className="font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                            >
                              {projectName(observation.canonical_project_id)}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap py-3 pr-4 text-gray-700">
                            {periodLabel(observation)}
                          </td>
                          <td className="whitespace-nowrap py-3 pr-4 text-gray-700">
                            {formatUnstatedAmount(observation.total_cost)}
                            <span className="block text-xs text-gray-500">
                              Currency not stated in source
                            </span>
                          </td>
                          <td className="whitespace-nowrap py-3 pr-4 text-gray-700">
                            {formatUnstatedAmount(
                              observation.total_cost_incurred_to_date
                            )}
                          </td>
                          <td className="whitespace-nowrap py-3 pr-4 text-gray-700">
                            {observation.cost_incurred_to_date_percent_derived ===
                            null
                              ? 'Not available'
                              : `${observation.cost_incurred_to_date_percent_derived}%`}
                          </td>
                          <td className="whitespace-nowrap py-3 pr-4 text-gray-700">
                            {observation.physical_completion_percent}%
                          </td>
                          <td className="max-w-[12rem] py-3 pr-4 text-gray-700">
                            {observation.status_remarks}
                          </td>
                          <td className="whitespace-nowrap py-3">
                            <SourceLinkAnchor observation={observation} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile compact records */}
                <ol className="mt-6 divide-y divide-gray-200 border-y border-gray-200 md:hidden">
                  {pagedObservations.map(observation => (
                    <li key={observation.id} className="space-y-2 py-4 text-sm">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <Link
                          href={`/projects/${observation.canonical_project_id}`}
                          className="font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                        >
                          {projectName(observation.canonical_project_id)}
                        </Link>
                        <span className="text-xs text-gray-600">
                          {periodLabel(observation)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                        <div>
                          <p className="text-gray-500">Cost incurred %</p>
                          <p className="font-medium">
                            {observation.cost_incurred_to_date_percent_derived ===
                            null
                              ? 'Not available'
                              : `${observation.cost_incurred_to_date_percent_derived}%`}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Physical completion %</p>
                          <p className="font-medium">
                            {observation.physical_completion_percent}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total cost</p>
                          <p className="font-medium">
                            {formatUnstatedAmount(observation.total_cost)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Cost incurred to date</p>
                          <p className="font-medium">
                            {formatUnstatedAmount(
                              observation.total_cost_incurred_to_date
                            )}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Currency not stated in source
                      </p>
                      <p className="text-xs text-gray-700">
                        <span className="font-semibold text-gray-900">
                          Status:
                        </span>{' '}
                        {observation.status_remarks}
                      </p>
                      <SourceLinkAnchor observation={observation} />
                    </li>
                  ))}
                </ol>
              </>
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
                  className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-900 hover:border-[#0066EB] hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] disabled:cursor-not-allowed disabled:opacity-40"
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
                  className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-900 hover:border-[#0066EB] hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </nav>
            )}
          </details>
        </section>

        {/* How to read this page */}
        <section
          aria-labelledby="how-to-read-heading"
          className="mt-12 border-t border-gray-200 pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]">How To Read This Page</p>
          <h2
            id="how-to-read-heading"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
          >
            What these figures mean
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Cost incurred %
              </h3>
              <p className="mt-1 text-sm leading-6 text-gray-700">
                Calculated from the total cost and cost incurred to date
                reported in the official source.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Physical completion %
              </h3>
              <p className="mt-1 text-sm leading-6 text-gray-700">
                Taken directly from the official source. BetterSanFernando does
                not independently verify physical progress.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Reporting periods
              </h3>
              <p className="mt-1 text-sm leading-6 text-gray-700">
                Each observation contains year-to-date figures. Quarterly values
                should not be added together.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Coverage</h3>
              <p className="mt-1 text-sm leading-6 text-gray-700">
                Only projects with verified cost-utilization observations are
                included in this analysis.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Currency</h3>
              <p className="mt-1 text-sm leading-6 text-gray-700">
                The official source does not state a currency unit, so monetary
                amounts are displayed without a currency symbol.
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="text-eyebrow text-[#0066EB]">Related pages</p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3 text-[0px]">
              <Link
                href="/statistics/projects"
                className="text-sm font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
              >
                Overall Project Statistics →
              </Link>
              {' · '}
              <Link
                href="/statistics/procurement"
                className="text-sm font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
              >
                Procurement Statistics →
              </Link>
              {' · '}
              <Link
                href="/projects/city-projects"
                className="text-sm font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
              >
                Browse City Projects →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
