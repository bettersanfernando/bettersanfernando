import { useMemo, useState } from 'react';
import { Clock3, FileText, Search } from 'lucide-react';
import { Link } from 'react-router';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import {
  getServiceCategory,
  getServiceHref,
  getServices,
  type PublishedServiceCategory,
} from '../data/civic/services';

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
    'planned',
  ],
  [
    'Livelihood',
    'livelihood',
    'Livelihood assistance, skills development, and local programs.',
    'planned',
  ],
  [
    'Health Services',
    'health-services',
    'Local health services and access guidance.',
    'planned',
  ],
  [
    'Education Services',
    'education',
    'Local education services and support programs.',
    'planned',
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
    'Services and assistance intended for senior citizens.',
    'planned',
  ],
  [
    'PWD Services',
    'pwd-services',
    'Services and support for persons with disabilities.',
    'published',
  ],
  [
    'Infrastructure & Public Works',
    'infrastructure-public-works',
    'Resident-facing public-works requests and reporting.',
    'planned',
  ],
  [
    'Agriculture & Fisheries',
    'agriculture-fisheries',
    'Local agriculture, fisheries, and veterinary services.',
    'planned',
  ],
  [
    'Environment',
    'environment',
    'Local environmental programs, permits, and reporting.',
    'planned',
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
              </p>
              <p className="mt-3 text-sm leading-6 text-gray-700">
                {category === 'assistance-programs' ||
                category === 'social-welfare' ||
                category === 'pwd-services'
                  ? 'This is a bounded collection, not all assistance programs and not complete coverage of CSWDO or City social-welfare services.'
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
            <div className="divide-y divide-gray-200 border-y border-gray-200 bg-white px-5 md:px-7">
              {filteredServices.map(service => (
                <article key={service.id} className="py-7">
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
                        <span className="font-semibold text-gray-900">
                          Who may avail:
                        </span>{' '}
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
                          <span className="font-semibold text-gray-900">
                            Fee:
                          </span>{' '}
                          {service.fee.text ??
                            "Not stated in the Citizen's Charter"}
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
              ))}
            </div>
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
