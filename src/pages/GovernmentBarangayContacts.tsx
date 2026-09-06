import { useMemo } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  Phone,
  RotateCcw,
  Search,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { useQueryState } from 'nuqs';
import { Link } from 'react-router';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import {
  getBarangayContactGroups,
  getBarangayContactsMetadata,
  type BarangayContact,
} from '../data/civic/governmentBarangayContacts';

const groups = getBarangayContactGroups();
const metadata = getBarangayContactsMetadata();
const allContacts = groups.flatMap(group => group.contacts);
const secretarySource = allContacts.find(
  contact => contact.contact_type === 'BARANGAY_SECRETARY'
)?.source;
const bhertSource = allContacts.find(
  contact => contact.contact_type === 'BHERT_MEMBER'
)?.source;
const secretaryCount = groups.reduce(
  (sum, group) =>
    sum +
    group.contacts.filter(c => c.contact_type === 'BARANGAY_SECRETARY').length,
  0
);
const bhertCount = groups.reduce(
  (sum, group) =>
    sum + group.contacts.filter(c => c.contact_type === 'BHERT_MEMBER').length,
  0
);

function phoneHref(value: string) {
  return `tel:${value.replace(/[^+\d]/g, '')}`;
}

function matchesQuery(contact: BarangayContact, query: string): boolean {
  const normalized = query.toLowerCase();
  return [
    contact.barangay_name,
    contact.name,
    contact.designation,
    ...contact.contact_numbers.map(n => n.number),
  ]
    .filter((value): value is string => Boolean(value))
    .some(value => value.toLowerCase().includes(normalized));
}

function ContactNumbers({ contact }: { contact: BarangayContact }) {
  if (contact.contact_numbers.length === 0) {
    return (
      <p className="text-sm italic text-gray-500">
        No contact number published in the official source.
      </p>
    );
  }

  return (
    <ul className="space-y-1.5">
      {contact.contact_numbers.map(entry => {
        const callable = entry.status !== 'invalid_length';
        return (
          <li key={entry.number} className="flex flex-wrap items-center gap-2">
            {callable ? (
              <a
                href={phoneHref(entry.number)}
                aria-label={`Call ${contact.name ?? contact.designation} at ${entry.number}`}
                className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
              >
                <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {entry.number}
              </a>
            ) : (
              <span className="font-mono text-sm font-semibold text-gray-800">
                {entry.number}
              </span>
            )}
            {entry.status === 'invalid_length' && (
              <span className="rounded-full bg-warning-100 px-2 py-0.5 text-xs font-semibold text-warning-900">
                Non-standard length as published; not call-linked
              </span>
            )}
            {entry.status === 'non_mobile_published' && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                Published as a landline number
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function ContactRow({ contact }: { contact: BarangayContact }) {
  const isSecretary = contact.contact_type === 'BARANGAY_SECRETARY';
  return (
    <li className="grid gap-3 border-t border-gray-100 py-4 first:border-t-0 sm:grid-cols-[minmax(0,1fr)_16rem] sm:gap-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-gray-900">
            {contact.name ?? (
              <span className="italic text-gray-500">
                Name not published in the official source
              </span>
            )}
          </p>
          {isSecretary && (
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-800">
              Barangay Secretary
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-gray-700">{contact.designation}</p>
      </div>
      <ContactNumbers contact={contact} />
    </li>
  );
}

export default function GovernmentBarangayContacts() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [barangayFilter, setBarangayFilter] = useQueryState('barangay', {
    defaultValue: '',
  });
  const hasFilters = Boolean(query.trim() || barangayFilter);

  const visibleGroups = useMemo(() => {
    const normalizedQuery = query.trim();
    return groups
      .filter(group => !barangayFilter || group.barangayPsgc === barangayFilter)
      .map(group => ({
        ...group,
        matches: normalizedQuery
          ? group.contacts.filter(contact =>
              matchesQuery(contact, normalizedQuery)
            )
          : group.contacts,
      }))
      .filter(group => !normalizedQuery || group.matches.length > 0);
  }, [query, barangayFilter]);

  function resetFilters() {
    void Promise.all([setQuery(null), setBarangayFilter(null)]);
  }

  return (
    <>
      <SEO
        title="Barangay Contacts"
        description="Browse the published Barangay Secretary and BHERT (Barangay Health Emergency Response Team) contact directory for all 35 barangays in the City of San Fernando, Pampanga."
        keywords="San Fernando Pampanga barangay contacts, BHERT, Barangay Secretary, barangay directory"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/government/barangay-contacts`}
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
                { label: 'Barangay Contacts' },
              ]}
            />
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="max-w-3xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
                  <Users className="h-6 w-6" aria-hidden="true" />
                </div>
                <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                  Barangay Contacts
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
                  Published Barangay Secretary and BHERT (Barangay Health
                  Emergency Response Team) contacts for all 35 barangays in the
                  City of San Fernando, Pampanga.
                </p>
              </div>
              <aside className="rounded-xl bg-primary-50 p-5 text-sm leading-relaxed text-primary-900">
                <p className="font-semibold">Not for citywide emergencies</p>
                <p className="mt-1">
                  For citywide emergency dispatch, use{' '}
                  <Link
                    to="/government/hotlines"
                    className="font-bold underline decoration-primary-300 underline-offset-4 hover:text-primary-950"
                  >
                    Government Hotlines
                  </Link>
                  , not this barangay-level directory.
                </p>
              </aside>
            </div>

            <dl className="mt-9 grid grid-cols-2 border-y border-gray-200 lg:grid-cols-4">
              {[
                ['Barangays', metadata.barangayCount],
                ['Barangay Secretaries', secretaryCount],
                ['BHERT contacts', bhertCount],
                ['Total records', metadata.recordCount],
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

        <section className="container mx-auto px-4 py-8 md:py-10">
          <div
            className="flex items-start gap-3 rounded-xl bg-warning-50 p-5 text-sm leading-6 text-warning-900"
            role="note"
            aria-labelledby="barangay-contacts-limitation-heading"
          >
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p
                id="barangay-contacts-limitation-heading"
                className="font-semibold"
              >
                Before you rely on these numbers
              </p>
              <p className="mt-1">{metadata.overallPublicLimitation}</p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-8 md:pb-10">
          <div className="grid gap-4 rounded-xl bg-primary-900 p-4 text-white shadow-[0_8px_28px_rgba(0,41,94,0.14)] md:grid-cols-[minmax(15rem,1fr)_16rem_auto] md:items-end md:p-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-primary-50">
                Search barangay, name, designation, or number
              </span>
              <span className="relative block">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={event => setQuery(event.target.value || null)}
                  placeholder="e.g. Alasas, BHERT, or a phone number"
                  className="min-h-11 w-full rounded-lg border border-primary-700 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
                />
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-primary-50">
                Jump to a barangay
              </span>
              <select
                value={barangayFilter}
                onChange={event =>
                  setBarangayFilter(event.target.value || null)
                }
                className="min-h-11 w-full rounded-lg border border-primary-700 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200"
              >
                <option value="">All barangays</option>
                {groups.map(group => (
                  <option key={group.barangayPsgc} value={group.barangayPsgc}>
                    {group.barangayName}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={resetFilters}
              disabled={!hasFilters}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>

          <p
            className="mt-4 text-sm font-semibold text-gray-800"
            aria-live="polite"
          >
            Showing {visibleGroups.length} of {metadata.barangayCount} barangays
          </p>

          {visibleGroups.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
              <p className="font-medium text-gray-900">
                No barangay matches these filters
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Try a different search term or reset the filters.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {visibleGroups.map(group => (
                <details
                  key={group.barangayPsgc}
                  open={hasFilters}
                  className="group rounded-xl border border-gray-200 bg-white shadow-[0_8px_28px_rgba(0,41,94,0.06)]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-5 py-4 marker:content-none">
                    <span className="text-base font-bold text-gray-900">
                      {group.barangayName}
                    </span>
                    <span className="text-sm text-gray-600">
                      {group.matches.length} of {group.contacts.length} contact
                      {group.contacts.length === 1 ? '' : 's'}
                    </span>
                  </summary>
                  <ul className="border-t border-gray-100 px-5 pb-4">
                    {group.matches.map(contact => (
                      <ContactRow key={contact.id} contact={contact} />
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          )}
        </section>

        <section className="border-y border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-12">
            <div className="flex items-center gap-3">
              <ShieldAlert
                className="h-6 w-6 text-primary-700"
                aria-hidden="true"
              />
              <h2 className="text-2xl font-bold text-gray-900">
                Source and verification
              </h2>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-700">
              Barangay Secretary and BHERT contacts are reproduced from official
              CSFP City Information Office Facebook directory posts, accessed on{' '}
              {metadata.lastVerified}. This is a bounded, publication-reviewed
              batch, not an independently verified or call-tested roster.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {secretarySource && (
                <a
                  href={secretarySource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 underline underline-offset-4 hover:text-primary-900"
                >
                  View the Barangay Secretaries source post
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              {bhertSource && (
                <a
                  href={bhertSource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 underline underline-offset-4 hover:text-primary-900"
                >
                  View the BHERT source post
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
