'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import type { BarangayFeature, CityFeature } from '../../data/civic/geography';
import type { BarangayProjectSummary } from '../../data/civic/projectMap';
import PageLoading from '../ui/PageLoading';

const BarangayProjectMap = dynamic(
  () => import('../projects/BarangayProjectMap'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[420px] w-full items-center justify-center bg-gray-50 text-xs text-gray-500">
        <PageLoading />
      </div>
    ),
  }
);

interface HomeProjectMapSectionProps {
  boundaries: readonly BarangayFeature[];
  cityBoundary: CityFeature;
  summaries: readonly BarangayProjectSummary[];
  totalProjects: number;
  attributedProjects: number;
  unattributedProjects: number;
}

export default function HomeProjectMapSection({
  boundaries,
  cityBoundary,
  summaries,
  totalProjects,
  attributedProjects,
  unattributedProjects,
}: HomeProjectMapSectionProps) {
  const [selectedPsgc, setSelectedPsgc] = useState<string | null>(null);

  const selectedSummary = summaries.find(s => s.psgcCode === selectedPsgc);

  return (
    <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[63fr_37fr] lg:gap-10 xl:gap-12">
      {/* Left: Locked Curated Map View (63%) */}
      <div className="relative aspect-square w-full overflow-hidden rounded-sm border border-gray-200 bg-gray-50 sm:aspect-[4/3] lg:aspect-[16/10] lg:h-full">
        <BarangayProjectMap
          boundaries={boundaries}
          cityBoundary={cityBoundary}
          summaries={summaries}
          selectedPsgc={selectedPsgc}
          onSelect={setSelectedPsgc}
          lifecycleFilter={null}
          lockedView
          className="h-full w-full"
        />
      </div>

      {/* Right: Project Distribution Context Panel (37%) */}
      <div className="flex flex-col justify-between rounded-sm border border-gray-200/90 bg-[#F3F6FB] p-6 sm:p-7">
        {selectedSummary ? (
          /* Selected Barangay View */
          <div>
            {/* Header with Back Action */}
            <div className="border-b border-gray-200/80 pb-4">
              <button
                type="button"
                onClick={() => setSelectedPsgc(null)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
              >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Back to Citywide Overview</span>
              </button>

              <div className="mt-3">
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-gray-500">
                  Selected Barangay
                </p>
                <h3 className="mt-1 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                  {selectedSummary.name}
                </h3>
              </div>
            </div>

            {/* Selected Metrics */}
            <div className="py-5 border-b border-gray-200/80 space-y-4">
              <div>
                <p className="text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                  {selectedSummary.projectCount}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-gray-700 sm:text-sm">
                  Published Project{' '}
                  {selectedSummary.projectCount === 1 ? 'Record' : 'Records'}
                </p>
              </div>

              <div className="border-l-2 border-[#0066EB] pl-3">
                <p className="text-lg font-bold tabular-nums text-[#0066EB] sm:text-xl">
                  {attributedProjects > 0
                    ? (
                        (selectedSummary.projectCount / attributedProjects) *
                        100
                      ).toFixed(1)
                    : '0.0'}
                  %
                </p>
                <p className="text-xs text-gray-600">
                  of barangay-attributed published project records (
                  {attributedProjects} total)
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href={`/projects/city-projects?barangay=${encodeURIComponent(selectedSummary.psgcCode)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0066EB] transition-colors hover:text-[#0052BC] sm:text-sm"
                >
                  <span>Browse Projects for {selectedSummary.name}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Density Legend for Reference */}
            <div className="py-5">
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-gray-950">
                Project-Record Density
              </p>
              <div className="mt-3">
                <div className="flex h-2.5 w-full overflow-hidden rounded-xs">
                  <div className="flex-1 bg-[#e9ecef]" title="0 records" />
                  <div className="flex-1 bg-[#cce0fb]" title="1–4 records" />
                  <div className="flex-1 bg-[#66a3f3]" title="5–9 records" />
                  <div className="flex-1 bg-[#0066eb]" title="10–19 records" />
                  <div className="flex-1 bg-[#003d8d]" title="20+ records" />
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] font-medium text-gray-600">
                  <span>Fewer records</span>
                  <span>More records</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Default: Citywide Overview */
          <div>
            {/* Header */}
            <div className="border-b border-gray-200/80 pb-4">
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-gray-500">
                Project Distribution
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-gray-950 sm:text-2xl">
                Citywide Overview
              </h3>
            </div>

            {/* Metrics Breakdown */}
            <div className="py-5 border-b border-gray-200/80">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Published Project Records
                </p>
                <p className="mt-1 text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                  {totalProjects}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="border-l-2 border-[#0066EB] pl-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Barangay-Attributed
                  </p>
                  <p className="mt-0.5 text-xl font-bold tabular-nums text-gray-950 sm:text-2xl">
                    {attributedProjects}
                  </p>
                </div>
                <div className="border-l-2 border-gray-300 pl-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Citywide / Unassigned
                  </p>
                  <p className="mt-0.5 text-xl font-bold tabular-nums text-gray-950 sm:text-2xl">
                    {unattributedProjects}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-gray-500">
                {attributedProjects} attributed across 35 barangays +{' '}
                {unattributedProjects} citywide / unassigned = {totalProjects}{' '}
                published project records.
              </p>
            </div>

            {/* Project Density Legend */}
            <div className="py-5 border-b border-gray-200/80">
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-gray-950">
                Project-Record Density
              </p>
              <div className="mt-3">
                <div className="flex h-2.5 w-full overflow-hidden rounded-xs">
                  <div className="flex-1 bg-[#e9ecef]" title="0 records" />
                  <div className="flex-1 bg-[#cce0fb]" title="1–4 records" />
                  <div className="flex-1 bg-[#66a3f3]" title="5–9 records" />
                  <div className="flex-1 bg-[#0066eb]" title="10–19 records" />
                  <div className="flex-1 bg-[#003d8d]" title="20+ records" />
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] font-medium text-gray-600">
                  <span>Fewer records</span>
                  <span>More records</span>
                </div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                Shading represents the number of published project records
                attributed to each barangay.
              </p>
            </div>

            {/* How to Read This Map */}
            <div className="py-5">
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-gray-950">
                How to Read This Map
              </p>
              <div className="mt-2 space-y-2 text-xs leading-relaxed text-gray-600">
                <p>
                  Project records may be associated with a barangay when
                  published evidence supports that relationship.
                </p>
                <p>
                  Barangay shading represents project-record attribution and
                  does not indicate an exact project coordinate, construction
                  site, parcel, or road segment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Links (Common) */}
        <div className="border-t border-gray-200/80 pt-5 space-y-2">
          <div>
            <Link
              href="/projects/map"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0066EB] transition-colors hover:text-[#0052BC] sm:text-sm"
            >
              <span>Explore Full Project Map</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div>
            <Link
              href="/barangays"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 transition-colors hover:text-[#0066EB] sm:text-sm"
            >
              <span>Browse Barangay Directory</span>
              <ArrowRight
                className="h-3.5 w-3.5 text-gray-400"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
