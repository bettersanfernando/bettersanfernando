import { ArrowDown, ArrowRight, ChevronDown, ExternalLink } from 'lucide-react';
import Link from '../../../components/i18n/LocaleLink';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getPublishedDomainDisplayText,
  getSourceLinkLabel,
  getTransparencySourceInventory,
  getUnavailableDomainDisplayText,
  type PublishedSourceDomain,
  type TransparencySourceLink,
} from '../../../data/civic/transparencySources';
import { buildPageMetadata } from '../../../lib/metadata';
import { formatIsoDate } from '../../../lib/utils';
import type { PageT } from '../../../i18n/page-t';
import { getPageT } from '../../../i18n/server';

export async function generateMetadata() {
  const { t, locale } = await getPageT('transparency-sources');
  return buildPageMetadata({
    title: t('Transparency Sources'),
    description: t(
      'See the public datasets, publishers, reference periods, and source links supporting information published by BetterSanFernando.'
    ),
    path: '/transparency/sources',
    locale,
  });
}

// UI-only presentation grouping for the 12 published domains
const DOMAIN_GROUPS = (t: PageT) =>
  [
    {
      id: 'projects-procurement',
      label: t('Projects & Procurement'),
      description: t(
        'Infrastructure projects, procurement evidence records, and verified cost-utilization observations.'
      ),
      domainIds: ['projects', 'project-evidence', 'project-cost-utilization'],
    },
    {
      id: 'community-geography',
      label: t('Community & Geography'),
      description: t(
        'Official census counts, demographic profiles, and open civic geographic boundaries.'
      ),
      domainIds: ['population', 'geography'],
    },
    {
      id: 'government-legislation',
      label: t('Government & Legislation'),
      description: t(
        'Verified city offices directory, executive orders, ordinances, and resolutions.'
      ),
      domainIds: [
        'city-offices',
        'executive-orders',
        'ordinances',
        'resolutions',
      ],
    },
    {
      id: 'transparency-finance',
      label: t('Transparency & Finance'),
      description: t(
        'City finances, statutory Full Disclosure reports, and general official documents.'
      ),
      domainIds: ['finance', 'full-disclosure', 'official-documents'],
    },
  ] as const;

async function SourceLinkItem({ link }: { link: TransparencySourceLink }) {
  const { t } = await getPageT('transparency-sources');
  const isInternal = link.type === 'internal';

  const typeBadgeLabel =
    link.type === 'official'
      ? t('Official Source')
      : link.type === 'community'
        ? t('Community Source')
        : t('BetterSanFernando Page');

  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 py-1.5 text-xs">
      {isInternal ? (
        <Link
          href={link.url}
          className="inline-flex items-center gap-1.5 font-semibold text-[#0066EB] hover:text-[#0052BC]"
        >
          <span>{getSourceLinkLabel(link.label, t)}</span>
          <ArrowRight className="h-3 w-3 shrink-0" aria-hidden="true" />
        </Link>
      ) : (
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-gray-800 hover:text-[#0066EB]"
        >
          <span className="truncate max-w-[28rem]">
            {getSourceLinkLabel(link.label, t)}
          </span>
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

async function DomainLinksSection({
  domain,
}: {
  domain: PublishedSourceDomain;
}) {
  const { t } = await getPageT('transparency-sources');
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
            {t('Source Links ({{length}})', {
              length: internalLink ? otherLinks.length : otherLinks.length - 1,
            })}
          </span>
          <span className="text-gray-400 text-[11px] font-normal flex items-center gap-1">
            {t('Click to inspect')}
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

export default async function TransparencySources() {
  const { t } = await getPageT('transparency-sources');
  const inventory = getTransparencySourceInventory();

  return (
    <main className="flex-grow bg-white">
      {/* 1. EDITORIAL HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[
              { label: t('Home'), href: '/' },
              { label: t('Transparency'), href: '/transparency' },
              { label: t('Sources') },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <div className="max-w-3xl">
              <p className="text-eyebrow text-[#0066EB]">
                {t('TRANSPARENCY · DATA SOURCES')}
              </p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.02em] text-gray-950 sm:text-4xl md:text-5xl">
                {t('The Public Sources Behind BetterSanFernando')}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">
                {t(
                  'See which datasets BetterSanFernando currently publishes, who supports their facts, what periods they cover, and where the original public sources can be inspected.'
                )}
              </p>

              {/* CTA row */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href="#source-registry"
                  className="inline-flex h-11 items-center gap-2 rounded-sm bg-[#0066EB] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0052BC]"
                >
                  {t('Browse source registry')}
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>
                <Link
                  href="/transparency/methodology"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
                >
                  {t('How We Publish Data')}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Right-Side Release Module */}
            <aside className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6 text-sm">
              <p className="text-eyebrow text-[#0066EB]">
                {t('CURRENT PUBLIC RELEASE')}
              </p>
              <h2 className="mt-1.5 text-base font-bold text-gray-950">
                {t('Export {{exportVersion}}', {
                  exportVersion: inventory.release.exportVersion,
                })}
              </h2>
              <p className="mt-2 text-xs font-semibold tabular-nums text-gray-900">
                {t(
                  '{{datasetCount}} dataset files · {{length}} published domains',
                  {
                    datasetCount: inventory.release.datasetCount,
                    length: inventory.publishedDomains.length,
                  }
                )}
              </p>
              <p className="mt-3 border-t border-gray-200/80 pt-3 text-xs leading-relaxed text-gray-600">
                {t(
                  'Source data version {{sourceDataVersion}}. Release dates are not exposed by the manifest; verification dates are shown per domain where available.',
                  { sourceDataVersion: inventory.release.sourceDataVersion }
                )}
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
            {t('Release snapshot')}
          </h2>
          <dl className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-3 sm:divide-y-0 sm:divide-x border-y border-gray-200 py-6">
            <div className="sm:pr-6">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('Dataset Files')}
              </dt>
              <dd className="mt-1.5 text-3xl sm:text-4xl font-extrabold tabular-nums text-gray-950">
                {inventory.release.datasetCount}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                {t('Declared by the public manifest')}
              </p>
            </div>
            <div className="pt-4 sm:pt-0 sm:px-6">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('Published Domains')}
              </dt>
              <dd className="mt-1.5 text-3xl sm:text-4xl font-extrabold tabular-nums text-gray-950">
                {inventory.publishedDomains.length}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                {t('With verified public records')}
              </p>
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-6">
              <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('Current Export')}
              </dt>
              <dd className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-gray-950">
                {t('Export {{exportVersion}}', {
                  exportVersion: inventory.release.exportVersion,
                })}
              </dd>
              <p className="mt-1 text-xs text-gray-600">
                {t('Source data {{sourceDataVersion}}', {
                  sourceDataVersion: inventory.release.sourceDataVersion,
                })}
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
            <p className="text-eyebrow text-[#0066EB]">
              {t('HOW SOURCING WORKS')}
            </p>
            <h2
              id="provenance-heading"
              className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
            >
              {t('From Published Fact to Public Source')}
            </h2>
            <p className="mt-1.5 text-sm text-gray-600">
              {t(
                'Every data point follows an auditable provenance chain back to public government documentation.'
              )}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <div className="rounded-sm border border-gray-200 bg-white p-5">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                {t('Step 1 · Fact')}
              </span>
              <h3 className="mt-1.5 text-base font-bold text-gray-950">
                {t('Published Civic Fact')}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                {t(
                  'A civic record, expenditure observation, or statistic published on BetterSanFernando.'
                )}
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                {t('Step 2 · Source')}
              </span>
              <h3 className="mt-1.5 text-base font-bold text-gray-950">
                {t('Named Authority')}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                {t(
                  'The official government body, statutory disclosure portal, or audit release supporting that information.'
                )}
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                {t('Step 3 · Public Link')}
              </span>
              <h3 className="mt-1.5 text-base font-bold text-gray-950">
                {t('Verifiable Public Link')}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                {t(
                  'A public page, portal filing, or official document file that residents can directly inspect.'
                )}
              </p>
            </div>
          </div>

          <p className="mt-6 text-xs text-gray-600">
            {t(
              'Authority is stated per domain and is never assumed from a generic government label.'
            )}
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
            <p className="text-eyebrow text-[#0066EB]">
              {t('SOURCE REGISTRY')}
            </p>
            <h2
              id="registry-heading"
              className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
            >
              {t('Published Datasets and Domains')}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
              {t(
                'Dataset files serving the same public purpose are grouped into source domains while preserving distinct authority and coverage information.'
              )}
            </p>
          </div>

          {/* Jump Index */}
          <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-1">
              {t('Jump to group:')}
            </span>
            {DOMAIN_GROUPS(t).map(group => (
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
            {DOMAIN_GROUPS(t).map(group => {
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
                    {groupDomains.map(domain => {
                      const display = getPublishedDomainDisplayText(domain, t);
                      return (
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
                              {display.name}
                            </h4>

                            <div className="mt-2 flex items-baseline gap-2">
                              <span className="text-xl sm:text-2xl font-extrabold tabular-nums text-gray-950">
                                {domain.recordCount.toLocaleString()}
                              </span>
                              <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                                {display.recordLabel}
                              </span>
                            </div>

                            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-gray-700">
                              {display.description}
                            </p>

                            <div className="mt-4 rounded-sm border border-gray-100 bg-[#F9FAFB] p-3 text-xs text-gray-600">
                              <span className="font-semibold text-gray-900 block mb-0.5">
                                {t('Coverage')}
                              </span>
                              <p className="leading-relaxed">
                                {display.coverageNote}
                              </p>
                            </div>
                          </div>

                          {/* RIGHT COLUMN */}
                          <div className="flex flex-col justify-between">
                            <dl className="divide-y divide-gray-100 text-xs sm:text-sm border-t border-gray-100">
                              <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
                                <dt className="font-semibold text-gray-600">
                                  {t('Publisher / Authority')}
                                </dt>
                                <dd className="font-medium text-gray-900 leading-relaxed">
                                  {domain.authority}
                                </dd>
                              </div>

                              <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
                                <dt className="font-semibold text-gray-600">
                                  {t('Reference Period')}
                                </dt>
                                <dd className="font-mono text-gray-800">
                                  {domain.referencePeriod}
                                </dd>
                              </div>

                              <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
                                <dt className="font-semibold text-gray-600">
                                  {t('Last Verified')}
                                </dt>
                                <dd className="font-mono text-gray-800">
                                  {domain.lastVerified
                                    ? formatIsoDate(domain.lastVerified)
                                    : t('Recorded per source entry')}
                                </dd>
                              </div>
                            </dl>

                            {/* Collapsible Source Links Section */}
                            <DomainLinksSection domain={domain} />
                          </div>
                        </article>
                      );
                    })}
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
            <p className="text-eyebrow text-[#0066EB]">
              {t('PUBLIC EXPORT STATUS')}
            </p>
            <h2
              id="not-published-heading"
              className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
            >
              {t('Not in This Public Export')}
            </h2>
            <p className="mt-1.5 text-sm text-gray-600">
              {t(
                'These labels describe the current BetterSanFernando frontend release only. They do not mean the records do not exist or that the City has no records.'
              )}
            </p>
          </div>

          <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200 bg-white">
            {inventory.unavailableDomains.map(domain => {
              const display = getUnavailableDomainDisplayText(domain, t);
              return (
                <div key={domain.id} className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-gray-950">
                      {display.name}
                    </h3>
                    <span className="rounded-sm border border-gray-200 bg-gray-50 px-2.5 py-0.5 font-mono text-xs font-semibold text-gray-600">
                      {domain.status === 'NOT_EXPORTED'
                        ? t('Not Exported')
                        : t('Not Verified for Publication')}
                    </span>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-600">
                    {display.note}
                  </p>
                </div>
              );
            })}
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
            <p className="text-eyebrow text-[#0066EB]">
              {t('ABOUT THIS REGISTRY')}
            </p>
            <h2
              id="about-registry-heading"
              className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
            >
              {t('Understanding the Source Registry')}
            </h2>
            <p className="mt-1.5 text-sm text-gray-600">
              {t(
                'Core standards governing source identification, authority attribution, and publication integrity.'
              )}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-sm border border-gray-200 bg-[#F9FAFB] p-5 sm:p-6">
              <h3 className="text-base font-bold text-gray-950">
                {t('Published Scope')}
              </h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-600">
                {t(
                  'The registry describes datasets available in the current public frontend export. Every domain is backed by versioned, public JSON data artifacts.'
                )}
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-[#F9FAFB] p-5 sm:p-6">
              <h3 className="text-base font-bold text-gray-950">
                {t('Authority')}
              </h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-600">
                {t(
                  'Each domain identifies the relevant official or community source rather than assuming provenance from a generic government label.'
                )}
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-[#F9FAFB] p-5 sm:p-6">
              <h3 className="text-base font-bold text-gray-950">
                {t('Coverage')}
              </h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-600">
                {t(
                  'Published coverage may be bounded or partial and does not automatically imply completeness. Absence indicates unrecovered or unverified materials.'
                )}
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
          <p className="text-eyebrow text-[#0066EB]">
            {t('RELATED RESOURCES')}
          </p>
          <h2
            id="explore-heading"
            className="mt-2 text-2xl font-bold text-gray-950 md:text-3xl"
          >
            {t('Keep Exploring')}
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/projects/sources"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 sm:p-5 transition-colors hover:border-[#0066EB]"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t('Projects')}
                </span>
                <h3 className="mt-1.5 text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                  {t('Project Evidence')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {t(
                    'Inspect individual project source attachments, procurement contracts, and verified records.'
                  )}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                {t('Browse evidence')}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/transparency/methodology"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 sm:p-5 transition-colors hover:border-[#0066EB]"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t('Methodology')}
                </span>
                <h3 className="mt-1.5 text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                  {t('How We Publish Data')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {t(
                    'Standards used for document classification, reconciliation, and audit safeguards.'
                  )}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                {t('Read guide')}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/statistics/public-records"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 sm:p-5 transition-colors hover:border-[#0066EB]"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t('Statistics')}
                </span>
                <h3 className="mt-1.5 text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                  {t('Public Records Statistics')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {t(
                    'Overview of published dataset record counts, units, and coverage periods.'
                  )}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                {t('View statistics')}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href="/transparency/documents"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 sm:p-5 transition-colors hover:border-[#0066EB]"
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {t('Archive')}
                </span>
                <h3 className="mt-1.5 text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                  {t('Official Documents')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {t(
                    'Executive summaries, administrative orders, and verified City documentation.'
                  )}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                {t('Browse documents')}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
