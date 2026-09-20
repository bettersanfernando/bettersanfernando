'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { RotateCcw, Search } from 'lucide-react';
import PageLoading from '../../../components/ui/PageLoading';
import type {
  BarangayFeature,
  CityFeature,
} from '../../../data/civic/geography';
import type { BarangayProjectSummary } from '../../../data/civic/projectMap';
import {
  ProjectLifecycleStatus,
  type ProjectLifecycleStatus as ProjectLifecycleStatusType,
} from '../../../data/civic/projects';
import { titleCaseEnum } from '../../../lib/utils';

// The only browser-only piece of /projects/map: the MapLibre canvas itself.
// next/dynamic's ssr:false is only usable inside a Client Component, which
// is exactly why this island (not the page.tsx Server Component
// wrapping it) owns the dynamic import — MapLibre's `window`/DOM access
// never runs during server rendering.
const BarangayProjectMap = dynamic(
  () => import('../../../components/projects/BarangayProjectMap'),
  { ssr: false, loading: () => <PageLoading /> }
);

const LIFECYCLE_OPTIONS = ProjectLifecycleStatus.options;

const LEGEND = [
  { label: '0', color: '#e9ecef' },
  { label: '1–4', color: '#cce0fb' },
  { label: '5–9', color: '#66a3f3' },
  { label: '10–19', color: '#0066eb' },
  { label: '20+', color: '#003d8d' },
];

const selectClass =
  'h-10 rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-2 focus:ring-[#0066EB]/20';

export default function ProjectMapView({
  boundaries,
  cityBoundary,
  barangays,
  attributedProjects,
  unattributedProjects,
}: {
  boundaries: readonly BarangayFeature[];
  cityBoundary: CityFeature;
  barangays: readonly BarangayProjectSummary[];
  attributedProjects: number;
  unattributedProjects: number;
}) {
  const [selectedPsgc, setSelectedPsgc] = useState<string | null>(null);
  const [lifecycleFilter, setLifecycleFilter] =
    useState<ProjectLifecycleStatusType | null>(null);

  const selected = useMemo(
    () => barangays.find(barangay => barangay.psgcCode === selectedPsgc),
    [barangays, selectedPsgc]
  );

  const selectedCount = selected
    ? lifecycleFilter
      ? selected.lifecycleCounts[lifecycleFilter]
      : selected.projectCount
    : 0;

  const top3 = useMemo(
    () =>
      [...barangays]
        .sort(
          (a, b) =>
            b.projectCount - a.projectCount || a.name.localeCompare(b.name)
        )
        .slice(0, 3),
    [barangays]
  );

  const cityLifecycleTotals = useMemo(() => {
    const totals: Record<ProjectLifecycleStatusType, number> = {
      PLANNED: 0,
      PROCUREMENT: 0,
      AWARDED: 0,
      CONTRACTED: 0,
      IMPLEMENTATION_REPORTED: 0,
    };
    for (const barangay of barangays) {
      for (const [status, count] of Object.entries(barangay.lifecycleCounts)) {
        totals[status as ProjectLifecycleStatusType] += count;
      }
    }
    return Object.entries(totals)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]) as [ProjectLifecycleStatusType, number][];
  }, [barangays]);

  function resetView() {
    setSelectedPsgc(null);
    setLifecycleFilter(null);
  }

  return (
    <div className="mt-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-sm border border-gray-200 bg-[#F3F6FB] p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <label className="flex-1 sm:min-w-[14rem]">
          <span className="sr-only">Find a barangay</span>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
              aria-hidden="true"
            />
            <select
              value={selectedPsgc ?? ''}
              onChange={event => setSelectedPsgc(event.target.value || null)}
              className={`${selectClass} w-full pl-9`}
            >
              <option value="">Find a barangay…</option>
              {barangays.map(barangay => (
                <option key={barangay.psgcCode} value={barangay.psgcCode}>
                  {barangay.name}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label className="sm:min-w-[13rem]">
          <span className="sr-only">View project records by status</span>
          <select
            value={lifecycleFilter ?? ''}
            onChange={event =>
              setLifecycleFilter(
                (event.target.value ||
                  null) as ProjectLifecycleStatusType | null
              )
            }
            className={`${selectClass} w-full sm:w-auto`}
          >
            <option value="">View: All project records</option>
            {LIFECYCLE_OPTIONS.map(status => (
              <option key={status} value={status}>
                View: {titleCaseEnum(status)}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={resetView}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-sm border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-900 hover:border-[#0066EB] hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset view
        </button>
      </div>

      {/* Map + details */}
      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-stretch">
        <div className="min-w-0 overflow-hidden rounded-sm border border-gray-200 lg:h-full">
          <BarangayProjectMap
            boundaries={boundaries}
            cityBoundary={cityBoundary}
            summaries={barangays}
            selectedPsgc={selectedPsgc}
            onSelect={setSelectedPsgc}
            lifecycleFilter={lifecycleFilter}
          />
        </div>

        <aside className="flex flex-col rounded-sm border border-gray-200 bg-white p-5 lg:h-full">
          {selected ? (
            <div aria-live="polite">
              <p className="text-eyebrow text-[#0066EB]">Selected Barangay</p>
              <p className="mt-2 text-xl font-bold text-gray-950">
                {selected.name}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                <strong className="font-bold tabular-nums text-gray-900">
                  {selectedCount}
                </strong>{' '}
                {lifecycleFilter
                  ? `${titleCaseEnum(lifecycleFilter).toLowerCase()} record${selectedCount === 1 ? '' : 's'}`
                  : `project record${selectedCount === 1 ? '' : 's'}`}
              </p>
              {lifecycleFilter && (
                <p className="mt-1 text-xs text-gray-500">
                  Showing {titleCaseEnum(lifecycleFilter).toLowerCase()} records
                  only. Reset view to see all records.
                </p>
              )}

              <h3 className="mt-5 border-t border-gray-200 pt-4 text-xs font-semibold text-gray-700">
                Current stages
              </h3>
              {selected.projectCount === 0 ? (
                <p className="mt-2 text-sm text-gray-600">
                  No attributed project records.
                </p>
              ) : (
                <dl className="mt-2 space-y-1.5 text-sm">
                  {Object.entries(selected.lifecycleCounts)
                    .filter(([, count]) => count > 0)
                    .map(([status, count]) => (
                      <div key={status} className="flex justify-between gap-4">
                        <dt className="text-gray-600">
                          {titleCaseEnum(status)}
                        </dt>
                        <dd className="font-medium tabular-nums text-gray-900">
                          {count}
                        </dd>
                      </div>
                    ))}
                </dl>
              )}

              {selected.projectCount > 0 && (
                <>
                  <h3 className="mt-5 border-t border-gray-200 pt-4 text-xs font-semibold text-gray-700">
                    Project categories
                  </h3>
                  <dl className="mt-2 space-y-1.5 text-sm">
                    {Object.entries(selected.categoryCounts)
                      .filter(([, count]) => count > 0)
                      .map(([category, count]) => (
                        <div
                          key={category}
                          className="flex justify-between gap-4"
                        >
                          <dt className="text-gray-600">
                            {titleCaseEnum(category)}
                          </dt>
                          <dd className="font-medium tabular-nums text-gray-900">
                            {count}
                          </dd>
                        </div>
                      ))}
                  </dl>
                </>
              )}

              <Link
                href={`/projects/city-projects?barangay=${selected.psgcCode}`}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] hover:text-[#0052BC]"
              >
                View project records →
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-eyebrow text-[#0066EB]">Map Overview</p>
              <h2 className="mt-2 text-xl font-bold text-gray-950">
                Citywide project distribution
              </h2>

              <div className="mt-5">
                <p className="text-3xl font-extrabold tabular-nums text-gray-950">
                  {attributedProjects}
                </p>
                <p className="mt-0.5 text-xs text-gray-600">
                  project records attributed to a barangay
                </p>
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4">
                <p className="text-3xl font-extrabold tabular-nums text-gray-950">
                  {unattributedProjects}
                </p>
                <p className="mt-0.5 text-xs text-gray-600">
                  records without a verified barangay attribution
                </p>
                {unattributedProjects > 0 && (
                  <Link
                    href="/projects/city-projects?barangay=unattributed"
                    className="mt-1 inline-flex text-xs font-semibold text-[#0066EB] hover:text-[#0052BC]"
                  >
                    View unattributed projects →
                  </Link>
                )}
              </div>

              {top3.length > 0 && (
                <div className="mt-5 border-t border-gray-200 pt-4">
                  <h3 className="text-xs font-semibold text-gray-700">
                    Most represented barangays
                  </h3>
                  <ol className="mt-2 space-y-1.5 text-sm">
                    {top3.map((barangay, index) => (
                      <li
                        key={barangay.psgcCode}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="flex items-center gap-2 text-gray-700">
                          <span className="font-mono text-xs text-gray-400">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          {barangay.name}
                        </span>
                        <span className="font-medium tabular-nums text-gray-900">
                          {barangay.projectCount}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {cityLifecycleTotals.length > 0 && (
                <div className="mt-5 border-t border-gray-200 pt-4">
                  <h3 className="text-xs font-semibold text-gray-700">
                    Current project stages
                  </h3>
                  <dl className="mt-2 space-y-1.5 text-sm">
                    {cityLifecycleTotals.map(([status, count]) => (
                      <div key={status} className="flex justify-between gap-4">
                        <dt className="text-gray-600">
                          {titleCaseEnum(status)}
                        </dt>
                        <dd className="font-medium tabular-nums text-gray-900">
                          {count}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 border-t border-gray-200 pt-4 lg:mt-auto">
            <p className="text-xs font-semibold text-gray-700">
              Project records
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-gray-600">
              {LEGEND.map(item => (
                <li key={item.label} className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-sm border border-gray-400"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  {item.label}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              Darker areas have more attributed project records.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
