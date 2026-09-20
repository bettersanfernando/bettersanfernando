import Link from 'next/link';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getBarangayBoundaries,
  getCityBoundary,
} from '../../../data/civic/geography';
import { aggregateProjectsByBarangay } from '../../../data/civic/projectMap';
import { getProjects } from '../../../data/civic/projects';
import ProjectMapView from './project-map-view';
import BarangayDistributionTable from './barangay-table';

import { buildPageMetadata } from '../../../lib/metadata';

export const metadata = buildPageMetadata({
  title: 'Project distribution by barangay',
  description:
    "Explore how the verified BetterSanFernando infrastructure and public-works project subset is distributed across San Fernando's barangays.",
  path: '/projects/map',
});

// Ported from src/pages/ProjectMap.tsx. Everything except the MapLibre
// canvas, the toolbar/details-panel state, and the table's client-side
// search/sort/pagination is static content, so only those two focused
// islands (project-map-view.tsx, barangay-table.tsx) are Client
// Components; this route entry stays a Server Component and computes the
// distribution once at render time from the same civic accessors the
// legacy page uses.
export default function ProjectMapPage() {
  const projects = getProjects();
  const boundaries = getBarangayBoundaries();
  const cityBoundary = getCityBoundary();
  const distribution = aggregateProjectsByBarangay(projects, boundaries);

  const top10 = [...distribution.barangays]
    .sort(
      (a, b) => b.projectCount - a.projectCount || a.name.localeCompare(b.name)
    )
    .slice(0, 10);
  const maxTop10Count = Math.max(1, ...top10.map(b => b.projectCount));

  return (
    <main className="flex-grow bg-white pb-16 md:pb-24">
      <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
        <Breadcrumbs
          className="text-xs text-gray-500"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Projects', href: '/projects' },
            { label: 'Project Map' },
          ]}
        />

        <div className="mt-6 max-w-3xl">
          <p className="text-eyebrow text-[#0066EB]">Project Map</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-[-0.02em] text-gray-950 md:text-5xl">
            Project distribution across San Fernando
          </h1>
          <p className="mt-5 text-base leading-7 text-gray-700 md:text-lg">
            See how BetterSanFernando&rsquo;s published project records are
            distributed across the City of San Fernando&rsquo;s barangays.
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Barangay shading represents the number of project records attributed
            to each barangay. It does not show exact project locations.
          </p>
        </div>

        <dl className="mt-8 grid grid-cols-1 gap-6 border-y border-gray-200 py-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-gray-200">
          <div className="sm:pr-6">
            <dt className="text-sm text-gray-600">Published project records</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-gray-950">
              {distribution.totalProjects}
            </dd>
          </div>
          <div className="sm:px-6">
            <dt className="text-sm text-gray-600">Attributed to a barangay</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-gray-950">
              {distribution.attributedProjects}
            </dd>
          </div>
          <div className="sm:pl-6">
            <dt className="text-sm text-gray-600">
              Not attributed to a barangay
            </dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-gray-950">
              {distribution.unattributedProjects}
            </dd>
            {distribution.unattributedProjects > 0 && (
              <Link
                href="/projects/city-projects?barangay=unattributed"
                className="mt-1 inline-flex text-xs font-semibold text-[#0066EB] hover:text-[#0052BC]"
              >
                View unattributed projects →
              </Link>
            )}
          </div>
        </dl>

        <ProjectMapView
          boundaries={boundaries}
          cityBoundary={cityBoundary}
          barangays={distribution.barangays}
          attributedProjects={distribution.attributedProjects}
          unattributedProjects={distribution.unattributedProjects}
        />

        <section
          aria-labelledby="about-map-heading"
          className="mt-12 border-t border-gray-200 pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]">About This Map</p>
          <h2
            id="about-map-heading"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
          >
            What the map represents
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Project records
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                Counts are based on BetterSanFernando&rsquo;s published project
                records and their verified barangay attribution. Records without
                a barangay attribution stay in the totals above and are reported
                separately.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Not exact project locations
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                The map shades whole barangays. It does not show the precise
                construction site or project coordinates, and shading does not
                indicate spending, quality, or completion.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Boundary source
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                Barangay boundaries come from the community-maintained
                Philippines PSGC shapefile set (31 December 2023), matched to
                the Philippine Statistics Authority&rsquo;s official barangay
                codes and names. This is a bounded infrastructure and
                public-works subset, not a complete list of all city activity.
              </p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="top-barangays-heading"
          className="mt-12 border-t border-gray-200 pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]">Quick Comparison</p>
          <h2
            id="top-barangays-heading"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
          >
            Top 10 barangays by project records
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            The 10 barangays with the most attributed project records. This
            reflects record counts only, not spending or project quality.
          </p>
          <ol className="mt-6 space-y-3">
            {top10.map(barangay => (
              <li key={barangay.psgcCode} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-sm text-gray-700 sm:w-36">
                  {barangay.name}
                </span>
                <span className="h-3 flex-1 overflow-hidden rounded-sm bg-gray-100">
                  <span
                    className="block h-full rounded-sm bg-[#0066EB]"
                    style={{
                      width: `${Math.max(2, (barangay.projectCount / maxTop10Count) * 100)}%`,
                    }}
                  />
                </span>
                <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums text-gray-900">
                  {barangay.projectCount}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="distribution-table-title"
          className="mt-12 border-t border-gray-200 pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]">Barangay Directory</p>
          <h2
            id="distribution-table-title"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
          >
            Project records by barangay
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Browse all 35 barangays and see how many published project records
            are currently attributed to each one.
          </p>
          <p className="mt-2 text-xs leading-5 text-gray-500">
            Status labels show each project record&rsquo;s current lifecycle
            stage.
          </p>

          <div className="mt-6">
            <BarangayDistributionTable barangays={distribution.barangays} />
          </div>
        </section>
      </div>
    </main>
  );
}
