import { ExternalLink, FileText, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Heading } from '../components/ui/Heading';
import Section from '../components/ui/Section';
import { Text } from '../components/ui/Text';
import SEO from '../components/SEO';
import { getResolutions } from '../data/civic/legislation';
import { getPublicRecordsArchiveCoverage } from '../data/civic/publicRecordsCoverage';

const resolutions = getResolutions();
const archiveRanges = getPublicRecordsArchiveCoverage().filter(
  entry => entry.record_type === 'resolution_archive_range'
);

export default function Resolutions() {
  return (
    <>
      <SEO
        title="Resolutions"
        description="Browse the subject-verified City of San Fernando resolution records currently published by BetterSanFernando."
        keywords="resolutions, City of San Fernando, Pampanga, legislation, public records"
      />
      <main className="flex-grow">
        <Section className="p-3 mb-12">
          <Breadcrumbs
            className="mb-8"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Legislation', href: '/legislation' },
              { label: 'Resolutions' },
            ]}
          />

          <header className="max-w-3xl">
            <Heading>Resolutions</Heading>
            <Text className="mb-8 max-w-2xl text-gray-700">
              A bounded set of resolution records BetterSanFernando has
              subject-verified against official City cross-references.
            </Text>
          </header>

          <aside
            className="mb-8 max-w-4xl rounded-xl border border-warning-200 bg-warning-50 p-5"
            aria-labelledby="resolutions-coverage-heading"
          >
            <Heading
              level={2}
              className="text-lg mb-2 leading-snug text-warning-900"
            >
              <span id="resolutions-coverage-heading">
                Verified partial collection
              </span>
            </Heading>
            <Text className="max-w-3xl mb-0 text-warning-900">
              These {resolutions.length} records are subject-verified only —
              neither includes the resolution&apos;s full text, verbatim formal
              title, or exact adoption date. This is not a claim of a complete
              historical resolution register, and it is never the number of
              resolutions the City has adopted.
            </Text>
          </aside>

          <dl className="mb-8 grid overflow-hidden rounded-xl border border-gray-200 bg-gray-50 sm:grid-cols-2">
            <div className="p-5 sm:border-r sm:border-gray-200">
              <dt className="text-sm text-gray-600">
                Subject-verified records
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
                {resolutions.length}
              </dd>
            </div>
            <div className="border-t border-gray-200 p-5 sm:border-t-0">
              <dt className="text-sm text-gray-600">Full text available</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
                0
              </dd>
            </div>
          </dl>

          <ol className="divide-y divide-gray-200 border-y border-gray-200">
            {resolutions.map(resolution => (
              <li key={resolution.id} className="py-6 first:pt-5">
                <article aria-labelledby={`${resolution.id}-subject`}>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="break-all font-mono text-sm font-semibold text-primary-800">
                      Resolution No. {resolution.document_number}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                      Full text not available
                    </span>
                  </div>

                  <h2
                    id={`${resolution.id}-subject`}
                    className="max-w-4xl text-base font-semibold leading-relaxed text-gray-900 sm:text-lg"
                  >
                    {resolution.subject}
                  </h2>
                  <Text size="sm" className="mt-1 mb-0 text-gray-500">
                    Verified subject — no formal title is currently available
                    for this record.
                  </Text>

                  <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm">
                    <div>
                      <dt className="text-gray-600">Year</dt>
                      <dd className="font-medium text-gray-900">
                        {resolution.year}
                        <span className="ml-1.5 text-xs font-normal text-gray-500">
                          (year-level precision only)
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Issuing body</dt>
                      <dd className="font-medium text-gray-900">
                        {resolution.issuing_body}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 border-t border-gray-200 pt-4 text-sm">
                    {resolution.reference_url && (
                      <a
                        href={resolution.reference_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View the official cross-reference for Resolution ${resolution.document_number} (opens in a new tab)`}
                        className="inline-flex items-center gap-1.5 font-medium text-primary-700 underline-offset-4 hover:text-primary-900 hover:underline"
                      >
                        View official cross-reference
                        <ExternalLink
                          className="h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />
                      </a>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ol>

          {archiveRanges.length > 0 && (
            <aside
              className="mt-10 max-w-4xl rounded-xl border border-gray-200 bg-gray-50 p-5"
              aria-labelledby="archive-range-heading"
            >
              <div className="flex items-start gap-3">
                <ShieldAlert
                  className="mt-0.5 h-5 w-5 shrink-0 text-gray-500"
                  aria-hidden="true"
                />
                <div>
                  <Heading
                    level={2}
                    className="text-lg mb-2 leading-snug text-gray-900"
                  >
                    <span id="archive-range-heading">
                      Archive-range context (not individual records)
                    </span>
                  </Heading>
                  <Text className="max-w-3xl mb-3 text-gray-700">
                    The City&apos;s official archive lists numbered resolution
                    ranges for these years. These are range-level positions, not
                    individually published resolution records, and they are
                    never added to the {resolutions.length} records above.
                  </Text>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {archiveRanges.map(entry => (
                      <li key={`${entry.year}-${entry.range_end}`}>
                        <span className="font-semibold text-gray-900">
                          {entry.year}:
                        </span>{' '}
                        {entry.count} archive range positions (
                        {entry.range_start}–{entry.range_end})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          )}

          <nav className="mt-8" aria-label="Related legislation">
            <p className="text-sm font-semibold text-gray-900">
              Related legislation
            </p>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
              <Link
                to="/legislation/executive-orders"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 underline-offset-4 hover:text-primary-900 hover:underline"
              >
                Browse Executive Orders
              </Link>
              <Link
                to="/legislation/ordinances"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 underline-offset-4 hover:text-primary-900 hover:underline"
              >
                Browse Ordinances
              </Link>
              <Link
                to="/statistics/legislation"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 underline-offset-4 hover:text-primary-900 hover:underline"
              >
                View Legislation Statistics
              </Link>
            </div>
          </nav>
        </Section>
      </main>
    </>
  );
}
