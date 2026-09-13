'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ListFilter, Map as MapIcon } from 'lucide-react';
import PageLoading from '../../../components/ui/PageLoading';
import type {
  BarangayFeature,
  CityFeature,
} from '../../../data/civic/geography.next';
import type { BarangayProjectSummary } from '../../../data/civic/projectMap';
import { titleCaseEnum } from '../../../lib/utils';

// The only browser-only piece of /projects/map: the MapLibre canvas itself
// and the selectedPsgc click state driving the "Map details" side panel.
// next/dynamic's ssr:false is only usable inside a Client Component, which
// is exactly why this island (not the page.page.tsx Server Component
// wrapping it) owns the dynamic import — MapLibre's `window`/DOM access
// never runs during server rendering.
const BarangayProjectMap = dynamic(
  () => import('../../../components/projects/BarangayProjectMap.next'),
  { ssr: false, loading: () => <PageLoading /> }
);

const LEGEND = [
  { label: 'No attributed projects', color: '#e9ecef' },
  { label: '1–4 projects', color: '#cce0fb' },
  { label: '5–9 projects', color: '#66a3f3' },
  { label: '10–19 projects', color: '#0066eb' },
  { label: '20 or more projects', color: '#003d8d' },
];

export default function ProjectMapView({
  boundaries,
  cityBoundary,
  barangays,
}: {
  boundaries: readonly BarangayFeature[];
  cityBoundary: CityFeature;
  barangays: readonly BarangayProjectSummary[];
}) {
  const [selectedPsgc, setSelectedPsgc] = useState<string | null>(null);
  const selected = barangays.find(
    barangay => barangay.psgcCode === selectedPsgc
  );

  return (
    <div className="mt-8 grid overflow-hidden rounded-2xl border border-gray-300 bg-gray-50 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0">
        <BarangayProjectMap
          boundaries={boundaries}
          cityBoundary={cityBoundary}
          summaries={barangays}
          selectedPsgc={selectedPsgc}
          onSelect={setSelectedPsgc}
        />
      </div>
      <aside className="border-t border-gray-300 bg-white p-5 lg:border-t-0 lg:border-l">
        <div className="flex items-center gap-2 text-gray-900">
          <MapIcon className="h-5 w-5 text-primary-700" aria-hidden="true" />
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
                  <div key={status} className="flex justify-between gap-4">
                    <dt className="text-gray-600">{titleCaseEnum(status)}</dt>
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
                  <div key={category} className="flex justify-between gap-4">
                    <dt className="text-gray-600">{titleCaseEnum(category)}</dt>
                    <dd className="font-medium tabular-nums text-gray-900">
                      {count}
                    </dd>
                  </div>
                )
              )}
            </dl>
            <Link
              href={`/projects?barangay=${selected.psgcCode}`}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
            >
              <ListFilter className="h-4 w-4" aria-hidden="true" />
              View project records
            </Link>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-gray-600">
            Select a barangay polygon to see its count and lifecycle breakdown.
            The complete distribution is also available in the table below.
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
  );
}
