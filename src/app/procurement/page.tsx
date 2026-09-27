import Link from '../../components/i18n/LocaleLink';
import {
  BadgeCheck,
  BarChart3,
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  FileQuestion,
  FileSearch,
  FileSignature,
  FolderKanban,
  Gavel,
  Hash,
  Landmark,
  Layers3,
  Link2,
  MapPinned,
  ReceiptText,
  type LucideIcon,
} from 'lucide-react';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { getProcurementStatistics } from '../../data/civic/procurementStatistics';
import { buildPageMetadata } from '../../lib/metadata';
import { getPageT } from '../../i18n/server';

export async function generateMetadata() {
  const { t, locale } = await getPageT('procurement');
  return buildPageMetadata({
    title: t('Procurement'),
    description: t(
      'Explore published bid results, award records, contract evidence, and procurement statistics connected to BetterSanFernando’s verified City project collection.'
    ),
    path: '/procurement',
    locale,
  });
}

const eyebrowTracking = { letterSpacing: '0.08em' } as const;

interface DestinationPanel {
  title: string;
  href: string;
  action: string;
  icon: LucideIcon;
  count: number;
  question: string;
  body: string;
  note: string;
}

interface RecordTypeItem {
  number: string;
  title: string;
  text: string;
  icon: LucideIcon;
}

interface RelatedResource {
  title: string;
  description: string;
  href: string;
}

export default async function ProcurementPage() {
  const { t } = await getPageT('procurement');
  const statistics = getProcurementStatistics();

  const metrics = [
    {
      label: t('Published project records'),
      value: statistics.projects.total,
    },
    {
      label: t('Project evidence records'),
      value: statistics.evidence.total,
    },
    {
      label: t('Bid-result evidence'),
      value: statistics.bidResults.total,
    },
    {
      label: t('Awarded projects'),
      value: statistics.awardsAndContracts.awarded,
    },
    {
      label: t('Contracted projects'),
      value: statistics.awardsAndContracts.contracted,
    },
  ] as const;

  const destinations: DestinationPanel[] = [
    {
      title: t('Bid Results'),
      href: '/procurement/bid-results',
      action: t('View Bid Results →'),
      icon: FileSearch,
      count: statistics.bidResults.total,
      question: t('Which published bid-result records are linked to projects?'),
      body: t(
        'Inspect bidders, procurement identifiers, ABC, winning-bid values, official sources, and published documents.'
      ),
      note: t('A winning bid does not establish contract execution.'),
    },
    {
      title: t('Contracts and Awards'),
      href: '/procurement/contracts',
      action: t('View Contracts and Awards →'),
      icon: FileCheck2,
      count: statistics.awardsAndContracts.awarded,
      question: t('Which projects have published award or contract evidence?'),
      body: t(
        'Review award evidence and the smaller set of projects whose canonical records support contract execution.'
      ),
      note: t('{{count}} projects currently have Contracted status.', {
        count: statistics.awardsAndContracts.contracted,
      }),
    },
    {
      title: t('Procurement Statistics'),
      href: '/statistics/procurement',
      action: t('View Procurement Statistics →'),
      icon: BarChart3,
      count: statistics.projects.total,
      question: t(
        'How much procurement evidence is published across the project collection?'
      ),
      body: t(
        'Review documentary coverage, project-field coverage, bid-result coverage, and evidence by document year.'
      ),
      note: t(
        'Descriptive coverage statistics, not a performance or spending dashboard.'
      ),
    },
  ];

  const recordTypes: RecordTypeItem[] = [
    {
      number: '01',
      title: t('Project record'),
      text: t(
        'The canonical project record identifies the project being documented.'
      ),
      icon: FolderKanban,
    },
    {
      number: '02',
      title: t('Bid-result evidence'),
      text: t(
        'Published bid-result records may establish bidders, procurement references, ABC, or winning-bid values.'
      ),
      icon: FileSearch,
    },
    {
      number: '03',
      title: t('Award evidence'),
      text: t('Published evidence may establish an award decision.'),
      icon: Gavel,
    },
    {
      number: '04',
      title: t('Contract evidence'),
      text: t('Separate evidence may support contract execution.'),
      icon: FileCheck2,
    },
  ];

  const relatedResources: RelatedResource[] = [
    {
      title: t('Project Evidence'),
      description: t(
        'Browse the published evidence records used to establish project facts.'
      ),
      href: '/projects/sources',
    },
    {
      title: t('Project Methodology'),
      description: t(
        'See how project records are collected, structured, and interpreted.'
      ),
      href: '/projects/methodology',
    },
    {
      title: t('Project Statistics'),
      description: t(
        'Explore descriptive statistics for the published project collection.'
      ),
      href: '/statistics/projects',
    },
    {
      title: t('Published Data Sources'),
      description: t(
        'Review the official-source datasets currently published by BetterSanFernando.'
      ),
      href: '/transparency/sources',
    },
  ];

  return (
    <main className="flex-grow bg-white pb-16 md:pb-24">
      {/* 1. Intro + Breadcrumbs + Scope */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-14">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[
              { label: t('Home'), href: '/' },
              { label: t('Projects'), href: '/projects' },
              { label: t('Procurement') },
            ]}
          />

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-12">
            <div className="max-w-2xl">
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                {t('PROCUREMENT')}
              </p>

              <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] text-gray-950 sm:text-4xl lg:text-5xl">
                {t('Procurement records and evidence')}
              </h1>

              <p className="mt-4 text-base leading-7 text-gray-700 sm:text-lg">
                {t(
                  'Explore published bid results, award records, contract evidence, and procurement statistics connected to BetterSanFernando’s verified City project collection.'
                )}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/procurement/bid-results"
                  className="inline-flex h-10 items-center gap-2 rounded-sm bg-[#0066EB] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] focus-visible:ring-offset-2"
                >
                  {t('Browse bid results →')}
                </Link>
                <Link
                  href="/procurement/contracts"
                  className="inline-flex h-10 items-center gap-2 rounded-sm border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 transition-colors hover:border-[#0066EB]/40 hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                >
                  {t('View contracts & awards →')}
                </Link>
              </div>
            </div>

            {/* Scope module */}
            <aside
              aria-labelledby="scope-module-heading"
              className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 text-sm leading-6 text-gray-700"
            >
              <p className="text-eyebrow text-gray-500" style={eyebrowTracking}>
                {t('WHAT THIS PAGE COVERS')}
              </p>
              <h2
                id="scope-module-heading"
                className="mt-2 text-base font-bold text-gray-950"
              >
                {t('Project-linked public records')}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {t(
                  'This page covers procurement records connected to BetterSanFernando’s current infrastructure and public-works project collection. It is not a complete record of all City Government procurement.'
                )}
              </p>
            </aside>
          </div>

          {/* 2. Metrics strip */}
          <dl className="mt-8 grid grid-cols-1 border-y border-gray-200 sm:grid-cols-2 lg:grid-cols-5">
            {metrics.map((metric, index) => (
              <div
                key={metric.label}
                className={`p-4 sm:p-5 ${
                  index > 0 ? 'border-t border-gray-200 sm:border-t-0' : ''
                } ${index % 2 === 1 ? 'sm:border-l sm:border-gray-200' : ''} ${
                  index >= 2
                    ? 'sm:border-t sm:border-gray-200 lg:border-t-0'
                    : ''
                } ${index > 0 ? 'lg:border-l lg:border-gray-200' : ''}`}
              >
                <dt className="text-sm text-gray-600">{metric.label}</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-gray-950 sm:text-3xl">
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm leading-6 text-gray-600">
            {t(
              'These counts describe different record types and documentary states. They should not be read as stages of one procurement funnel.'
            )}
          </p>
        </div>
      </section>

      {/* Main page content sections */}
      <div className="container mx-auto space-y-12 px-4 py-10 md:space-y-16 md:py-14 lg:space-y-20 lg:py-20">
        {/* 3. Find what you need */}
        <section aria-labelledby="destinations-heading">
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            {t('PROCUREMENT DATA')}
          </p>
          <h2
            id="destinations-heading"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
          >
            {t('Find what you need')}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            {t('Choose the view that best matches what you want to inspect.')}
          </p>

          <div className="mt-7 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
            {destinations.map(panel => {
              const Icon = panel.icon;
              return (
                <article
                  key={panel.title}
                  className="flex h-full flex-col rounded-sm border border-gray-200 bg-white p-5 transition-colors hover:bg-[#F3F6FB] sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <Icon
                      className="h-5 w-5 shrink-0 text-[#0066EB]"
                      aria-hidden="true"
                    />
                    <span className="text-2xl font-bold tabular-nums text-gray-950 sm:text-3xl">
                      {panel.count}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-gray-950">
                    {panel.title}
                  </h3>

                  <p className="mt-3 text-sm font-semibold leading-6 text-gray-900">
                    {panel.question}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {panel.body}
                  </p>

                  <p className="mt-3 text-xs leading-5 text-gray-500">
                    {panel.note}
                  </p>

                  <div className="mt-auto pt-6">
                    <Link
                      href={panel.href}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] hover:text-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                    >
                      {panel.action}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* 4. Record-type visual explainer */}
        <section aria-labelledby="record-types-heading">
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            {t('HOW THE RECORDS RELATE')}
          </p>
          <h2
            id="record-types-heading"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
          >
            {t('Four types of procurement records you may encounter')}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            {t(
              'These records describe different parts of procurement documentation. A project may have some, all, or none of these published record types.'
            )}
          </p>

          <div className="mt-7 overflow-hidden rounded-sm border border-gray-200 bg-[#F3F6FB]">
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {recordTypes.map((type, index) => {
                const Icon = type.icon;
                return (
                  <li
                    key={type.title}
                    className={`p-5 sm:p-6 ${
                      index > 0 ? 'border-t border-gray-200 sm:border-t-0' : ''
                    } ${
                      index % 2 === 1 ? 'sm:border-l sm:border-gray-200' : ''
                    } ${
                      index >= 2
                        ? 'sm:border-t sm:border-gray-200 lg:border-t-0'
                        : ''
                    } ${index > 0 ? 'lg:border-l lg:border-gray-200' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-medium text-gray-500">
                        {type.number}
                      </span>
                      <Icon
                        className="h-4 w-4 text-[#0066EB]"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="mt-3 text-base font-bold text-gray-950">
                      {type.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-700">
                      {type.text}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            {t(
              'Not every project has every type of published evidence. A winning bid does not by itself establish contract execution.'
            )}
          </p>
        </section>

        {/* 5. Understanding the data - Full-width editorial bands */}
        <section aria-labelledby="understanding-heading">
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            {t('UNDERSTANDING THE DATA')}
          </p>
          <h2
            id="understanding-heading"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
          >
            {t('How to read procurement records')}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            {t(
              'Procurement statuses and financial amounts describe different facts about a project. Understanding the difference helps avoid misleading comparisons.'
            )}
          </p>

          <div className="mt-8 space-y-10">
            {/* Subsection 1: Project status comparison (full-width strip) */}
            <div>
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                {t('PROJECT STATUS')}
              </p>
              <h3 className="mt-1.5 text-xl font-bold text-gray-950">
                {t('Awarded and Contracted are different')}
              </h3>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                {t(
                  'These statuses establish different documentary facts about a project.'
                )}
              </p>

              <div className="mt-4 overflow-hidden rounded-sm border border-gray-200 bg-[#F3F6FB]">
                <div className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
                  {/* Awarded */}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-2">
                      <Gavel
                        className="h-4 w-4 shrink-0 text-[#0066EB]"
                        aria-hidden="true"
                      />
                      <h4 className="text-base font-bold text-gray-950">
                        {t('Awarded')}
                      </h4>
                    </div>
                    <p className="mt-2.5 text-sm font-semibold leading-6 text-gray-950">
                      {t(
                        'An official record establishes that an award decision was made.'
                      )}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-600">
                      {t(
                        'This does not by itself establish that a contract was executed.'
                      )}
                    </p>
                  </div>

                  {/* Contracted */}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-2">
                      <FileCheck2
                        className="h-4 w-4 shrink-0 text-[#0066EB]"
                        aria-hidden="true"
                      />
                      <h4 className="text-base font-bold text-gray-950">
                        {t('Contracted')}
                      </h4>
                    </div>
                    <p className="mt-2.5 text-sm font-semibold leading-6 text-gray-950">
                      {t(
                        'Separate canonical evidence supports contract execution.'
                      )}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-600">
                      {t(
                        'BetterSanFernando uses this status only when contract evidence supports it.'
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-2.5 text-xs text-gray-500">
                {t('Awarded and Contracted are separate documentary states.')}
              </p>
            </div>

            {/* Subsection 2: Financial fields (full-width horizontal strip) */}
            <div>
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                {t('FINANCIAL FIELDS')}
              </p>
              <h3 className="mt-1.5 text-xl font-bold text-gray-950">
                {t('What each amount means')}
              </h3>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                {t(
                  'Procurement amounts come from different records and answer different questions.'
                )}
              </p>

              <div className="mt-4 border-y border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {/* ABC */}
                  <div className="py-4 sm:p-4 sm:pl-0 lg:p-5 lg:pl-0">
                    <div className="flex items-center gap-2">
                      <Landmark
                        className="h-4 w-4 shrink-0 text-[#0066EB]"
                        aria-hidden="true"
                      />
                      <h4 className="text-sm font-bold text-gray-950">
                        {t('Approved Budget for the Contract (ABC)')}
                      </h4>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-gray-700">
                      {t('The approved procurement budget or ceiling.')}
                    </p>
                    <p className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      {t('Budget reference')}
                    </p>
                  </div>

                  {/* Winning Bid */}
                  <div className="border-t border-gray-200 py-4 sm:border-t-0 sm:border-l sm:border-gray-200 sm:p-4 lg:p-5">
                    <div className="flex items-center gap-2">
                      <BadgeCheck
                        className="h-4 w-4 shrink-0 text-[#0066EB]"
                        aria-hidden="true"
                      />
                      <h4 className="text-sm font-bold text-gray-950">
                        {t('Winning bid amount')}
                      </h4>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-gray-700">
                      {t(
                        'The amount reported for the winning bid in bid-result evidence.'
                      )}
                    </p>
                    <p className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      {t('Bid result')}
                    </p>
                  </div>

                  {/* Contract Amount */}
                  <div className="border-t border-gray-200 py-4 sm:border-t sm:border-gray-200 sm:p-4 sm:pl-0 lg:border-t-0 lg:border-l lg:p-5">
                    <div className="flex items-center gap-2">
                      <FileSignature
                        className="h-4 w-4 shrink-0 text-[#0066EB]"
                        aria-hidden="true"
                      />
                      <h4 className="text-sm font-bold text-gray-950">
                        {t('Contract amount')}
                      </h4>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-gray-700">
                      {t(
                        'The amount supported by published contract evidence where available.'
                      )}
                    </p>
                    <p className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      {t('Contract evidence')}
                    </p>
                  </div>

                  {/* Actual Expenditure */}
                  <div className="border-t border-gray-200 py-4 sm:border-t sm:border-gray-200 sm:border-l sm:border-gray-200 sm:p-4 sm:pr-0 lg:border-t-0 lg:p-5 lg:pr-0">
                    <div className="flex items-center gap-2">
                      <CircleDollarSign
                        className="h-4 w-4 shrink-0 text-gray-400"
                        aria-hidden="true"
                      />
                      <h4 className="text-sm font-bold text-gray-950">
                        {t('Actual expenditure')}
                      </h4>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-gray-600">
                      {t(
                        'Actual expenditure is not currently available in this project procurement dataset.'
                      )}
                    </p>
                    <p className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      {t('Not available')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Scope and provenance - Full-width editorial layers */}
        <section aria-labelledby="scope-provenance-heading">
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            {t('SCOPE AND PROVENANCE')}
          </p>
          <h2
            id="scope-provenance-heading"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
          >
            {t('What these records can and cannot establish')}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            {t(
              'Published procurement records can establish specific facts, but they do not answer every question about a project.'
            )}
          </p>

          <div className="mt-8 space-y-10">
            {/* Layer 1: What the records can establish */}
            <div>
              <h3 className="text-xl font-bold text-gray-950">
                {t('What the records can establish')}
              </h3>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                {t(
                  'Different official records can establish different project and procurement details.'
                )}
              </p>

              <div className="mt-4 border-y border-gray-200">
                <div className="grid grid-cols-1 divide-y divide-gray-200 lg:grid-cols-3 lg:divide-y-0 lg:divide-x">
                  {/* Project references */}
                  <div className="py-4 lg:p-5 lg:pl-0">
                    <div className="flex items-center gap-2">
                      <Hash
                        className="h-4 w-4 shrink-0 text-[#0066EB]"
                        aria-hidden="true"
                      />
                      <h4 className="text-sm font-bold text-gray-950">
                        {t('Project references')}
                      </h4>
                    </div>
                    <ul className="mt-2.5 space-y-1 text-xs text-gray-600 sm:text-sm">
                      <li>{t('Project ID')}</li>
                      <li>{t('APP Code')}</li>
                      <li>{t('BAC / control reference')}</li>
                    </ul>
                  </div>

                  {/* Procurement references */}
                  <div className="py-4 lg:p-5">
                    <div className="flex items-center gap-2">
                      <Link2
                        className="h-4 w-4 shrink-0 text-[#0066EB]"
                        aria-hidden="true"
                      />
                      <h4 className="text-sm font-bold text-gray-950">
                        {t('Procurement references')}
                      </h4>
                    </div>
                    <ul className="mt-2.5 space-y-1 text-xs text-gray-600 sm:text-sm">
                      <li>{t('Evidence ID')}</li>
                      <li>{t('PhilGEPS reference')}</li>
                      <li>{t('Contract number')}</li>
                    </ul>
                  </div>

                  {/* Published parties and amounts */}
                  <div className="py-4 lg:p-5 lg:pr-0">
                    <div className="flex items-center gap-2">
                      <ReceiptText
                        className="h-4 w-4 shrink-0 text-[#0066EB]"
                        aria-hidden="true"
                      />
                      <h4 className="text-sm font-bold text-gray-950">
                        {t('Published parties and amounts')}
                      </h4>
                    </div>
                    <ul className="mt-2.5 space-y-1 text-xs text-gray-600 sm:text-sm">
                      <li>{t('Bidder names')}</li>
                      <li>{t('Published procurement amounts')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <p className="mt-2.5 text-xs text-gray-500">
                {t(
                  'Different reference systems keep their own identifiers and should not be treated as interchangeable.'
                )}
              </p>
            </div>

            {/* Layer 2: What the records do not automatically prove */}
            <div>
              <h3 className="text-xl font-bold text-gray-950">
                {t('What the records do not automatically prove')}
              </h3>

              <div className="mt-4 overflow-hidden rounded-sm border border-gray-200 bg-[#F3F6FB]">
                <div className="grid grid-cols-1 divide-y divide-gray-200 lg:grid-cols-3 lg:divide-y-0 lg:divide-x">
                  {/* Complete City coverage */}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-2">
                      <MapPinned
                        className="h-4 w-4 shrink-0 text-[#0066EB]"
                        aria-hidden="true"
                      />
                      <h4 className="text-sm font-bold text-gray-950">
                        {t('Complete City coverage')}
                      </h4>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-gray-700 sm:text-sm sm:leading-6">
                      {t(
                        'This page covers BetterSanFernando’s infrastructure and public-works project collection. It does not represent every City procurement activity.'
                      )}
                    </p>
                  </div>

                  {/* Whether an undocumented activity occurred */}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-2">
                      <FileQuestion
                        className="h-4 w-4 shrink-0 text-[#0066EB]"
                        aria-hidden="true"
                      />
                      <h4 className="text-sm font-bold text-gray-950">
                        {t('Whether an undocumented activity occurred')}
                      </h4>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-gray-700 sm:text-sm sm:leading-6">
                      {t(
                        'A missing published record means the fact has not been established in this dataset. It does not prove that the activity never occurred.'
                      )}
                    </p>
                  </div>

                  {/* Other project outcomes */}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-2">
                      <Layers3
                        className="h-4 w-4 shrink-0 text-[#0066EB]"
                        aria-hidden="true"
                      />
                      <h4 className="text-sm font-bold text-gray-950">
                        {t('Other project outcomes')}
                      </h4>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-gray-700 sm:text-sm sm:leading-6">
                      {t(
                        'Award, contract execution, physical progress, payment, and expenditure are separate facts. Evidence for one does not automatically establish the others.'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Keep exploring */}
        <section aria-labelledby="keep-exploring-heading">
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            {t('KEEP EXPLORING')}
          </p>
          <h2
            id="keep-exploring-heading"
            className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
          >
            {t('Continue exploring project and procurement data')}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            {t(
              'Use these related pages to inspect project records, evidence, statistics, and methodology.'
            )}
          </p>

          {/* Featured destinations */}
          <div className="mt-7 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2">
            <article className="flex h-full flex-col rounded-sm border border-gray-200 bg-white p-5 transition-colors hover:bg-[#F3F6FB] sm:p-6">
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                {t('PROJECT RECORDS')}
              </p>
              <h3 className="mt-2 text-xl font-bold text-gray-950">
                {t('City Projects')}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {t(
                  'Browse all published project records and filter by status, barangay, year, and project type.'
                )}
              </p>
              <div className="mt-auto pt-6">
                <Link
                  href="/projects/city-projects"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] hover:text-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                >
                  {t('Browse City Projects →')}
                </Link>
              </div>
            </article>

            <article className="flex h-full flex-col rounded-sm border border-gray-200 bg-white p-5 transition-colors hover:bg-[#F3F6FB] sm:p-6">
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                {t('ANALYSIS')}
              </p>
              <h3 className="mt-2 text-xl font-bold text-gray-950">
                {t('Procurement Statistics')}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {t(
                  'Review procurement evidence coverage and descriptive statistics across the current project collection.'
                )}
              </p>
              <div className="mt-auto pt-6">
                <Link
                  href="/statistics/procurement"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] hover:text-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                >
                  {t('View Procurement Statistics →')}
                </Link>
              </div>
            </article>
          </div>

          {/* Related resources */}
          <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white">
            <div className="divide-y divide-gray-200">
              {relatedResources.map(resource => (
                <Link
                  key={resource.href}
                  href={resource.href}
                  className="group flex items-center justify-between gap-4 p-4 transition-colors hover:bg-[#F3F6FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066EB] sm:p-5"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-950">
                      {resource.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
                      {resource.description}
                    </p>
                  </div>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-gray-400 transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-[#0066EB]"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
