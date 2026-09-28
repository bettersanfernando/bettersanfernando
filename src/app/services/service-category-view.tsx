'use client';

import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Building2,
  Clock3,
  ExternalLink,
  FileText,
  Mail,
  Phone,
  ReceiptText,
  Search,
  SearchX,
  X,
} from 'lucide-react';
import Link from '../../components/i18n/LocaleLink';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { usePageT } from '../../components/i18n/PageMessages';
import type { PageT } from '../../i18n/page-t';
import {
  getServiceCategory,
  getServiceHref,
  getServices,
  type PublishedServiceCategory,
} from '../../data/civic/services';
import { getUtilitiesWaterResources } from '../../data/civic/utilitiesWaterResources';
import { getCategoryDisplay } from './categories';

// Client-side search/filter island for a single service category — the
// genuinely interactive part of src/pages/Services.tsx's ServiceCategory
// component, extracted so it can be shared between the (now-removed) legacy
// /services/{category} static routes and the Batch 4 [category] dispatcher
// without duplicating this ~300-line view. Rendered by
// src/app/services/[category]/page.tsx (a Server Component, since it
// also needs permanentRedirect()/notFound()) for a category segment that
// matched one of the 16 real PublishedServiceCategory values.

const utilitiesWaterResources = getUtilitiesWaterResources();
const services = getServices();
const SERVICES_PER_PAGE = 10;
const WHO_MAY_AVAIL_COLLAPSE_LENGTH = 220;

// BetterSanFernando-authored per-category introduction. Some categories
// (e.g. health-services) intentionally have no dedicated intro sentence yet
// and render nothing here, matching the pre-i18n behavior exactly.
function categoryIntro(
  category: PublishedServiceCategory,
  t: PageT
): string | null {
  switch (category) {
    case 'business':
      return t(
        'Reviewed services currently published from the Business License and Permit Division.'
      );
    case 'disaster-preparedness':
      return t(
        'Reviewed services currently published from the City Disaster Risk Reduction Management Office.'
      );
    case 'assistance-programs':
      return t(
        'A reviewed subset of City social-assistance services currently published from the City Social Welfare and Development Office.'
      );
    case 'social-welfare':
      return t(
        'A reviewed subset of Solo Parent identification and registration services currently published from the City Social Welfare and Development Office.'
      );
    case 'pwd-services':
      return t(
        'A reviewed subset of PWD identification and registration services currently published from the City Social Welfare and Development Office.'
      );
    case 'employment':
      return t(
        'Reviewed services currently published from the City Investment Promotions and Public Employment Services Office (CIPPESO), also known as the City Public Employment Services Office (CPESO).'
      );
    case 'agriculture-fisheries':
      return t(
        "Seven reviewed Citizen's Charter services currently published from the City Agriculture and Veterinary Office (CAVO), covering agriculture, crops, animal health, and meat regulation."
      );
    case 'education':
      return t(
        "Nine publication-reviewed Citizen's Charter services from the City College of San Fernando Pampanga (CCSFP)."
      );
    case 'environment':
      return t(
        "One publication-reviewed Citizen's Charter service currently published from the City Environment and Natural Resources Office (CENRO)."
      );
    case 'civil-registry':
      return t(
        "Fifteen publication-reviewed Citizen's Charter services currently published from the City Civil Registry Office (CCRO)."
      );
    case 'senior-citizens':
      return t(
        "Two publication-reviewed Citizen's Charter services currently published from the Office for Senior Citizen's Affairs (OSCA), under the City Mayor's Office."
      );
    case 'infrastructure-public-works':
      return t(
        "One publication-reviewed Citizen's Charter complaint-intake and referral procedure currently published from the City Administrator's Office (CAdminO), covering roads, bridges, drainage, streetlights, public buildings, and other City infrastructure concerns."
      );
    case 'housing-land-use':
      return t(
        "Two publication-reviewed Citizen's Charter certificate procedures currently published from the Office of the City Building Official (OCBO)."
      );
    case 'utilities-water':
      return t(
        "Nine publication-reviewed Citizen's Charter transactions currently published from the City of San Fernando Water District (CSFWD), a distinct Water District organized under Presidential Decree 198 — not a City Government office or City Engineer division."
      );
    case 'property-taxes':
    case 'health-services':
      return null;
  }
}

// BetterSanFernando-authored bounded-coverage caveat, one per category.
// Precision matters here: preserve every "bounded", "not a complete
// inventory", and exact count exactly as published in English.
function categoryCoverageNote(
  category: PublishedServiceCategory,
  t: PageT
): string {
  switch (category) {
    case 'assistance-programs':
    case 'social-welfare':
    case 'pwd-services':
      return t(
        'This is a bounded collection, not all assistance programs and not complete coverage of CSWDO or City social-welfare services.'
      );
    case 'employment':
      return t(
        'This is a bounded collection of seven reviewed CIPPESO/CPESO procedures, not a complete inventory of City employment programs, current job vacancies, or training-batch schedules.'
      );
    case 'agriculture-fisheries':
      return t(
        'This is a bounded collection of seven CAVO agriculture and veterinary procedures. No standalone fisheries Charter service is currently published, and this is not a complete inventory of City agriculture, fisheries, or veterinary programs, current seed/seedling/vaccine stock, or seminar and vaccination schedules.'
      );
    case 'education':
      return t(
        'This page does not announce a current admission or enrollment window. Service availability may depend on City College schedules, referrals, clinic staffing, and other published limitations.'
      );
    case 'environment':
      return t(
        'This is not a complete inventory of City environmental programs or transactions. Two tree-related certification records remain unpublished because their current Charter titles, output names, and public/private-property scopes conflict. National tree-cutting permits remain under the applicable DENR/PENRO process; CENRO is not presented here as the national permit issuer.'
      );
    case 'civil-registry':
      return t(
        'This is a bounded collection, not a complete inventory. CCRO handles local registration, certification, endorsement, and transmission; PSA documents and annotations, court matters, NACC/RACCO orders, and City Health Office services remain separate processes whose processing time is not included here.'
      );
    case 'senior-citizens':
      return t(
        'This is a bounded collection covering only new Senior Citizen ID issuance and lost-card replacement. Renewal, transfer, damaged-card replacement, record updates, and other OSCA programs are not covered here and their current procedures remain unverified.'
      );
    case 'infrastructure-public-works':
      return t(
        'This is a single bounded complaint-intake and referral procedure, not a repair service. Filing a complaint does not establish that the City owns or maintains the affected road, bridge, drainage facility, streetlight, or building; inspection, evaluation, funding, scheduling, resolution, and repair time are not stated and are not published here.'
      );
    case 'housing-land-use':
      return t(
        'This is a bounded collection of two OCBO certificate procedures, not a complete inventory of building, zoning, or land-use services. Building permits, certificates of occupancy, zoning clearances, and other building/zoning transactions remain unpublished pending source clarification. Fees follow the PD 1096 Schedule of Fees and applicable regulatory or ordinance charges; no fixed peso amount is shown, and the physical inspection itself is excluded from the published certificate-processing time.'
      );
    case 'utilities-water':
      return t(
        'This is a bounded collection of nine CSFWD Charter transactions, not a complete inventory of water-utility services. Service availability applies only within CSFWD/PW-CSF coverage — not every San Fernando barangay or property is served. No universal flat new-connection fee, online payment, online application, or 24/7 hotline or office is published; two separate reconnection procedures and one maintenance procedure covering eight technical subtypes are preserved as reviewed.'
      );
    case 'business':
    case 'disaster-preparedness':
    case 'health-services':
    case 'property-taxes':
      return t(
        'This is a bounded collection, not a complete inventory of City Government services.'
      );
  }
}

function ServiceRow({ service }: { service: (typeof services)[number] }) {
  const t = usePageT();
  const [showFullEligibility, setShowFullEligibility] = useState(false);
  const hasLongEligibility =
    service.who_may_avail.length > WHO_MAY_AVAIL_COLLAPSE_LENGTH;
  const eligibilityId = `eligibility-${service.slug}`;

  return (
    <article className="group px-4 py-6 transition-colors hover:bg-[#F3F6FB] md:px-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
        <div className="min-w-0">
          <h3 className="text-lg font-bold leading-snug text-gray-950 md:text-xl">
            <Link
              href={getServiceHref(service)}
              className="hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066EB]"
            >
              {service.title}
            </Link>
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
            {service.description}
          </p>
          <div className="mt-4 border-t border-gray-100 pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              {t('Who may avail')}
            </p>
            <p
              id={eligibilityId}
              className={`mt-1 max-w-prose text-sm leading-6 text-gray-700 ${hasLongEligibility && !showFullEligibility ? 'line-clamp-3' : ''}`}
            >
              {service.who_may_avail}
            </p>
            {hasLongEligibility && (
              <button
                type="button"
                aria-expanded={showFullEligibility}
                aria-controls={eligibilityId}
                onClick={() => setShowFullEligibility(value => !value)}
                className="mt-2 text-sm font-semibold text-[#0066EB] underline decoration-[#0066EB]/40 underline-offset-4 hover:text-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] focus-visible:ring-offset-2"
              >
                {showFullEligibility
                  ? t('Show less')
                  : t('Show full eligibility')}
              </button>
            )}
          </div>
        </div>
        <div className="grid gap-3 text-sm text-gray-700 sm:grid-cols-2 lg:grid-cols-1">
          <p className="flex items-start gap-2">
            <Clock3
              className="mt-0.5 h-4 w-4 shrink-0 text-[#0066EB]"
              aria-hidden="true"
            />
            <span>
              <span className="font-semibold text-gray-950">
                {t('Processing time:')}
              </span>{' '}
              {service.processing_time.text ??
                t("Not stated in the Citizen's Charter")}
            </span>
          </p>
          <p className="flex items-start gap-2">
            <FileText
              className="mt-0.5 h-4 w-4 shrink-0 text-[#0066EB]"
              aria-hidden="true"
            />
            <span>
              <span className="font-semibold text-gray-950">{t('Fee:')}</span>{' '}
              {service.fee.text ?? t("Not stated in the Citizen's Charter")}
            </span>
          </p>
          <Link
            href={getServiceHref(service)}
            className="group/details inline-flex items-center gap-1.5 font-semibold text-[#0066EB] hover:text-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] focus-visible:ring-offset-2"
            aria-label={t('View details for {{title}}', {
              title: service.title,
            })}
          >
            {t('View service details')}
            <ArrowUpRight
              className="h-4 w-4 transition-transform group-hover/details:-translate-y-0.5 group-hover/details:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function ServiceCategoryView({
  category,
}: {
  category: PublishedServiceCategory;
}) {
  const t = usePageT();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const display = getCategoryDisplay(category, t);
  const categoryServices = useMemo(
    () => services.filter(service => getServiceCategory(service) === category),
    [category]
  );
  const officeLabel = useMemo(
    () =>
      [...new Set(categoryServices.map(service => service.office.name))].join(
        ' · '
      ),
    [categoryServices]
  );
  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return categoryServices;

    return categoryServices.filter(service =>
      [service.title, service.description, service.who_may_avail].some(value =>
        value.toLowerCase().includes(normalizedQuery)
      )
    );
  }, [categoryServices, query]);
  const totalPages = Math.ceil(filteredServices.length / SERVICES_PER_PAGE);
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const paginatedServices = useMemo(
    () =>
      filteredServices.slice(
        (currentPage - 1) * SERVICES_PER_PAGE,
        currentPage * SERVICES_PER_PAGE
      ),
    [currentPage, filteredServices]
  );
  const assessorServices = useMemo(
    () =>
      paginatedServices.filter(service => service.office.acronym === 'CASSO'),
    [paginatedServices]
  );
  const treasurerServices = useMemo(
    () => paginatedServices.filter(service => service.office.acronym === 'CTO'),
    [paginatedServices]
  );
  const pageStart = filteredServices.length
    ? (currentPage - 1) * SERVICES_PER_PAGE + 1
    : 0;
  const pageEnd = Math.min(
    currentPage * SERVICES_PER_PAGE,
    filteredServices.length
  );
  const resultSummary =
    filteredServices.length === 0
      ? t('No matches')
      : filteredServices.length > SERVICES_PER_PAGE
        ? t('Showing {{start}}–{{end}} of {{total}} services', {
            start: pageStart,
            end: pageEnd,
            total: filteredServices.length,
          })
        : t(
            filteredServices.length === 1
              ? '{{count}} service'
              : '{{count}} services',
            { count: filteredServices.length }
          );

  return (
    <>
      <main className="flex-grow bg-white pb-16 md:pb-24">
        <section className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-14">
            <Breadcrumbs
              className="text-xs text-gray-500"
              items={[
                { label: t('Home'), href: '/' },
                { label: t('Services'), href: '/services' },
                { label: display.name },
              ]}
            />
            <div className="mt-6 max-w-3xl">
              <p className="text-eyebrow text-[#0066EB]">{t('Services')}</p>
              <h1 className="mt-3 text-3xl font-extrabold text-display text-gray-950 sm:text-4xl lg:text-5xl">
                {display.name}
              </h1>
              {category === 'property-taxes' ? (
                <p className="mt-4 text-lg font-medium leading-7 text-gray-800 sm:text-xl">
                  {t(
                    'Browse reviewed property assessment and City tax services from the City Assessor’s Office and City Treasurer’s Office.'
                  )}
                </p>
              ) : (
                categoryIntro(category, t) && (
                  <p className="mt-4 text-lg font-medium leading-7 text-gray-800 sm:text-xl">
                    {categoryIntro(category, t)}
                  </p>
                )
              )}
              {category !== 'property-taxes' && (
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {categoryCoverageNote(category, t)}
                </p>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-600">
                {category === 'property-taxes' ? (
                  <>
                    <span>
                      {t('{{count}} reviewed services', { count: 11 })}
                    </span>
                    <span>{t('{{count}} City offices', { count: 2 })}</span>
                    <span>{t('Official-source guidance')}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {t('{{count}} reviewed services', {
                        count: categoryServices.length,
                      })}
                    </span>
                    <span>{officeLabel}</span>
                    <span>{t('Official-source guidance')}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {category === 'property-taxes' && (
          <div className="container mx-auto space-y-12 px-4 py-10 sm:py-12 lg:space-y-16 lg:py-16">
            <section aria-labelledby="office-responsibilities-heading">
              <p className="text-eyebrow text-[#0066EB]">
                {t('Office Responsibilities')}
              </p>
              <h2
                id="office-responsibilities-heading"
                className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
              >
                {t('Who handles what?')}
              </h2>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <article className="border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <Building2
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#0066EB]"
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-gray-950">
                        City Assessor&rsquo;s Office
                      </h3>
                      <ul className="mt-4 space-y-2 border-t border-gray-200 pt-4 text-sm leading-6 text-gray-700">
                        <li>{t('Property appraisal')}</li>
                        <li>{t('Assessment records')}</li>
                        <li>{t('Ownership-record updates')}</li>
                        <li>{t('Tax mapping')}</li>
                        <li>{t('Assessment documents')}</li>
                      </ul>
                    </div>
                  </div>
                </article>

                <article className="border border-gray-200 bg-white p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <ReceiptText
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#0066EB]"
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-gray-950">
                        City Treasurer&rsquo;s Office
                      </h3>
                      <ul className="mt-4 space-y-2 border-t border-gray-200 pt-4 text-sm leading-6 text-gray-700">
                        <li>{t('Real property tax')}</li>
                        <li>{t('Tax collection and receipts')}</li>
                        <li>{t('Transfer tax')}</li>
                        <li>{t('Community Tax Certificates')}</li>
                        <li>{t('RPT / Amilyar')}</li>
                      </ul>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            <section
              aria-labelledby="coverage-notes-heading"
              className="border-t border-gray-200 pt-8"
            >
              <p className="text-eyebrow text-[#0066EB]">
                {t('Coverage Notes')}
              </p>
              <h2
                id="coverage-notes-heading"
                className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
              >
                {t('Coverage notes')}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700">
                {t(
                  'This is a bounded collection of eight Assessor and three Treasurer records, not a complete inventory of property or tax procedures.'
                )}
              </p>
              <ul className="mt-5 max-w-4xl divide-y divide-gray-200 border-y border-gray-200 text-sm leading-6 text-gray-700">
                <li className="py-3">
                  {t(
                    'Six additional Assessor services, Market Stall Rental, and one standalone RPT Clearance service remain under review.'
                  )}
                </li>
                <li className="py-3">
                  {t(
                    'No online RPT, transfer-tax, or CTC payment/application channel is currently published.'
                  )}
                </li>
                <li className="py-3">
                  {t(
                    'Land-title registration remains with the Registry of Deeds/LRA.'
                  )}
                </li>
                <li className="py-3">
                  {t('National tax requirements remain with the BIR.')}
                </li>
                <li className="py-3">
                  {t(
                    'Building, occupancy, zoning, and locational responsibilities remain with OCBO and CPDCO.'
                  )}
                </li>
                <li className="py-3">
                  {t(
                    'RPT account inquiry / statement-of-account information remains integrated within the RPT record, not published as a separate service.'
                  )}
                </li>
              </ul>
            </section>
          </div>
        )}

        <section
          className="border-t border-gray-200 bg-white"
          aria-labelledby="service-finder-heading"
        >
          <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
            <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,7fr)_minmax(0,13fr)] xl:items-end xl:gap-10">
              <div className="min-w-0">
                <p className="text-eyebrow text-[#0066EB]">
                  {t('Search Services')}
                </p>
                <h2
                  id="service-finder-heading"
                  className="mt-2 text-xl font-bold text-gray-950"
                >
                  {t('Find a service in this category')}
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  {t('Search by service name, description, or who may avail.')}
                </p>
                <p className="mt-3 text-xs font-medium text-gray-500">
                  {t(
                    categoryServices.length === 1
                      ? '{{count}} reviewed service'
                      : '{{count}} reviewed services',
                    { count: categoryServices.length }
                  )}
                </p>
              </div>

              <div className="relative min-w-0">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  id="service-search"
                  type="text"
                  value={query}
                  onChange={event => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder={t(
                    'Search permits, certificates, requirements...'
                  )}
                  aria-labelledby="service-finder-heading"
                  className="h-[52px] w-full rounded-sm border border-gray-300 bg-white pl-12 pr-12 text-base text-gray-900 outline-none placeholder:text-gray-500 focus:border-[#0066EB] focus:ring-2 focus:ring-[#0066EB]/20"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setPage(1);
                    }}
                    aria-label={t('Clear search')}
                    className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section
          className="container mx-auto px-4 py-8 sm:py-12 lg:py-16"
          aria-labelledby="services-list-heading"
        >
          <div className="flex flex-col justify-between gap-4 border-t border-b border-gray-200 py-5 md:flex-row md:items-end">
            <div>
              <h2
                id="services-list-heading"
                className="text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
              >
                {t('Reviewed Services')}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                {t('Compare requirements, timing, fees, and service details.')}
              </p>
            </div>
            <p className="text-xs font-medium text-gray-500" aria-live="polite">
              {resultSummary}
            </p>
          </div>

          {filteredServices.length ? (
            category === 'property-taxes' ? (
              <div className="space-y-10">
                {assessorServices.length > 0 && (
                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-lg font-bold text-gray-950">
                      City Assessor&rsquo;s Office
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {t(
                        assessorServices.length === 1
                          ? '{{count}} service'
                          : '{{count}} services',
                        { count: assessorServices.length }
                      )}
                    </p>
                    <div className="mt-3 divide-y divide-gray-200 border border-gray-200 bg-white">
                      {assessorServices.map(service => (
                        <ServiceRow key={service.id} service={service} />
                      ))}
                    </div>
                  </div>
                )}
                {treasurerServices.length > 0 && (
                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-lg font-bold text-gray-950">
                      City Treasurer&rsquo;s Office
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {t(
                        treasurerServices.length === 1
                          ? '{{count}} service'
                          : '{{count}} services',
                        { count: treasurerServices.length }
                      )}
                    </p>
                    <div className="mt-3 divide-y divide-gray-200 border border-gray-200 bg-white">
                      {treasurerServices.map(service => (
                        <ServiceRow key={service.id} service={service} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200 border border-gray-200 bg-white">
                {paginatedServices.map(service => (
                  <ServiceRow key={service.id} service={service} />
                ))}
              </div>
            )
          ) : (
            <div className="mx-auto max-w-3xl py-10">
              <div className="grid gap-5 rounded-sm border border-gray-200 bg-[#F3F6FB] px-5 py-8 text-center md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-6 md:px-7 md:text-left">
                <SearchX
                  className="mx-auto h-6 w-6 text-[#0066EB] md:mx-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-eyebrow text-[#0066EB]">
                    {t('Search Results')}
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-gray-950">
                    {t('No matching services')}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    {t(
                      'We couldn’t find a service matching “{{query}}”. Try another service name, requirement, or audience.',
                      { query: query.trim() }
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 md:flex-col md:items-stretch">
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setPage(1);
                    }}
                    className="rounded-sm bg-[#0066EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] focus-visible:ring-offset-2"
                  >
                    {t('Clear search')}
                  </button>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-1.5 rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:border-[#0066EB] hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] focus-visible:ring-offset-2"
                  >
                    {t('Browse all services')}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {filteredServices.length > SERVICES_PER_PAGE && (
            <nav
              className="mt-6 flex flex-wrap items-center justify-center gap-2"
              aria-label={t('Service results pagination')}
            >
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="cursor-pointer rounded-sm border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-[#0066EB] hover:text-[#0066EB] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                aria-label={t('Previous page')}
              >
                {t('Previous')}
              </button>
              <div className="flex items-center gap-1" aria-label={t('Pages')}>
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  const active = pageNumber === currentPage;
                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      aria-current={active ? 'page' : undefined}
                      aria-label={t('Page {{pageNumber}}', { pageNumber })}
                      className={`h-9 min-w-9 cursor-pointer rounded-sm border px-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] ${active ? 'border-[#0066EB] bg-[#0066EB] text-white' : 'border-gray-300 text-gray-700 hover:border-[#0066EB] hover:text-[#0066EB]'}`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="cursor-pointer rounded-sm border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-[#0066EB] hover:text-[#0066EB] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                aria-label={t('Next page')}
              >
                {t('Next')}
              </button>
            </nav>
          )}
        </section>

        {category === 'utilities-water' && (
          <section
            className="border-t border-gray-200 bg-white"
            aria-labelledby="supporting-resources-heading"
          >
            <div className="container mx-auto px-4 py-8 md:py-12">
              <h2
                id="supporting-resources-heading"
                className="text-2xl font-bold text-gray-900 md:text-3xl"
              >
                {t('Supporting resources')}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700">
                {t(
                  'These are CSFWD/PrimeWater support resources, not Charter transactions.'
                )}
              </p>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {utilitiesWaterResources.map(resource => (
                  <article
                    key={resource.id}
                    className="flex flex-col rounded-sm border border-gray-200 p-5"
                  >
                    <h3 className="text-lg font-bold text-gray-900">
                      {resource.title}
                    </h3>
                    {resource.resource_type === 'digital_utility' && (
                      <>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary-800">
                          {t('Inquiry tool — not online payment')}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-gray-700">
                          {resource.description}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-gray-700">
                          {resource.function_note}
                        </p>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-1.5 self-start font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                          aria-label={t('{{title}} (opens in a new tab)', {
                            title: resource.title,
                          })}
                        >
                          {t('Open Billing Inquiry')}
                          <ExternalLink
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        </a>
                        {resource.contact.phone && (
                          <p className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                            <Phone
                              className="h-4 w-4 shrink-0 text-primary-700"
                              aria-hidden="true"
                            />
                            {resource.contact.phone}
                          </p>
                        )}
                      </>
                    )}
                    {resource.resource_type === 'shared_support_resource' && (
                      <>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary-800">
                          {t('Shared customer support')}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-gray-700">
                          {resource.description}
                        </p>
                        <div className="mt-3 space-y-2 text-sm text-gray-700">
                          <p className="flex items-center gap-2">
                            <Mail
                              className="h-4 w-4 shrink-0 text-primary-700"
                              aria-hidden="true"
                            />
                            {resource.channels.email}
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone
                              className="h-4 w-4 shrink-0 text-primary-700"
                              aria-hidden="true"
                            />
                            {resource.channels.phone}
                          </p>
                          <p>
                            {t('Walk-in: {{walkIn}}', {
                              walkIn: resource.channels.walk_in,
                            })}
                          </p>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-gray-700">
                          <span className="font-semibold text-gray-900">
                            {t('Reply standard:')}
                          </span>{' '}
                          {resource.reply_standard}
                        </p>
                      </>
                    )}
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-xs leading-6 text-gray-600 marker:text-primary-700">
                      {resource.public_notes.map(note => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
