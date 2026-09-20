import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  FileText,
  LockKeyhole,
} from 'lucide-react';
import Link from 'next/link';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import { getTransparencySourceInventory } from '../../../data/civic/transparencySources';
import { buildPageMetadata } from '../../../lib/metadata';

export const metadata = buildPageMetadata({
  title: 'How We Publish Data',
  description:
    'How BetterSanFernando sources, verifies, normalizes, limits, and responsibly publishes civic information.',
  path: '/transparency/methodology',
});

const SECTION_LINKS = [
  ['source-authority', 'Source Authority'],
  ['verification', 'Verification Workflow'],
  ['normalization', 'Normalization'],
  ['claim-boundaries', 'Evidence & Claim Boundaries'],
  ['publication-boundary', 'Privacy & Publication Boundary'],
  ['versioned-releases', 'Versioned Releases'],
  ['domain-limitations', 'Domain Limits'],
  ['limitations', 'Data Limitations'],
] as const;

const VERIFICATION_PHASES = [
  {
    phase: 'Find',
    description:
      'Identify public sources and preserve their explicit provenance.',
    steps: [
      {
        num: 1,
        title: 'Locate a public source',
        description:
          'Start with a relevant public page, document, archive, or dataset and identify who published it.',
      },
      {
        num: 2,
        title: 'Preserve source identity',
        description:
          'Keep the publisher, source authority, reference period, and public link attached to the record.',
      },
    ],
  },
  {
    phase: 'Verify',
    description:
      'Extract only what the source directly establishes and validate relationships.',
    steps: [
      {
        num: 3,
        title: 'Extract supported facts',
        description:
          'Record only the fields the source actually establishes; unrelated claims do not inherit its authority.',
      },
      {
        num: 4,
        title: 'Validate relationships and totals',
        description:
          'Check identities, references, joins, expected totals, and cross-dataset consistency before publication.',
      },
    ],
  },
  {
    phase: 'Normalize',
    description:
      'Standardize formats consistently while leaving uncertainty and gaps visible.',
    steps: [
      {
        num: 5,
        title: 'Normalize without changing meaning',
        description:
          'Represent dates, identifiers, amounts, places, and documentary states consistently while retaining their original meaning.',
      },
      {
        num: 6,
        title: 'Keep uncertainty visible',
        description:
          'Leave unsupported values unknown, preserve meaningful distinctions, and state the dataset’s coverage.',
      },
    ],
  },
  {
    phase: 'Publish',
    description:
      'Export frontend-safe records and keep public verification links open.',
    steps: [
      {
        num: 7,
        title: 'Publish reviewed fields only',
        description:
          'Move only approved, frontend-safe fields into a versioned public export used by the website.',
      },
      {
        num: 8,
        title: 'Keep the trust path open',
        description:
          'Where available, retain a public link so readers can inspect the source behind a published fact.',
      },
    ],
  },
] as const;

const AUTHORITY_ROWS = [
  {
    domain: 'Population and PSGC identity',
    authority: 'Philippine Statistics Authority',
    role: 'Supports the 2024 POPCEN population baseline, official names, codes, and classifications.',
  },
  {
    domain: 'Geographic polygons',
    authority: 'Community-maintained geography source',
    role: 'Supplies polygon geometry. It is not presented as an official PSA shapefile.',
  },
  {
    domain: 'Project evidence',
    authority: 'Record-specific primary official publishers',
    role: 'Authority and public links remain attached to each evidence record and documentary stage.',
  },
  {
    domain: 'City offices',
    authority: 'Record-specific City Government sources',
    role: 'Office identity and contact fields retain the public sources used for each directory record.',
  },
] as const;

const NORMALIZATION_RULES = [
  {
    concept: 'Documentary State',
    highlight: 'AWARDED ≠ CONTRACTED',
    explanation:
      'Each state describes the strongest published documentary evidence, not physical progress on the ground.',
  },
  {
    concept: 'Financial Meaning',
    highlight: 'ABC ≠ Winning Bid ≠ Contract Amount ≠ Actual Expenditure',
    explanation:
      'ABC is not a winning bid, contract amount, or actual expenditure. These values describe fundamentally different stages of budgeting, procurement, and accounting and remain strictly separate.',
  },
  {
    concept: 'Missing Values',
    highlight: 'Unknown ≠ Zero',
    explanation:
      'An unavailable value stays absent or is presented as “Not specified.” Missing data is never coerced into a numeric zero.',
  },
  {
    concept: 'Place',
    highlight: 'Missing Location ≠ Invented Map Point',
    explanation:
      'Missing barangay attribution is never converted into an invented location or arbitrary map coordinate.',
  },
  {
    concept: 'Identifiers',
    highlight: 'Different Identifiers ≠ Interchangeable IDs',
    explanation:
      'Project IDs, APP codes, procurement references, PhilGEPS references, contract numbers, and source identifiers retain separate namespaces.',
  },
] as const;

const WHY_VERSIONING_MATTERS = [
  {
    title: 'Validate Structure',
    explanation:
      'Confirm that the website receives the fields and relationships it expects.',
  },
  {
    title: 'Reproduce Releases',
    explanation:
      'Identify what information a particular public release contained.',
  },
  {
    title: 'Track Reviewed Changes',
    explanation: 'Publish updates deliberately as verified evidence improves.',
  },
  {
    title: 'Protect Field Meaning',
    explanation:
      'Avoid silent changes to identifiers, relationships, or data semantics.',
  },
] as const;

const DATA_LIMITATIONS_GROUPS = [
  {
    label: 'COVERAGE',
    text: 'Published datasets may be bounded or incomplete and may not represent every City Government activity or complete historical coverage.',
  },
  {
    label: 'MISSING INFORMATION',
    text: 'Missing or unsupported fields remain unknown rather than being inferred, reconstructed, or treated as zero.',
  },
  {
    label: 'SOURCE AVAILABILITY',
    text: 'Official sources differ in availability, format, authority, and verification date.',
  },
  {
    label: 'TIME & STATUS',
    text: 'Different datasets may describe different reference periods, and publication does not automatically establish current legal status or validity.',
  },
  {
    label: 'ABSENCE OF EVIDENCE',
    text: 'A record missing from BetterSanFernando does not prove that the record, event, or action never existed.',
  },
  {
    label: 'ATTRIBUTION',
    text: 'Using an official public source does not mean the City Government endorses, operates, or maintains BetterSanFernando.',
  },
] as const;

function MethodSection({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 border-t border-gray-200 pt-12 sm:pt-14"
    >
      {eyebrow && <p className="text-eyebrow text-[#0066EB]">{eyebrow}</p>}
      <h2 className="text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl">
        {title}
      </h2>
      <div className="mt-5 space-y-6 text-base leading-relaxed text-gray-700">
        {children}
      </div>
    </section>
  );
}

export default function TransparencyMethodology() {
  const inventory = getTransparencySourceInventory();
  const fullDisclosureDomain = inventory.publishedDomains.find(
    domain => domain.id === 'full-disclosure'
  );
  const financeDomain = inventory.publishedDomains.find(
    domain => domain.id === 'finance'
  );

  return (
    <main className="flex-grow bg-white">
      {/* 1. EDITORIAL HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Transparency', href: '/transparency' },
              { label: 'How We Publish Data' },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <div className="max-w-3xl">
              <p className="text-eyebrow text-[#0066EB]">
                TRANSPARENCY · PUBLICATION METHOD
              </p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.02em] text-gray-950 sm:text-4xl md:text-5xl">
                How We Publish Data
              </h1>
              <p className="mt-4 max-w-[72ch] text-base leading-relaxed text-gray-700 sm:text-lg">
                See how BetterSanFernando finds public sources, verifies facts,
                preserves source meaning, manages uncertainty, and decides what
                is safe to publish.
              </p>

              {/* CTA row */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href="#publication-process"
                  className="inline-flex h-11 items-center gap-2 rounded-sm bg-[#0066EB] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0052BC]"
                >
                  See the Publication Process
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>
                <Link
                  href="/transparency/sources"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
                >
                  Browse Data Sources
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Right-Side Scope Module */}
            <aside className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6 text-sm">
              <p className="text-eyebrow text-[#0066EB]">THIS PAGE COVERS</p>
              <h2 className="mt-1.5 text-base font-bold text-gray-950">
                Site-Wide Publication Rules
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                This page describes the publication rules BetterSanFernando
                applies across civic datasets. Project-specific evidence,
                lifecycle, financial-field, linkage, and geography rules remain
                in the separate Project Data Guide.
              </p>
              <div className="mt-4 border-t border-gray-200/80 pt-3">
                <Link
                  href="/projects/methodology"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC]"
                >
                  Project Data Guide
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 2. SIMPLIFIED FULL-WIDTH RELEASE SNAPSHOT (NO ACCORDION/DETAILS BOX) */}
      <section
        className="border-b border-gray-200 bg-white py-8 sm:py-10"
        aria-labelledby="snapshot-heading"
      >
        <div className="container mx-auto px-4">
          <h2 id="snapshot-heading" className="sr-only">
            Release snapshot
          </h2>
          <div>
            <p className="text-eyebrow text-gray-500">CURRENT PUBLIC RELEASE</p>
            {/* Primary resident metrics */}
            <dl className="mt-4 grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
              <div className="pb-4 sm:pb-0 sm:pr-8">
                <dd className="text-3xl sm:text-4xl font-extrabold tabular-nums text-gray-950">
                  {inventory.publishedDomains.length}
                </dd>
                <dt className="mt-1 text-sm font-semibold text-gray-800">
                  Published Domains
                </dt>
                <p className="mt-0.5 text-xs text-gray-500">
                  Active civic subject areas
                </p>
              </div>
              <div className="pt-4 sm:pt-0 sm:pl-8">
                <dd className="text-3xl sm:text-4xl font-extrabold tabular-nums text-gray-950">
                  {inventory.release.datasetCount}
                </dd>
                <dt className="mt-1 text-sm font-semibold text-gray-800">
                  Dataset Files
                </dt>
                <p className="mt-0.5 text-xs text-gray-500">
                  In current public manifest
                </p>
              </div>
            </dl>

            {/* Quiet metadata line below metrics */}
            <p className="mt-5 border-t border-gray-100 pt-3 text-xs text-gray-500">
              Release metadata: Public export {inventory.release.exportVersion}{' '}
              · Source data {inventory.release.sourceDataVersion}
            </p>
          </div>
        </div>
      </section>

      {/* 3. RESPONSIVE FULL-WIDTH "ON THIS PAGE" INDEX */}
      <section
        className="border-b border-gray-200 bg-[#F9FAFB] py-8 sm:py-10"
        aria-label="Table of contents"
      >
        <div className="container mx-auto px-4">
          <p className="text-eyebrow text-[#0066EB]">ON THIS PAGE</p>
          <ol className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
            {SECTION_LINKS.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="group flex items-center justify-between py-1.5 text-xs sm:text-sm font-medium text-gray-700 transition-colors hover:text-[#0066EB] focus-visible:outline-2 focus-visible:outline-[#0066EB]"
                >
                  <span>{label}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#0066EB]" />
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. MAIN METHODOLOGY ARTICLE */}
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <article className="space-y-14 sm:space-y-16">
          {/* 1. PUBLICATION PROCESS */}
          <section
            id="publication-process"
            className="scroll-mt-28"
            aria-labelledby="process-heading"
          >
            <p className="text-eyebrow text-[#0066EB]">PUBLICATION LIFECYCLE</p>
            <h2
              id="process-heading"
              className="text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
            >
              The Publication Process
            </h2>
            <p className="mt-3 max-w-[72ch] text-base leading-relaxed text-gray-700">
              BetterSanFernando follows an evidence-first pipeline to ensure
              every published statistic or record can be traced to a real public
              source and inspected by residents.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5">
                <div>
                  <span className="text-xs font-bold tabular-nums text-[#0066EB]">
                    01
                  </span>
                  <h3 className="mt-2 text-base font-bold text-gray-950">
                    Public Source
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-gray-600">
                    Relevant public page, document, archive, or dataset
                    published by an identifiable authority.
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-gray-400">
                  Stage 1
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5">
                <div>
                  <span className="text-xs font-bold tabular-nums text-[#0066EB]">
                    02
                  </span>
                  <h3 className="mt-2 text-base font-bold text-gray-950">
                    Verified Evidence
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-gray-600">
                    Source authority, identifiers, context, and supported facts
                    are checked and recorded.
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-gray-400">
                  Stage 2
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5">
                <div>
                  <span className="text-xs font-bold tabular-nums text-[#0066EB]">
                    03
                  </span>
                  <h3 className="mt-2 text-base font-bold text-gray-950">
                    Reviewed Data
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-gray-600">
                    Facts are normalized, relationships validated, uncertainty
                    retained, and publication safety reviewed.
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-gray-400">
                  Stage 3
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-sm border border-[#0066EB]/40 bg-[#F3F6FB] p-5">
                <div>
                  <span className="text-xs font-bold tabular-nums text-[#0066EB]">
                    04
                  </span>
                  <h3 className="mt-2 text-base font-bold text-gray-950">
                    Public Export
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-gray-600">
                    Only approved frontend-safe fields and public source links
                    are included in the versioned website dataset.
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-[#0066EB]">
                  Live Release
                </div>
              </div>
            </div>
          </section>

          {/* 2. SOURCE AUTHORITY (30% / 70% BALANCED GRID) */}
          <MethodSection
            id="source-authority"
            eyebrow="PROVENANCE & TRUST"
            title="Source Authority"
          >
            <p className="max-w-[72ch]">
              A public link alone does not establish authority.
              BetterSanFernando records the role each source actually plays,
              ensuring readers know who stands behind every specific piece of
              civic data.
            </p>

            <div className="divide-y divide-gray-200 border-y border-gray-200">
              {AUTHORITY_ROWS.map(row => (
                <div
                  key={row.domain}
                  className="grid gap-2 py-4 sm:grid-cols-[minmax(0,30%)_minmax(0,70%)] sm:gap-8 items-start"
                >
                  <h3 className="text-sm font-bold text-gray-950">
                    {row.domain}
                  </h3>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-950">
                      {row.authority}
                    </h4>
                    <p className="mt-1 text-xs sm:text-sm leading-relaxed text-gray-600">
                      {row.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="max-w-[72ch] text-sm text-gray-600">
              Secondary validation may support identity or context, but it does
              not silently become a primary publisher. Authority labels remain
              attached to the role each source actually plays.
            </p>
          </MethodSection>

          {/* 3. VERIFICATION WORKFLOW */}
          <MethodSection
            id="verification"
            eyebrow="VERIFICATION STANDARDS"
            title="Verification Workflow"
          >
            <p className="max-w-[72ch]">
              Verification is an explicit sequence of evidence and consistency
              checks, not an assumption of perfection. BetterSanFernando
              organizes verification into four distinct operational phases:
            </p>

            <div className="space-y-6 pt-2">
              {VERIFICATION_PHASES.map(phaseGroup => (
                <div
                  key={phaseGroup.phase}
                  className="rounded-sm border border-gray-200 bg-[#F9FAFB] p-5 sm:p-6"
                >
                  <div className="border-b border-gray-200 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                      Phase
                    </span>
                    <h3 className="text-lg font-bold text-gray-950">
                      {phaseGroup.phase}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {phaseGroup.description}
                    </p>
                  </div>

                  <div className="mt-4 space-y-4">
                    {phaseGroup.steps.map(step => (
                      <div
                        key={step.title}
                        className="grid items-start gap-2 sm:grid-cols-[2rem_14rem_1fr] sm:gap-4"
                      >
                        <span className="text-xs font-bold tabular-nums text-[#0066EB]">
                          0{step.num}
                        </span>
                        <h4 className="text-sm font-bold text-gray-950">
                          {step.title}
                        </h4>
                        <p className="text-xs sm:text-sm leading-relaxed text-gray-600">
                          {step.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </MethodSection>

          {/* 4. NORMALIZATION */}
          <MethodSection
            id="normalization"
            eyebrow="STANDARDIZATION SAFEGUARDS"
            title="Normalization Without Changing Meaning"
          >
            <p className="max-w-[72ch]">
              Public records use differing formats, naming conventions, and
              documentary terminology. Normalization ensures datasets can be
              searched and reconciled without distorting what the source
              actually recorded.
            </p>

            <div className="divide-y divide-gray-200 border-y border-gray-200">
              {NORMALIZATION_RULES.map(rule => (
                <div
                  key={rule.concept}
                  className="grid gap-2 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6"
                >
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Concept
                    </span>
                    <h3 className="mt-0.5 text-sm font-bold text-gray-950">
                      {rule.concept}
                    </h3>
                  </div>
                  <div>
                    <div className="inline-block rounded-sm bg-[#F3F6FB] px-2.5 py-1 font-mono text-xs font-bold text-[#0066EB]">
                      {rule.highlight}
                    </div>
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-600">
                      {rule.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </MethodSection>

          {/* 5. EVIDENCE & CLAIM BOUNDARIES (BALANCED 50/50 LAYOUT) */}
          <MethodSection
            id="claim-boundaries"
            eyebrow="EVALUATION BOUNDARIES"
            title="Evidence Supports Only What It Establishes"
          >
            <p className="max-w-[72ch]">
              A public record supports only the facts it directly and explicitly
              establishes. Extending a document’s authority to unrelated or
              downstream events creates misinformation.
            </p>

            {/* Simplified Example Container with 50/50 Desktop Alignment */}
            <div className="border-y border-gray-200 py-6">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#0066EB]" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-950">
                  Example · Award Document
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
                {/* Left Column: Can Support */}
                <div className="pb-5 sm:pb-0 sm:pr-6">
                  <h3 className="text-sm font-bold text-gray-950">
                    Can Support
                  </h3>
                  <ul className="mt-3 space-y-2 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-[#0066EB] font-bold">•</span>
                      <span>Award decision and resolution reference</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#0066EB] font-bold">•</span>
                      <span>Identity of the winning bidder</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#0066EB] font-bold">•</span>
                      <span>
                        Award amount where explicitly stated in the document
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Right Column: Does Not Establish by Itself */}
                <div className="pt-5 sm:pt-0 sm:pl-6">
                  <h3 className="text-sm font-bold text-gray-700">
                    Does Not Establish by Itself
                  </h3>
                  <ul className="mt-3 space-y-2 text-xs sm:text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 font-bold">•</span>
                      <span>Executed contract or final terms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 font-bold">•</span>
                      <span>Notice to Proceed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 font-bold">•</span>
                      <span>Physical construction start or progress</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 font-bold">•</span>
                      <span>Financial disbursements or final payment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-400 font-bold">•</span>
                      <span>Project completion or handover</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Refined Missing Evidence Callout on pale #F3F6FB */}
            <div className="rounded-sm bg-[#F3F6FB] p-5 text-sm">
              <p className="font-semibold text-gray-950">
                “Missing evidence is not proof that an event never happened.”
              </p>
              <p className="mt-1 text-xs leading-relaxed text-gray-600 max-w-[72ch]">
                It means the current public dataset does not contain qualifying
                evidence for that claim. For project lifecycle, amount,
                identifier, linkage, geography, and missing-information rules,
                see the Project Data Guide.
              </p>
              <div className="mt-3">
                <Link
                  href="/projects/methodology"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0066EB] hover:text-[#0052BC]"
                >
                  Project Data Guide
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </MethodSection>

          {/* 6. PRIVACY & PUBLICATION BOUNDARY */}
          <MethodSection
            id="publication-boundary"
            eyebrow="RESPONSIBLE DISCLOSURE"
            title="Privacy and the Publication Boundary"
          >
            <p className="max-w-[72ch]">
              The public website consumes only reviewed, versioned,
              frontend-safe exports. Research material may include raw sources,
              working notes, unresolved records, or information needing
              additional verification or privacy review. Its existence does not
              authorize publication.
            </p>

            <div className="grid gap-px overflow-hidden rounded-sm border border-gray-200 bg-gray-200 sm:grid-cols-2">
              <div className="bg-white p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className="h-4 w-4 text-emerald-600"
                    aria-hidden="true"
                  />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-950">
                    Public Frontend Export
                  </h3>
                </div>
                <ul className="mt-3 space-y-1.5 text-xs sm:text-sm text-gray-600">
                  <li>• Reviewed fields with documented coverage</li>
                  <li>• Validated relationships and joins</li>
                  <li>• Safe public source links readers can inspect</li>
                  <li>• Frontend-safe civic information</li>
                </ul>
              </div>

              <div className="bg-[#F9FAFB] p-5 sm:p-6">
                <div className="flex items-center gap-2">
                  <LockKeyhole
                    className="h-4 w-4 text-gray-700"
                    aria-hidden="true"
                  />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-950">
                    Not Automatically Public
                  </h3>
                </div>
                <ul className="mt-3 space-y-1.5 text-xs sm:text-sm text-gray-600">
                  <li>• Unresolved research or preliminary findings</li>
                  <li>• Sensitive person-level information</li>
                  <li>• Working notes and internal research artifacts</li>
                  <li>
                    • Information requiring privacy review or minimization
                  </li>
                </ul>
              </div>
            </div>

            <p className="max-w-[72ch] text-xs sm:text-sm text-gray-600">
              A publicly accessible source does not mean every field should be
              republished or aggregated. Person-level information may require
              stronger minimization, maintenance, and publication decisions.
              BetterSanFernando does not claim that this conservative review is
              a formal legal compliance program.
            </p>
          </MethodSection>

          {/* 7. REDESIGNED VERSIONED PUBLIC RELEASES (BALANCED 2-COLUMN LAYOUT) */}
          <MethodSection
            id="versioned-releases"
            eyebrow="RELEASE CONTRACTS"
            title="Versioned Public Releases"
          >
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:divide-x sm:divide-gray-200">
              {/* Left Column: Shortened Context + Current Release Tag */}
              <div className="sm:pr-8">
                <p className="text-base leading-relaxed text-gray-700">
                  BetterSanFernando publishes reviewed civic data through
                  versioned public releases. Versioning makes changes traceable
                  without implying that every release change reflects a change
                  in the underlying City record.
                </p>
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Current release
                  </p>
                  <p className="mt-1 text-sm font-mono text-gray-900">
                    Public export {inventory.release.exportVersion} · Source
                    data {inventory.release.sourceDataVersion}
                  </p>
                </div>
              </div>

              {/* Right Column: Why Versioning Matters (4 Compact Editorial Rows) */}
              <div className="sm:pl-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-950">
                  Why Versioning Matters
                </h3>
                <div className="mt-4 divide-y divide-gray-100">
                  {WHY_VERSIONING_MATTERS.map(item => (
                    <div
                      key={item.title}
                      className="py-2.5 first:pt-0 last:pb-0"
                    >
                      <h4 className="text-xs font-bold text-gray-950">
                        {item.title}
                      </h4>
                      <p className="mt-0.5 text-xs leading-relaxed text-gray-600">
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </MethodSection>

          {/* 8. DOMAIN LIMITATIONS */}
          <MethodSection
            id="domain-limitations"
            eyebrow="SCOPED BOUNDARIES"
            title="Different Domains Have Different Limits"
          >
            <p className="max-w-[72ch]">
              Different civic datasets serve different public purposes and carry
              different limitations. Each domain answers what the current
              published data covers and what it does not claim.
            </p>

            <div className="divide-y divide-gray-200 border-y border-gray-200">
              {[
                [
                  'Projects',
                  'A bounded infrastructure and public-works subset.',
                  'Lifecycle is documentary, not physical progress; no verified project point coordinates currently exist.',
                ],
                [
                  'Population',
                  'The PSA 2024 POPCEN baseline.',
                  'Not a population projection, historical trend, or current-year local estimate.',
                ],
                [
                  'Geography',
                  'City and barangay polygon geometry.',
                  'Derived from a community-maintained geometry source; not an official PSA shapefile.',
                ],
                [
                  'Legislation',
                  'Archive coverage by document type and legislative term.',
                  'Absence from BetterSanFernando does not prove that a measure or resolution does not exist.',
                ],
                [
                  'City offices',
                  'The current published directory is a bounded coverage.',
                  'Not an exhaustive or legally definitive municipal organizational chart.',
                ],
                ...(fullDisclosureDomain
                  ? ([
                      [
                        'Full Disclosure',
                        'Official DILG full disclosure portal uploads.',
                        fullDisclosureDomain.coverageNote,
                      ],
                    ] as const)
                  : []),
                ...(financeDomain
                  ? ([
                      [
                        'City Finances',
                        'Certified financial statements and aggregate audit reports.',
                        financeDomain.coverageNote,
                      ],
                    ] as const)
                  : []),
              ].map(([domain, covers, doesNotClaim]) => (
                <dl
                  key={domain}
                  className="grid gap-2 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6"
                >
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Domain
                    </dt>
                    <dd className="mt-0.5 text-sm font-bold text-gray-950">
                      {domain}
                    </dd>
                  </div>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <p className="text-gray-900">
                      <strong className="text-gray-950">Covers:</strong>{' '}
                      {covers}
                    </p>
                    <p className="text-gray-600">
                      <strong className="text-gray-950">Does not claim:</strong>{' '}
                      {doesNotClaim}
                    </p>
                  </div>
                </dl>
              ))}
            </div>
          </MethodSection>

          {/* 9. REDESIGNED DATA LIMITATIONS (2 COLUMNS × 3 ROWS EDITORIAL GRID) */}
          <MethodSection
            id="limitations"
            eyebrow="GENERAL PRINCIPLES"
            title="Data Limitations"
          >
            <div>
              <h3 className="text-lg font-bold text-gray-950">
                What the Published Data Can — and Cannot — Establish
              </h3>
              <p className="mt-1 text-sm text-gray-600 max-w-[72ch]">
                BetterSanFernando publishes bounded, source-backed civic
                information. Coverage and source availability differ by dataset.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 border-y border-gray-200 py-6">
              {DATA_LIMITATIONS_GROUPS.map(item => (
                <div key={item.label} className="space-y-1">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#0066EB]">
                    {item.label}
                  </span>
                  <p className="text-xs sm:text-sm leading-relaxed text-gray-600">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs sm:text-sm text-gray-500 italic max-w-[72ch]">
              For consequential decisions, inspect the linked original source
              and current official guidance.
            </p>
          </MethodSection>
        </article>
      </div>

      {/* 5. KEEP EXPLORING (FULL-WIDTH WITH HEALTHY BOTTOM SPACING BEFORE GLOBAL CTA) */}
      <section
        className="border-t border-gray-200 bg-white pt-12 pb-16 sm:pb-20 lg:pb-24"
        aria-labelledby="explore-heading"
      >
        <div className="container mx-auto px-4">
          <p className="text-eyebrow text-[#0066EB]">RESOURCES & PROVENANCE</p>
          <h2
            id="explore-heading"
            className="text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
          >
            Keep Exploring
          </h2>

          <div className="mt-8 grid grid-cols-1 divide-y divide-gray-200 border-y border-gray-200 sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
            <Link
              href="/transparency/sources"
              className="group flex flex-col justify-between p-5 transition-colors hover:bg-[#F3F6FB]"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Sources
                </span>
                <h3 className="mt-1.5 text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                  Data Sources
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  See which datasets BetterSanFernando publishes and inspect
                  their public sources.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                Browse sources
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/projects/methodology"
              className="group flex flex-col justify-between p-5 transition-colors hover:bg-[#F3F6FB]"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Projects
                </span>
                <h3 className="mt-1.5 text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                  Project Data Guide
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  Detailed lifecycle, financial-field, and linkage rules for
                  project records.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                Read guide
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/projects/sources"
              className="group flex flex-col justify-between p-5 transition-colors hover:bg-[#F3F6FB]"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Evidence
                </span>
                <h3 className="mt-1.5 text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                  Project Sources
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  Inspect record-level project evidence, contracts, and original
                  attachments.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                Inspect evidence
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/statistics/public-records"
              className="group flex flex-col justify-between p-5 transition-colors hover:bg-[#F3F6FB]"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Coverage
                </span>
                <h3 className="mt-1.5 text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                  Public Records Statistics
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  Overview of published public record collections, years, and
                  preservation status.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                View statistics
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
