import { useMemo, useState } from 'react';
import { Clock3, FileText, Search } from 'lucide-react';
import { Link } from 'react-router';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import { getServices } from '../data/civic/services';

const services = getServices();
const offices = [
  'Business License and Permit Division',
  'City Disaster Risk Reduction Management Office',
] as const;

export default function Services() {
  const [query, setQuery] = useState('');
  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return services;

    return services.filter(service =>
      [
        service.title,
        service.description,
        service.who_may_avail,
        service.office.name,
        service.office.acronym,
      ].some(value => value.toLowerCase().includes(normalizedQuery))
    );
  }, [query]);

  return (
    <>
      <SEO
        title="Services"
        description="Reviewed services from selected City of San Fernando offices, including BLPD and CDRRMO."
        keywords="San Fernando Pampanga services, BLPD, CDRRMO, business permits, disaster response"
      />
      <main className="flex-grow bg-gray-50">
        <section className="border-b border-primary-100 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <Breadcrumbs
              className="mb-8"
              items={[{ label: 'Home', href: '/' }, { label: 'Services' }]}
            />
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="max-w-3xl">
                <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                  Services
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
                  Find requirements, fees, processing times, and application
                  steps for currently available reviewed services from selected
                  City offices.
                </p>
              </div>
              <aside className="rounded-xl bg-primary-50 p-5 text-sm leading-6 text-primary-900">
                <p className="font-semibold">Current coverage</p>
                <p className="mt-1">
                  Currently available: selected services from the Business
                  License and Permit Division and City Disaster Risk Reduction
                  Management Office. This is not a complete directory of all
                  City Government services.
                </p>
              </aside>
            </div>
            <dl className="mt-9 border-y border-gray-200 py-5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <dt className="text-sm text-gray-600">Published services</dt>
                <dd className="text-3xl font-bold tabular-nums text-gray-900">
                  {services.length}
                </dd>
                <dd className="text-sm font-semibold text-gray-700">
                  from 2 selected City offices
                </dd>
              </div>
            </dl>
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
                Browse reviewed services
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
            <div className="space-y-10">
              {offices.map(officeName => {
                const officeServices = filteredServices.filter(
                  service => service.office.name === officeName
                );
                if (!officeServices.length) return null;

                return (
                  <section
                    key={officeName}
                    aria-labelledby={`${officeServices[0].office.acronym.toLowerCase()}-services-heading`}
                  >
                    <h3
                      id={`${officeServices[0].office.acronym.toLowerCase()}-services-heading`}
                      className="mb-4 text-xl font-bold text-gray-900"
                    >
                      {officeName} ({officeServices[0].office.acronym})
                    </h3>
                    <div className="divide-y divide-gray-200 border-y border-gray-200 bg-white px-5 md:px-7">
                      {officeServices.map(service => (
                        <article key={service.id} className="py-7">
                          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10">
                            <div className="min-w-0">
                              <h4 className="text-xl font-bold leading-snug text-gray-900 md:text-2xl">
                                <Link
                                  to={`/services/${service.slug}`}
                                  className="hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600"
                                >
                                  {service.title}
                                </Link>
                              </h4>
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
                              <p>
                                {service.forms.length > 0
                                  ? `${service.forms.length} published form${service.forms.length === 1 ? '' : 's'}`
                                  : 'No published form link in this record'}
                                {service.online_channels.length > 0 &&
                                  ` · ${service.online_channels.length} reviewed online channel`}
                              </p>
                              <Link
                                to={`/services/${service.slug}`}
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
                  </section>
                );
              })}
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

          <div className="mt-10 border-t border-gray-200 pt-6 text-sm leading-6 text-gray-700">
            <p>
              Service information was last reviewed on 1 September 2026 from the
              official City of San Fernando Citizen&apos;s Charter and reviewed
              official City sources. BetterSanFernando is independent and is not
              the official City Government website.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
