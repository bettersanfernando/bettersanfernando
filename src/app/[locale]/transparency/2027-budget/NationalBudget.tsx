import { ArrowRight, ExternalLink } from 'lucide-react';
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

const STATUS_ORDER: NationalBudgetStatusValue[] = [
  'SAME_AMOUNT_IN_BOTH',
  'HOUSE_BILL_ONLY_CANDIDATE',
  'NEP_ONLY_CANDIDATE',
  'HIGHER_IN_HOUSE_BILL',
  'LOWER_IN_HOUSE_BILL',
];

const STATUS_TILE_CLASS: Record<NationalBudgetStatusValue, string> = {
  SAME_AMOUNT_IN_BOTH: 'bg-[#EBF3FC] text-[#0052BC]',
  HOUSE_BILL_ONLY_CANDIDATE: 'bg-gray-100 text-gray-800',
  NEP_ONLY_CANDIDATE: 'bg-gray-100 text-gray-800',
  HIGHER_IN_HOUSE_BILL: 'bg-gray-100 text-gray-800',
  LOWER_IN_HOUSE_BILL: 'bg-gray-100 text-gray-800',
};

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

// The stored evidence text is reviewer-facing and may cite repository paths,
// so the public page shows these reader-facing equivalents instead. An
// unrecognised value falls back to a generic line rather than leaking
// internal wording.
function getLocationEvidenceDisplay(
  record: NationalBudgetRecord,
  t: PageT
): string {
  switch (record.bettergov_record_id) {
    case 'house-reading:7757':
      return t(
        'The source title names "City of San Fernando, Pampanga" and the barangays Del Carmen, Bulaon and Calulut, which are City barangays.'
      );
    case 'house-reading:12396':
      return t(
        'The source title names "City of San Fernando, Pampanga", and the coordinates in the document fall inside the City boundary.'
      );
    case 'house-reading:12422':
      return t(
        'The source title names Barangay Lourdes (a City barangay) and "City of San Fernando, Pampanga"; the NEP and House Bill titles are identical.'
      );
    case 'house-reading:8004':
      return t(
        'The source title names Barangay Alasas (a City barangay) and "City of San Fernando, Pampanga"; the line is listed under the DPWH Pampanga 1st District Engineering Office.'
      );
    case 'house-reading:7959':
      return t(
        'The source title names Barangay San Felipe (a City barangay) and "City of San Fernando, Pampanga"; the line is listed under the DPWH Pampanga 1st District Engineering Office.'
      );
    case 'house-reading:16225':
      return t(
        'The source title names Sindalan (a City barangay) and "City of San Fernando, Pampanga"; the coordinates in the document fall inside the City boundary, and the line is listed under the DPWH Pampanga 1st District Engineering Office.'
      );
    default:
      return t(
        'Location association with the City of San Fernando, Pampanga was verified by hand against the source document.'
      );
  }
}

function SourceLink({
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
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm font-semibold text-[#0066EB] hover:text-[#0052BC] hover:underline focus-visible:outline-none focus-visible:underline"
    >
      <span>{t('{{document}}, p. {{page}}', { document: label, page })}</span>
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
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
    <ul className="space-y-1">
      {record.nep_source && (
        <li>
          <SourceLink
            label={t('NEP')}
            page={record.nep_source.page}
            url={record.nep_source.url}
            t={t}
          />
        </li>
      )}
      {record.house_source && (
        <li>
          <SourceLink
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

function RecordIdentity({
  record,
  t,
  evidence,
}: {
  record: NationalBudgetRecord;
  t: PageT;
  evidence: string;
}) {
  return (
    <>
      <p className="font-semibold text-gray-950">{record.title}</p>
      <p className="mt-1 text-xs text-gray-600">
        {record.program} · {record.program_line}
      </p>
      <p className="mt-1 text-xs text-gray-600">
        {record.agency} · {record.implementing_office}
      </p>
      <details className="mt-2 text-xs text-gray-600">
        <summary className="cursor-pointer font-semibold text-[#0066EB] hover:text-[#0052BC]">
          {t('Why this is associated with San Fernando')}
        </summary>
        <p className="mt-1 leading-relaxed">{evidence}</p>
      </details>
    </>
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
  const presentStatuses = STATUS_ORDER.filter(s => summaries[s].count > 0);
  const nepAmount = (record: NationalBudgetRecord) =>
    record.nep_amount_php === null ? (
      <span>
        <span aria-hidden="true">—</span>
        <span className="mt-0.5 block text-xs font-normal text-gray-500">
          {t('No NEP line found')}
        </span>
      </span>
    ) : (
      peso.format(record.nep_amount_php)
    );
  const houseAmount = (record: NationalBudgetRecord) =>
    record.house_amount_php === null ? (
      <span>
        <span aria-hidden="true">—</span>
        <span className="mt-0.5 block text-xs font-normal text-gray-500">
          {t('No House Bill line found')}
        </span>
      </span>
    ) : (
      peso.format(record.house_amount_php)
    );
  const unconfirmedBadge = (record: NationalBudgetRecord) =>
    record.unconfirmed_match ? (
      <span className="mt-1 inline-block rounded-xs bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
        {t('Unconfirmed pairing')}
      </span>
    ) : null;
  const statusBadge = (record: NationalBudgetRecord) => (
    <>
      <span
        className={`inline-block rounded-xs px-2 py-0.5 text-xs font-semibold ${STATUS_TILE_CLASS[record.comparison_status]}`}
      >
        {statusLabel(record.comparison_status, t)}
      </span>
      {unconfirmedBadge(record)}
    </>
  );
  const sameGroup = summaries.SAME_AMOUNT_IN_BOTH;
  const houseOnlyGroup = summaries.HOUSE_BILL_ONLY_CANDIDATE;
  const nepOnlyGroup = summaries.NEP_ONLY_CANDIDATE;

  return (
    <main className="flex-grow bg-white">
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[
              { label: t('Home'), href: '/' },
              { label: t('Transparency'), href: '/transparency' },
              { label: t('2027 National Budget') },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
            <div>
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                {t('TRANSPARENCY · FY2027 NATIONAL BUDGET')}
              </p>
              <h1 className="mt-1.5 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl lg:text-4xl">
                {t('2027 National Budget')}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base sm:leading-7">
                {t(
                  'Verified FY2027 proposed national-government budget project lines associated with the City of San Fernando, Pampanga, comparing the National Expenditure Program (NEP) with House Bill 10858.'
                )}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a
                  href="#project-lines"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-[#0066EB] px-5 text-sm font-semibold text-white transition hover:bg-[#0052BC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066EB]"
                >
                  <span>{t('View the project lines')}</span>
                </a>
                <Link
                  href="/transparency"
                  className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] transition hover:text-[#0052BC] hover:underline focus-visible:outline-none focus-visible:underline"
                >
                  <span>{t('Transparency overview')}</span>
                  <ArrowRight
                    className="h-4 w-4 transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>

            <aside className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
              <p className="text-eyebrow text-gray-500" style={eyebrowTracking}>
                {t('READ THIS FIRST')}
              </p>
              <h2 className="mt-1 text-sm font-bold text-gray-950">
                {t('Proposed national budget — not City spending')}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                {t(
                  'These lines are not City expenditures, procurement awards, contracts, fund releases, or proof that any project was built.'
                )}
              </p>
              <p className="mt-3 border-t border-gray-200/80 pt-2 text-[11px] text-gray-500">
                {t(
                  'Independent and community-run. Not an official City Government website.'
                )}
              </p>
            </aside>
          </div>
        </div>
      </section>

      <div className="container mx-auto space-y-12 px-4 pb-20 sm:space-y-16 sm:pb-24 lg:pb-28">
        <section aria-labelledby="summary-heading" className="pt-8 sm:pt-10">
          <h2 id="summary-heading" className="sr-only">
            {t('Summary')}
          </h2>
          <dl className="grid grid-cols-1 divide-y divide-gray-200 border-y border-gray-200 py-6 sm:grid-cols-2 sm:divide-y-0 sm:gap-6 lg:flex lg:gap-0 lg:divide-x lg:py-7">
            <div className="py-3 sm:py-0 lg:flex-1 lg:px-6 lg:first:pl-0">
              <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
                {t('Verified project lines')}
              </dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums text-gray-950 sm:text-3xl">
                {metadata.recordCount}
              </dd>
            </div>
            {presentStatuses.map(status => (
              <div
                key={status}
                className="py-3 sm:py-0 lg:flex-1 lg:px-6 lg:last:pr-0"
              >
                <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {statusLabel(status, t)}
                </dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-gray-950 sm:text-3xl">
                  {summaries[status].count}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
            <h3 className="text-sm font-bold text-gray-950">
              {t('How to read the amounts')}
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-gray-700">
              {sameGroup.count > 0 && (
                <li>
                  {t(
                    'Same in both versions: {{amount}} represented in each version.',
                    { amount: peso.format(sameGroup.houseAmountPhp) }
                  )}
                </li>
              )}
              {houseOnlyGroup.count > 0 && (
                <li>
                  {t(
                    'House Bill-only candidates: {{amount}}, with no corresponding NEP line found.',
                    { amount: peso.format(houseOnlyGroup.houseAmountPhp) }
                  )}
                </li>
              )}
              {nepOnlyGroup.count > 0 && (
                <li>
                  {t(
                    'NEP-only candidates: {{amount}}, with no corresponding House Bill line found.',
                    { amount: peso.format(nepOnlyGroup.nepAmountPhp) }
                  )}
                </li>
              )}
            </ul>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              {t(
                'The NEP and House Bill 10858 are alternative budget documents, and the two versions cover different sets of lines. Their amounts are never added or subtracted, so no overall NEP-versus-House Bill total is shown.'
              )}
            </p>
          </div>
        </section>

        <section
          id="project-lines"
          aria-labelledby="lines-heading"
          className="scroll-mt-24"
        >
          <h2
            id="lines-heading"
            className="text-xl font-bold text-gray-950 sm:text-2xl"
          >
            {t('Verified project lines')}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
            {t(
              'Each line is shown with the amount in each budget document and the page it appears on. Amounts are proposals, not spending.'
            )}
          </p>

          <div className="mt-6 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[54rem] border-collapse text-left text-sm">
              <caption className="sr-only">
                {t('Verified FY2027 national-budget project lines')}
              </caption>
              <thead>
                <tr className="border-b border-gray-300 text-xs uppercase tracking-wider text-gray-500">
                  <th scope="col" className="py-3 pr-4 font-bold">
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
                    <td className="py-4 pr-4">
                      <RecordIdentity
                        record={record}
                        t={t}
                        evidence={getLocationEvidenceDisplay(record, t)}
                      />
                    </td>
                    <td className="px-4 py-4 text-right font-semibold tabular-nums text-gray-950">
                      {nepAmount(record)}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold tabular-nums text-gray-950">
                      {houseAmount(record)}
                    </td>
                    <td className="px-4 py-4">{statusBadge(record)}</td>
                    <td className="py-4 pl-4">
                      <RecordSources record={record} t={t} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-6 divide-y divide-gray-200 border-y border-gray-200 md:hidden">
            {sorted.map(record => (
              <li key={record.id} className="space-y-3 py-5">
                <div>{statusBadge(record)}</div>
                <div>
                  <RecordIdentity
                    record={record}
                    t={t}
                    evidence={getLocationEvidenceDisplay(record, t)}
                  />
                </div>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      {t('NEP')}
                    </dt>
                    <dd className="mt-1 font-semibold tabular-nums text-gray-950">
                      {nepAmount(record)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">
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
        </section>

        <section
          aria-labelledby="method-heading"
          className="grid grid-cols-1 gap-8 rounded-sm border border-gray-200 bg-white p-6 sm:p-8 md:grid-cols-2"
        >
          <div>
            <h2 id="method-heading" className="text-xl font-bold text-gray-950">
              {t('How we verified these lines')}
            </h2>
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
                  'BetterGov does not currently provide a reliable structured municipality or PSGC field for these lines.'
                )}
              </li>
              <li>
                {t(
                  'Only confirmed City of San Fernando lines are published; uncertain lines stay unpublished.'
                )}
              </li>
            </ul>
          </div>
          <div className="md:border-l md:border-gray-200 md:pl-8">
            <h2 className="text-xl font-bold text-gray-950">
              {t('Coverage limitation')}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              {t(
                'This is a curated, partial list. It is not every national project in San Fernando, and it should not be read as the San Fernando 2027 budget.'
              )}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              {getNationalBudgetLimitationDisplay(t)}
            </p>
          </div>
        </section>

        <section aria-labelledby="sources-heading">
          <h2
            id="sources-heading"
            className="text-xl font-bold text-gray-950 sm:text-2xl"
          >
            {t('Sources and attribution')}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-700">
            {getNationalBudgetScopeNoteDisplay(t)}
          </p>

          <h3 className="mt-6 text-sm font-bold text-gray-950">
            {t('Budget documents')}
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm">
            {Object.entries(metadata.documents).map(([id, document]) => (
              <li key={id}>
                <a
                  href={document.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#0066EB] hover:text-[#0052BC] hover:underline"
                >
                  <span>{document.label}</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>

          <h3 className="mt-6 text-sm font-bold text-gray-950">
            {t('Attribution')}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-700">
            {metadata.attribution.text}
          </p>
          <p className="mt-2 text-sm">
            <a
              href={metadata.attribution.license_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#0066EB] hover:underline"
            >
              {t('CC BY 4.0 licence')}
            </a>
            {' · '}
            <a
              href={metadata.attribution.api_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#0066EB] hover:underline"
            >
              {t('BetterGov Budget API')}
            </a>
          </p>

          <div className="mt-6 rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
            <h3 className="text-sm font-bold text-gray-950">
              {t('BetterGov notice')}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-gray-600">
              {t(
                'The notice below is reproduced in English exactly as BetterGov publishes it.'
              )}
            </p>
            <p lang="en" className="mt-2 text-sm leading-relaxed text-gray-700">
              {metadata.attribution.bettergov_notice}
            </p>
          </div>

          <p className="mt-6 text-xs text-gray-500">
            {t(
              'Comparison data built {{builtAt}}, retrieved {{retrievedAt}}, last verified {{verifiedAt}}.',
              {
                builtAt: formatDate(
                  metadata.sourceSnapshot.built_at.slice(0, 10)
                ),
                retrievedAt: formatDate(metadata.sourceSnapshot.retrieved_at),
                verifiedAt: formatDate(metadata.lastVerified),
              }
            )}
          </p>
          <p className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
            <Link
              href="/transparency/sources"
              className="text-[#0066EB] hover:underline"
            >
              {t('Transparency sources')}
            </Link>
            <Link
              href="/transparency/methodology"
              className="text-[#0066EB] hover:underline"
            >
              {t('Transparency methodology')}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
