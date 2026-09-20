import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  FileCheck2,
  FileText,
  FolderKanban,
  Landmark,
  Link2,
  MapPinned,
} from 'lucide-react';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getAllProjectEvidence,
  getProjects,
  ProjectLifecycleStatus,
} from '../../../data/civic/projects';
import { hasAttachment } from '../../../data/civic/sources';
import { titleCaseEnum } from '../../../lib/utils';
import { buildPageMetadata } from '../../../lib/metadata';

export const metadata = buildPageMetadata({
  title: 'Project Methodology',
  description:
    'How BetterSanFernando builds and interprets project records: sources, evidence, documentary status, financial fields, geography, and the limits of the dataset.',
  path: '/projects/methodology',
});

const eyebrowTracking = { letterSpacing: '0.08em' } as const;

const ON_THIS_PAGE = [
  ['how-facts-are-built', 'How facts are built'],
  ['evidence-and-verification', 'Evidence and verification'],
  ['documentary-status', 'Documentary status'],
  ['record-linkage', 'Record linkage'],
  ['money-and-geography', 'Money and geography'],
  ['missing-information', 'Missing information'],
  ['coverage-and-limits', 'Coverage and limits'],
  ['before-you-rely-on-a-record', 'Before you rely on a record'],
] as const;

const PROCESS_STAGES = [
  {
    number: '01',
    title: 'Public source',
    text: 'Official page or document.',
    icon: Landmark,
  },
  {
    number: '02',
    title: 'Evidence record',
    text: 'Source, date, identifier, and the fields the record establishes.',
    icon: FileText,
  },
  {
    number: '03',
    title: 'Project link',
    text: 'Evidence connected conservatively to the supported project.',
    icon: Link2,
  },
  {
    number: '04',
    title: 'Published fact',
    text: 'Normalized project field with provenance and source links.',
    icon: BadgeCheck,
  },
] as const;

const LIFECYCLE_MEANINGS: Record<
  (typeof ProjectLifecycleStatus.options)[number],
  { establishes: string; doesNotEstablish: string }
> = {
  PLANNED: {
    establishes: 'A published planning record identifies proposed work.',
    doesNotEstablish: 'That procurement began or the work was approved.',
  },
  PROCUREMENT: {
    establishes: 'A procurement-stage record identifies a bidding process.',
    doesNotEstablish: 'That a bidder won or a contract was executed.',
  },
  AWARDED: {
    establishes: 'Award evidence identifies an award decision.',
    doesNotEstablish:
      'An executed contract, Notice to Proceed, construction, or payment.',
  },
  CONTRACTED: {
    establishes: 'Contract evidence supports contract execution.',
    doesNotEstablish:
      'A Notice to Proceed, physical progress, payment, or completion.',
  },
  IMPLEMENTATION_REPORTED: {
    establishes:
      'An official implementation or utilization report describes project activity.',
    doesNotEstablish:
      'Procurement award, signed contract, payment, disbursement, or independent physical verification.',
  },
};

const IDENTIFIER_ROWS = [
  ['BetterSanFernando project ID', 'Stable public route and record identity.'],
  ['APP Code', 'Planning and procurement-plan reference.'],
  ['BAC / control reference', 'Bids and Awards Committee process reference.'],
  [
    'PhilGEPS reference',
    'Philippine Government Electronic Procurement System reference.',
  ],
  ['Contract number', 'Contract document reference.'],
  [
    'Source identifier',
    'Identifier of the supporting evidence record or document.',
  ],
] as const;

const AMOUNT_ROWS = [
  ['Estimated budget', 'A planning estimate recorded in planning evidence.'],
  [
    'Approved Budget for the Contract (ABC)',
    'The approved procurement budget or ceiling for the contract.',
  ],
  [
    'Winning bid amount',
    'The amount reported for the winning bid in procurement evidence.',
  ],
  [
    'Contract amount',
    'The amount supported by published contract-related evidence.',
  ],
  [
    'Fund utilization amount',
    'An amount reported in a separate utilization context.',
  ],
  [
    'Actual expenditure',
    'Not established by the current published project dataset.',
  ],
] as const;

const MISSING_DATA_PRINCIPLES = [
  {
    number: '01',
    title: 'We do not turn missing values into zero.',
    text: 'A missing contractor, amount, date, reference, or location stays missing unless a published source establishes it.',
  },
  {
    number: '02',
    title: 'We do not fill gaps from nearby records.',
    text: 'Similar projects or documents do not supply a missing field for another project record.',
  },
  {
    number: '03',
    title: 'A missing record is not proof that something never happened.',
    text: 'It means the current BetterSanFernando dataset has not established that fact from its published evidence.',
  },
] as const;

const COVERAGE_BLOCKS = [
  {
    title: 'Bounded project collection',
    text: 'BetterSanFernando currently publishes a bounded collection of infrastructure and public-works project records assembled from identified public sources. It is not a complete legal register of all projects, procurements, contracts, payments, or City Government activity.',
  },
  {
    title: 'Source labels',
    text: '“Official source” describes the recorded source authority and provenance. It does not mean the source agency endorses BetterSanFernando.',
  },
  {
    title: 'No legal or performance findings',
    text: 'The presence or absence of a record is not a finding of legality, compliance, wrongdoing, project quality, project completion, or performance.',
  },
  {
    title: 'Records can change',
    text: 'Published records may be corrected or expanded when stronger or newer source evidence becomes available. For consequential decisions or formal citation, check the linked official document and its date.',
  },
] as const;

const CHECKLIST_ROWS = [
  ['Open the cited official source.'],
  ['Check the document date and whether newer information exists.'],
  ['Confirm which project field the source actually establishes.'],
  [
    'Keep ABC, winning bid, contract amount, utilization, and expenditure separate.',
  ],
  ['Treat missing information as unknown, not zero or proof of absence.'],
  [
    'Treat barangay attribution as area-level unless a verified exact location is published.',
  ],
] as const;

const RELATED_RESOURCES = [
  {
    title: 'Project Map',
    description:
      'See how published project records are distributed across San Fernando’s barangays.',
    href: '/projects/map',
  },
  {
    title: 'Procurement Overview',
    description:
      'Understand how project, bid, award, and contract evidence relate.',
    href: '/procurement',
  },
  {
    title: 'Project Statistics',
    description:
      'Explore descriptive statistics for the current published project collection.',
    href: '/statistics/projects',
  },
  {
    title: 'Transparency Methodology',
    description:
      'See how BetterSanFernando handles broader publication, sources, and transparency data.',
    href: '/transparency/methodology',
  },
] as const;

export default function ProjectMethodology() {
  const projects = getProjects();
  const evidence = getAllProjectEvidence();
  const withDocuments = evidence.filter(hasAttachment).length;

  return (
    <main className="min-h-screen bg-white">
      {/* Intro + Scope */}
      <section className="container mx-auto px-4 pt-6 pb-8 sm:pt-8 sm:pb-10">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Projects', href: '/projects' },
            { label: 'Project Methodology' },
          ]}
        />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
          <div>
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              PROJECT METHODOLOGY
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              How BetterSanFernando builds project records
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-700 sm:text-lg">
              BetterSanFernando organizes public project records so residents
              can trace a published fact back to the evidence that supports it.
              This page explains how records are collected, connected,
              interpreted, and presented, and where the limits of the current
              dataset begin.
            </p>
          </div>

          <aside
            aria-labelledby="scope-module-title"
            className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5"
          >
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              SCOPE
            </p>
            <h2
              id="scope-module-title"
              className="mt-1.5 text-base font-bold text-gray-950"
            >
              What this methodology covers
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-gray-600">
              This methodology applies to BetterSanFernando’s current published
              infrastructure and public-works project collection. It explains
              how the portal handles evidence, project relationships,
              documentary status, financial fields, geography, and missing
              information.
            </p>
            <p className="mt-3 border-t border-gray-200 pt-3 text-xs leading-relaxed text-gray-500">
              Independent and community-run. Not an official City Government
              website.
            </p>
          </aside>
        </div>
      </section>

      {/* Current release summary */}
      <section
        aria-label="Current project release summary"
        className="border-y border-gray-200 bg-gray-50"
      >
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <dl className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
            <div className="py-3 sm:py-0 sm:pr-6">
              <dt className="text-sm font-medium text-gray-600">
                Published projects
              </dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
                {projects.length}
              </dd>
            </div>
            <div className="py-3 sm:py-0 sm:px-6">
              <dt className="text-sm font-medium text-gray-600">
                Project evidence records
              </dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
                {evidence.length}
              </dd>
            </div>
            <div className="py-3 sm:py-0 sm:pl-6">
              <dt className="text-sm font-medium text-gray-600">
                Evidence records with direct documents
              </dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
                {withDocuments} of {evidence.length}
              </dd>
            </div>
          </dl>
          <p className="mt-4 border-t border-gray-200 pt-3 text-xs text-gray-600 sm:mt-4 sm:pt-4">
            These figures describe the current published project collection and
            may change as additional verified source evidence is added.
          </p>
        </div>
      </section>

      {/* On this page */}
      <nav
        aria-label="Methodology sections"
        className="container mx-auto px-4 py-6"
      >
        <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
          ON THIS PAGE
        </p>
        <ol className="mt-3 grid grid-cols-1 divide-y divide-gray-200 border-y border-gray-200 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
          {ON_THIS_PAGE.map(([href, label], index) => (
            <li
              key={href}
              className={
                index % 2 === 1
                  ? 'sm:border-l sm:border-gray-200'
                  : index % 4 !== 0
                    ? 'lg:border-l lg:border-gray-200'
                    : ''
              }
            >
              <a
                href={`#${href}`}
                className="flex items-center justify-between gap-2 px-1 py-3 text-sm font-medium text-gray-700 hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] sm:px-4"
              >
                {label}
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-gray-400"
                  aria-hidden="true"
                />
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="container mx-auto space-y-10 px-4 pt-6 pb-16 sm:space-y-12 sm:pt-8 sm:pb-16">
        {/* How facts are built */}
        <section
          id="how-facts-are-built"
          className="scroll-mt-24 border-t border-gray-200 pt-8 sm:pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            HOW FACTS ARE BUILT
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl">
            From public source to published fact
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            BetterSanFernando does not treat a project page as an independent
            source. Published project facts remain connected to the records used
            to establish them.
          </p>

          {/* Desktop: four stages with connectors */}
          <div className="mt-6 hidden overflow-hidden rounded-sm border border-gray-200 bg-white lg:grid lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
            {PROCESS_STAGES.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <div className="contents" key={stage.number}>
                  {index > 0 && (
                    <div className="flex items-center justify-center px-2">
                      <ArrowRight
                        className="h-4 w-4 text-gray-300"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  <div
                    className={`p-5 ${index > 0 ? 'border-l border-gray-200' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-medium text-gray-500">
                        {stage.number}
                      </span>
                      <Icon
                        className="h-4 w-4 text-[#0066EB]"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-gray-950">
                      {stage.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-gray-700">
                      {stage.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile: vertical sequence */}
          <ol className="mt-6 divide-y divide-gray-200 rounded-sm border border-gray-200 bg-white lg:hidden">
            {PROCESS_STAGES.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <li key={stage.number} className="p-5">
                  {index > 0 && (
                    <div className="mb-3 flex justify-center">
                      <ArrowDown
                        className="h-4 w-4 text-gray-300"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-medium text-gray-500">
                      {stage.number}
                    </span>
                    <Icon
                      className="h-4 w-4 text-[#0066EB]"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-gray-950">
                    {stage.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-gray-700">
                    {stage.text}
                  </p>
                </li>
              );
            })}
          </ol>

          <p className="mt-4 max-w-3xl text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
            Normalization changes structure, not source meaning.
            BetterSanFernando may standardize labels, dates, identifiers, or
            field placement so records can be searched consistently, but it does
            not turn one financial concept, documentary stage, or location into
            another.
          </p>
        </section>

        {/* Evidence and verification */}
        <section
          id="evidence-and-verification"
          className="scroll-mt-24 border-t border-gray-200 pt-8 sm:pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            EVIDENCE AND VERIFICATION
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl">
            What evidence can and cannot establish
          </h2>

          <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white">
            <div className="grid grid-cols-1 divide-y divide-gray-200 md:grid-cols-2 md:divide-y-0 md:divide-x">
              <div className="p-5 sm:p-6">
                <h3 className="text-sm font-bold text-gray-950">
                  What evidence can establish
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                  A published source can establish specific facts such as a
                  project name, procurement reference, approved budget, winning
                  bidder, contract amount, award date, or barangay attribution
                  when those facts are explicitly supported by the record.
                </p>
              </div>
              <div className="bg-gray-50/40 p-5 sm:p-6">
                <h3 className="text-sm font-bold text-gray-950">
                  What evidence does not automatically establish
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                  One document does not automatically establish every fact about
                  a project. A bid result does not prove contract execution. A
                  contract record does not prove payment or physical completion.
                  An implementation report does not independently establish an
                  award or contract.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 bg-[#F3F6FB] p-5 sm:p-6">
              <h3 className="text-sm font-bold text-gray-950">
                What “verified” means
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                When BetterSanFernando describes a project fact or evidence
                record as verified, it means the published value is supported by
                the cited source and recorded provenance. It does not mean
                BetterSanFernando independently audited the underlying
                government activity, inspected the project site, or made a legal
                or compliance determination.
              </p>
            </div>
          </div>
        </section>

        {/* Documentary status */}
        <section
          id="documentary-status"
          className="scroll-mt-24 border-t border-gray-200 pt-8 sm:pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            DOCUMENTARY STATUS
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl">
            Documentary status, not physical progress
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            A project’s status summarizes the strongest documentary stage
            currently supported by published evidence. It should not be read as
            a construction-progress indicator.
          </p>

          {/* Desktop table */}
          <div className="mt-6 hidden overflow-x-auto border-y border-gray-300 md:block">
            <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
              <caption className="sr-only">
                Current public project lifecycle states and what each does and
                does not establish
              </caption>
              <thead className="bg-gray-50 text-gray-900">
                <tr>
                  <th scope="col" className="px-4 py-3 font-bold">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    What the evidence establishes
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
                      className="px-4 py-4 align-top font-bold text-gray-950"
                    >
                      {titleCaseEnum(status)}
                    </th>
                    <td className="px-4 py-4 align-top text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                      {LIFECYCLE_MEANINGS[status].establishes}
                    </td>
                    <td className="px-4 py-4 align-top text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                      {LIFECYCLE_MEANINGS[status].doesNotEstablish}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked records */}
          <ol className="mt-6 divide-y divide-gray-200 border-y border-gray-200 md:hidden">
            {ProjectLifecycleStatus.options.map(status => (
              <li key={status} className="space-y-1.5 py-4">
                <p className="font-bold text-gray-950">
                  {titleCaseEnum(status)}
                </p>
                <p className="text-xs leading-relaxed text-gray-700 sm:text-sm">
                  <span className="font-semibold text-gray-900">
                    Establishes:{' '}
                  </span>
                  {LIFECYCLE_MEANINGS[status].establishes}
                </p>
                <p className="text-xs leading-relaxed text-gray-700 sm:text-sm">
                  <span className="font-semibold text-gray-900">
                    Does not establish:{' '}
                  </span>
                  {LIFECYCLE_MEANINGS[status].doesNotEstablish}
                </p>
              </li>
            ))}
          </ol>

          <p className="mt-4 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
            These statuses summarize documentary support. They are not a
            procurement funnel, a project-completion scale, or a measure of
            physical work performed on site.
          </p>
        </section>

        {/* Record linkage */}
        <section
          id="record-linkage"
          className="scroll-mt-24 border-t border-gray-200 pt-8 sm:pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            RECORD LINKAGE
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl">
            How evidence is connected to projects
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            BetterSanFernando links evidence conservatively. Exact project
            relationships and namespaced references are stronger identity
            signals than similar wording.
          </p>

          <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white">
            <div className="grid grid-cols-1 divide-y divide-gray-200 md:grid-cols-3 md:divide-y-0 md:divide-x">
              <div className="p-5 sm:p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Strong identity signals
                </h3>
                <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                  <li className="flex items-start gap-2">
                    <span className="text-[#0066EB]" aria-hidden="true">
                      •
                    </span>
                    <span>Explicit evidence-to-project relationship</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#0066EB]" aria-hidden="true">
                      •
                    </span>
                    <span>Exact canonical project relationship</span>
                  </li>
                </ul>
              </div>

              <div className="p-5 sm:p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Namespaced references
                </h3>
                <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                  <li className="flex items-start gap-2">
                    <span className="text-[#0066EB]" aria-hidden="true">
                      •
                    </span>
                    <span>APP Code</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#0066EB]" aria-hidden="true">
                      •
                    </span>
                    <span>BAC / control reference</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#0066EB]" aria-hidden="true">
                      •
                    </span>
                    <span>PhilGEPS reference</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#0066EB]" aria-hidden="true">
                      •
                    </span>
                    <span>Contract number</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#0066EB]" aria-hidden="true">
                      •
                    </span>
                    <span>Source identifier</span>
                  </li>
                </ul>
              </div>

              <div className="p-5 sm:p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Not enough on their own
                </h3>
                <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400" aria-hidden="true">
                      •
                    </span>
                    <span>Similar project title</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400" aria-hidden="true">
                      •
                    </span>
                    <span>Same year</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400" aria-hidden="true">
                      •
                    </span>
                    <span>Same barangay</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400" aria-hidden="true">
                      •
                    </span>
                    <span>Similar amount</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
            Similar names, years, barangays, or amounts may help identify a
            candidate match, but they are not enough by themselves to merge
            records.
          </p>

          <div className="mt-8">
            <h3 className="text-sm font-bold text-gray-950">
              Identifiers keep their own namespaces
            </h3>
            <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-white">
              <dl className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
                {IDENTIFIER_ROWS.map(([term, definition], index) => (
                  <div
                    key={term}
                    className={`p-4 sm:p-5 ${
                      index % 2 === 1 ? 'sm:border-l sm:border-gray-200' : ''
                    } ${index >= 2 ? 'sm:border-t sm:border-gray-200' : ''} ${
                      index % 3 !== 0
                        ? 'lg:border-l lg:border-gray-200'
                        : 'lg:border-l-0'
                    } ${
                      index >= 3
                        ? 'lg:border-t lg:border-gray-200'
                        : 'lg:border-t-0'
                    }`}
                  >
                    <dt className="text-xs font-semibold text-gray-900 sm:text-sm">
                      {term}
                    </dt>
                    <dd className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm">
                      {definition}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
              These identifiers come from different record systems and should
              not be treated as interchangeable values.
            </p>
          </div>
        </section>

        {/* Money and geography */}
        <section
          id="money-and-geography"
          className="scroll-mt-24 border-t border-gray-200 pt-8 sm:pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            READING PROJECT FIELDS
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl">
            Money and geography describe different facts
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-bold text-gray-950 sm:text-base">
                Money fields are not interchangeable
              </h3>
              <dl className="mt-3 divide-y divide-gray-200 border-y border-gray-200">
                {AMOUNT_ROWS.map(([field, meaning]) => (
                  <div key={field} className="py-2.5 sm:py-3">
                    <dt className="text-xs font-semibold text-gray-900 sm:text-sm">
                      {field}
                    </dt>
                    <dd className="mt-0.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                      {meaning}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs font-semibold text-gray-900 sm:text-sm">
                ABC ≠ winning bid ≠ contract amount ≠ utilization amount ≠
                actual expenditure.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-950 sm:text-base">
                Barangay attribution is not an exact project location
              </h3>
              <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-[#F3F6FB]">
                <div className="divide-y divide-gray-200">
                  <div className="p-4 sm:p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                      What the map can show
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                      Projects may be attributed to one of San Fernando’s 35
                      barangays when published evidence supports that
                      relationship.
                    </p>
                  </div>
                  <div className="p-4 sm:p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      What the map cannot show
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                      The current project dataset does not publish verified
                      project point coordinates. Barangay attribution should not
                      be interpreted as an exact construction site, parcel, road
                      segment, or facility coordinate.
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                The Project Map therefore shows the distribution of project
                records by barangay. It is not an exact project-location map.
              </p>

              <div className="mt-2 rounded-sm border border-gray-200 bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-600">
                Map shading represents project-record attribution by barangay,
                not exact project coordinates.
              </div>

              <div className="mt-3.5">
                <Link
                  href="/projects/map"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
                >
                  <MapPinned className="h-4 w-4" aria-hidden="true" />
                  View Project Map →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Missing information */}
        <section
          id="missing-information"
          className="scroll-mt-24 border-t border-gray-200 pt-8 sm:pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            MISSING INFORMATION
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl">
            Missing information stays missing
          </h2>

          <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-[#F3F6FB]">
            <ol className="grid grid-cols-1 divide-y divide-gray-200 md:grid-cols-3 md:divide-y-0 md:divide-x">
              {MISSING_DATA_PRINCIPLES.map(principle => (
                <li key={principle.number} className="p-5 sm:p-6">
                  <span className="font-mono text-sm font-semibold text-gray-400 sm:text-base">
                    {principle.number}
                  </span>
                  <h3 className="mt-2 text-sm font-bold text-gray-950">
                    {principle.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                    {principle.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-3.5 rounded-sm border-l-2 border-[#0066EB] bg-gray-50 px-4 py-2.5">
            <p className="text-xs font-medium text-gray-800 sm:text-sm">
              Unknown, unavailable, and not established are not the same as
              zero, false, or not applicable.
            </p>
          </div>
        </section>

        {/* Coverage and limits */}
        <section
          id="coverage-and-limits"
          className="scroll-mt-24 border-t border-gray-200 pt-8 sm:pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            COVERAGE AND LIMITS
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl">
            What this dataset covers
          </h2>

          <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-[#F3F6FB]">
            <div className="grid grid-cols-1 divide-y divide-gray-200 md:grid-cols-2 md:divide-y-0">
              {COVERAGE_BLOCKS.map((block, index) => (
                <div
                  key={block.title}
                  className={`p-5 sm:p-6 ${
                    index % 2 === 1 ? 'md:border-l md:border-gray-200' : ''
                  } ${index >= 2 ? 'md:border-t md:border-gray-200' : ''}`}
                >
                  <h3 className="text-sm font-bold text-gray-950">
                    {block.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                    {block.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Before you rely on a record */}
        <section
          id="before-you-rely-on-a-record"
          className="scroll-mt-24 border-t border-gray-200 pt-8 sm:pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            BEFORE YOU RELY ON A RECORD
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl">
            A quick verification checklist
          </h2>

          <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white">
            <ol className="grid grid-cols-1 divide-y divide-gray-200 md:grid-cols-2 md:divide-y-0">
              {CHECKLIST_ROWS.map(([text], index) => (
                <li
                  key={text}
                  className={`flex items-start gap-3.5 p-4 sm:p-5 ${
                    index % 2 === 1 ? 'md:border-l md:border-gray-200' : ''
                  } ${index >= 2 ? 'md:border-t md:border-gray-200' : ''}`}
                >
                  <span className="font-mono text-sm font-semibold text-gray-400 sm:text-base">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                    {text}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <p className="mt-3 text-xs text-gray-500 sm:text-sm sm:text-gray-600">
            BetterSanFernando is designed to make public records easier to
            inspect, not to replace the official source.
          </p>
        </section>

        {/* Keep exploring */}
        <section
          id="keep-exploring"
          aria-labelledby="keep-exploring-heading"
          className="scroll-mt-24 border-t border-gray-200 pt-8 sm:pt-10 pb-8 sm:pb-10 lg:pb-12"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            KEEP EXPLORING
          </p>
          <h2
            id="keep-exploring-heading"
            className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl"
          >
            Explore the project data
          </h2>

          <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white">
            <div className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-2 text-[#0066EB]">
                  <FileCheck2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <h3 className="text-sm font-bold text-gray-950 sm:text-base">
                    Project Evidence
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                  Inspect the official-source records behind published project
                  facts.
                </p>
                <div className="mt-3.5">
                  <Link
                    href="/projects/sources"
                    className="inline-flex items-center text-xs font-bold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
                  >
                    Browse Project Evidence →
                  </Link>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-2 text-[#0066EB]">
                  <FolderKanban
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  <h3 className="text-sm font-bold text-gray-950 sm:text-base">
                    City Projects
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                  Browse the current published infrastructure and public-works
                  project collection.
                </p>
                <div className="mt-3.5">
                  <Link
                    href="/projects/city-projects"
                    className="inline-flex items-center text-xs font-bold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
                  >
                    Browse City Projects →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Related resources
            </h3>
            <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-white">
              <div className="grid grid-cols-1 divide-y divide-gray-200 md:grid-cols-2 md:divide-y-0">
                {RELATED_RESOURCES.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between gap-4 p-4 transition-colors hover:bg-[#F3F6FB] sm:p-5 ${
                      index % 2 === 1 ? 'md:border-l md:border-gray-200' : ''
                    } ${index >= 2 ? 'md:border-t md:border-gray-200' : ''}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-950 group-hover:text-[#0066EB]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#0066EB]"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
