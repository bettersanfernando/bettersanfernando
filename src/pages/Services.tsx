import { useMemo, useState } from 'react';
import {
  Clock3,
  ExternalLink,
  FileText,
  Mail,
  Phone,
  Search,
} from 'lucide-react';
import { Link } from 'react-router';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import {
  getServiceCategory,
  getServiceHref,
  getServices,
  type PublishedServiceCategory,
} from '../data/civic/services';
import { getUtilitiesWaterResources } from '../data/civic/utilitiesWaterResources';

const utilitiesWaterResources = getUtilitiesWaterResources();

const services = getServices();
const categories = [
  [
    'Business Services',
    'business',
    'Permits, registration guidance, and business information.',
    'published',
  ],
  [
    'Employment',
    'employment',
    'Employment services, opportunities, and workforce support.',
    'published',
  ],
  [
    'Health Services',
    'health-services',
    'Local health services and access guidance.',
    'published',
  ],
  [
    'Education Services',
    'education',
    'Reviewed City College services and student support procedures.',
    'published',
  ],
  [
    'Assistance Programs',
    'assistance-programs',
    'Public assistance programs and eligibility guidance.',
    'published',
  ],
  [
    'Social Welfare',
    'social-welfare',
    'Local social-welfare services and referral routes.',
    'published',
  ],
  [
    'Senior Citizens',
    'senior-citizens',
    'Reviewed OSCA senior citizen ID application and replacement procedures.',
    'published',
  ],
  [
    'PWD Services',
    'pwd-services',
    'Services and support for persons with disabilities.',
    'published',
  ],
  [
    'Civil Registry',
    'civil-registry',
    'Reviewed local civil-registration and certification procedures.',
    'published',
  ],
  [
    'Infrastructure & Public Works',
    'infrastructure-public-works',
    'Reviewed complaint intake and referral procedure for roads, bridges, drainage, streetlights, and public facilities.',
    'published',
  ],
  [
    'Housing & Land Use',
    'housing-land-use',
    'Reviewed OCBO annual inspection, operation, and electrical-completion certificate procedures.',
    'published',
  ],
  [
    'Utilities & Water',
    'utilities-water',
    'Reviewed CSFWD water-service transactions plus billing-inquiry and complaints resources.',
    'published',
  ],
  [
    'Property & Taxes',
    'property-taxes',
    'Reviewed City Assessor and City Treasurer property-tax procedures.',
    'published',
  ],
  [
    'Agriculture & Fisheries',
    'agriculture-fisheries',
    'Local CAVO agriculture, crop, animal health, and meat-regulation services.',
    'published',
  ],
  [
    'Environment',
    'environment',
    'Reviewed environmental services and access guidance.',
    'published',
  ],
  [
    'Disaster Preparedness',
    'disaster-preparedness',
    'Preparedness guidance and reviewed response services.',
    'published',
  ],
] as const;

function ServicesHub() {
  return (
    <>
      <SEO
        title="Services"
        description="Browse BetterSanFernando's progressively published City service guidance by need."
        keywords="San Fernando Pampanga services, city services, resident services"
      />
      <main className="flex-grow bg-gray-50">
        <section className="border-b border-primary-100 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <Breadcrumbs
              className="mb-8"
              items={[{ label: 'Home', href: '/' }, { label: 'Services' }]}
            />
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                Services
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
                Browse City service guidance by need. BetterSanFernando is
                progressively publishing reviewed information, so these
                categories are not complete service inventories.
              </p>
            </div>
          </div>
        </section>

        <section
          className="container mx-auto px-4 py-8 md:py-12"
          aria-labelledby="service-categories-heading"
        >
          <h2
            id="service-categories-heading"
            className="text-2xl font-bold text-gray-900 md:text-3xl"
          >
            Browse by need
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700">
            Published categories contain reviewed service records. Planned
            categories remain visible while their local sources are prepared.
          </p>
          <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map(([name, slug, description, status]) => (
              <article
                key={slug}
                className="flex flex-col border border-gray-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    <Link
                      to={`/services/${slug}`}
                      className="hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600"
                    >
                      {name}
                    </Link>
                  </h3>
                  <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-800">
                    {status === 'published' ? 'Published' : 'Planned'}
                  </span>
                </div>
                <p className="mt-3 flex-grow text-sm leading-6 text-gray-700">
                  {description}
                </p>
                <Link
                  to={`/services/${slug}`}
                  className="mt-5 inline-flex self-start font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                >
                  {status === 'published'
                    ? 'Browse reviewed services'
                    : 'View planned section'}
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function ServiceCard({ service }: { service: (typeof services)[number] }) {
  return (
    <article className="py-7">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10">
        <div className="min-w-0">
          <h3 className="text-xl font-bold leading-snug text-gray-900 md:text-2xl">
            <Link
              to={getServiceHref(service)}
              className="hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600"
            >
              {service.title}
            </Link>
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700">
            {service.description}
          </p>
          <p className="mt-3 text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Who may avail:</span>{' '}
            {service.who_may_avail}
          </p>
        </div>
        <div className="space-y-3 text-sm text-gray-700">
          <p className="flex items-start gap-2">
            <Clock3
              className="mt-0.5 h-4 w-4 shrink-0 text-primary-700"
              aria-hidden="true"
            />
            <span>
              <span className="font-semibold text-gray-900">
                Processing time:
              </span>{' '}
              {service.processing_time.text ??
                "Not stated in the Citizen's Charter"}
            </span>
          </p>
          <p className="flex items-start gap-2">
            <FileText
              className="mt-0.5 h-4 w-4 shrink-0 text-primary-700"
              aria-hidden="true"
            />
            <span>
              <span className="font-semibold text-gray-900">Fee:</span>{' '}
              {service.fee.text ?? "Not stated in the Citizen's Charter"}
            </span>
          </p>
          <Link
            to={getServiceHref(service)}
            className="inline-flex font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
            aria-label={`View details for ${service.title}`}
          >
            View service details
          </Link>
        </div>
      </div>
    </article>
  );
}

function ServiceCategory({ category }: { category: PublishedServiceCategory }) {
  const [query, setQuery] = useState('');
  const [name] = categories.find(item => item[1] === category)!;
  const categoryServices = useMemo(
    () => services.filter(service => getServiceCategory(service) === category),
    [category]
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
  const assessorServices = useMemo(
    () =>
      filteredServices.filter(service => service.office.acronym === 'CASSO'),
    [filteredServices]
  );
  const treasurerServices = useMemo(
    () => filteredServices.filter(service => service.office.acronym === 'CTO'),
    [filteredServices]
  );

  return (
    <>
      <SEO
        title={name}
        description={`Browse ${categoryServices.length} reviewed ${name.toLowerCase()} records published by BetterSanFernando.`}
      />
      <main className="flex-grow bg-gray-50">
        <section className="border-b border-primary-100 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <Breadcrumbs
              className="mb-8"
              items={[
                { label: 'Home', href: '/' },
                { label: 'Services', href: '/services' },
                { label: name },
              ]}
            />
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                {name}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
                {category === 'business' &&
                  'Reviewed services currently published from the Business License and Permit Division.'}
                {category === 'disaster-preparedness' &&
                  'Reviewed services currently published from the City Disaster Risk Reduction Management Office.'}
                {category === 'assistance-programs' &&
                  'A reviewed subset of City social-assistance services currently published from the City Social Welfare and Development Office.'}
                {category === 'social-welfare' &&
                  'A reviewed subset of Solo Parent identification and registration services currently published from the City Social Welfare and Development Office.'}
                {category === 'pwd-services' &&
                  'A reviewed subset of PWD identification and registration services currently published from the City Social Welfare and Development Office.'}
                {category === 'employment' &&
                  'Reviewed services currently published from the City Investment Promotions and Public Employment Services Office (CIPPESO), also known as the City Public Employment Services Office (CPESO).'}
                {category === 'agriculture-fisheries' &&
                  "Seven reviewed Citizen's Charter services currently published from the City Agriculture and Veterinary Office (CAVO), covering agriculture, crops, animal health, and meat regulation."}
                {category === 'education' &&
                  "Nine publication-reviewed Citizen's Charter services from the City College of San Fernando Pampanga (CCSFP)."}
                {category === 'environment' &&
                  "One publication-reviewed Citizen's Charter service currently published from the City Environment and Natural Resources Office (CENRO)."}
                {category === 'civil-registry' &&
                  "Fifteen publication-reviewed Citizen's Charter services currently published from the City Civil Registry Office (CCRO)."}
                {category === 'senior-citizens' &&
                  "Two publication-reviewed Citizen's Charter services currently published from the Office for Senior Citizen's Affairs (OSCA), under the City Mayor's Office."}
                {category === 'infrastructure-public-works' &&
                  "One publication-reviewed Citizen's Charter complaint-intake and referral procedure currently published from the City Administrator's Office (CAdminO), covering roads, bridges, drainage, streetlights, public buildings, and other City infrastructure concerns."}
                {category === 'housing-land-use' &&
                  "Two publication-reviewed Citizen's Charter certificate procedures currently published from the Office of the City Building Official (OCBO)."}
                {category === 'utilities-water' &&
                  "Nine publication-reviewed Citizen's Charter transactions currently published from the City of San Fernando Water District (CSFWD), a distinct Water District organized under Presidential Decree 198 — not a City Government office or City Engineer division."}
                {category === 'property-taxes' &&
                  "Eleven publication-reviewed Citizen's Charter records currently published from two offices with distinct responsibilities. The City Assessor's Office handles appraisal, assessment, tax declarations, ownership-record updates, tax mapping, and assessment documents. The City Treasurer's Office handles tax computation, collection, payment records, receipts, transfer tax, RPT/Amilyar, and individual Community Tax Certificates. A Treasurer payment window inside an Assessor procedure does not make that Assessor service Treasurer-owned. Land-title registration remains with the Registry of Deeds/LRA; applicable national tax requirements remain with the BIR; building, occupancy, zoning, and locational responsibilities remain with OCBO and CPDCO."}
              </p>
              <p className="mt-3 text-sm leading-6 text-gray-700">
                {category === 'assistance-programs' ||
                category === 'social-welfare' ||
                category === 'pwd-services'
                  ? 'This is a bounded collection, not all assistance programs and not complete coverage of CSWDO or City social-welfare services.'
                  : category === 'employment'
                    ? 'This is a bounded collection of seven reviewed CIPPESO/CPESO procedures, not a complete inventory of City employment programs, current job vacancies, or training-batch schedules.'
                    : category === 'agriculture-fisheries'
                      ? 'This is a bounded collection of seven CAVO agriculture and veterinary procedures. No standalone fisheries Charter service is currently published, and this is not a complete inventory of City agriculture, fisheries, or veterinary programs, current seed/seedling/vaccine stock, or seminar and vaccination schedules.'
                      : category === 'education'
                        ? 'This page does not announce a current admission or enrollment window. Service availability may depend on City College schedules, referrals, clinic staffing, and other published limitations.'
                        : category === 'environment'
                          ? 'This is not a complete inventory of City environmental programs or transactions. Two tree-related certification records remain unpublished because their current Charter titles, output names, and public/private-property scopes conflict. National tree-cutting permits remain under the applicable DENR/PENRO process; CENRO is not presented here as the national permit issuer.'
                          : category === 'civil-registry'
                            ? 'This is a bounded collection, not a complete inventory. CCRO handles local registration, certification, endorsement, and transmission; PSA documents and annotations, court matters, NACC/RACCO orders, and City Health Office services remain separate processes whose processing time is not included here.'
                            : category === 'senior-citizens'
                              ? 'This is a bounded collection covering only new Senior Citizen ID issuance and lost-card replacement. Renewal, transfer, damaged-card replacement, record updates, and other OSCA programs are not covered here and their current procedures remain unverified.'
                              : category === 'infrastructure-public-works'
                                ? 'This is a single bounded complaint-intake and referral procedure, not a repair service. Filing a complaint does not establish that the City owns or maintains the affected road, bridge, drainage facility, streetlight, or building; inspection, evaluation, funding, scheduling, resolution, and repair time are not stated and are not published here.'
                                : category === 'housing-land-use'
                                  ? 'This is a bounded collection of two OCBO certificate procedures, not a complete inventory of building, zoning, or land-use services. Building permits, certificates of occupancy, zoning clearances, and other building/zoning transactions remain unpublished pending source clarification. Fees follow the PD 1096 Schedule of Fees and applicable regulatory or ordinance charges; no fixed peso amount is shown, and the physical inspection itself is excluded from the published certificate-processing time.'
                                  : category === 'utilities-water'
                                    ? 'This is a bounded collection of nine CSFWD Charter transactions, not a complete inventory of water-utility services. Service availability applies only within CSFWD/PW-CSF coverage — not every San Fernando barangay or property is served. No universal flat new-connection fee, online payment, online application, or 24/7 hotline or office is published; two separate reconnection procedures and one maintenance procedure covering eight technical subtypes are preserved as reviewed.'
                                    : category === 'property-taxes'
                                      ? 'This is a bounded collection of eight Assessor and three Treasurer records, not a complete inventory of property or tax procedures. Six additional Assessor services, Market Stall Rental, and a standalone RPT Clearance service remain held pending further review. No online RPT, transfer-tax, or CTC payment/application channel is published, no universal barangay CTC availability is claimed, and no current Schedule of Market Values table is included. RPT account inquiry and statement-of-account information stays integrated within the RPT record as exported, not as a separate service.'
                                      : 'This is a bounded collection, not a complete inventory of City Government services.'}
              </p>
            </div>
          </div>
        </section>

        <section
          className="container mx-auto px-4 py-8 md:py-12"
          aria-labelledby="services-list-heading"
        >
          <div className="flex flex-col justify-between gap-5 border-b border-gray-200 pb-6 md:flex-row md:items-end">
            <div>
              <h2
                id="services-list-heading"
                className="text-2xl font-bold text-gray-900 md:text-3xl"
              >
                Reviewed services
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                Search by service, description, or who may avail.
              </p>
            </div>
            <p
              className="text-sm font-semibold text-gray-900"
              aria-live="polite"
            >
              {filteredServices.length}{' '}
              {filteredServices.length === 1 ? 'service' : 'services'} shown
            </p>
          </div>

          <div className="py-6">
            <label
              className="mb-2 block text-sm font-semibold text-gray-900"
              htmlFor="service-search"
            >
              Search services
            </label>
            <div className="relative max-w-2xl">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600"
                aria-hidden="true"
              />
              <input
                id="service-search"
                type="search"
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Example: renewal or certificate"
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-base text-gray-900 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </div>

          {filteredServices.length ? (
            category === 'property-taxes' ? (
              <div className="space-y-10">
                {assessorServices.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      City Assessor's Office — {assessorServices.length}{' '}
                      {assessorServices.length === 1 ? 'service' : 'services'}
                    </h3>
                    <div className="mt-3 divide-y divide-gray-200 border-y border-gray-200 bg-white px-5 md:px-7">
                      {assessorServices.map(service => (
                        <ServiceCard key={service.id} service={service} />
                      ))}
                    </div>
                  </div>
                )}
                {treasurerServices.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      City Treasurer's Office — {treasurerServices.length}{' '}
                      {treasurerServices.length === 1 ? 'service' : 'services'}
                    </h3>
                    <div className="mt-3 divide-y divide-gray-200 border-y border-gray-200 bg-white px-5 md:px-7">
                      {treasurerServices.map(service => (
                        <ServiceCard key={service.id} service={service} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200 border-y border-gray-200 bg-white px-5 md:px-7">
                {filteredServices.map(service => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )
          ) : (
            <div className="rounded-xl bg-white px-5 py-10 text-center">
              <h2 className="text-lg font-bold text-gray-900">
                No matching services
              </h2>
              <p className="mt-2 text-sm text-gray-700">
                Try a broader service name or clear the search.
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="mt-5 rounded-lg bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
              >
                Clear search
              </button>
            </div>
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
                Supporting resources
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700">
                These are CSFWD/PrimeWater support resources, not Charter
                transactions.
              </p>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {utilitiesWaterResources.map(resource => (
                  <article
                    key={resource.id}
                    className="flex flex-col rounded-xl border border-gray-200 p-5"
                  >
                    <h3 className="text-lg font-bold text-gray-900">
                      {resource.title}
                    </h3>
                    {resource.resource_type === 'digital_utility' && (
                      <>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary-800">
                          Inquiry tool — not online payment
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
                          aria-label={`${resource.title} (opens in a new tab)`}
                        >
                          Open Billing Inquiry
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
                          Shared customer support
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
                          <p>Walk-in: {resource.channels.walk_in}</p>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-gray-700">
                          <span className="font-semibold text-gray-900">
                            Reply standard:
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

export default function Services({
  category,
}: {
  category?: PublishedServiceCategory;
}) {
  return category ? <ServiceCategory category={category} /> : <ServicesHub />;
}
