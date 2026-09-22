import Link from 'next/link';
import {
  ExternalLink,
  Gavel,
  HardHat,
  Info,
  Landmark,
  Link2,
  MapPin,
} from 'lucide-react';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import EvidenceSourceLinks from '../../../components/projects/EvidenceSourceLinks';
import type { Project, ProjectEvidence } from '../../../data/civic/projects';
import type { ProjectCostUtilizationObservation } from '../../../data/civic/projectCostUtilization';
import {
  getEvidenceSourceLabel,
  isPrimaryOfficialSource,
} from '../../../data/civic/sources';
import {
  formatPeso,
  formatIsoDate,
  titleCaseEnum,
  formatUnstatedAmount,
} from '../../../lib/utils';

const STATUS_STYLES: Record<string, string> = {
  PLANNED: 'bg-gray-100 text-gray-600',
  PROCUREMENT: 'bg-gray-200 text-gray-700',
  AWARDED: 'bg-primary-50 text-primary-600',
  CONTRACTED: 'bg-primary-100 text-primary-700',
  IMPLEMENTATION_REPORTED: 'bg-success-50 text-success-700',
};

const IDENTIFIER_LABELS: Record<string, string> = {
  bid_reference: 'Bid Reference',
  contract_number: 'Contract Number',
  philgeps_reference: 'PhilGEPS Reference',
  app_code: 'APP Code',
};

function costUtilizationSourceLink(
  observation: ProjectCostUtilizationObservation
): { url: string; kind: 'page' | 'attachment' } {
  return observation.official_page_url
    ? { url: observation.official_page_url, kind: 'page' }
    : { url: observation.official_attachment_url, kind: 'attachment' };
}

function FinancialMetric({
  label,
  amount,
  supporting,
}: {
  label: string;
  amount: number | null;
  supporting?: string | null;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-gray-900 md:text-2xl">
        {formatPeso(amount)}
      </p>
      {supporting && <p className="mt-1 text-xs text-gray-500">{supporting}</p>}
    </div>
  );
}

function FinancialOverview({ project }: { project: Project }) {
  const {
    estimated_budget,
    approved_budget_abc: abc,
    winning_bid_amount,
    contract_amount,
  } = project;
  const allUnavailable =
    estimated_budget === null &&
    abc === null &&
    winning_bid_amount === null &&
    contract_amount === null;

  const percentOfAbc = (value: number | null) =>
    abc !== null && abc > 0 && value !== null
      ? `${((value / abc) * 100).toFixed(2)}% of ABC`
      : null;

  const difference =
    abc !== null && contract_amount !== null ? abc - contract_amount : null;
  const differenceSupporting =
    abc !== null && contract_amount !== null && abc > 0
      ? `${(((abc - contract_amount) / abc) * 100).toFixed(2)}% difference`
      : null;

  return (
    <div className="min-w-0">
      <p className="text-eyebrow text-[#0066EB]">Financial Overview</p>
      <h2 className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl">
        Budget and contract amounts
      </h2>

      {allUnavailable ? (
        <div className="mt-6 flex items-start gap-2 rounded-sm border border-gray-200 bg-[#F3F6FB] px-4 py-3 text-sm text-gray-700">
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-gray-500"
            aria-hidden="true"
          />
          <p>
            Financial amounts are not yet established in the published project
            record.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <FinancialMetric
            label="APP Estimated Budget"
            amount={estimated_budget}
          />
          <FinancialMetric
            label="Approved Budget for Contract (ABC)"
            amount={abc}
          />
          <FinancialMetric
            label="Winning Bid Amount"
            amount={winning_bid_amount}
            supporting={percentOfAbc(winning_bid_amount)}
          />
          <FinancialMetric
            label="Contract Amount"
            amount={contract_amount}
            supporting={percentOfAbc(contract_amount)}
          />
          {difference !== null && (
            <FinancialMetric
              label="Difference from ABC"
              amount={difference}
              supporting={differenceSupporting}
            />
          )}
        </div>
      )}
    </div>
  );
}

function ProjectTimeline({ project }: { project: Project }) {
  const milestones = [
    { label: 'Award date', date: project.award_date },
    {
      label: 'Contract effectivity',
      date: project.contract_effectivity_date,
    },
    { label: 'Contract end', date: project.contract_end_date },
  ].filter(
    (milestone): milestone is { label: string; date: string } =>
      milestone.date !== null
  );

  return (
    <div className="min-w-0">
      <p className="text-eyebrow text-[#0066EB]">Timeline</p>
      <h2 className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl">
        Project timeline
      </h2>

      {milestones.length === 0 ? (
        <div className="mt-6 flex items-start gap-2 rounded-sm border border-gray-200 bg-[#F3F6FB] px-4 py-3 text-sm text-gray-700">
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-gray-500"
            aria-hidden="true"
          />
          <p>
            Award and contract milestone dates are not yet established in the
            published project record.
          </p>
        </div>
      ) : (
        <ol className="mt-6">
          {milestones.map((milestone, index) => {
            const isLast = index === milestones.length - 1;
            return (
              <li key={milestone.label} className="flex gap-4">
                {/* self-stretch makes this column match the content
                    column's full height (including its own pb-8), so the
                    connector reaches all the way to the next dot instead of
                    stopping at the text's height. */}
                <div className="flex flex-col items-center self-stretch">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full bg-[#0066EB]"
                    aria-hidden="true"
                  />
                  {!isLast && (
                    <span
                      className="mt-1 w-px flex-1 bg-[#0066EB]/25"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className={`-mt-1 ${isLast ? '' : 'pb-8'}`}>
                  <p className="text-base font-bold text-gray-900">
                    {formatIsoDate(milestone.date)}
                  </p>
                  <p className="text-xs text-gray-500">{milestone.label}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function UtilizationProgress({
  label,
  percent,
  colorClass,
  subtext,
  footnote,
}: {
  label: string;
  percent: number | null;
  colorClass: string;
  subtext?: string;
  footnote?: string;
}) {
  if (percent === null) {
    return (
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="mt-1 text-sm text-gray-500">Not available</p>
      </div>
    );
  }

  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tabular-nums text-gray-950">
        {percent}%
      </p>
      <div
        className="relative mt-2 h-2.5 w-full overflow-hidden rounded-sm bg-gray-100"
        aria-hidden="true"
      >
        <div
          className={`h-full rounded-sm ${colorClass}`}
          style={{ width: `${clamped}%` }}
        />
        {/* Quiet reference mark for the 100% ceiling — not a threshold
            judgment, just where "complete" sits on the track. */}
        <span className="absolute right-0 top-0 h-full w-px bg-gray-300" />
      </div>
      {subtext && <p className="mt-1.5 text-xs text-gray-500">{subtext}</p>}
      {footnote && <p className="mt-1 text-xs text-gray-400">{footnote}</p>}
    </div>
  );
}

function ObservationSourceLink({
  observation,
}: {
  observation: ProjectCostUtilizationObservation;
}) {
  const { url, kind } = costUtilizationSourceLink(observation);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open the official ${kind === 'page' ? 'source page' : 'source attachment'} for this observation (opens in a new tab)`}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 underline decoration-primary-200 underline-offset-4 hover:text-primary-800"
    >
      <Link2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      Official source
      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    </a>
  );
}

function costIncurredSupporting(
  observation: ProjectCostUtilizationObservation
): string | undefined {
  const { total_cost_incurred_to_date: incurred, total_cost: total } =
    observation;
  if (incurred !== null && total !== null) {
    return `${formatUnstatedAmount(incurred)} of ${formatUnstatedAmount(total)} total cost`;
  }
  if (incurred !== null) {
    return `${formatUnstatedAmount(incurred)} incurred to date`;
  }
  return undefined;
}

function CostUtilizationSection({
  observations,
}: {
  observations: readonly ProjectCostUtilizationObservation[];
}) {
  if (observations.length === 0) return null;

  const latest = observations.at(-1)!;
  const observationsByYear = observations.reduce<
    Map<number, ProjectCostUtilizationObservation[]>
  >((byYear, observation) => {
    const yearObservations = byYear.get(observation.reporting_year) ?? [];
    yearObservations.push(observation);
    byYear.set(observation.reporting_year, yearObservations);
    return byYear;
  }, new Map());
  const observationYears = [...observationsByYear.entries()];

  return (
    <section
      id="cost-utilization"
      aria-labelledby="cost-utilization-heading"
      className="mt-12 border-t border-gray-200 pt-10"
    >
      <p className="text-eyebrow text-[#0066EB]">Utilization</p>
      <h2
        id="cost-utilization-heading"
        className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
      >
        Project Cost &amp; Utilization
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
        Source-reported, year-to-date figures for a bounded subset of published
        projects — not proof of cash payment, disbursement, or completion.{' '}
        <Link
          href="/statistics/project-spending"
          className="font-semibold text-[#0066EB] hover:text-[#0052BC]"
        >
          View the full Project Cost &amp; Utilization statistics
        </Link>
        .
      </p>

      <div className="mt-6 rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6">
        <p className="text-sm font-semibold text-gray-900">
          Latest observation — {latest.reporting_year} Q
          {latest.reporting_quarter}
        </p>
        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <UtilizationProgress
            label="Cost incurred to date"
            percent={latest.cost_incurred_to_date_percent_derived}
            colorClass="bg-[#0066EB]"
            subtext={costIncurredSupporting(latest)}
            footnote={
              latest.cost_incurred_to_date_percent_derived !== null
                ? 'Derived from the source-reported cost figures.'
                : undefined
            }
          />
          <UtilizationProgress
            label="Physical completion"
            percent={latest.physical_completion_percent}
            colorClass="bg-success-500"
            subtext="Source-reported physical completion"
          />
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t border-gray-200 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-700">
              Source-reported status
            </p>
            <p className="mt-1 text-sm leading-6 text-gray-800">
              {latest.status_remarks}
            </p>
          </div>
          <div className="shrink-0">
            <ObservationSourceLink observation={latest} />
          </div>
        </div>
      </div>
      <section
        aria-labelledby="utilization-history-heading"
        className="mt-8 border-t border-gray-200 pt-8"
      >
        <p className="text-eyebrow text-[#0066EB]">Observation history</p>
        <h3
          id="utilization-history-heading"
          className="mt-2 text-xl font-bold text-gray-950"
        >
          Project utilization history
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          Compare the verified year-to-date figures published for this project
          across reporting periods.
        </p>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
          Each observation is year-to-date, so the figures should be compared
          across periods rather than added together.
        </p>
        {observations.length === 1 ? (
          <p className="mt-4 text-sm text-gray-600">
            Only one verified utilization observation is currently available for
            this project.
          </p>
        ) : (
          <div className="mt-5">
            <div className="hidden grid-cols-[5rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.25fr)_auto] gap-3 border-y border-gray-200 py-2 text-xs font-semibold text-gray-600 sm:grid">
              <span>Period</span>
              <span>Cost incurred</span>
              <span>Physical completion</span>
              <span>Source-reported status</span>
              <span>Source</span>
            </div>
            {observationYears.map(([year, yearObservations]) => (
              <div key={year} className="mt-5 first:mt-0">
                {observationYears.length > 1 && (
                  <p className="mb-2 text-sm font-bold text-gray-900">{year}</p>
                )}
                <ol className="divide-y divide-gray-200 border-y border-gray-200">
                  {yearObservations.map(observation => (
                    <li
                      key={observation.id}
                      className="grid gap-3 py-4 text-sm sm:grid-cols-[5rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.25fr)_auto] sm:items-center"
                    >
                      <p className="font-semibold text-gray-900">
                        {observationYears.length > 1
                          ? `Q${observation.reporting_quarter}`
                          : `${observation.reporting_year} Q${observation.reporting_quarter}`}
                        {observation.id === latest.id && (
                          <span className="ml-2 text-xs font-medium text-gray-500">
                            Latest
                          </span>
                        )}
                      </p>
                      <p>
                        <span className="block text-xs text-gray-500 sm:hidden">
                          Cost incurred
                        </span>
                        <span className="font-medium tabular-nums text-gray-900">
                          {observation.cost_incurred_to_date_percent_derived ===
                          null
                            ? 'Not available'
                            : `${observation.cost_incurred_to_date_percent_derived}%`}
                        </span>
                      </p>
                      <p>
                        <span className="block text-xs text-gray-500 sm:hidden">
                          Physical completion
                        </span>
                        <span className="font-medium tabular-nums text-gray-900">
                          {observation.physical_completion_percent}%
                        </span>
                      </p>
                      <p>
                        <span className="block text-xs text-gray-500 sm:hidden">
                          Source-reported status
                        </span>
                        <span className="text-gray-700">
                          {observation.status_remarks}
                        </span>
                      </p>
                      <ObservationSourceLink observation={observation} />
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="mt-5 text-xs leading-5 text-gray-500">
        These are year-to-date figures from the official source, not proof of
        cash payment or disbursement. Currency is not stated in the source;
        amounts are shown as plain numbers. Coverage is limited to a bounded
        subset of published projects.
      </p>
    </section>
  );
}

function EvidenceRow({ evidence }: { evidence: ProjectEvidence }) {
  const officialLabel = isPrimaryOfficialSource(evidence)
    ? 'Official source'
    : evidence.source_authority;

  return (
    <li className="grid gap-4 py-6 lg:grid-cols-[minmax(0,1fr)_14rem_14rem] lg:items-start lg:gap-6">
      <div className="min-w-0">
        <p className="text-base font-bold text-gray-900">
          {titleCaseEnum(evidence.stage)}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {officialLabel} · {getEvidenceSourceLabel(evidence)}
        </p>
        {evidence.fields_established.length > 0 && (
          <p className="mt-2 text-xs leading-5 text-gray-600">
            Establishes:{' '}
            {evidence.fields_established.map(titleCaseEnum).join(', ')}
          </p>
        )}
      </div>

      <div className="min-w-0 text-sm">
        <p className="text-xs text-gray-500">Source identifier</p>
        <p className="mt-0.5 break-words font-mono text-xs text-gray-900">
          {evidence.source_identifier}
        </p>
        <p className="mt-2 text-xs text-gray-500">Document date</p>
        <p className="mt-0.5 text-gray-900">
          {formatIsoDate(evidence.document_date)}
        </p>
      </div>

      <div>
        <EvidenceSourceLinks evidence={evidence} />
      </div>
    </li>
  );
}

export default function ProjectDetailView({
  project,
  evidence,
  costUtilizationObservations,
}: {
  project: Project;
  evidence: readonly ProjectEvidence[];
  costUtilizationObservations: readonly ProjectCostUtilizationObservation[];
}) {
  const identifiers = Object.entries(project.identifiers).filter(
    ([, value]) => value !== null
  ) as [keyof typeof IDENTIFIER_LABELS, string][];
  const identifierColsClass =
    identifiers.length === 1
      ? 'grid-cols-1'
      : identifiers.length === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : identifiers.length === 3
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <main className="flex-grow bg-white pb-16 md:pb-24">
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <div className="overflow-hidden">
            <Breadcrumbs
              className="text-xs text-gray-500"
              items={[
                { label: 'Home', href: '/' },
                { label: 'Projects', href: '/projects' },
                { label: 'City Projects', href: '/projects/city-projects' },
                { label: project.project_name },
              ]}
            />
          </div>

          <div className="mt-6 max-w-4xl min-w-0">
            <span
              className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[project.lifecycle_status] ?? 'bg-gray-100 text-gray-600'}`}
            >
              {titleCaseEnum(project.lifecycle_status)}
            </span>
            <h1 className="mt-3 max-w-full break-words text-3xl font-extrabold leading-[1.08] tracking-[-0.02em] text-gray-950 sm:text-4xl lg:text-5xl">
              {project.project_name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-gray-600">
              <span>{project.barangay ?? 'Barangay not attributed'}</span>
              <span aria-hidden="true">·</span>
              <span>{project.year}</span>
              <span aria-hidden="true">·</span>
              <span>{titleCaseEnum(project.project_type)}</span>
              <span aria-hidden="true">·</span>
              <span>{titleCaseEnum(project.project_category)}</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Status as of {formatIsoDate(project.status_as_of)}
            </p>
          </div>

          {project.lifecycle_status === 'IMPLEMENTATION_REPORTED' && (
            <div className="mt-6 flex items-start gap-2 rounded-sm border border-primary-200 bg-[#F3F6FB] px-4 py-3 text-sm text-gray-800">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-[#0066EB]"
                aria-hidden="true"
              />
              <p>
                <strong>Implementation reported.</strong> An official
                implementation or utilization report describes project activity.
                This does not independently establish procurement award, signed
                contract, payment, disbursement, or physical verification.
              </p>
            </div>
          )}

          <div className="mt-8 rounded-sm border border-gray-200 bg-[#F3F6FB] px-5 py-5 sm:px-6">
            <p className="text-eyebrow text-[#0066EB]">Project at a Glance</p>
            <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="flex items-center gap-1.5 text-eyebrow text-gray-500">
                  <MapPin
                    className="h-3.5 w-3.5 text-[#0066EB]"
                    aria-hidden="true"
                  />
                  Barangay
                </dt>
                <dd className="mt-1.5 text-sm leading-6 text-gray-900">
                  {project.barangay ?? 'Not available'}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-eyebrow text-gray-500">
                  <HardHat
                    className="h-3.5 w-3.5 text-[#0066EB]"
                    aria-hidden="true"
                  />
                  Contractor
                </dt>
                <dd className="mt-1.5 text-sm leading-6 text-gray-900">
                  {project.contractor ?? 'Not available'}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-eyebrow text-gray-500">
                  <Landmark
                    className="h-3.5 w-3.5 text-[#0066EB]"
                    aria-hidden="true"
                  />
                  Funding source
                </dt>
                <dd className="mt-1.5 text-sm leading-6 text-gray-900">
                  {project.funding_source ?? 'Not available'}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-eyebrow text-gray-500">
                  <Gavel
                    className="h-3.5 w-3.5 text-[#0066EB]"
                    aria-hidden="true"
                  />
                  Procurement mode
                </dt>
                <dd className="mt-1.5 text-sm leading-6 text-gray-900">
                  {project.procurement_mode ?? 'Not available'}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.75fr)] lg:items-start lg:gap-14">
          <FinancialOverview project={project} />
          <div className="lg:border-l lg:border-gray-200 lg:pl-10">
            <ProjectTimeline project={project} />
          </div>
        </div>

        <CostUtilizationSection observations={costUtilizationObservations} />

        {identifiers.length > 0 && (
          <section
            id="identifiers"
            aria-labelledby="identifiers-heading"
            className="mt-12 border-t border-gray-200 pt-10"
          >
            <p className="text-eyebrow text-[#0066EB]">Reference</p>
            <h2
              id="identifiers-heading"
              className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
            >
              Project Identifiers
            </h2>
            <div
              className={`mt-6 grid gap-x-8 gap-y-5 rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 ${identifierColsClass}`}
            >
              {identifiers.map(([key, value]) => (
                <div key={key} className="min-w-0">
                  <dt className="text-eyebrow text-gray-500">
                    {IDENTIFIER_LABELS[key] ?? key}
                  </dt>
                  <dd className="mt-1.5 break-words text-sm font-medium text-gray-900">
                    {value}
                  </dd>
                </div>
              ))}
            </div>
          </section>
        )}

        <section
          id="evidence"
          aria-labelledby="evidence-heading"
          className="mt-12 border-t border-gray-200 pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]">Provenance</p>
          <h2
            id="evidence-heading"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
          >
            Evidence &amp; official sources
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Official documents used to establish project facts.
          </p>

          {evidence.length === 0 ? (
            <p className="mt-6 text-sm text-gray-500">
              No evidence records are available for this project yet.
            </p>
          ) : (
            <ol className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
              {evidence.map(e => (
                <EvidenceRow key={e.id} evidence={e} />
              ))}
            </ol>
          )}
        </section>

        <Link
          href="/projects/city-projects"
          className="mt-12 inline-flex text-sm font-semibold text-gray-600 hover:text-[#0066EB]"
        >
          ← Back to City Projects
        </Link>
      </div>
    </main>
  );
}
