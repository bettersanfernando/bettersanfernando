import { ArrowDown, ArrowRight, ChevronDown, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getTransparencySourceInventory,
  type PublishedSourceDomain,
  type TransparencySourceLink,
} from '../../../data/civic/transparencySources';
import { buildPageMetadata } from '../../../lib/metadata';
import { formatIsoDate } from '../../../lib/utils';

export const metadata = buildPageMetadata({
  title: 'Transparency Sources',
  description:
    'See the public datasets, publishers, reference periods, and source links supporting information published by BetterSanFernando.',
  path: '/transparency/sources',
});

// UI-only presentation grouping for the 12 published domains
const DOMAIN_GROUPS = [
  {
    id: 'projects-procurement',
    label: 'Projects & Procurement',
    description:
      'Infrastructure projects, procurement evidence records, and verified cost-utilization observations.',
    domainIds: ['projects', 'project-evidence', 'project-cost-utilization'],
  },
  {
    id: 'community-geography',
    label: 'Community & Geography',
    description:
      'Official census counts, demographic profiles, and open civic geographic boundaries.',
    domainIds: ['population', 'geography'],
  },
  {
    id: 'government-legislation',
    label: 'Government & Legislation',
    description:
      'Verified city offices directory, executive orders, ordinances, and resolutions.',
    domainIds: [
      'city-offices',
      'executive-orders',
      'ordinances',
      'resolutions',
    ],
  },
  {
    id: 'transparency-finance',
    label: 'Transparency & Finance',
    description:
      'City finances, statutory Full Disclosure reports, and general official documents.',
    domainIds: ['finance', 'full-disclosure', 'official-documents'],
  },
] as const;

function formatDomainTitle(name: string): string {
  return name
    .split(' ')
    .map(word => {
      if (word.toLowerCase() === '&') return '&';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function SourceLinkItem({ link }: { link: TransparencySourceLink }) {
  const isInternal = link.type === 'internal';

  const typeBadgeLabel =
    link.type === 'official'
      ? 'Official Source'
      : link.type === 'community'
        ? 'Community Source'
        : 'BetterSanFernando Page';

  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 py-1.5 text-xs">
      {isInternal ? (
        <Link
          href={link.url}
          className="inline-flex items-center gap-1.5 font-semibold text-[#0066EB] hover:text-[#0052BC]"
        >
          <span>{link.label}</span>
          <ArrowRight className="h-3 w-3 shrink-0" aria-hidden="true" />
        </Link>
      ) : (
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-gray-800 hover:text-[#0066EB]"
        >
          <span className="truncate max-w-[28rem]">{link.label}</span>
          <ExternalLink
            className="h-3 w-3 shrink-0 text-gray-400"
            aria-hidden="true"
          />
        </a>
      )}
      <span className="text-[11px] text-gray-500 shrink-0 font-medium">
        {typeBadgeLabel}
      </span>
    </div>
  );
}

function DomainLinksSection({ domain }: { domain: PublishedSourceDomain }) {
  const internalLink = domain.links.find(l => l.type === 'internal');
  const otherLinks = domain.links.filter(l => l !== internalLink);

  // If 3 or fewer links total, show them all directly
  if (domain.links.length <= 3) {
    return (
      <div className="mt-4 divide-y divide-gray-100 border-t border-gray-100 pt-2">
        {domain.links.map(link => (
          <SourceLinkItem key={`${domain.id}-${link.url}`} link={link} />
        ))}
      </div>
    );
  }

  // More than 3 links: show primary action first, collapse the rest inside native <details>
  return (
    <div className="mt-4 border-t border-gray-100 pt-2">
      {internalLink && (
        <div className="pb-2">
          <SourceLinkItem link={internalLink} />
        </div>
      )}
      {!internalLink && otherLinks.length > 0 && (
        <div className="pb-2">
          <SourceLinkItem link={otherLinks[0]} />
        </div>
      )}

      <details className="group mt-2 rounded-sm border border-gray-200 bg-[#F9FAFB] p-3 text-xs">
        <summary className="cursor-pointer font-semibold text-gray-800 hover:text-[#0066EB] list-none flex items-center justify-between">
          <span>
            Source Links (
            {internalLink ? otherLinks.length : otherLinks.length - 1})
          </span>
          <span className="text-gray-400 text-[11px] font-normal flex items-center gap-1">
            Click to inspect
            <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
          </span>
        </summary>
        <div className="mt-3 divide-y divide-gray-100 border-t border-gray-200/80 pt-2 space-y-1">
          {(internalLink ? otherLinks : otherLinks.slice(1)).map(link => (
            <SourceLinkItem key={`${domain.id}-${link.url}`} link={link} />
          ))}
        </div>
      </details>
    </div>
  );
}

export default function TransparencySources() {
  const inventory = getTransparencySourceInventory();

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
              { label: 'Sources' },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <div className="max-w-3xl">
              <p className="text-eyebrow text-[#0066EB]">
                TRANSPARENCY · DATA SOURCES
              </p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.02em] text-gray-950 sm:text-4xl md:text-5xl">
                The Public Sources Behind BetterSanFernando
              </h1>
              <p className="mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">
                See which datasets BetterSanFernando currently publishes, who
                supports their facts, what periods they cover, and where the
                original public sources can be inspected.
              </p>

              {/* CTA row */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href="#source-registry"
                  className="inline-flex h-11 items-center gap-2 rounded-sm bg-[#0066EB] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0052BC]"
                >
                  Browse source registry
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>
                <Link
                  href="/transparency/methodology"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
                >
                  How We Publish Data
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Right-Side Release Module */}
            <aside className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6 text-sm">
              <p className="text-eyebrow text-[#0066EB]">
                CURRENT PUBLIC RELEASE
              </p>
              <h2 className="mt-1.5 text-base font-bold text-gray-950">
                Export {inventory.release.exportVersion}
              </h2>
              <p className="mt-2 text-xs font-semibold tabular-nums text-gray-900">
                {inventory.release.datasetCount} dataset files ·{' '}
                {inventory.publishedDomains.length} published domains
              </p>
              <p className="mt-3 border-t border-gray-200/80 pt-3 text-xs leading-relaxed text-gray-600">
                Source data version {inventory.release.sourceDataVersion}.
                Release dates are not exposed by the manifest; verification
                dates are shown per domain where available.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* 2. RELEASE SNAPSHOT */}
      <section
        className="border-b border-gray-200 bg-white"
        aria-labelledby="snapshot-heading"
      >
        <div className="container mx-auto px-4 py-8">
          <h2 id="snapshot-heading" className="sr-only">
            Release snapshot
          </h2>
          <dl className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-3 sm:divide-y-0 sm:divide-x border-y border-gray-200 py-6">
            <div className="sm:pr-6">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Dataset Files
              </dt>
              <dd className="mt-1.5 text-3xl sm:text-4xl font-extrabold tabular-nums text-gray-950">
                {inventory.release.datasetCount}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                Declared by the public manifest
              </p>
            </div>
            <div className="pt-4 sm:pt-0 sm:px-6">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Published Domains
              </dt>
              <dd className="mt-1.5 text-3xl sm:text-4xl font-extrabold tabular-nums text-gray-950">
                {inventory.publishedDomains.length}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                With verified public records
              </p>
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-6">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Current Export
              </dt>
              <dd className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-gray-950">
                Export {inventory.release.exportVersion}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                Source data {inventory.release.sourceDataVersion}
              </p>
            </div>
          </dl>
        </div>
      </section>

      {/* 3. PROVENANCE EXPLAINER */}
      <section
        className="border-b border-gray-200 bg-[#F9FAFB] py-10 sm:py-12 lg:py-14"
        aria-labelledby="provenance-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-[#0066EB]">HOW SOURCING WORKS</p>
            <h2
              id="provenance-heading"
              className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
            >
              From Published Fact to Public Source
            </h2>
            <p className="mt-1.5 text-sm text-gray-600">
              Every data point follows an auditable provenance chain back to
              public government documentation.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <div className="rounded-sm border border-gray-200 bg-white p-5">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                Step 1 · Fact
              </span>
              <h3 className="mt-1.5 text-base font-bold text-gray-950">
                Published Civic Fact
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                A civic record, expenditure observation, or statistic published
                on BetterSanFernando.
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                Step 2 · Source
              </span>
              <h3 className="mt-1.5 text-base font-bold text-gray-950">
                Named Authority
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                The official government body, statutory disclosure portal, or
                audit release supporting that information.
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                Step 3 · Public Link
              </span>
              <h3 className="mt-1.5 text-base font-bold text-gray-950">
                Verifiable Public Link
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                A public page, portal filing, or official document file that
                residents can directly inspect.
              </p>
            </div>
          </div>

          <p className="mt-6 text-xs text-gray-600">
            Authority is stated per domain and is never assumed from a generic
            government label.
          </p>
        </div>
      </section>

      {/* 4 & 5 & 6. SOURCE REGISTRY & DOMAIN GROUPS */}
      <section
        id="source-registry"
        className="border-b border-gray-200 bg-white py-10 sm:py-14 lg:py-16"
        aria-labelledby="registry-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">SOURCE REGISTRY</p>
            <h2
              id="registry-heading"
              className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
            >
              Published Datasets and Domains
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
              Dataset files serving the same public purpose are grouped into
              source domains while preserving distinct authority and coverage
              information.
            </p>
          </div>

          {/* Jump Index */}
          <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-1">
              Jump to group:
            </span>
            {DOMAIN_GROUPS.map(group => (
              <a
                key={group.id}
                href={`#group-${group.id}`}
                className="inline-flex items-center rounded-sm border border-gray-200 bg-[#F3F6FB] px-3 py-1.5 text-xs font-semibold text-gray-800 transition-colors hover:border-[#0066EB] hover:text-[#0066EB]"
              >
                {group.label}
              </a>
            ))}
          </div>

          {/* Domain Groups Container */}
          <div className="mt-8 space-y-12">
            {DOMAIN_GROUPS.map(group => {
              const groupDomains = inventory.publishedDomains.filter(domain =>
                (group.domainIds as readonly string[]).includes(domain.id)
              );

              return (
                <div
                  key={group.id}
                  id={`group-${group.id}`}
                  className="scroll-mt-8"
                >
                  <div className="border-b border-gray-200 pb-3">
                    <h3 className="text-xl font-bold text-gray-950 sm:text-2xl">
                      {group.label}
                    </h3>
                    <p className="mt-1 text-xs text-gray-600">
                      {group.description}
                    </p>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {groupDomains.map(domain => (
                      <article
                        key={domain.id}
                        id={`domain-${domain.id}`}
                        className="grid grid-cols-1 gap-6 py-8 first:pt-6 last:pb-6 lg:grid-cols-[minmax(14rem,0.85fr)_minmax(0,1.15fr)] lg:gap-10"
                        aria-labelledby={`heading-${domain.id}`}
                      >
                        {/* LEFT COLUMN */}
                        <div>
                          <h4
                            id={`heading-${domain.id}`}
                            className="text-lg sm:text-xl font-bold tracking-tight text-gray-950"
                          >
                            {formatDomainTitle(domain.name)}
                          </h4>

                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-xl sm:text-2xl font-extrabold tabular-nums text-gray-950">
                              {domain.recordCount.toLocaleString()}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                              {domain.recordLabel}
                            </span>
                          </div>

                          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-gray-700">
                            {domain.description}
                          </p>

                          <div className="mt-4 rounded-sm border border-gray-100 bg-[#F9FAFB] p-3 text-xs text-gray-600">
                            <span className="font-semibold text-gray-900 block mb-0.5">
                              Coverage
                            </span>
                            <p className="leading-relaxed">
                              {domain.coverageNote}
                            </p>
                          </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="flex flex-col justify-between">
                          <dl className="divide-y divide-gray-100 text-xs sm:text-sm border-t border-gray-100">
                            <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
                              <dt className="font-semibold text-gray-600">
                                Publisher / Authority
                              </dt>
                              <dd className="font-medium text-gray-900 leading-relaxed">
                                {domain.authority}
                              </dd>
                            </div>

                            <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
                              <dt className="font-semibold text-gray-600">
                                Reference Period
                              </dt>
                              <dd className="font-mono text-gray-800">
                                {domain.referencePeriod}
                              </dd>
                            </div>

                            <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
                              <dt className="font-semibold text-gray-600">
                                Last Verified
                              </dt>
                              <dd className="font-mono text-gray-800">
                                {domain.lastVerified
                                  ? formatIsoDate(domain.lastVerified)
                                  : 'Recorded per source entry'}
                              </dd>
                            </div>
                          </dl>

                          {/* Collapsible Source Links Section */}
                          <DomainLinksSection domain={domain} />
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 11. NOT CURRENTLY PUBLISHED */}
      <section
        className="border-b border-gray-200 bg-[#F9FAFB] py-10 sm:py-12 lg:py-14"
        aria-labelledby="not-published-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-[#0066EB]">PUBLIC EXPORT STATUS</p>
            <h2
              id="not-published-heading"
              className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
            >
              Not in This Public Export
            </h2>
            <p className="mt-1.5 text-sm text-gray-600">
              These labels describe the current BetterSanFernando frontend
              release only. They do not mean the records do not exist or that
              the City has no records.
            </p>
          </div>

          <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200 bg-white">
            {inventory.unavailableDomains.map(domain => (
              <div key={domain.id} className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-gray-950">
                    {formatDomainTitle(domain.name)}
                  </h3>
                  <span className="rounded-sm border border-gray-200 bg-gray-50 px-2.5 py-0.5 font-mono text-xs font-semibold text-gray-600">
                    {domain.status === 'NOT_EXPORTED'
                      ? 'Not Exported'
                      : 'Not Verified for Publication'}
                  </span>
                </div>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-600">
                  {domain.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. CLOSING PROVENANCE SECTION */}
      <section
        className="border-b border-gray-200 bg-white py-10 sm:py-12 lg:py-14"
        aria-labelledby="about-registry-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-[#0066EB]">ABOUT THIS REGISTRY</p>
            <h2
              id="about-registry-heading"
              className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
            >
              Understanding the Source Registry
            </h2>
            <p className="mt-1.5 text-sm text-gray-600">
              Core standards governing source identification, authority
              attribution, and publication integrity.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-sm border border-gray-200 bg-[#F9FAFB] p-5 sm:p-6">
              <h3 className="text-base font-bold text-gray-950">
                Published Scope
              </h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-600">
                The registry describes datasets available in the current public
                frontend export. Every domain is backed by versioned, public
                JSON data artifacts.
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-[#F9FAFB] p-5 sm:p-6">
              <h3 className="text-base font-bold text-gray-950">Authority</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-600">
                Each domain identifies the relevant official or community source
                rather than assuming provenance from a generic government label.
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-[#F9FAFB] p-5 sm:p-6">
              <h3 className="text-base font-bold text-gray-950">Coverage</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-600">
                Published coverage may be bounded or partial and does not
                automatically imply completeness. Absence indicates unrecovered
                or unverified materials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 13. KEEP EXPLORING */}
      <section
        className="bg-white py-10 pb-16 sm:py-12 sm:pb-24 lg:py-14 lg:pb-28"
        aria-labelledby="explore-heading"
      >
        <div className="container mx-auto px-4">
          <p className="text-eyebrow text-[#0066EB]">RELATED RESOURCES</p>
          <h2
            id="explore-heading"
            className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
          >
            Keep Exploring
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/projects/sources"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 sm:p-5 transition-colors hover:border-[#0066EB]"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Projects
                </span>
                <h3 className="mt-1.5 text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                  Project Evidence
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  Inspect individual project source attachments, procurement
                  contracts, and verified records.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                Browse evidence
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/transparency/methodology"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 sm:p-5 transition-colors hover:border-[#0066EB]"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Methodology
                </span>
                <h3 className="mt-1.5 text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                  How We Publish Data
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  Standards used for document classification, reconciliation,
                  and audit safeguards.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                Read guide
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/statistics/public-records"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 sm:p-5 transition-colors hover:border-[#0066EB]"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Statistics
                </span>
                <h3 className="mt-1.5 text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                  Public Records Statistics
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  Overview of published dataset record counts, units, and
                  coverage periods.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                View statistics
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/transparency/documents"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 sm:p-5 transition-colors hover:border-[#0066EB]"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Archive
                </span>
                <h3 className="mt-1.5 text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                  Official Documents
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  Executive summaries, administrative orders, and verified City
                  documentation.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                Browse documents
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
