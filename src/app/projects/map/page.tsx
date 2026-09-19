import Link from 'next/link';
import { Info } from 'lucide-react';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getBarangayBoundaries,
  getCityBoundary,
} from '../../../data/civic/geography';
import { aggregateProjectsByBarangay } from '../../../data/civic/projectMap';
import { getProjects } from '../../../data/civic/projects';
import ProjectMapView from './project-map-view';

import { buildPageMetadata } from '../../../lib/metadata';

export const metadata = buildPageMetadata({
  title: 'Project distribution by barangay',
  description:
    "Explore how the verified BetterSanFernando infrastructure and public-works project subset is distributed across San Fernando's barangays.",
  path: '/projects/map',
});

// Ported from src/pages/ProjectMap.tsx. Everything except the MapLibre
// canvas and its click-driven "Map details" panel is static content, so
// only that piece (project-map-view.tsx) is a Client Component; this
// route entry stays a Server Component and computes the distribution once
// at render time from the same civic accessors the legacy page uses.
export default function ProjectMapPage() {
  const projects = getProjects();
  const boundaries = getBarangayBoundaries();
  const cityBoundary = getCityBoundary();
  const distribution = aggregateProjectsByBarangay(projects, boundaries);

  return (
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
            infrastructure and public-works project subset are attributed across
            the city’s 35 barangays.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
            The map groups records by source-reported barangay. It does not plot
            exact project coordinates; records without a barangay association
            remain projects and are counted as not mapped.
          </p>
        </div>

        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-5 border-y border-gray-200 py-5">
          <div>
            <dt className="text-sm text-gray-600">Published project records</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
              {distribution.totalProjects}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Attributed to a barangay</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
              {distribution.attributedProjects}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Not mapped to a barangay</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
              {distribution.unattributedProjects}
            </dd>
          </div>
        </dl>

        <ProjectMapView
          boundaries={boundaries}
          cityBoundary={cityBoundary}
          barangays={distribution.barangays}
        />

        <section className="mt-8 rounded-xl bg-primary-50 px-5 py-5 text-primary-900">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <h2 className="font-semibold">What this map shows</h2>
              <p className="mt-1 max-w-4xl text-sm leading-6 text-primary-900">
                Polygons represent barangay boundaries. Counts aggregate project
                records by their verified barangay association; they do not show
                exact project sites or physical implementation progress. Records
                without a barangay attribution are kept in the total and
                reported separately. This dataset is a bounded infrastructure
                and public-works subset, not a complete list of all city
                activity.
              </p>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-primary-900">
                <strong>Sources:</strong> project counts use the published
                project records and their barangay PSGC associations; each{' '}
                <Link
                  href="/projects"
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
              href="/projects?barangay=unattributed"
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
                  <th
                    scope="col"
                    className="hidden px-4 py-3 text-right font-semibold lg:table-cell"
                  >
                    Implementation reported
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
                        href={`/projects?barangay=${barangay.psgcCode}`}
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
                    <td className="hidden px-4 py-3 text-right tabular-nums text-gray-700 lg:table-cell">
                      {barangay.lifecycleCounts.IMPLEMENTATION_REPORTED}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
