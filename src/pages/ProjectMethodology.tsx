import { Link } from 'react-router';
import { ArrowRight, CircleAlert, ExternalLink } from 'lucide-react';
import Section from '../components/ui/Section';
import { Heading } from '../components/ui/Heading';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import {
  getAllProjectEvidence,
  getProjects,
  ProjectLifecycleStatus,
} from '../data/civic/projects';
import { isPrimaryOfficialSource } from '../data/civic/sources';
import { titleCaseEnum } from '../lib/utils';

const SECTION_LINKS = [
  ['how-to-read', 'How to read the data'],
  ['evidence-model', 'Sources and evidence'],
  ['lifecycle', 'Documentary lifecycle'],
  ['identifiers', 'Identifiers'],
  ['amounts', 'Financial fields'],
  ['matching', 'Matching and linkage'],
  ['geography', 'Geography'],
  ['missing-data', 'Missing data'],
  ['limitations', 'Coverage and limitations'],
] as const;

const LIFECYCLE_MEANINGS: Record<
  (typeof ProjectLifecycleStatus.options)[number],
  { establishes: string; doesNotEstablish: string }
> = {
  PLANNED: {
    establishes: 'A published planning record identifies the proposed work.',
    doesNotEstablish: 'That procurement began or the work was approved.',
  },
  PROCUREMENT: {
    establishes: 'A procurement-stage record identifies a bidding process.',
    doesNotEstablish: 'That a bidder won or a contract was executed.',
  },
  AWARDED: {
    establishes: 'Award evidence identifies an award decision.',
    doesNotEstablish:
      'An executed contract, notice to proceed, or construction.',
  },
  CONTRACTED: {
    establishes: 'Contract evidence supports an executed contract.',
    doesNotEstablish: 'A notice to proceed, physical progress, or completion.',
  },
};

const AMOUNT_ROWS = [
  {
    field: 'Estimated budget',
    key: 'estimated_budget',
    meaning: 'A planning estimate recorded in APP evidence.',
    availability: 'Evidence-level concept; not a current project-level metric.',
  },
  {
    field: 'Approved Budget for the Contract (ABC)',
    key: 'approved_budget_abc',
    meaning: 'The approved procurement ceiling for the contract.',
    availability: 'Current public project field.',
  },
  {
    field: 'Winning bid amount',
    key: 'winning_bid_amount',
    meaning: 'The amount of the winning bid reported by procurement evidence.',
    availability: 'Current public project field.',
  },
  {
    field: 'Contract amount',
    key: 'contract_amount',
    meaning: 'The amount supported by executed-contract evidence.',
    availability: 'Current public project field.',
  },
  {
    field: 'Fund utilization amount',
    key: 'fund_utilization_amount',
    meaning: 'An amount reported in a separate fund-utilization context.',
    availability: 'Not a current public project-level metric.',
  },
] as const;

const IDENTIFIER_ROWS = [
  ['BetterSanFernando project ID', 'Stable public route and record identity.'],
  ['APP Code (PAP)', 'Planning and procurement-plan namespace.'],
  ['BAC / control reference', 'Bids and Awards Committee process reference.'],
  [
    'PhilGEPS reference',
    'Philippine Government Electronic Procurement System reference.',
  ],
  ['Contract number', 'Executed-contract document namespace.'],
  [
    'Source identifier',
    'Identity of the supporting evidence record or document.',
  ],
] as const;

function MethodSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-gray-200 pt-10">
      <h2 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-7 text-gray-700">
        {children}
      </div>
    </section>
  );
}

export default function ProjectMethodology() {
  const projects = getProjects();
  const evidence = getAllProjectEvidence();
  const bidResultsCount = evidence.filter(
    item => item.stage === 'BID_RESULTS'
  ).length;
  const officialEvidenceCount = evidence.filter(isPrimaryOfficialSource).length;

  return (
    <>
      <SEO
        title="Project Methodology"
        description="How BetterSanFernando collects, connects, verifies, and presents its bounded public project dataset."
        keywords="project methodology, civic data, procurement evidence, public records, San Fernando Pampanga"
      />
      <Section className="p-3 mb-12">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'City Projects', href: '/projects' },
            { label: 'Methodology' },
          ]}
          className="mb-8"
        />

        <header className="max-w-4xl">
          <Heading>How to read BetterSanFernando project data</Heading>
          <p className="max-w-3xl text-lg leading-8 text-gray-700">
            BetterSanFernando connects project facts to the public records that
            support them. The result is a verified, bounded subset of
            infrastructure and public-works projects—not a complete register of
            City Government activity.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-700">
            <strong className="text-gray-900">Current public release:</strong>
            <span className="tabular-nums">{projects.length} projects</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {evidence.length} evidence records
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{bidResultsCount} bid results</span>
          </div>
        </header>

        <div className="mt-10 grid gap-10 xl:grid-cols-[14rem_minmax(0,48rem)] xl:items-start xl:gap-16">
          <nav
            aria-label="Methodology sections"
            className="border-y border-gray-200 py-5 xl:sticky xl:top-24"
          >
            <p className="text-sm font-bold text-gray-900">On this page</p>
            <ol className="mt-3 grid gap-1 sm:grid-cols-2 xl:grid-cols-1">
              {SECTION_LINKS.map(([href, label]) => (
                <li key={href}>
                  <a
                    href={`#${href}`}
                    className="block rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="space-y-12">
            <MethodSection
              id="how-to-read"
              title="Facts remain connected to records"
            >
              <p>
                The public trust chain is{' '}
                <strong>fact → source → official link</strong>. A project page
                presents normalized facts, each project links to its supporting
                evidence, and evidence links to an official page or document
                when one is available.
              </p>
              <div className="grid border-y border-gray-200 sm:grid-cols-3">
                {[
                  ['Fact', 'A named field on a published project record.'],
                  ['Source', 'Evidence that establishes that field.'],
                  [
                    'Official link',
                    'The public page or document recorded for that evidence.',
                  ],
                ].map(([term, definition], index) => (
                  <div
                    key={term}
                    className={`py-4 sm:px-4 ${index > 0 ? 'border-t border-gray-200 sm:border-l sm:border-t-0' : ''}`}
                  >
                    <p className="font-bold text-gray-900">{term}</p>
                    <p className="mt-1 text-sm leading-6">{definition}</p>
                  </div>
                ))}
              </div>
            </MethodSection>

            <MethodSection id="evidence-model" title="Sources and evidence">
              <p>
                Evidence records identify a documentary stage, source authority,
                source identifier, relevant date when available, fields
                established, and their relationship to a project. An attachment
                may link directly to a document; otherwise a public source page
                may be the best available link.
              </p>
              <p>
                A record verifies only the fields it names—for example, a
                budget, procurement reference, winning bidder, award date, or
                contract amount. It does not automatically verify every fact on
                the related project.
              </p>
              <div className="rounded-xl bg-primary-50 p-5 text-primary-900">
                <p className="font-bold">Source authority is explicit</p>
                <p className="mt-2 text-sm leading-6">
                  “Official source” is shown only when the evidence authority
                  metadata supports it. In this release, {officialEvidenceCount}{' '}
                  of {evidence.length} published project evidence records meet
                  the public helper’s primary-official definition. Future
                  secondary validation would remain labeled separately.
                </p>
              </div>
            </MethodSection>

            <MethodSection
              id="lifecycle"
              title="Documentary lifecycle, not physical progress"
            >
              <p>
                Lifecycle status summarizes the strongest published documentary
                stage supported for a project. The current public schema
                contains only the four states below. It does not contain an
                “ongoing” state.
              </p>
              <div className="overflow-x-auto border-y border-gray-300">
                <table className="min-w-[44rem] w-full border-collapse text-left text-sm">
                  <caption className="sr-only">
                    Current public project lifecycle states and evidentiary
                    limits
                  </caption>
                  <thead className="bg-gray-50 text-gray-900">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-bold">
                        State
                      </th>
                      <th scope="col" className="px-4 py-3 font-bold">
                        What it establishes
                      </th>
                      <th scope="col" className="px-4 py-3 font-bold">
                        What it does not establish
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {ProjectLifecycleStatus.options.map(status => (
                      <tr key={status}>
                        <th
                          scope="row"
                          className="px-4 py-4 align-top font-bold text-gray-900"
                        >
                          {titleCaseEnum(status)}
                        </th>
                        <td className="px-4 py-4 align-top leading-6">
                          {LIFECYCLE_MEANINGS[status].establishes}
                        </td>
                        <td className="px-4 py-4 align-top leading-6">
                          {LIFECYCLE_MEANINGS[status].doesNotEstablish}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="font-semibold text-gray-900">
                Awarded is not contracted. A contract does not prove a Notice to
                Proceed, and a Notice to Proceed would not prove completion.
              </p>
              <p>
                The broader methodology keeps later documentary milestones
                distinct, but they are not populated lifecycle states in the
                current public project schema. None of these stages describes
                physical construction progress by itself.
              </p>
            </MethodSection>

            <MethodSection
              id="identifiers"
              title="Identifiers keep their namespaces"
            >
              <p>
                A project can carry several identifiers because different public
                systems and documentary stages assign different references. They
                are labeled separately and are not interchangeable.
              </p>
              <dl className="divide-y divide-gray-200 border-y border-gray-200">
                {IDENTIFIER_ROWS.map(([term, definition]) => (
                  <div
                    key={term}
                    className="grid gap-1 py-3 sm:grid-cols-[13rem_1fr] sm:gap-5"
                  >
                    <dt className="font-bold text-gray-900">{term}</dt>
                    <dd>{definition}</dd>
                  </div>
                ))}
              </dl>
            </MethodSection>

            <MethodSection
              id="amounts"
              title="Financial fields are not interchangeable"
            >
              <p>
                Procurement and planning records describe different financial
                moments. BetterSanFernando never collapses them into “project
                cost” or “spending,” and none of the current project-level
                fields establishes actual expenditure.
              </p>
              <div className="overflow-x-auto border-y border-gray-300">
                <table className="min-w-[48rem] w-full border-collapse text-left text-sm">
                  <caption className="sr-only">
                    Project amount concepts, meanings, and current public
                    availability
                  </caption>
                  <thead className="bg-gray-50 text-gray-900">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-bold">
                        Concept
                      </th>
                      <th scope="col" className="px-4 py-3 font-bold">
                        Meaning
                      </th>
                      <th scope="col" className="px-4 py-3 font-bold">
                        Current availability
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {AMOUNT_ROWS.map(row => (
                      <tr key={row.key}>
                        <th
                          scope="row"
                          className="px-4 py-4 align-top font-bold text-gray-900"
                        >
                          {row.field}
                          <span className="mt-1 block font-mono text-xs font-normal text-gray-700">
                            {row.key}
                          </span>
                        </th>
                        <td className="px-4 py-4 align-top leading-6">
                          {row.meaning}
                        </td>
                        <td className="px-4 py-4 align-top leading-6">
                          {row.availability}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="font-semibold text-gray-900">
                ABC ≠ winning bid ≠ contract amount ≠ actual expenditure.
              </p>
            </MethodSection>

            <MethodSection id="matching" title="Matching and record linkage">
              <p>
                Evidence is connected to projects conservatively. Exact,
                namespaced identifiers and an evidence record’s explicit project
                relationship are stronger identity signals than similar wording.
              </p>
              <p>
                Similar titles, the same year, the same barangay, or similar
                amounts are not enough on their own to merge records. When
                identity is not adequately supported, records remain distinct
                and uncertainty remains visible rather than being resolved by
                assumption.
              </p>
            </MethodSection>

            <MethodSection
              id="geography"
              title="Geography and barangay attribution"
            >
              <p>
                The public geography layer contains one city boundary and 35
                barangay polygons. A project may be attributed to a barangay
                when the published record supports that relationship; otherwise
                it remains unattributed.
              </p>
              <div className="flex gap-3 rounded-xl bg-gray-100 p-5 text-gray-900">
                <CircleAlert
                  className="mt-0.5 h-5 w-5 shrink-0"
                  aria-hidden="true"
                />
                <p className="text-sm leading-6">
                  No verified project point coordinates are currently published.
                  The project map shows barangay-level distribution, not exact
                  project sites, and polygon centers are never presented as
                  project locations.
                </p>
              </div>
            </MethodSection>

            <MethodSection
              id="missing-data"
              title="Missing data remains missing"
            >
              <p>
                Unknown values are represented as absent or “Not specified”—not
                as zero and not as inferred facts. A missing contract amount
                does not mean a zero-value contract. Missing barangay
                attribution does not place a project at the city center.
              </p>
              <p>
                Likewise, an unavailable source document or absent evidence
                record does not prove an event never happened. It means the
                current public dataset does not contain qualifying evidence for
                that field or stage.
              </p>
            </MethodSection>

            <MethodSection id="limitations" title="Coverage and limitations">
              <ul className="space-y-3 pl-5 marker:text-primary-700">
                <li>
                  The dataset is a bounded infrastructure and public-works
                  subset, not a citywide project or procurement register.
                </li>
                <li>
                  Lifecycle states reflect documentary evidence, not physical
                  construction progress.
                </li>
                <li>
                  Financial fields describe distinct concepts and do not
                  establish actual expenditure.
                </li>
                <li>
                  Project-level point locations are unavailable; geography is
                  aggregated by barangay.
                </li>
                <li>
                  Official source and attachment availability varies by evidence
                  record.
                </li>
                <li>
                  Unsupported or unresolved facts remain unknown rather than
                  inferred.
                </li>
              </ul>
            </MethodSection>

            <section
              className="border-t border-gray-300 pt-10"
              aria-labelledby="related-heading"
            >
              <h2
                id="related-heading"
                className="text-2xl font-bold text-gray-900"
              >
                Explore the published data
              </h2>
              <div className="mt-5 grid divide-y divide-gray-200 border-y border-gray-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                {[
                  [
                    '/projects',
                    'Browse projects',
                    'Search the published project records.',
                  ],
                  [
                    '/projects/sources',
                    'Browse project sources',
                    'Find evidence across every represented project.',
                  ],
                  [
                    '/projects/map',
                    'View the project map',
                    'Compare barangay-level project distribution.',
                  ],
                  [
                    '/statistics/projects',
                    'View project statistics',
                    'Explore bounded summaries and coverage.',
                  ],
                ].map(([href, title, description], index) => (
                  <Link
                    key={href}
                    to={href}
                    className={`group p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${index > 1 ? 'sm:border-t sm:border-gray-200' : ''}`}
                  >
                    <span className="flex items-center justify-between gap-3 font-bold text-gray-900 group-hover:text-primary-700">
                      {title}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-gray-700">
                      {description}
                    </span>
                  </Link>
                ))}
              </div>
              <p className="mt-6 text-sm leading-6 text-gray-700">
                BetterSanFernando is an independent civic-information project,
                not an official City Government website. Evidence links open the
                recorded public authority’s page or document{' '}
                <ExternalLink
                  className="inline h-3.5 w-3.5"
                  aria-hidden="true"
                />
                .
              </p>
            </section>
          </article>
        </div>
      </Section>
    </>
  );
}
