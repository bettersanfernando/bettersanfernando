import { useMemo, useState } from 'react';
import {
  Building2,
  CalendarCheck2,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Siren,
  X,
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import {
  getCityOffices,
  getCityOfficesMetadata,
  type CityOffice,
} from '../data/civic/government';

type ContactFilter = 'all' | 'phone' | 'email' | 'hotline';

const offices = getCityOffices();
const metadata = getCityOfficesMetadata();

const contactFilters: Array<{ value: ContactFilter; label: string }> = [
  { value: 'all', label: 'All offices' },
  { value: 'phone', label: 'With phone' },
  { value: 'email', label: 'With email' },
  { value: 'hotline', label: 'With hotline' },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

function getEmails(office: CityOffice) {
  return Array.from(
    new Set(
      [
        office.institutional_email,
        office.operational_email,
        ...(office.additional_emails ?? []),
      ].filter((email): email is string => Boolean(email))
    )
  );
}

function matchesContactFilter(office: CityOffice, filter: ContactFilter) {
  if (filter === 'phone') return Boolean(office.primary_phone);
  if (filter === 'email') return getEmails(office).length > 0;
  if (filter === 'hotline') return Boolean(office.emergency_hotlines?.length);
  return true;
}

function OfficeRecord({ office }: { office: CityOffice }) {
  const emails = getEmails(office);

  return (
    <article className="border-b border-gray-200 py-7 first:pt-0 last:border-b-0 last:pb-0">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)] lg:gap-10">
        <div>
          <div className="flex flex-wrap items-start gap-3">
            <h2 className="text-xl font-bold leading-snug text-gray-900 md:text-2xl">
              {office.office_name}
            </h2>
            {office.acronym && (
              <span className="mt-0.5 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-800">
                {office.acronym}
              </span>
            )}
          </div>
          <div className="mt-4 flex items-start gap-3 text-sm leading-relaxed text-gray-700">
            <MapPin
              className="mt-0.5 h-5 w-5 shrink-0 text-primary-700"
              aria-hidden="true"
            />
            <div>
              <span className="font-semibold text-gray-900">Location</span>
              <p>{office.physical_address}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          {office.primary_phone && (
            <div className="flex items-start gap-3">
              <Phone
                className="mt-0.5 h-5 w-5 shrink-0 text-primary-700"
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold text-gray-900">Office phone</p>
                <a
                  className="break-words text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                  href={`tel:${office.primary_phone.replace(/[^+\d]/g, '')}`}
                >
                  {office.primary_phone}
                </a>
                {office.phone_extensions?.length ? (
                  <p className="mt-1 text-gray-700">
                    Extension{office.phone_extensions.length > 1 ? 's' : ''}:{' '}
                    {office.phone_extensions.join(', ')}
                  </p>
                ) : null}
              </div>
            </div>
          )}

          {emails.length > 0 && (
            <div className="flex items-start gap-3">
              <Mail
                className="mt-0.5 h-5 w-5 shrink-0 text-primary-700"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">Office email</p>
                <ul className="space-y-1">
                  {emails.map(email => (
                    <li key={email}>
                      <a
                        className="break-all text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                        href={`mailto:${email}`}
                      >
                        {email}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {office.emergency_hotlines?.length ? (
            <div className="rounded-xl bg-error-50 p-4 text-error-900">
              <div className="flex items-start gap-3">
                <Siren
                  className="mt-0.5 h-5 w-5 shrink-0 text-error-700"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold">Institutional hotline</p>
                  <ul className="mt-1 space-y-1">
                    {office.emergency_hotlines.map(hotline => (
                      <li key={hotline}>
                        <a
                          className="font-semibold underline decoration-error-300 underline-offset-4 hover:text-error-700"
                          href={`tel:${hotline.replace(/[^+\d]/g, '')}`}
                        >
                          {hotline}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}

          {!office.primary_phone &&
            emails.length === 0 &&
            !office.emergency_hotlines?.length && (
              <p className="text-gray-700">
                No phone, email, or hotline is included in the verified record.
              </p>
            )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gray-100 pt-4 text-xs text-gray-700">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck
            className="h-4 w-4 text-success-700"
            aria-hidden="true"
          />
          Verified record
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarCheck2 className="h-4 w-4" aria-hidden="true" />
          Checked {formatDate(office.last_verified_at)}
        </span>
        {office.source_urls.map((url, index) => (
          <a
            key={url}
            className="inline-flex items-center gap-1.5 font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            {office.source_urls.length > 1
              ? `View official source ${index + 1}`
              : 'View official source'}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        ))}
      </div>
    </article>
  );
}

export default function GovernmentOffices() {
  const [query, setQuery] = useState('');
  const [contactFilter, setContactFilter] = useState<ContactFilter>('all');

  const filteredOffices = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('en-PH');

    return offices.filter(office => {
      const matchesQuery =
        !normalizedQuery ||
        [office.office_name, office.acronym, office.physical_address]
          .filter(Boolean)
          .some(value =>
            value!.toLocaleLowerCase('en-PH').includes(normalizedQuery)
          );
      return matchesQuery && matchesContactFilter(office, contactFilter);
    });
  }, [contactFilter, query]);

  const clearFilters = () => {
    setQuery('');
    setContactFilter('all');
  };

  return (
    <>
      <SEO
        title="City Offices"
        description="Browse verified City Government office locations and available institutional contact information in San Fernando, Pampanga."
        keywords="San Fernando Pampanga city offices, government office directory, city office contacts"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/government/offices`}
        siteName="BetterSanFernando"
      />
      <main className="flex-grow bg-gray-50">
        <section className="border-b border-primary-100 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <Breadcrumbs
              className="mb-8"
              items={[
                { label: 'Home', href: '/' },
                { label: 'Government', href: '/government' },
                { label: 'City Offices' },
              ]}
            />
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="max-w-3xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
                  <Building2 className="h-6 w-6" aria-hidden="true" />
                </div>
                <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                  City Offices
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
                  Find verified locations and available institutional contact
                  details for City Government offices in San Fernando, Pampanga.
                </p>
              </div>
              <aside className="rounded-xl bg-primary-50 p-5 text-sm leading-relaxed text-primary-900">
                <p className="font-semibold">Independent civic directory</p>
                <p className="mt-1">
                  BetterSanFernando is not the official City Government website.
                  Official CSFP details below are shown separately and linked to
                  their sources.
                </p>
              </aside>
            </div>
          </div>
        </section>

        <section
          className="container mx-auto px-4 py-8 md:py-12"
          aria-labelledby="directory-heading"
        >
          <div className="rounded-xl bg-white p-5 shadow-[0_8px_28px_rgba(0,41,94,0.08)] md:p-7">
            <div className="flex flex-col justify-between gap-5 border-b border-gray-200 pb-6 lg:flex-row lg:items-end">
              <div>
                <h2
                  id="directory-heading"
                  className="text-2xl font-bold text-gray-900 md:text-3xl"
                >
                  Browse verified records
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-700">
                  This published collection contains {metadata.officeCount}{' '}
                  verified office records checked{' '}
                  {formatDate(metadata.lastVerified)}. It is a bounded directory
                  and may not include every City Government unit or every
                  available contact channel.
                </p>
              </div>
              <p
                className="shrink-0 text-sm font-semibold text-gray-900"
                aria-live="polite"
              >
                {filteredOffices.length}{' '}
                {filteredOffices.length === 1 ? 'record' : 'records'} shown
              </p>
            </div>

            <div className="grid gap-4 py-6 md:grid-cols-[minmax(0,1fr)_13rem]">
              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-gray-900"
                  htmlFor="office-search"
                >
                  Search offices
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-700"
                    aria-hidden="true"
                  />
                  <input
                    id="office-search"
                    type="search"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="Name, acronym, or location"
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-base text-gray-900 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-200"
                  />
                </div>
              </div>
              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-gray-900"
                  htmlFor="contact-filter"
                >
                  Contact availability
                </label>
                <select
                  id="contact-filter"
                  value={contactFilter}
                  onChange={event =>
                    setContactFilter(event.target.value as ContactFilter)
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-base text-gray-900 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-200"
                >
                  {contactFilters.map(filter => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredOffices.length > 0 ? (
              <div>
                {filteredOffices.map(office => (
                  <OfficeRecord key={office.office_id} office={office} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-gray-50 px-5 py-10 text-center">
                <Search
                  className="mx-auto h-7 w-7 text-gray-700"
                  aria-hidden="true"
                />
                <h2 className="mt-4 text-lg font-bold text-gray-900">
                  No matching office records
                </h2>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-gray-700">
                  Try a different name or location, or show all contact types.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Clear search and filter
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
