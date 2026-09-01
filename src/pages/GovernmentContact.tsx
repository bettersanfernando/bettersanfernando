import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  Building2,
  CalendarCheck2,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import {
  filterAndSortGovernmentContacts,
  getGovernmentContactRecords,
  getGovernmentContactSummary,
  type GovernmentContactAvailability,
  type GovernmentContactRecord,
  type GovernmentContactSort,
} from '../data/civic/governmentContacts';

const contacts = getGovernmentContactRecords();
const summary = getGovernmentContactSummary();

const availabilityOptions: Array<{
  value: GovernmentContactAvailability;
  label: string;
}> = [
  { value: 'all', label: 'All published offices' },
  { value: 'phone', label: 'Phone available' },
  { value: 'email', label: 'Email available' },
  { value: 'both', label: 'Phone and email available' },
];

const sortOptions: Array<{ value: GovernmentContactSort; label: string }> = [
  { value: 'name-asc', label: 'Office name A–Z' },
  { value: 'name-desc', label: 'Office name Z–A' },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

function phoneHref(value: string) {
  return `tel:${value.replace(/[^+\d]/g, '')}`;
}

function ContactRecord({ contact }: { contact: GovernmentContactRecord }) {
  return (
    <article className="border-b border-gray-200 py-7 first:pt-0 last:border-b-0 last:pb-0">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(20rem,1.2fr)] lg:gap-10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start gap-3">
            <h3 className="text-xl font-bold leading-snug text-gray-900 md:text-2xl">
              {contact.officeName}
            </h3>
            {contact.acronym && (
              <span className="mt-0.5 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-800">
                {contact.acronym}
              </span>
            )}
          </div>
          <div className="mt-4 flex items-start gap-3 text-sm leading-6 text-gray-700">
            <MapPin
              className="mt-0.5 h-5 w-5 shrink-0 text-primary-700"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-gray-900">Office location</p>
              <p>{contact.address}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex min-w-0 items-start gap-3">
            <Phone
              className="mt-0.5 h-5 w-5 shrink-0 text-primary-700"
              aria-hidden="true"
            />
            <div className="min-w-0 text-sm leading-6">
              <p className="font-semibold text-gray-900">Institutional phone</p>
              {contact.phone ? (
                <>
                  <a
                    className="text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                    href={phoneHref(contact.phone)}
                    aria-label={`Call ${contact.officeName} at ${contact.phone}`}
                  >
                    {contact.phone}
                  </a>
                  {contact.phoneExtensions.length > 0 && (
                    <p className="mt-1 text-gray-700">
                      Extension{contact.phoneExtensions.length > 1 ? 's' : ''}:{' '}
                      {contact.phoneExtensions.join(', ')}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-600">
                  Not currently available in BetterSanFernando
                </p>
              )}
            </div>
          </div>

          <div className="flex min-w-0 items-start gap-3">
            <Mail
              className="mt-0.5 h-5 w-5 shrink-0 text-primary-700"
              aria-hidden="true"
            />
            <div className="min-w-0 text-sm leading-6">
              <p className="font-semibold text-gray-900">Institutional email</p>
              {contact.emails.length > 0 ? (
                <ul className="space-y-1">
                  {contact.emails.map(email => (
                    <li key={email}>
                      <a
                        className="break-all text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                        href={`mailto:${email}`}
                        aria-label={`Email ${contact.officeName} at ${email}`}
                      >
                        {email}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">
                  Not currently available in BetterSanFernando
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gray-100 pt-4 text-xs text-gray-700">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck
            className="h-4 w-4 text-success-700"
            aria-hidden="true"
          />
          Verified institutional record
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarCheck2 className="h-4 w-4" aria-hidden="true" />
          Checked {formatDate(contact.lastVerifiedAt)}
        </span>
        {contact.sourceUrls.map((url, index) => (
          <a
            key={url}
            className="inline-flex items-center gap-1.5 font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            City Government source {index + 1}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        ))}
      </div>
    </article>
  );
}

export default function GovernmentContact() {
  const [query, setQuery] = useState('');
  const [availability, setAvailability] =
    useState<GovernmentContactAvailability>('all');
  const [sort, setSort] = useState<GovernmentContactSort>('name-asc');

  const filteredContacts = useMemo(
    () =>
      filterAndSortGovernmentContacts(contacts, {
        query,
        availability,
        sort,
      }),
    [availability, query, sort]
  );

  const clearControls = () => {
    setQuery('');
    setAvailability('all');
    setSort('name-asc');
  };

  return (
    <>
      <SEO
        title="Government Contact Directory"
        description="Find currently verified institutional contact information for published City Government office records in San Fernando, Pampanga."
        keywords="San Fernando Pampanga government contacts, city office phone, city office email"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/government/contact`}
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
                { label: 'Government Contact Directory' },
              ]}
            />
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="max-w-3xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
                  <Phone className="h-6 w-6" aria-hidden="true" />
                </div>
                <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                  Government Contact Directory
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
                  Contact City Government offices using the institutional phone,
                  email, and location information currently verified and
                  published by BetterSanFernando.
                </p>
              </div>
              <aside className="rounded-xl bg-primary-50 p-5 text-sm leading-relaxed text-primary-900">
                <p className="font-semibold">Independent civic directory</p>
                <p className="mt-1">
                  BetterSanFernando is community-run and not the official City
                  Government website. This page lists City Government contact
                  information—not ways to contact BetterSanFernando.
                </p>
              </aside>
            </div>

            <dl className="mt-9 grid grid-cols-2 border-y border-gray-200 lg:grid-cols-4">
              {[
                ['Published office records', summary.total],
                ['With phone', summary.withPhone],
                ['With email', summary.withEmail],
                ['With location', summary.withAddress],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`p-4 sm:p-5 ${index % 2 === 1 ? 'border-l border-gray-200' : ''} ${index > 1 ? 'border-t border-gray-200 lg:border-t-0' : ''} ${index > 0 ? 'lg:border-l lg:border-gray-200' : ''}`}
                >
                  <dt className="text-sm leading-5 text-gray-600">{label}</dt>
                  <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section
          className="container mx-auto px-4 py-8 md:py-12"
          aria-labelledby="contact-records-heading"
        >
          <div className="rounded-xl bg-white p-5 shadow-[0_8px_28px_rgba(0,41,94,0.08)] md:p-7">
            <div className="flex flex-col justify-between gap-5 border-b border-gray-200 pb-6 lg:flex-row lg:items-end">
              <div>
                <h2
                  id="contact-records-heading"
                  className="text-2xl font-bold text-gray-900 md:text-3xl"
                >
                  Find an office contact
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-700">
                  Search the full published collection by office, acronym,
                  phone, email, or location. Missing contact methods remain
                  unknown rather than inferred.
                </p>
              </div>
              <p
                className="shrink-0 text-sm font-semibold text-gray-900"
                aria-live="polite"
              >
                {filteredContacts.length}{' '}
                {filteredContacts.length === 1 ? 'record' : 'records'} shown
              </p>
            </div>

            <div className="grid gap-4 py-6 lg:grid-cols-[minmax(0,1fr)_14rem_13rem]">
              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-gray-900"
                  htmlFor="government-contact-search"
                >
                  Search contacts
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-700"
                    aria-hidden="true"
                  />
                  <input
                    id="government-contact-search"
                    type="search"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="Office, phone, email, or location"
                    className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-base text-gray-900 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-200"
                  />
                </div>
              </div>
              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-gray-900"
                  htmlFor="government-contact-availability"
                >
                  Contact availability
                </label>
                <select
                  id="government-contact-availability"
                  value={availability}
                  onChange={event =>
                    setAvailability(
                      event.target.value as GovernmentContactAvailability
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-base text-gray-900 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-200"
                >
                  {availabilityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-gray-900"
                  htmlFor="government-contact-sort"
                >
                  Sort records
                </label>
                <select
                  id="government-contact-sort"
                  value={sort}
                  onChange={event =>
                    setSort(event.target.value as GovernmentContactSort)
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-base text-gray-900 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-200"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredContacts.length > 0 ? (
              <div>
                {filteredContacts.map(contact => (
                  <ContactRecord key={contact.officeId} contact={contact} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-gray-50 px-5 py-10 text-center">
                <Search
                  className="mx-auto h-7 w-7 text-gray-700"
                  aria-hidden="true"
                />
                <h2 className="mt-4 text-lg font-bold text-gray-900">
                  No matching contact records
                </h2>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-gray-700">
                  Try another office, phone, email, or location, or reset the
                  contact-availability filter.
                </p>
                <button
                  type="button"
                  onClick={clearControls}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Clear search and filters
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="border-y border-gray-200 bg-white">
          <div className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)] lg:items-start md:py-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Coverage and verification
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700">
                This page reflects institutional office contact records
                currently verified and published by BetterSanFernando. It may
                not include every City Government unit or contact channel.
                Availability and source dates can vary by office; an absent
                phone or email does not prove that no such contact exists.
                Follow the linked City Government source to confirm current
                information before relying on it.
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700">
                This is not an emergency-hotline or staff directory. The page
                excludes personal contacts and publishes only institutional
                fields from the current frontend-safe office export.
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-primary-50 p-5 text-sm leading-6 text-primary-900">
              <Building2
                className="mt-0.5 h-5 w-5 shrink-0"
                aria-hidden="true"
              />
              <p>
                Looking for office identities and locations rather than contact
                methods?{' '}
                <Link
                  to="/government/offices"
                  className="font-bold underline decoration-primary-300 underline-offset-4 hover:text-primary-800"
                >
                  Browse the City Offices directory
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 md:py-12">
          <h2 className="text-2xl font-bold text-gray-900">
            Related information
          </h2>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
            {[
              ['/government/offices', 'City Offices'],
              ['/statistics/city-profile', 'City Profile'],
              ['/transparency/sources', 'Published Data Sources'],
              ['/transparency/methodology', 'Transparency Methodology'],
            ].map(([href, label]) => (
              <Link
                key={href}
                to={href}
                className="text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
