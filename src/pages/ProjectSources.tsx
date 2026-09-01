import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQueryState } from 'nuqs';
import { FileCheck2, Search, SlidersHorizontal, X } from 'lucide-react';
import Section from '../components/ui/Section';
import { Heading } from '../components/ui/Heading';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import EvidenceSourceLinks from '../components/projects/EvidenceSourceLinks';
import {
  EvidenceSourceAuthority,
  getAllProjectEvidence,
  getProjects,
  ProjectEvidenceStage,
} from '../data/civic/projects';
import {
  countProjectEvidenceByStage,
  filterProjectEvidence,
  resolveProjectEvidence,
  type ProjectEvidenceSort,
} from '../data/civic/projectSources';
import {
  getEvidenceSourceLabel,
  hasAttachment,
  isPrimaryOfficialSource,
} from '../data/civic/sources';
import { formatIsoDate, titleCaseEnum } from '../lib/utils';

const PAGE_SIZE = 25;

const FIELD_LABELS: Record<string, string> = {
  app_code: 'APP Code (PAP)',
  primary_procurement_id: 'BAC / control reference',
  philgeps_reference: 'PhilGEPS reference',
  contract_number: 'Contract number',
  approved_budget_abc: 'Approved Budget for the Contract (ABC)',
  winning_bid_amount: 'Winning bid amount',
  winning_bidder: 'Winning bidder',
};

function fieldLabel(field: string) {
  return FIELD_LABELS[field] ?? titleCaseEnum(field);
}

function authorityLabel(authority: string) {
  return authority === 'PRIMARY_OFFICIAL_CSFP'
    ? 'Primary official · City of San Fernando'
    : 'Primary official';
}

export default function ProjectSources() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [stage, setStage] = useQueryState('stage', { defaultValue: '' });
  const [authority, setAuthority] = useQueryState('authority', {
    defaultValue: '',
  });
  const [projectId, setProjectId] = useQueryState('project', {
    defaultValue: '',
  });
  const [sort, setSort] = useQueryState('sort', {
    defaultValue: 'date-desc',
  });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const evidence = getAllProjectEvidence();
  const projects = getProjects();
  const records = useMemo(() => resolveProjectEvidence(evidence), [evidence]);
  const stageCounts = useMemo(
    () => countProjectEvidenceByStage(evidence),
    [evidence]
  );
  const filtered = useMemo(
    () =>
      filterProjectEvidence(records, {
        query,
        stage: ProjectEvidenceStage.safeParse(stage).success
          ? (stage as (typeof ProjectEvidenceStage.options)[number])
          : '',
        authority: EvidenceSourceAuthority.safeParse(authority).success
          ? (authority as (typeof EvidenceSourceAuthority.options)[number])
          : '',
        projectId,
        sort: sort as ProjectEvidenceSort,
      }),
    [records, query, stage, authority, projectId, sort]
  );

  const hasFilters = Boolean(query || stage || authority || projectId);
  const clearFilters = () => {
    setQuery(null);
    setStage(null);
    setAuthority(null);
    setProjectId(null);
  };

  return (
    <>
      <SEO
        title="Project Sources"
        description="Browse the public evidence records that support BetterSanFernando's published project facts."
        keywords="project sources, public records, bid results, procurement evidence, San Fernando Pampanga"
      />
      <Section className="p-3 mb-12">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'City Projects', href: '/projects' },
            { label: 'Sources' },
          ]}
          className="mb-8"
        />

        <div className="max-w-3xl">
          <Heading>Records behind the project facts</Heading>
          <p className="text-lg leading-8 text-gray-700">
            Browse the public records used to support BetterSanFernando’s
            bounded project dataset. Each record names the project it supports,
            its documentary stage, and only the fields it establishes.
          </p>
        </div>

        <div className="mt-8 border-y border-gray-200 bg-gray-50">
          <dl className="grid grid-cols-2 lg:grid-cols-4">
            <div className="p-4 sm:p-5">
              <dt className="text-sm text-gray-700">Evidence records</dt>
              <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                {evidence.length}
              </dd>
            </div>
            <div className="border-l border-gray-200 p-4 sm:p-5">
              <dt className="text-sm text-gray-700">Projects represented</dt>
              <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                {new Set(evidence.map(item => item.project_id)).size}
              </dd>
            </div>
            <div className="border-t border-gray-200 p-4 sm:p-5 lg:border-l lg:border-t-0">
              <dt className="text-sm text-gray-700">Bid results</dt>
              <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                {stageCounts.BID_RESULTS}
              </dd>
            </div>
            <div className="border-l border-t border-gray-200 p-4 sm:p-5 lg:border-t-0">
              <dt className="text-sm text-gray-700">With documents</dt>
              <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                {evidence.filter(hasAttachment).length}
              </dd>
            </div>
          </dl>
        </div>

        <div
          className="mt-8 flex gap-2 overflow-x-auto pb-2"
          aria-label="Evidence counts by documentary stage"
        >
          {ProjectEvidenceStage.options.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => setStage(stage === option ? null : option)}
              aria-pressed={stage === option}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${stage === option ? 'border-primary-700 bg-primary-700 text-white' : 'border-gray-300 bg-white text-gray-800 hover:border-primary-400'}`}
            >
              {titleCaseEnum(option)}{' '}
              <span className="tabular-nums">{stageCounts[option]}</span>
            </button>
          ))}
        </div>

        <section aria-labelledby="evidence-browser-heading" className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2
                id="evidence-browser-heading"
                className="text-2xl font-bold text-gray-900"
              >
                Evidence browser
              </h2>
              <p className="mt-1 text-sm text-gray-700" aria-live="polite">
                Showing {Math.min(visibleCount, filtered.length)} of{' '}
                {filtered.length} matching records
              </p>
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 underline decoration-primary-200 underline-offset-4"
              >
                <X className="h-4 w-4" aria-hidden="true" /> Clear filters
              </button>
            )}
          </div>

          <div className="mt-4 border border-gray-300 bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Search and filter records
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <label className="relative md:col-span-2 xl:col-span-1">
                <span className="sr-only">Search evidence</span>
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={event => setQuery(event.target.value || null)}
                  placeholder="Project, source ID, or field"
                  className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </label>
              <label>
                <span className="sr-only">Documentary stage</span>
                <select
                  value={stage}
                  onChange={event => setStage(event.target.value || null)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  <option value="">All documentary stages</option>
                  {ProjectEvidenceStage.options.map(option => (
                    <option key={option} value={option}>
                      {titleCaseEnum(option)} ({stageCounts[option]})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="sr-only">Source authority</span>
                <select
                  value={authority}
                  onChange={event => setAuthority(event.target.value || null)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  <option value="">All source authorities</option>
                  {EvidenceSourceAuthority.options.map(option => (
                    <option key={option} value={option}>
                      {authorityLabel(option)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="sr-only">Related project</span>
                <select
                  value={projectId}
                  onChange={event => setProjectId(event.target.value || null)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  <option value="">All projects</option>
                  {[...projects]
                    .sort((a, b) =>
                      a.project_name.localeCompare(b.project_name)
                    )
                    .map(project => (
                      <option key={project.id} value={project.id}>
                        {project.project_name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                <span className="sr-only">Sort evidence</span>
                <select
                  value={sort}
                  onChange={event => setSort(event.target.value || null)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  <option value="date-desc">Newest document date</option>
                  <option value="date-asc">Oldest document date</option>
                  <option value="identifier-asc">Source identifier A–Z</option>
                </select>
              </label>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-5 border border-dashed border-gray-300 px-5 py-12 text-center">
              <FileCheck2
                className="mx-auto h-7 w-7 text-gray-600"
                aria-hidden="true"
              />
              <h3 className="mt-3 font-semibold text-gray-900">
                No evidence records match
              </h3>
              <p className="mt-1 text-sm text-gray-700">
                Try a broader search or clear the active filters.
              </p>
            </div>
          ) : (
            <ol className="mt-5 divide-y divide-gray-200 border-y border-gray-200">
              {filtered
                .slice(0, visibleCount)
                .map(({ evidence: item, project }) => (
                  <li
                    key={item.id}
                    className="grid gap-4 py-5 lg:grid-cols-[10rem_minmax(0,1fr)_15rem] lg:gap-7"
                  >
                    <div>
                      <span className="inline-flex rounded-full bg-primary-100 px-2.5 py-1 text-xs font-bold text-primary-800">
                        {titleCaseEnum(item.stage)}
                      </span>
                      <p className="mt-2 text-sm font-semibold text-gray-900 break-words">
                        {item.source_identifier}
                      </p>
                      <p className="mt-1 text-xs text-gray-700">
                        {formatIsoDate(item.document_date)}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/projects/${project.id}`}
                        className="font-semibold leading-6 text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                      >
                        {project.project_name}
                      </Link>
                      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="font-medium text-gray-900">
                            Fields established
                          </dt>
                          <dd className="mt-1 leading-6 text-gray-700">
                            {item.fields_established.length
                              ? item.fields_established
                                  .map(fieldLabel)
                                  .join(', ')
                              : 'No fields listed'}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-900">
                            Source authority
                          </dt>
                          <dd className="mt-1 leading-6 text-gray-700">
                            {isPrimaryOfficialSource(item)
                              ? 'Official source'
                              : item.source_authority}
                            <span className="block text-xs">
                              {authorityLabel(item.source_authority)} ·{' '}
                              {getEvidenceSourceLabel(item)}
                            </span>
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <div className="lg:border-l lg:border-gray-200 lg:pl-6">
                      <EvidenceSourceLinks evidence={item} />
                      <p className="mt-3 text-xs text-gray-700">
                        {hasAttachment(item)
                          ? 'Attachment available'
                          : 'Source page only'}
                      </p>
                    </div>
                  </li>
                ))}
            </ol>
          )}

          {visibleCount < filtered.length && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount(count => count + PAGE_SIZE)}
                className="rounded-md border border-primary-700 bg-white px-5 py-2.5 text-sm font-bold text-primary-700 hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                Show 25 more records
              </button>
            </div>
          )}
        </section>

        <aside
          className="mt-14 max-w-4xl border-t border-gray-300 pt-7"
          aria-labelledby="coverage-heading"
        >
          <h2 id="coverage-heading" className="text-xl font-bold text-gray-900">
            Coverage and limitations
          </h2>
          <div className="mt-3 grid gap-4 text-sm leading-6 text-gray-700 md:grid-cols-3">
            <p>
              This evidence covers the current bounded set of 239 infrastructure
              and public-works projects, not every City Government activity.
            </p>
            <p>
              A record supports only the fields and documentary stage named
              here. Its presence does not verify every fact about a project.
            </p>
            <p>
              An absent record does not prove an event did not happen. It means
              qualifying evidence is not present in this published dataset.
            </p>
          </div>
          <p className="mt-5 text-sm text-gray-700">
            Learn how records are normalized and interpreted on the{' '}
            <Link
              to="/projects/methodology"
              className="font-semibold text-primary-700 underline decoration-primary-200 underline-offset-4"
            >
              planned Project Methodology page
            </Link>
            .
          </p>
        </aside>
      </Section>
    </>
  );
}
