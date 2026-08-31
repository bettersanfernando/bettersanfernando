import { lazy, Suspense, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Info, ListFilter, Map as MapIcon } from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import PageLoading from '../components/ui/PageLoading';
import SEO from '../components/SEO';
import {
  getBarangayBoundaries,
  getCityBoundary,
} from '../data/civic/geography';
import { aggregateProjectsByBarangay } from '../data/civic/projectMap';
import { getProjects } from '../data/civic/projects';
import { titleCaseEnum } from '../lib/utils';

const BarangayProjectMap = lazy(
  () => import('../components/projects/BarangayProjectMap')
);

const LEGEND = [
  { label: 'No attributed projects', color: '#e9ecef' },
  { label: '1–4 projects', color: '#cce0fb' },
  { label: '5–9 projects', color: '#66a3f3' },
  { label: '10–19 projects', color: '#0066eb' },
  { label: '20 or more projects', color: '#003d8d' },
];

export default function ProjectMap() {
  const projects = getProjects();
  const boundaries = getBarangayBoundaries();
  const cityBoundary = getCityBoundary();
  const distribution = useMemo(
    () => aggregateProjectsByBarangay(projects, boundaries),
    [projects, boundaries]
  );
  const [selectedPsgc, setSelectedPsgc] = useState<string | null>(null);
  const selected = distribution.barangays.find(
    barangay => barangay.psgcCode === selectedPsgc
  );

  return (
    <>
      <SEO
        title="Project distribution by barangay"
        description="Explore how the verified BetterSanFernando infrastructure and public-works project subset is distributed across San Fernando's barangays."
        keywords="San Fernando projects, barangay project distribution, infrastructure, public works"
      />
      <main className="bg-white pb-16">
        <div className="container mx-auto px-4 pt-12">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Projects', href: '/projects' },
              { label: 'Map' },
            ]}
            className="mb-8"
          />

          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold tracking-[-0.02em] text-gray-900 sm:text-5xl">
              Project distribution by barangay
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-gray-700 sm:text-lg">
              Compare where records in BetterSanFernando’s verified, bounded
              infrastructure and public-works project subset are attributed
              across the city’s 35 barangays.
            </p>
          </div>

          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-5 border-y border-gray-200 py-5">
            <div>
              <dt className="text-sm text-gray-600">
                Published project records
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
                {distribution.totalProjects}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">
                Attributed to a barangay
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
                {distribution.attributedProjects}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Barangay not attributed</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
                {distribution.unattributedProjects}
              </dd>
            </div>
          </dl>

          <div className="mt-8 grid overflow-hidden rounded-2xl border border-gray-300 bg-gray-50 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="min-w-0">
              <Suspense fallback={<PageLoading />}>
                <BarangayProjectMap
                  boundaries={boundaries}
                  cityBoundary={cityBoundary}
                  summaries={distribution.barangays}
                  selectedPsgc={selectedPsgc}
                  onSelect={setSelectedPsgc}
                />
              </Suspense>
            </div>
            <aside className="border-t border-gray-300 bg-white p-5 lg:border-t-0 lg:border-l">
              <div className="flex items-center gap-2 text-gray-900">
                <MapIcon
                  className="h-5 w-5 text-primary-700"
                  aria-hidden="true"
                />
                <h2 className="text-lg font-semibold">Map details</h2>
              </div>
              {selected ? (
                <div className="mt-5" aria-live="polite">
                  <p className="text-xl font-semibold text-gray-900">
                    {selected.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    <strong className="font-semibold text-gray-900 tabular-nums">
                      {selected.projectCount}
                    </strong>{' '}
                    attributed project{selected.projectCount === 1 ? '' : 's'}
                  </p>
                  <dl className="mt-5 space-y-2 border-t border-gray-200 pt-4 text-sm">
                    {Object.entries(selected.lifecycleCounts).map(
                      ([status, count]) => (
                        <div
                          key={status}
                          className="flex justify-between gap-4"
                        >
                          <dt className="text-gray-600">
                            {titleCaseEnum(status)}
                          </dt>
                          <dd className="font-medium tabular-nums text-gray-900">
                            {count}
                          </dd>
                        </div>
                      )
                    )}
                  </dl>
                  <h3 className="mt-5 border-t border-gray-200 pt-4 text-sm font-semibold text-gray-900">
                    Project category
                  </h3>
                  <dl className="mt-2 space-y-2 text-sm">
                    {Object.entries(selected.categoryCounts).map(
                      ([category, count]) => (
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
                      )
                    )}
                  </dl>
                  <Link
                    to={`/projects?barangay=${selected.psgcCode}`}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                  >
                    <ListFilter className="h-4 w-4" aria-hidden="true" />
                    View project records
                  </Link>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  Select a barangay polygon to see its count and lifecycle
                  breakdown. The complete distribution is also available in the
                  table below.
                </p>
              )}

              <h3 className="mt-7 border-t border-gray-200 pt-5 text-sm font-semibold text-gray-900">
                Project count
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {LEGEND.map(item => (
                  <li key={item.label} className="flex items-center gap-2.5">
                    <span
                      className="h-4 w-4 shrink-0 rounded-sm border border-gray-400"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    {item.label}
                  </li>
                ))}
              </ul>
            </aside>
          </div>

          <section className="mt-8 rounded-xl bg-primary-50 px-5 py-5 text-primary-900">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div>
                <h2 className="font-semibold">What this map shows</h2>
                <p className="mt-1 max-w-4xl text-sm leading-6 text-primary-900">
                  Polygons represent barangay boundaries. Counts aggregate
                  project records by their verified barangay association; they
                  do not show exact project sites or physical implementation
                  progress. Records without a barangay attribution are kept in
                  the total and reported separately. This dataset is a bounded
                  infrastructure and public-works subset, not a complete list of
                  all city activity.
                </p>
                <p className="mt-3 max-w-4xl text-sm leading-6 text-primary-900">
                  <strong>Sources:</strong> project counts use the published
                  project records and their barangay PSGC associations; each{' '}
                  <Link
                    to="/projects"
                    className="font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                  >
                    project record
                  </Link>{' '}
                  links to its supporting evidence. Polygon geometry comes from
                  the community-maintained Philippines PSGC shapefile set (31
                  December 2023), with barangay codes and names matched to the
                  Philippine Statistics Authority’s PSGC.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-14" aria-labelledby="distribution-table-title">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2
                  id="distribution-table-title"
                  className="text-2xl font-semibold tracking-[-0.02em] text-gray-900"
                >
                  Barangay distribution
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                  The same counts shown on the map, available without map
                  interaction. Select a barangay name to filter the project
                  records.
                </p>
              </div>
              <Link
                to="/projects?barangay=unattributed"
                className="text-sm font-semibold text-primary-700 underline underline-offset-4 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                View {distribution.unattributedProjects} unattributed records
              </Link>
            </div>

            <div className="mt-5 overflow-x-auto rounded-xl border border-gray-300">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">
                  Project counts and lifecycle summaries for all 35 barangays
                </caption>
                <thead className="bg-gray-100 text-gray-800">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Barangay
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right font-semibold"
                    >
                      Projects
                    </th>
                    <th
                      scope="col"
                      className="hidden px-4 py-3 text-right font-semibold sm:table-cell"
                    >
                      Planned
                    </th>
                    <th
                      scope="col"
                      className="hidden px-4 py-3 text-right font-semibold md:table-cell"
                    >
                      Procurement
                    </th>
                    <th
                      scope="col"
                      className="hidden px-4 py-3 text-right font-semibold md:table-cell"
                    >
                      Awarded
                    </th>
                    <th
                      scope="col"
                      className="hidden px-4 py-3 text-right font-semibold sm:table-cell"
                    >
                      Contracted
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {distribution.barangays.map(barangay => (
                    <tr key={barangay.psgcCode} className="hover:bg-primary-50">
                      <th
                        scope="row"
                        className="px-4 py-3 font-medium text-gray-900"
                      >
                        <Link
                          to={`/projects?barangay=${barangay.psgcCode}`}
                          className="underline decoration-gray-300 underline-offset-4 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                        >
                          {barangay.name}
                        </Link>
                      </th>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900">
                        {barangay.projectCount}
                      </td>
                      <td className="hidden px-4 py-3 text-right tabular-nums text-gray-700 sm:table-cell">
                        {barangay.lifecycleCounts.PLANNED}
                      </td>
                      <td className="hidden px-4 py-3 text-right tabular-nums text-gray-700 md:table-cell">
                        {barangay.lifecycleCounts.PROCUREMENT}
                      </td>
                      <td className="hidden px-4 py-3 text-right tabular-nums text-gray-700 md:table-cell">
                        {barangay.lifecycleCounts.AWARDED}
                      </td>
                      <td className="hidden px-4 py-3 text-right tabular-nums text-gray-700 sm:table-cell">
                        {barangay.lifecycleCounts.CONTRACTED}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
