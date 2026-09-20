import { ArrowDown, ArrowRight, ExternalLink, FileText } from 'lucide-react';
import Link from 'next/link';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getResolutions,
  getResolutionsMetadata,
} from '../../../data/civic/legislation';
import { getPublicRecordsArchiveCoverage } from '../../../data/civic/publicRecordsCoverage';
import { buildPageMetadata } from '../../../lib/metadata';

export const metadata = buildPageMetadata({
  title: 'Resolutions',
  description:
    'Browse the subject-verified City of San Fernando resolution records currently published by BetterSanFernando.',
  path: '/legislation/resolutions',
});

const eyebrowTracking = { letterSpacing: '0.08em' };

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

const resolutions = getResolutions();
const legislationMetadata = getResolutionsMetadata();
const archiveRanges = getPublicRecordsArchiveCoverage().filter(
  entry => entry.record_type === 'resolution_archive_range'
);

export default function Resolutions() {
  return (
    <main className="flex-grow bg-white">
      {/* 1. Editorial Hero & Scope Intro */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Legislation', href: '/legislation' },
              { label: 'Resolutions' },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
            <div>
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                LEGISLATION · RESOLUTION ARCHIVE
              </p>
              <h1 className="mt-1.5 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl lg:text-4xl">
                Resolutions
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base sm:leading-7">
                Browse the resolution records BetterSanFernando can currently
                verify through official City cross-references. Published
                coverage is partial and subject-verified, not a complete
                historical register.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a
                  href="#verified-records"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-[#0066EB] px-5 text-sm font-semibold text-white transition hover:bg-[#0052BC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066EB]"
                >
                  <span>Browse verified records</span>
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>
                <Link
                  href="/legislation"
                  className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition hover:text-[#0052BC] hover:underline focus-visible:outline-none focus-visible:underline"
                >
                  <span>Legislation overview</span>
                  <ArrowRight
                    className="h-4 w-4 transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>

            <aside className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
              <p className="text-eyebrow text-gray-500" style={eyebrowTracking}>
                VERIFICATION SCOPE
              </p>
              <h2 className="mt-1 text-sm font-bold text-gray-950">
                Subject-verified collection
              </h2>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                <li>• Subjects are supported by official City references.</li>
                <li>• Verbatim formal titles are not currently recovered.</li>
                <li>• Full resolution text is unavailable.</li>
                <li>• Exact adoption dates are unavailable.</li>
                <li>• This is not a complete historical register.</li>
              </ul>
              <p className="mt-3 border-t border-gray-200/80 pt-2 text-[11px] text-gray-500">
                Independent and community-run. Not an official City Government
                website.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <div className="container mx-auto space-y-12 px-4 pb-20 sm:space-y-16 sm:pb-24 lg:pb-28">
        {/* 2. Collection Snapshot */}
        <section aria-labelledby="snapshot-heading" className="pt-8 sm:pt-10">
          <h2 id="snapshot-heading" className="sr-only">
            Collection snapshot
          </h2>
          <dl className="grid grid-cols-1 divide-y divide-gray-200 border-y border-gray-200 py-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:py-7">
            <div className="pb-4 sm:pb-0 sm:pr-6">
              <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Subject-verified records
              </dt>
              <dd className="mt-2 text-3xl font-bold tabular-nums text-gray-950 sm:text-4xl">
                {resolutions.length}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                Verified via official cross-reference
              </p>
            </div>

            <div className="py-4 sm:py-0 sm:px-6">
              <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Full text available
              </dt>
              <dd className="mt-2 text-3xl font-bold tabular-nums text-gray-950 sm:text-4xl">
                0
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                No full resolution text recovered
              </p>
            </div>

            <div className="pt-4 sm:pt-0 sm:pl-6">
              <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Date precision
              </dt>
              <dd className="mt-2 text-2xl font-bold text-gray-950 sm:text-3xl">
                YEAR-LEVEL
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                Exact adoption dates unavailable
              </p>
            </div>
          </dl>
          <p className="mt-3 text-xs text-gray-500 sm:text-sm">
            Last verified: {formatDate(legislationMetadata.lastVerified)}
          </p>
        </section>

        {/* 3. Verification Model */}
        <section aria-labelledby="verification-model-heading">
          <div className="rounded-sm border border-gray-200 bg-white p-6 sm:p-8">
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              EVIDENCE MODEL
            </p>
            <h2
              id="verification-model-heading"
              className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
            >
              What &ldquo;subject-verified&rdquo; means
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-6 border-t border-gray-200 pt-6 md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-base font-bold text-gray-950">
                  What is verified
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Resolution number, year, issuing body, and subject are
                  supported through official City cross-references.
                </p>
              </div>

              <div className="md:border-l md:border-gray-200 md:pl-8">
                <h3 className="text-base font-bold text-gray-950">
                  What is not currently recovered
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  BetterSanFernando does not currently have verbatim formal
                  titles, full resolution text, or exact adoption dates for
                  these records.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Published Records */}
        <section
          id="verified-records"
          aria-labelledby="verified-records-heading"
        >
          <div className="mb-4">
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              PUBLISHED RECORDS
            </p>
            <h2
              id="verified-records-heading"
              className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
            >
              Verified resolution subjects
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Each entry below is an individually subject-verified record.
            </p>
          </div>

          <ol className="divide-y divide-gray-200 border-y sm:border border-gray-200 bg-white sm:rounded-sm">
            {resolutions.map(resolution => (
              <li
                key={resolution.id}
                className="p-5 transition-colors hover:bg-[#F3F6FB]/50 sm:p-6"
              >
                <article aria-labelledby={`${resolution.id}-subject`}>
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8">
                    {/* Main Record Content */}
                    <div className="min-w-0">
                      {/* Top row: Resolution number + Status */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-gray-700">
                          RESOLUTION NO. {resolution.document_number}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-xs bg-[#F3F6FB] px-2 py-0.5 text-xs font-medium text-primary-800">
                          <FileText
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          Subject-verified
                        </span>
                      </div>

                      {/* Verified Subject */}
                      <h3
                        id={`${resolution.id}-subject`}
                        className="mt-2 text-base font-bold leading-snug text-gray-950 sm:text-lg"
                      >
                        {resolution.subject}
                      </h3>

                      <p className="mt-1.5 text-xs text-gray-500 sm:text-sm">
                        Verified subject — no verbatim formal title is currently
                        available for this record.
                      </p>

                      {/* Structured Metadata */}
                      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-xs sm:text-sm">
                        <div>
                          <dt className="text-gray-500">Year</dt>
                          <dd className="font-medium text-gray-900">
                            {resolution.year}
                            <span className="ml-1.5 text-xs font-normal text-gray-500">
                              (year-level precision only)
                            </span>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Issuing body</dt>
                          <dd className="font-medium text-gray-900">
                            {resolution.issuing_body}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    {/* Right Evidence Rail */}
                    <div className="border-t border-gray-200 pt-4 text-xs sm:text-sm lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                      <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        SOURCE &amp; EVIDENCE
                      </p>
                      <p className="mt-1.5 text-gray-700">
                        <span className="text-gray-500">Evidence:</span>{' '}
                        Official City cross-reference
                      </p>

                      <ul className="mt-2 space-y-1 text-xs text-gray-500">
                        <li>• Verbatim formal title unavailable</li>
                        <li>• Full resolution text unavailable</li>
                        <li>• Exact adoption date unavailable</li>
                      </ul>

                      {resolution.reference_url && (
                        <div className="mt-3.5">
                          <a
                            href={resolution.reference_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View official cross-reference for Resolution ${resolution.document_number} (opens in a new tab)`}
                            className="inline-flex items-center gap-1 font-semibold text-[#0066EB] hover:text-[#0052BC] hover:underline"
                          >
                            View official cross-reference
                            <ExternalLink
                              className="h-3.5 w-3.5 shrink-0"
                              aria-hidden="true"
                            />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </section>

        {/* 5. Archive-Range Context */}
        {archiveRanges.length > 0 && (
          <section
            aria-labelledby="archive-range-heading"
            className="rounded-sm border border-gray-200 bg-white p-6 sm:p-8"
          >
            <p className="text-eyebrow text-gray-500" style={eyebrowTracking}>
              ARCHIVE CONTEXT
            </p>
            <h2
              id="archive-range-heading"
              className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
            >
              What the official archive ranges show
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
              The official City archive also exposes numbered resolution ranges
              for some years. These indicate archive positions only and are not
              individually verified resolution records.
            </p>

            <div className="mt-6 rounded-sm border border-gray-200 bg-[#F3F6FB]">
              <div className="divide-y divide-gray-200">
                {archiveRanges.map(entry => (
                  <div
                    key={`${entry.year}-${entry.range_end}`}
                    className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-6"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-base font-bold text-gray-950">
                        {entry.year}
                      </span>
                      <span className="text-sm text-gray-700">
                        {entry.count} archive positions
                      </span>
                    </div>
                    <span className="font-mono text-xs font-medium text-gray-600 sm:text-sm">
                      Numbered range {entry.range_start}&ndash;{entry.range_end}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-gray-500 sm:text-sm">
              Note: These archive positions are not added to the{' '}
              {resolutions.length} individually published records above.
            </p>
          </section>
        )}

        {/* 6. Keep Exploring */}
        <section aria-labelledby="keep-exploring-heading">
          <div className="border-t border-gray-200 pt-10 sm:pt-12">
            <p className="text-eyebrow text-gray-500" style={eyebrowTracking}>
              KEEP EXPLORING
            </p>
            <h2
              id="keep-exploring-heading"
              className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
            >
              Related legislative resources
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/legislation"
                className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 transition hover:border-[#0066EB] hover:bg-[#F3F6FB]/40"
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-950 group-hover:text-[#0066EB]">
                    Legislation overview
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    City ordinances, executive orders, and legislative tracking.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                  <span>Browse overview</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
              </Link>

              <Link
                href="/legislation/executive-orders"
                className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 transition hover:border-[#0066EB] hover:bg-[#F3F6FB]/40"
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-950 group-hover:text-[#0066EB]">
                    Executive Orders
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    Verified mayoral and executive order records with source
                    documents.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                  <span>Browse Executive Orders</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
              </Link>

              <Link
                href="/legislation/ordinances"
                className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 transition hover:border-[#0066EB] hover:bg-[#F3F6FB]/40"
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-950 group-hover:text-[#0066EB]">
                    Ordinances
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    Verified City council ordinances with full text and official
                    sources.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                  <span>Browse Ordinances</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
              </Link>

              <Link
                href="/statistics/legislation"
                className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 transition hover:border-[#0066EB] hover:bg-[#F3F6FB]/40"
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-950 group-hover:text-[#0066EB]">
                    Legislation Statistics
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    Overview metrics, document counts, and archive coverage
                    breakdowns.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                  <span>View statistics</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
