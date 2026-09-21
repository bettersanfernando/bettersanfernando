import {
  ArrowDown,
  ArrowRight,
  Building2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getGovernmentEntities,
  getGovernmentStructureMetadata,
  getVerifiedRelationships,
  type GovernmentEntity,
} from '../../../data/civic/governmentStructureSummary';
import { buildPageMetadata } from '../../../lib/metadata';
import { formatIsoDate, titleCaseEnum } from '../../../lib/utils';

export function generateMetadata() {
  return buildPageMetadata({
    title: 'Government Statistics',
    description:
      'A verified, partial summary of City Government of San Fernando organizational entities, official directory matches, and explicitly verified relationships — not a complete organizational chart.',
    path: '/statistics/government',
  });
}

const numberFormatter = new Intl.NumberFormat('en-PH');

const metadata = getGovernmentStructureMetadata();
const entities = getGovernmentEntities();
const relationships = getVerifiedRelationships();

const facilitiesAndServiceUnits = entities.filter(
  entity =>
    entity.entity_type === 'facility' || entity.entity_type === 'service_unit'
);

const entitiesById = new Map(entities.map(e => [e.id, e]));

// Group relationships by parent entity dynamically
const groupedRelationships = relationships.reduce<
  Record<
    string,
    {
      parent: GovernmentEntity;
      children: Array<{
        child: GovernmentEntity;
        relationshipType: string;
      }>;
    }
  >
>((acc, rel) => {
  const parent = entitiesById.get(rel.parent_id);
  const child = entitiesById.get(rel.child_id);
  if (!parent || !child) return acc;

  if (!acc[parent.id]) {
    acc[parent.id] = {
      parent,
      children: [],
    };
  }
  acc[parent.id].children.push({
    child,
    relationshipType: rel.relationship_type,
  });
  return acc;
}, {});

const parentGroups = Object.values(groupedRelationships);

// Display label mappings
const ENTITY_TYPE_LABELS: Record<string, string> = {
  office: 'Office',
  institution: 'Institution',
  division: 'Division',
  board: 'Board',
  facility: 'Facility',
  service_unit: 'Service Unit',
};

function formatEntityType(type: string): string {
  return ENTITY_TYPE_LABELS[type] ?? titleCaseEnum(type);
}

function formatRelationshipType(type: string): string {
  switch (type) {
    case 'division_of':
      return 'Division of';
    case 'facility_of':
      return 'Facility of';
    case 'unit_of':
      return 'Unit of';
    default:
      return titleCaseEnum(type);
  }
}

// Entity Type breakdown sorted descending by count
const entityTypeBreakdownSorted = Object.entries(metadata.entityTypeBreakdown)
  .map(([type, count]) => ({
    type,
    label: formatEntityType(type),
    count,
  }))
  .sort((a, b) => b.count - a.count);

const maxEntityCount = entityTypeBreakdownSorted[0]?.count ?? 30;
const entityScaleMax = Math.ceil(maxEntityCount / 5) * 5; // 30
const entityTicks = [0, 5, 10, 15, 20, 25, 30];

// Check unrepresented facilities or service units
const relChildIds = new Set(relationships.map(r => r.child_id));
const unrepresentedFacilities = facilitiesAndServiceUnits.filter(
  f => !relChildIds.has(f.id)
);

const readingGuidePrinciples = [
  {
    title: 'COVERAGE IS BOUNDED',
    description:
      'Published records describe BetterSanFernando’s current directory coverage and do not represent a complete legal organizational chart.',
  },
  {
    title: 'RELATIONSHIPS ARE EVIDENCE-BASED',
    description:
      'A parent-child relationship is shown only when supported by the current verified source data.',
  },
  {
    title: 'COUNTS ARE NOT STAFFING MEASURES',
    description:
      'Record counts do not describe employees, vacancies, office size, budget, workload, or departmental importance.',
  },
  {
    title: 'UNRESOLVED STRUCTURE STAYS UNRESOLVED',
    description:
      'BetterSanFernando does not infer missing hierarchy from office names or assumptions.',
  },
] as const;

export default function GovernmentStatistics() {
  return (
    <main className="flex-grow bg-white">
      {/* 1. EDITORIAL HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Statistics', href: '/statistics' },
              { label: 'Government Statistics' },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <div className="max-w-3xl">
              <p className="text-eyebrow text-[#0066EB]">
                STATISTICS · GOVERNMENT
              </p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.02em] text-gray-950 sm:text-4xl md:text-5xl">
                Government Statistics
              </h1>
              <p className="mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">
                Explore BetterSanFernando’s verified government-directory
                coverage, including published entities, entity types,
                source-supported relationships, and public service units. This
                is a verified, partial directory summary rather than a full
                organizational roster.
              </p>

              {/* CTA row */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href="#at-a-glance"
                  className="inline-flex h-11 items-center gap-2 rounded-sm bg-[#0066EB] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                >
                  <span>Explore Published Coverage</span>
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>

                <Link
                  href="/government/offices"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
                >
                  <span>Browse City Offices</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Right-Side Scope Module */}
            <aside
              aria-label="Government directory scope"
              className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Scope of This Page
              </p>
              <h2 className="mt-1 text-base font-bold text-gray-950">
                Published Directory Coverage
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                These figures describe BetterSanFernando’s currently verified
                government records. They are not a complete legal organizational
                chart, staffing roster, or measure of office importance.
              </p>

              <div className="mt-4 border-t border-gray-200/80 pt-3">
                <p className="text-xs leading-relaxed text-gray-600">
                  {metadata.permanentLimitation}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 2. AT A GLANCE */}
      <section
        id="at-a-glance"
        className="border-b border-gray-200 bg-white py-10 sm:py-12"
        aria-labelledby="at-a-glance-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">SUMMARY</p>
            <h2
              id="at-a-glance-heading"
              className="mt-1 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
            >
              At a Glance
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Verified summary of BetterSanFernando’s current published
              government-directory records.
            </p>
          </div>

          {/* 4-column metric strip with thin internal dividers */}
          <dl className="mt-8 grid grid-cols-1 gap-6 divide-y divide-gray-200 border-b border-gray-200 pb-8 sm:grid-cols-2 sm:divide-y-0 sm:gap-8 lg:grid-cols-4 lg:divide-x lg:divide-gray-200">
            {/* Metric 1 */}
            <div className="space-y-1 lg:pr-6">
              <div className="h-0.5 w-7 bg-[#0066EB]" aria-hidden="true" />
              <dt className="pt-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Published Government Records
              </dt>
              <dd className="text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                {numberFormatter.format(
                  metadata.betterSanFernandoDirectoryRecordCount
                )}
              </dd>
              <p className="text-xs text-gray-600">
                Reconciled entities in directory
              </p>
            </div>

            {/* Metric 2 */}
            <div className="space-y-1 pt-6 sm:pt-0 lg:px-6">
              <div className="h-0.5 w-7 bg-[#0066EB]" aria-hidden="true" />
              <dt className="pt-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Official Directory Matches
              </dt>
              <dd className="text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                {numberFormatter.format(
                  metadata.officialDepartmentDirectoryCount
                )}
              </dd>
              <p className="text-xs text-gray-600">
                Matched with official portal
              </p>
            </div>

            {/* Metric 3 */}
            <div className="space-y-1 pt-6 sm:pt-0 lg:px-6">
              <div className="h-0.5 w-7 bg-[#0066EB]" aria-hidden="true" />
              <dt className="pt-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Published Facilities &amp; Service Units
              </dt>
              <dd className="text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                {facilitiesAndServiceUnits.length}
              </dd>
              <p className="text-xs text-gray-600">
                Verified public service locations
              </p>
            </div>

            {/* Metric 4 */}
            <div className="space-y-1 pt-6 sm:pt-0 lg:pl-6">
              <div className="h-0.5 w-7 bg-[#0066EB]" aria-hidden="true" />
              <dt className="pt-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Verified Relationships
              </dt>
              <dd className="text-3xl font-extrabold tabular-nums text-gray-950 sm:text-4xl">
                {relationships.length}
              </dd>
              <p className="text-xs text-gray-600">
                Source-supported parent-child links
              </p>
            </div>
          </dl>

          {/* Explanatory sentence */}
          <p className="mt-4 text-xs leading-relaxed text-gray-600 sm:text-sm">
            Of the {metadata.officialDepartmentDirectoryCount} official
            directory matches, {metadata.officialDepartmentTopLevelCount} are
            top-level entries and {metadata.officialDepartmentNestedCount} are
            explicitly nested under a top-level entry, per the{' '}
            <a
              href={metadata.officialDepartmentDirectoryUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#0066EB] underline underline-offset-4 hover:text-[#0052BC]"
            >
              current official Departments directory
            </a>
            .
          </p>
        </div>
      </section>

      {/* 3. ENTITY TYPE BREAKDOWN (HORIZONTAL BAR CHART) */}
      <section
        id="entity-types"
        className="border-b border-gray-200 bg-white py-10 sm:py-12 lg:py-14"
        aria-labelledby="entity-types-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">DIRECTORY COMPOSITION</p>
            <h2
              id="entity-types-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              Entity Type Breakdown
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Published government records grouped by their current entity type.
            </p>
          </div>

          {/* Full-width Chart Card */}
          <div className="mt-8 overflow-hidden rounded-sm border border-gray-200 bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white px-4 py-3.5 sm:px-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-950">
                    Entity Counts by Classification
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Standardized public-facing classifications
                  </p>
                </div>
                <div className="text-xs text-gray-500 sm:text-right">
                  <p className="font-semibold text-gray-950">
                    {metadata.betterSanFernandoDirectoryRecordCount} Total
                    Entities
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    Count scale · 0 to {entityScaleMax}
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Column Header */}
            <div className="hidden border-b border-gray-200 bg-gray-50/70 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:grid sm:grid-cols-[9.5rem_minmax(0,1fr)_4rem] sm:items-center sm:gap-4 sm:px-5">
              <span>Entity Type</span>
              <span>Count Scale</span>
              <span className="text-right">Count</span>
            </div>

            {/* Rows */}
            <ol className="divide-y divide-gray-100">
              {entityTypeBreakdownSorted.map(item => {
                const barWidthPercent = (item.count / entityScaleMax) * 100;
                const accessibleLabel = `${item.label}: ${item.count} published records.`;

                return (
                  <li key={item.type} className="px-4 py-3 sm:px-5">
                    {/* Desktop layout */}
                    <div className="hidden sm:grid sm:grid-cols-[9.5rem_minmax(0,1fr)_4rem] sm:items-center sm:gap-4">
                      <span className="truncate text-sm font-semibold text-gray-950">
                        {item.label}
                      </span>

                      {/* Horizontal Bar on neutral track */}
                      <div
                        className="h-4 w-full bg-gray-100"
                        role="img"
                        aria-label={accessibleLabel}
                      >
                        <div
                          className="h-full bg-[#0066EB]"
                          style={{ width: `${barWidthPercent}%` }}
                        />
                      </div>

                      <span className="text-right text-sm font-semibold tabular-nums text-gray-950">
                        {item.count}
                      </span>
                    </div>

                    {/* Mobile layout */}
                    <div className="space-y-1.5 sm:hidden">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-950">
                          {item.label}
                        </span>
                        <span className="text-sm font-semibold tabular-nums text-gray-950">
                          {item.count}
                        </span>
                      </div>

                      <div
                        className="h-3 w-full bg-gray-100"
                        role="img"
                        aria-label={accessibleLabel}
                      >
                        <div
                          className="h-full bg-[#0066EB]"
                          style={{ width: `${barWidthPercent}%` }}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Desktop Axis beneath bars */}
            <div className="hidden border-t border-gray-100 bg-gray-50/30 px-4 py-1.5 sm:grid sm:grid-cols-[9.5rem_minmax(0,1fr)_4rem] sm:items-center sm:gap-4 sm:px-5">
              <span />
              <div>
                <div className="flex justify-between px-0.5">
                  {entityTicks.map(tick => (
                    <span
                      key={tick}
                      className="h-1 w-px bg-gray-300"
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <div className="mt-0.5 flex justify-between text-[11px] tabular-nums text-gray-400">
                  {entityTicks.map((tick, index) => (
                    <span
                      key={tick}
                      className={
                        index === 0
                          ? 'text-left'
                          : index === entityTicks.length - 1
                            ? 'text-right'
                            : 'text-center'
                      }
                    >
                      {tick}
                    </span>
                  ))}
                </div>
              </div>
              <span />
            </div>
          </div>

          {/* Interpretation row below full-width chart */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  What You’re Seeing
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-700 sm:text-sm">
                  Published BetterSanFernando government records grouped by
                  entity type.
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  How to Read It
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-700 sm:text-sm">
                  These counts describe directory coverage, not staffing,
                  budget, office importance, or legal hierarchy.
                </p>
              </div>
            </div>

            {/* Action link below interpretation */}
            <div className="mt-6">
              <Link
                href="/government/offices"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC]"
              >
                <span>Explore all {entities.length} office records</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. VERIFIED RELATIONSHIPS (CONTINUOUS GROUPED EDITORIAL DIRECTORY) */}
      <section
        id="relationships"
        className="border-b border-gray-200 bg-white py-10 sm:py-12 lg:py-14"
        aria-labelledby="relationships-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">
              ORGANIZATIONAL STRUCTURE
            </p>
            <h2
              id="relationships-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              Verified Relationships
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Only source-supported relationships are shown. Unresolved or
              unsupported hierarchy remains unassigned.
            </p>
          </div>

          {/* Continuous Grouped Editorial Relationship Directory */}
          <div className="mt-8 border-b border-gray-200">
            {/* Shared Column Header (Desktop & Tablet) */}
            <div className="hidden border-b border-gray-200 pb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 md:grid md:grid-cols-[3fr_7fr] md:gap-8 lg:gap-12">
              <span>Parent Entity</span>
              <span>Verified Child Relationships</span>
            </div>

            {/* Natural-height rows per parent group */}
            <div className="divide-y divide-gray-200">
              {parentGroups.map((group, index) => (
                <div
                  key={group.parent.id}
                  className={`py-6 md:grid md:grid-cols-[3fr_7fr] md:gap-8 lg:gap-12 ${
                    index === 0 ? 'border-t border-gray-200 md:border-t-0' : ''
                  }`}
                >
                  {/* Left Column: Parent Entity */}
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-base font-bold text-gray-950">
                      {group.parent.name}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-gray-500">
                      {group.children.length}{' '}
                      {group.children.length === 1
                        ? 'Verified Relationship'
                        : 'Verified Relationships'}
                    </p>
                  </div>

                  {/* Right Column: Verified Child Relationships */}
                  <div>
                    <ul className="space-y-3.5">
                      {group.children.map(({ child, relationshipType }) => (
                        <li key={child.id}>
                          <p className="text-sm font-semibold text-gray-900">
                            {child.name}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {formatRelationshipType(relationshipType)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section Footnote */}
          <p className="mt-6 text-xs leading-relaxed text-gray-500">
            These {relationships.length} parent-child links are shown only
            because the export explicitly verifies them. Entities with an
            unresolved or held classification are excluded here and are not
            shown as part of any hierarchy.
          </p>
        </div>
      </section>

      {/* 6. PUBLIC FACILITIES & SERVICE UNITS (COMPACT SUMMARY) */}
      <section
        id="facilities-summary"
        className="border-b border-gray-200 bg-white py-8 sm:py-10"
        aria-labelledby="facilities-summary-heading"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col justify-between gap-4 rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="flex items-start gap-3">
              <Building2
                className="mt-0.5 h-5 w-5 shrink-0 text-[#0066EB]"
                aria-hidden="true"
              />
              <div>
                <h3
                  id="facilities-summary-heading"
                  className="text-base font-bold text-gray-950"
                >
                  Public Facilities &amp; Service Units
                </h3>
                <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                  <span className="font-semibold text-gray-900">
                    {facilitiesAndServiceUnits.length} Published Records.
                  </span>{' '}
                  Verified facility and service-unit records are represented in
                  the relationship view above.
                </p>
              </div>
            </div>

            <Link
              href="/government/offices"
              className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
            >
              <span>Browse City Offices</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {/* Conditional fallback for unmatched facilities if data ever contains them */}
          {unrepresentedFacilities.length > 0 && (
            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Other Published Facilities &amp; Service Units
              </h4>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {unrepresentedFacilities.map(entity => (
                  <li
                    key={entity.id}
                    className="rounded-sm border border-gray-200 px-4 py-2 text-xs font-medium text-gray-800"
                  >
                    {entity.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* 7. HOW TO READ THESE NUMBERS (REPLACES DARK NAVY CONTAINER) */}
      <section
        className="border-b border-gray-200 bg-white py-10 sm:py-12 lg:py-14"
        aria-labelledby="reading-guide-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">READING GUIDE</p>
            <h2
              id="reading-guide-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              How to Read These Numbers
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Guidance on understanding the strict boundaries of this directory
              coverage report.
            </p>
          </div>

          {/* 2 x 2 Desktop Grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {readingGuidePrinciples.map(item => (
              <div
                key={item.title}
                className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6"
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-700 sm:text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Acknowledged limitations callout */}
          <div className="mt-8 rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck
                className="h-4 w-4 text-[#0066EB]"
                aria-hidden="true"
              />
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                Acknowledged Scope Limitations
              </h4>
            </div>
            <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-gray-600">
              {metadata.prohibitedClaimsAcknowledged.map(claim => (
                <li key={claim} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#0066EB]"
                    aria-hidden="true"
                  />
                  <span>{claim}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 8. SOURCES & COVERAGE (PROVENANCE) */}
      <section
        className="border-b border-gray-200 bg-white py-10 sm:py-12 lg:py-14"
        aria-labelledby="provenance-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">PROVENANCE</p>
            <h2
              id="provenance-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              Sources &amp; Coverage
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Official reference links and verification methodology supporting
              these records.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {/* Official Departments Directory */}
            <div className="flex flex-col justify-between gap-4 rounded-sm border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                  Official Departments Directory
                </p>
                <h3 className="mt-1 text-base font-bold text-gray-950">
                  City Government of San Fernando Official Portal
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  {metadata.officialDepartmentDirectoryCount} matched records (
                  {metadata.officialDepartmentTopLevelCount} top-level,{' '}
                  {metadata.officialDepartmentNestedCount} nested) · Verified{' '}
                  {formatIsoDate(
                    metadata.officialDepartmentDirectoryVerifiedAt
                  )}
                </p>
              </div>
              <a
                href={metadata.officialDepartmentDirectoryUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
              >
                <span>View Official Departments Directory</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>

            {/* Record-Specific Official Sources */}
            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                Record-Specific Official Sources
              </p>
              <h3 className="mt-1 text-base font-bold text-gray-950">
                Departmental and Unit Pages
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">
                Individual office identities, contact information, and supported
                relationships may rely on the specific official source attached
                to each record in the directory.
              </p>
            </div>

            {/* BetterSanFernando Directory Dataset */}
            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                BetterSanFernando Directory
              </p>
              <h3 className="mt-1 text-base font-bold text-gray-950">
                Verified Civic Directory Dataset
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">
                The {metadata.betterSanFernandoDirectoryRecordCount} published
                records describe the current verified directory dataset and are
                not a claim about the City’s complete legal organization. Last
                verified {formatIsoDate(metadata.lastVerified)}.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. KEEP EXPLORING */}
      <section
        className="bg-white py-10 pb-16 sm:py-12 sm:pb-24 lg:py-14 lg:pb-28"
        aria-labelledby="keep-exploring-heading"
      >
        <div className="container mx-auto px-4">
          <p className="text-eyebrow text-[#0066EB]">RELATED RESOURCES</p>
          <h2
            id="keep-exploring-heading"
            className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
          >
            Keep Exploring
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* ROW 1: Government Overview | City Offices */}
            <Link
              href="/government"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 transition-colors hover:border-[#0066EB] hover:bg-[#F3F6FB] sm:p-5"
            >
              <div>
                <h3 className="text-base font-bold text-gray-950 transition-colors group-hover:text-[#0066EB]">
                  Government Overview
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  Comprehensive portal to city leadership, branches, and civic
                  structures.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                <span>View government overview</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/government/offices"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 transition-colors hover:border-[#0066EB] hover:bg-[#F3F6FB] sm:p-5"
            >
              <div>
                <h3 className="text-base font-bold text-gray-950 transition-colors group-hover:text-[#0066EB]">
                  City Offices
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  Detailed directory of city departments, divisions, and public
                  facilities.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                <span>Browse city offices</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            {/* ROW 2: Hotlines & Contacts | Barangay Contacts */}
            <Link
              href="/government/hotlines"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 transition-colors hover:border-[#0066EB] hover:bg-[#F3F6FB] sm:p-5"
            >
              <div>
                <h3 className="text-base font-bold text-gray-950 transition-colors group-hover:text-[#0066EB]">
                  Hotlines &amp; Contacts
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  Emergency numbers, direct department phone lines, and official
                  emails.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                <span>View contact numbers</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/government/barangay-contacts"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 transition-colors hover:border-[#0066EB] hover:bg-[#F3F6FB] sm:p-5"
            >
              <div>
                <h3 className="text-base font-bold text-gray-950 transition-colors group-hover:text-[#0066EB]">
                  Barangay Contacts
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  Hall locations and official contact information for all 35
                  barangays.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                <span>Browse barangay contacts</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            {/* ROW 3: Official Government Links (Full Width on Desktop) */}
            <Link
              href="/government/links"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 transition-colors hover:border-[#0066EB] hover:bg-[#F3F6FB] sm:col-span-2 sm:p-5"
            >
              <div>
                <h3 className="text-base font-bold text-gray-950 transition-colors group-hover:text-[#0066EB]">
                  Official Government Links
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  Verified outbound links to national agencies, provincial
                  offices, and regional government websites.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                <span>View official links</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
