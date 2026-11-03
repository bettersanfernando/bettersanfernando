import { ArrowRight, ExternalLink, Info } from 'lucide-react';
import Link from '../../../../components/i18n/LocaleLink';
import Breadcrumbs from '../../../../components/ui/Breadcrumbs';
import {
  getNationalBudgetLimitationDisplay,
  getNationalBudgetMetadata,
  getNationalBudgetRecords,
  getNationalBudgetScopeNoteDisplay,
  type NationalBudgetRecord,
  type NationalBudgetStatusValue,
} from '../../../../data/civic/nationalBudget';
import type { PageT } from '../../../../i18n/page-t';
import { getPageT } from '../../../../i18n/server';
import { INTL_LOCALES } from '../../../../i18n/locale';
import { formatIsoDate } from '../../../../lib/utils';

const eyebrowTracking = { letterSpacing: '0.08em' };

const BUDGET_PORTAL_URL = 'https://budget.bettersanfernando.org';

const STATUS_PILL_CLASS: Record<NationalBudgetStatusValue, string> = {
  SAME_AMOUNT_IN_BOTH: 'bg-[#EBF3FC] text-[#0052BC]',
  HOUSE_BILL_ONLY_CANDIDATE: 'bg-gray-100 text-gray-800',
  NEP_ONLY_CANDIDATE: 'bg-gray-100 text-gray-800',
  HIGHER_IN_HOUSE_BILL: 'bg-gray-100 text-gray-800',
  LOWER_IN_HOUSE_BILL: 'bg-gray-100 text-gray-800',
};

const STATUS_DOT_CLASS: Record<NationalBudgetStatusValue, string> = {
  SAME_AMOUNT_IN_BOTH: 'bg-[#0066EB]',
  HOUSE_BILL_ONLY_CANDIDATE: 'bg-gray-500',
  NEP_ONLY_CANDIDATE: 'bg-gray-500',
  HIGHER_IN_HOUSE_BILL: 'bg-gray-500',
  LOWER_IN_HOUSE_BILL: 'bg-gray-500',
};

const cardClass = 'rounded-sm border border-gray-200 bg-white p-6 sm:p-7';
const cardHeadingClass = 'text-base font-bold text-gray-950 sm:text-lg';
const linkClass =
  'inline-flex items-center gap-1 font-semibold text-[#0066EB] underline decoration-[#0066EB]/30 underline-offset-2 transition hover:text-[#0052BC] hover:decoration-[#0052BC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066EB]';

function statusLabel(status: NationalBudgetStatusValue, t: PageT) {
  switch (status) {
    case 'SAME_AMOUNT_IN_BOTH':
      return t('Same in both versions');
    case 'HOUSE_BILL_ONLY_CANDIDATE':
      return t('House Bill only (candidate)');
    case 'NEP_ONLY_CANDIDATE':
      return t('NEP only (candidate)');
    case 'HIGHER_IN_HOUSE_BILL':
      return t('Higher in House Bill');
    case 'LOWER_IN_HOUSE_BILL':
      return t('Lower in House Bill');
  }
}

// Reader-facing names for the two budget documents; unknown documents fall
// back to the export's own label.
function documentDisplay(id: string, label: string, t: PageT) {
  switch (id) {
    case 'hb10858-3r-vol-ic':
      return {
        title: t('House Bill No. 10858'),
        detail: t(
          'FY2027 General Appropriations Bill · Third Reading · Volume I-C'
        ),
      };
    case 'nep2027-vol-iib':
      return {
        title: t('FY2027 National Expenditure Program'),
        detail: t('Volume II-B'),
      };
    default:
      return { title: label, detail: null };
  }
}

function ExternalAnchor({
  href,
  label,
  t,
  className = linkClass,
}: {
  href: string;
  label: string;
  t: PageT;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('{{label}} (opens in a new tab)', { label })}
      className={className}
    >
      <span>{label}</span>
      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    </a>
  );
}

function SourceChip({
  label,
  page,
  url,
  t,
}: {
  label: string;
  page: number;
  url: string;
  t: PageT;
}) {
  const text = t('{{document}}, p. {{page}}', { document: label, page });
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('{{label}} (opens in a new tab)', { label: text })}
      className="inline-flex items-center gap-1.5 rounded-xs border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-[#0066EB] transition hover:border-[#0066EB] hover:text-[#0052BC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0066EB]"
    >
      <span>{text}</span>
      <ExternalLink className="h-3 w-3" aria-hidden="true" />
    </a>
  );
}

function RecordSources({
  record,
  t,
}: {
  record: NationalBudgetRecord;
  t: PageT;
}) {
  return (
    <ul className="flex flex-wrap gap-2 md:flex-col md:items-start">
      {record.nep_source && (
        <li>
          <SourceChip
            label={t('NEP')}
            page={record.nep_source.page}
            url={record.nep_source.url}
            t={t}
          />
        </li>
      )}
      {record.house_source && (
        <li>
          <SourceChip
            label={t('House Bill 10858')}
            page={record.house_source.page}
            url={record.house_source.url}
            t={t}
          />
        </li>
      )}
    </ul>
  );
}

function RecordIdentity({ record }: { record: NationalBudgetRecord }) {
  return (
    <>
      <p className="text-[15px] font-semibold leading-snug text-gray-950">
        {record.title}
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-gray-600">
        {record.program} · {record.program_line}
      </p>
      <p className="mt-0.5 text-xs text-gray-500">
        {record.agency} · {record.implementing_office}
      </p>
    </>
  );
}

// BetterGov's notice ends with a raw "Read the full notice: <url>" pointer.
// The link is rendered separately with a readable label, so the pointer is
// dropped from the paragraph text; the wording above it is untouched.
function splitNotice(notice: string) {
  const [body] = notice.split(/\s*Read the full notice:/);
  const sentences = body.split(/(?<=\.)\s+/);
  return [sentences.slice(0, 4).join(' '), sentences.slice(4).join(' ')].filter(
    Boolean
  );
}

export default async function NationalBudgetView() {
  const { t, locale } = await getPageT('transparency-2027-budget');
  const records = getNationalBudgetRecords();
  const metadata = getNationalBudgetMetadata();
  const peso = new Intl.NumberFormat(INTL_LOCALES[locale], {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  });
  const formatDate = (iso: string) => formatIsoDate(iso, locale);
  const sorted = [...records].sort(
    (a, b) => (b.house_amount_php ?? 0) - (a.house_amount_php ?? 0)
  );
  const summaries = metadata.statusSummaries;
  const sameGroup = summaries.SAME_AMOUNT_IN_BOTH;
  const houseOnlyGroup = summaries.HOUSE_BILL_ONLY_CANDIDATE;
  const nepOnlyGroup = summaries.NEP_ONLY_CANDIDATE;
  const noticeParagraphs = splitNotice(metadata.attribution.bettergov_notice);

  const missingLine = (label: string) => (
    <span>
      <span aria-hidden="true" className="text-gray-400">
        —
      </span>
      <span className="mt-0.5 block text-xs font-normal text-gray-500">
        {label}
      </span>
    </span>
  );
  const nepAmount = (record: NationalBudgetRecord) =>
    record.nep_amount_php === null
      ? missingLine(t('No NEP line found'))
      : peso.format(record.nep_amount_php);
  const houseAmount = (record: NationalBudgetRecord) =>
    record.house_amount_php === null
      ? missingLine(t('No House Bill line found'))
      : peso.format(record.house_amount_php);
  const statusBadge = (record: NationalBudgetRecord) => (
    <>
      <span
        className={`inline-flex items-center gap-1.5 rounded-xs px-2 py-1 text-xs font-semibold ${STATUS_PILL_CLASS[record.comparison_status]}`}
      >
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_CLASS[record.comparison_status]}`}
        />
        {statusLabel(record.comparison_status, t)}
      </span>
      {record.unconfirmed_match && (
        <span className="mt-1.5 block text-[11px] font-semibold text-amber-800">
          {t('Unconfirmed pairing')}
        </span>
      )}
    </>
  );

  return (
    <main className="flex-grow bg-white">
      <section className="border-b border-gray-200 bg-[#F8FAFC]">
        <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-10">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[
              { label: t('Home'), href: '/' },
              { label: t('Transparency'), href: '/transparency' },
              { label: t('2027 National Budget') },
            ]}
          />

          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[54fr_46fr] lg:items-center lg:gap-12">
            <div className="flex flex-col">
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                {t('TRANSPARENCY · FY2027 NATIONAL BUDGET')}
              </p>
              <h1 className="mt-1.5 text-4xl font-bold tracking-[-0.03em] text-gray-950 sm:text-5xl lg:text-6xl">
                {t('2027 National Budget')}
              </h1>
              <p className="mt-3 mb-6 max-w-xl text-base leading-relaxed text-gray-700 sm:text-lg sm:leading-8">
                {t(
                  'Verified FY2027 proposed national-government budget project lines associated with the City of San Fernando, Pampanga, comparing the National Expenditure Program (NEP) with House Bill 10858.'
                )}
              </p>

              <div className="flex gap-3 rounded-sm border border-amber-200 bg-amber-50 p-4 sm:p-5 lg:mt-auto">
                <Info
                  className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="text-base font-bold text-gray-950">
                    {t('Proposed national budget — not City spending')}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-gray-700">
                    {t(
                      'These lines are not City expenditures, procurement awards, contracts, fund releases, or proof that any project was built.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-sm border border-[#0066EB]/25 bg-[#F3F8FE] p-5 sm:p-6">
              <p
                className="text-eyebrow text-[#0052BC]"
                style={eyebrowTracking}
              >
                {t('FY2027 BUDGET COMPARISON')}
              </p>

              <div className="mt-4 grid grid-cols-1 border-t border-[#0066EB]/20 sm:grid-cols-2 sm:divide-x sm:divide-[#0066EB]/20">
                <div className="py-5 sm:pr-6">
                  <p className="text-xs font-semibold uppercase leading-snug tracking-wider text-gray-600">
                    {t('National Expenditure Program')}
                  </p>
                  <p className="mt-2 text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-950">
                    {t('NEP')}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{t('FY2027')}</p>
                </div>
                <div className="border-t border-[#0066EB]/20 py-5 sm:border-t-0 sm:pl-6">
                  <p className="text-xs font-semibold uppercase leading-snug tracking-wider text-gray-600">
                    {t('House Bill No. 10858')}
                  </p>
                  <p className="mt-2 text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-950">
                    {t('Third Reading')}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{t('FY2027')}</p>
                </div>
              </div>

              <div className="border-t border-[#0066EB]/20 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0052BC]">
                  {t('{{count}} verified project lines', {
                    count: metadata.recordCount,
                  })}
                </p>
                <p className="mt-0.5 text-sm text-gray-700">
                  {t('City of San Fernando, Pampanga')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto space-y-14 px-4 pb-16 pt-10 sm:space-y-16 sm:pb-20 sm:pt-12 lg:pb-24">
        <section
          id="project-lines"
          aria-labelledby="lines-heading"
          className="scroll-mt-24"
        >
          <h2
            id="lines-heading"
            className="text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
          >
            {t('Verified project lines')}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600 sm:text-base">
            {t(
              'Each line shows the amount in each budget document and the page it appears on. Amounts are proposals, not spending.'
            )}
          </p>

          <div className="mt-6 rounded-sm bg-[#F3F6FB] p-5 sm:p-6">
            <h3 className="text-sm font-bold text-gray-950">
              {t('How to read the amounts')}
            </h3>
            <div className="mt-4 grid grid-cols-1 divide-y divide-gray-300/70 md:grid-cols-[1fr_1fr_1.4fr] md:divide-x md:divide-y-0">
              {sameGroup.count > 0 && (
                <div className="py-4 first:pt-0 md:px-6 md:py-0 md:first:pl-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {t('Same in both versions')}
                  </p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-gray-950">
                    {peso.format(sameGroup.houseAmountPhp)}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-600">
                    {t('represented in each version')}
                  </p>
                </div>
              )}
              {houseOnlyGroup.count > 0 && (
                <div className="py-4 md:px-6 md:py-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {t('House Bill-only candidates')}
                  </p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-gray-950">
                    {peso.format(houseOnlyGroup.houseAmountPhp)}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-600">
                    {t('with no corresponding NEP line found')}
                  </p>
                </div>
              )}
              {nepOnlyGroup.count > 0 && (
                <div className="py-4 md:px-6 md:py-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {t('NEP-only candidates')}
                  </p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-gray-950">
                    {peso.format(nepOnlyGroup.nepAmountPhp)}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-600">
                    {t('with no corresponding House Bill line found')}
                  </p>
                </div>
              )}
              <div className="py-4 last:pb-0 md:py-0 md:pl-6 md:pr-0">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {t('Important')}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-700">
                  {t(
                    'The NEP and House Bill 10858 are alternative budget documents, and the two versions cover different sets of lines. Their amounts are never added or subtracted, so no overall NEP-versus-House Bill total is shown.'
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[54rem] border-collapse text-left text-sm">
              <caption className="sr-only">
                {t('Verified FY2027 national-budget project lines')}
              </caption>
              <thead>
                <tr className="border-b-2 border-gray-900 text-[11px] uppercase tracking-wider text-gray-500">
                  <th scope="col" className="py-3 pr-6 font-bold">
                    {t('Project line')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-bold">
                    {t('NEP')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-bold">
                    {t('House Bill 10858')}
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    {t('Comparison')}
                  </th>
                  <th scope="col" className="py-3 pl-4 font-bold">
                    {t('Source pages')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sorted.map(record => (
                  <tr key={record.id} className="align-top">
                    <td className="max-w-md py-5 pr-6">
                      <RecordIdentity record={record} />
                    </td>
                    <td className="px-4 py-5 text-right text-[15px] font-semibold tabular-nums text-gray-950">
                      {nepAmount(record)}
                    </td>
                    <td className="px-4 py-5 text-right text-[15px] font-semibold tabular-nums text-gray-950">
                      {houseAmount(record)}
                    </td>
                    <td className="px-4 py-5">{statusBadge(record)}</td>
                    <td className="py-5 pl-4">
                      <RecordSources record={record} t={t} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-6 space-y-4 md:hidden">
            {sorted.map(record => (
              <li
                key={record.id}
                className="space-y-4 rounded-sm border border-gray-200 bg-white p-4"
              >
                <div>{statusBadge(record)}</div>
                <div>
                  <RecordIdentity record={record} />
                </div>
                <dl className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      {t('NEP')}
                    </dt>
                    <dd className="mt-1 font-semibold tabular-nums text-gray-950">
                      {nepAmount(record)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      {t('House Bill 10858')}
                    </dt>
                    <dd className="mt-1 font-semibold tabular-nums text-gray-950">
                      {houseAmount(record)}
                    </dd>
                  </div>
                </dl>
                <RecordSources record={record} t={t} />
              </li>
            ))}
          </ul>

          <div className="mt-8 max-w-2xl rounded-sm bg-[#F3F6FB] p-5">
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              {t('INTERACTIVE BUDGET EXPLORER')}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              {t(
                'Explore these FY2027 national-budget projects associated with San Fernando in an interactive view, with office, district, and broader budget context.'
              )}
            </p>
            <p className="mt-3 text-sm">
              <ExternalAnchor
                href={BUDGET_PORTAL_URL}
                label={t('Explore the full budget portal')}
                t={t}
              />
            </p>
          </div>
        </section>

        <section aria-labelledby="about-heading">
          <div>
            <div>
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                {t('ABOUT THIS DATA')}
              </p>
              <h2
                id="about-heading"
                className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
              >
                {t('Sources, method and limits')}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">
                {t(
                  '{{count}} FY2027 national-budget project lines were verified as associated with the City of San Fernando, Pampanga. These are proposed national appropriations, not City spending or proof of implementation.',
                  { count: metadata.recordCount }
                )}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            <article className={cardClass}>
              <h3 className={cardHeadingClass}>
                {t('How we reviewed these lines')}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                {getNationalBudgetScopeNoteDisplay(t)}
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-700">
                <li>
                  {t(
                    'The structured NEP and House Bill comparison comes from the BetterGov.ph Budget API.'
                  )}
                </li>
                <li>
                  {t(
                    'BetterSanFernando checks by hand whether each line is associated with the City of San Fernando, Pampanga, using the place and barangay names in the source title and, where present, the coordinates in the document.'
                  )}
                </li>
                <li>
                  {t(
                    'Only confirmed City of San Fernando lines are published; uncertain lines stay unpublished.'
                  )}
                </li>
              </ul>
            </article>
            <article className={cardClass}>
              <h3 className={cardHeadingClass}>
                {t('Coverage and limitations')}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                {t(
                  'This is a curated, partial list. It is not every national project in San Fernando, and it should not be read as the San Fernando 2027 budget.'
                )}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {t(
                  'BetterGov does not currently provide a reliable structured municipality or PSGC field for these lines.'
                )}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {getNationalBudgetLimitationDisplay(t)}
              </p>
            </article>
          </div>

          <article className={`${cardClass} mt-5`}>
            <h3 className={cardHeadingClass}>{t('Sources and attribution')}</h3>
            <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-[2fr_3fr] md:gap-0 md:divide-x md:divide-gray-200">
              <section aria-labelledby="documents-heading" className="md:pr-8">
                <h4
                  id="documents-heading"
                  className="text-xs font-bold uppercase tracking-wider text-gray-500"
                >
                  {t('Official budget documents')}
                </h4>
                <ul className="mt-3 space-y-4 text-sm">
                  {Object.entries(metadata.documents).map(([id, document]) => {
                    const display = documentDisplay(id, document.label, t);
                    return (
                      <li key={id}>
                        <ExternalAnchor
                          href={document.pdf_url}
                          label={display.title}
                          t={t}
                        />
                        {display.detail && (
                          <p className="mt-1 text-gray-600">{display.detail}</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-5 border-t border-gray-200 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {t('Source snapshot')}
                  </h4>
                  <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
                    <dt className="text-gray-500">{t('Comparison built')}</dt>
                    <dd className="text-right font-semibold text-gray-900">
                      {formatDate(
                        metadata.sourceSnapshot.built_at.slice(0, 10)
                      )}
                    </dd>
                    <dt className="text-gray-500">{t('Data retrieved')}</dt>
                    <dd className="text-right font-semibold text-gray-900">
                      {formatDate(metadata.sourceSnapshot.retrieved_at)}
                    </dd>
                    <dt className="text-gray-500">{t('Last verified')}</dt>
                    <dd className="text-right font-semibold text-gray-900">
                      {formatDate(metadata.lastVerified)}
                    </dd>
                  </dl>
                </div>
              </section>

              <section
                aria-labelledby="attribution-heading"
                className="md:pl-8"
              >
                <h4
                  id="attribution-heading"
                  className="text-xs font-bold uppercase tracking-wider text-gray-500"
                >
                  {t('Data and attribution')}
                </h4>
                <dl className="mt-3 space-y-4 text-sm leading-relaxed">
                  <div>
                    <dt className="font-semibold text-gray-950">
                      {t('Data comparison')}
                    </dt>
                    <dd className="mt-0.5 text-gray-700">
                      {t(
                        'Structured comparison data from the BetterGov.ph Budget API, licensed CC BY 4.0. Independent and unofficial; filtered and re-verified for the City of San Fernando, Pampanga.'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-950">
                      {t('Government source documents')}
                    </dt>
                    <dd className="mt-0.5 text-gray-700">
                      {t(
                        'Figures are traced to the FY2027 National Expenditure Program and House Bill No. 10858.'
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-gray-950">
                      {t('Analysis provenance')}
                    </dt>
                    <dd className="mt-0.5 text-gray-700">
                      {t(
                        'Based in part on the public FY2027 NEP–House Bill analysis repository.'
                      )}
                    </dd>
                  </div>
                </dl>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-gray-200 pt-4 text-sm">
                  <li>
                    <ExternalAnchor
                      href={metadata.attribution.license_url}
                      label={t('CC BY 4.0 licence')}
                      t={t}
                    />
                  </li>
                  <li>
                    <ExternalAnchor
                      href={metadata.attribution.api_url}
                      label={t('BetterGov Budget API')}
                      t={t}
                    />
                  </li>
                  <li>
                    <ExternalAnchor
                      href={metadata.sourceSnapshot.source_repo}
                      label={t('FY2027 analysis repository')}
                      t={t}
                    />
                  </li>
                </ul>
              </section>
            </div>
          </article>

          <div className="mt-5 grid grid-cols-1 gap-5 rounded-sm bg-[#F3F6FB] p-6 sm:p-7 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-0">
            <div className="lg:pr-8">
              <h3 className="text-base font-bold text-gray-950">
                {t('BetterGov notice')}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {t(
                  'The notice below is reproduced in English exactly as BetterGov publishes it.'
                )}
              </p>
            </div>
            <div className="lg:border-l lg:border-gray-300/70 lg:pl-8">
              <div
                lang="en"
                className="space-y-3 text-sm leading-relaxed text-gray-700"
              >
                {noticeParagraphs.map(paragraph => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <p className="mt-4 text-sm">
                <ExternalAnchor
                  href={metadata.attribution.disclaimer_url}
                  label={t('Read BetterGov’s full methodology and disclaimer')}
                  t={t}
                />
              </p>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-eyebrow text-gray-500" style={eyebrowTracking}>
              {t('LEARN MORE')}
            </h3>
            <ul className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <li>
                <Link
                  href="/transparency/sources"
                  className="group flex h-full items-start justify-between gap-4 rounded-sm border border-gray-200 bg-white p-5 transition hover:border-[#0066EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066EB]"
                >
                  <span>
                    <span className="block text-base font-bold text-gray-950">
                      {t('Transparency sources')}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-gray-600">
                      {t(
                        'See where BetterSanFernando’s published information comes from.'
                      )}
                    </span>
                  </span>
                  <ArrowRight
                    className="mt-1 h-5 w-5 shrink-0 text-[#0066EB] transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
              <li>
                <Link
                  href="/transparency/methodology"
                  className="group flex h-full items-start justify-between gap-4 rounded-sm border border-gray-200 bg-white p-5 transition hover:border-[#0066EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066EB]"
                >
                  <span>
                    <span className="block text-base font-bold text-gray-950">
                      {t('How we verify data')}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-gray-600">
                      {t(
                        'Understand how BetterSanFernando reviews and verifies civic information.'
                      )}
                    </span>
                  </span>
                  <ArrowRight
                    className="mt-1 h-5 w-5 shrink-0 text-[#0066EB] transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
