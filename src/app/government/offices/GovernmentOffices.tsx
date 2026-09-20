'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQueryState, parseAsInteger } from 'nuqs';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Search,
  SearchX,
  ShieldCheck,
  Siren,
  X,
} from 'lucide-react';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getCityOffices,
  getCityOfficesMetadata,
  getParentOffice,
  type CityOffice,
} from '../../../data/civic/government';

type ContactFilter = 'all' | 'phone' | 'email' | 'hotline';
type RelationshipFilter = 'all' | 'standalone' | 'subunit';
type OfficialPageFilter = 'all' | 'available';
type SortOption = 'name-asc' | 'name-desc' | 'recently-verified';

const PAGE_SIZE = 10;
const eyebrowTracking = { letterSpacing: '0.08em' };

const allOffices = getCityOffices();
const metadata = getCityOfficesMetadata();

const CONTACT_FILTERS: Array<{ value: ContactFilter; label: string }> = [
  { value: 'all', label: 'All offices' },
  { value: 'phone', label: 'With phone' },
  { value: 'email', label: 'With email' },
  { value: 'hotline', label: 'With hotline' },
];

const RELATIONSHIP_FILTERS: Array<{
  value: RelationshipFilter;
  label: string;
}> = [
  { value: 'all', label: 'All records' },
  { value: 'standalone', label: 'Standalone / parent not recorded' },
  { value: 'subunit', label: 'Verified subunits' },
];

const OFFICIAL_PAGE_FILTERS: Array<{
  value: OfficialPageFilter;
  label: string;
}> = [
  { value: 'all', label: 'All records' },
  { value: 'available', label: 'Official office page available' },
];

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'name-asc', label: 'Office name A–Z' },
  { value: 'name-desc', label: 'Office name Z–A' },
  { value: 'recently-verified', label: 'Recently verified' },
];

const RELATED_RESOURCES = [
  {
    title: 'Emergency Hotlines',
    description: 'Find important public-safety and emergency contact numbers.',
    href: '/government/hotlines',
  },
  {
    title: 'Barangay Contacts',
    description: "Find contact information for San Fernando's barangays.",
    href: '/government/barangay-contacts',
  },
  {
    title: 'Official Government Links',
    description: 'Open official City Government websites and public channels.',
    href: '/government/links',
  },
  {
    title: 'Government Statistics',
    description:
      'Explore descriptive information about the current published government directory.',
    href: '/statistics/government',
  },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

function getEmails(office: CityOffice): string[] {
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

function getPrimaryEmail(office: CityOffice): string | undefined {
  return (
    office.institutional_email ??
    office.operational_email ??
    office.additional_emails?.[0]
  );
}

function getPageWindow(current: number, total: number): (number | '…')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const keep = new Set<number>([1, total, current - 1, current, current + 1]);
  const pages = [...keep]
    .filter(p => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const result: (number | '…')[] = [];
  let previous = 0;
  for (const p of pages) {
    if (previous && p - previous > 1) result.push('…');
    result.push(p);
    previous = p;
  }
  return result;
}

export default function GovernmentOffices() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [contactFilter, setContactFilter] = useQueryState('contact', {
    defaultValue: 'all',
  });
  const [relationshipFilter, setRelationshipFilter] = useQueryState(
    'relationship',
    { defaultValue: 'all' }
  );
  const [officialPageFilter, setOfficialPageFilter] = useQueryState(
    'officialPage',
    { defaultValue: 'all' }
  );
  const [sort, setSort] = useQueryState('sort', {
    defaultValue: 'name-asc',
  });
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  // Derived high-level directory metrics
  const totalOffices = allOffices.length;
  const officesWithContact = useMemo(
    () =>
      allOffices.filter(o =>
        Boolean(
          o.primary_phone ||
          o.institutional_email ||
          o.operational_email ||
          (o.additional_emails && o.additional_emails.length > 0) ||
          (o.emergency_hotlines && o.emergency_hotlines.length > 0)
        )
      ).length,
    []
  );
  const contactPercentage = ((officesWithContact / totalOffices) * 100).toFixed(
    1
  );

  const officesWithOfficialPage = useMemo(
    () => allOffices.filter(o => Boolean(o.official_page_url)).length,
    []
  );
  const officialPagePercentage = (
    (officesWithOfficialPage / totalOffices) *
    100
  ).toFixed(1);

  // Filter & sort logic
  const filteredOffices = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('en-PH');

    const result = allOffices.filter(office => {
      // 1. Search query
      if (normalizedQuery) {
        const matchesQuery = [
          office.office_name,
          office.acronym,
          office.physical_address,
          ...(office.alternate_names ?? []),
        ]
          .filter(Boolean)
          .some(value =>
            value!.toLocaleLowerCase('en-PH').includes(normalizedQuery)
          );
        if (!matchesQuery) return false;
      }

      // 2. Contact filter
      if (contactFilter === 'phone' && !office.primary_phone) return false;
      if (contactFilter === 'email' && getEmails(office).length === 0)
        return false;
      if (
        contactFilter === 'hotline' &&
        (!office.emergency_hotlines || office.emergency_hotlines.length === 0)
      ) {
        return false;
      }

      // 3. Relationship filter
      if (
        relationshipFilter === 'standalone' &&
        Boolean(office.parent_office_id)
      ) {
        return false;
      }
      if (relationshipFilter === 'subunit' && !office.parent_office_id) {
        return false;
      }

      // 4. Official page filter
      if (officialPageFilter === 'available' && !office.official_page_url) {
        return false;
      }

      return true;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sort === 'name-desc') {
        return b.office_name.localeCompare(a.office_name, 'en-PH');
      }
      if (sort === 'recently-verified') {
        const dateA = a.last_verified_at ?? metadata.lastVerified;
        const dateB = b.last_verified_at ?? metadata.lastVerified;
        const cmp = dateB.localeCompare(dateA);
        if (cmp !== 0) return cmp;
      }
      return a.office_name.localeCompare(b.office_name, 'en-PH');
    });
  }, [contactFilter, officialPageFilter, query, relationshipFilter, sort]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOffices.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const paginatedOffices = useMemo(
    () =>
      filteredOffices.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
      ),
    [currentPage, filteredOffices]
  );
  const startIndex = (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, filteredOffices.length);

  const hasActiveFilters = Boolean(
    query ||
    contactFilter !== 'all' ||
    relationshipFilter !== 'all' ||
    officialPageFilter !== 'all' ||
    sort !== 'name-asc'
  );

  const clearFilters = () => {
    setQuery('');
    setContactFilter('all');
    setRelationshipFilter('all');
    setOfficialPageFilter('all');
    setSort('name-asc');
    setPage(1);
  };

  return (
    <main className="bg-white text-gray-900">
      {/* 1. Header / Editorial Intro */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Government', href: '/government' },
              { label: 'City Offices' },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
            <div>
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                CITY DIRECTORY
              </p>
              <h1 className="mt-1.5 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl lg:text-4xl">
                City offices and public contact information
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base sm:leading-7">
                Find verified office locations, phone numbers, email addresses,
                official pages, and available public contact channels for City
                Government offices in San Fernando, Pampanga.
              </p>
            </div>

            <aside className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
              <p className="text-eyebrow text-gray-500" style={eyebrowTracking}>
                ABOUT THIS DIRECTORY
              </p>
              <h2 className="mt-1 text-sm font-bold text-gray-950">
                Bounded civic directory
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                BetterSanFernando organizes publicly available office
                information from official City sources. This is a bounded civic
                directory and should not be read as the complete legal
                organizational structure of the City Government.
              </p>
              <p className="mt-3 border-t border-gray-200/80 pt-2 text-[11px] text-gray-500">
                Independent and community-run. Not an official City Government
                website.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <div className="container mx-auto space-y-12 px-4 pb-16 sm:space-y-16">
        {/* 2. Top Metric Strip */}
        <section aria-labelledby="metrics-heading" className="pt-8 sm:pt-10">
          <h2 id="metrics-heading" className="sr-only">
            Directory overview metrics
          </h2>
          <div className="grid grid-cols-1 divide-y divide-gray-200 border-y border-gray-200 py-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:py-7">
            <div className="pb-4 sm:pb-0 sm:pr-6">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Verified office records
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-gray-950 sm:text-4xl">
                {totalOffices}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Published City Government directory
              </p>
            </div>

            <div className="py-4 sm:py-0 sm:px-6">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                With public contact details
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-gray-950 sm:text-4xl">
                {officesWithContact}{' '}
                <span className="text-sm font-normal text-gray-500">
                  of {totalOffices}
                </span>
              </p>
              <p className="mt-1 text-xs font-medium text-[#0066EB]">
                {contactPercentage}% coverage
              </p>
            </div>

            <div className="pt-4 sm:pt-0 sm:pl-6">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                With official office pages
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-gray-950 sm:text-4xl">
                {officesWithOfficialPage}{' '}
                <span className="text-sm font-normal text-gray-500">
                  of {totalOffices}
                </span>
              </p>
              <p className="mt-1 text-xs font-medium text-[#0066EB]">
                {officialPagePercentage}% coverage
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Directory last verified {formatDate(metadata.lastVerified)}
          </p>
        </section>

        {/* 3. Office Directory (Search, Filter, Table, Pagination) */}
        <section
          id="office-directory"
          className="scroll-mt-24 border-t border-gray-200 pt-8 sm:pt-10"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-baseline">
            <div>
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                OFFICE DIRECTORY
              </p>
              <h2 className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl">
                Find an office
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm">
                Search by office name, acronym, alternate name, or location.
              </p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC]"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Reset filters
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="mt-6">
            <label htmlFor="office-search" className="sr-only">
              Search office, acronym, or location
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="office-search"
                type="search"
                value={query}
                onChange={event => {
                  setQuery(event.target.value);
                  if (page !== 1) setPage(1);
                }}
                placeholder="Search office, acronym, or location..."
                className="w-full rounded-sm border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-950 placeholder:text-gray-400 transition-colors focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
              />
            </div>
          </div>

          {/* Filter Controls Grid */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Contact Filter */}
            <div>
              <label
                htmlFor="contact-filter"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Contact
              </label>
              <select
                id="contact-filter"
                value={contactFilter}
                onChange={event => {
                  setContactFilter(event.target.value as ContactFilter);
                  if (page !== 1) setPage(1);
                }}
                className="w-full rounded-sm border border-gray-300 bg-white px-2.5 py-2 text-xs text-gray-900 transition-colors focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB] sm:text-sm"
              >
                {CONTACT_FILTERS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Relationship Filter */}
            <div>
              <label
                htmlFor="relationship-filter"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Directory relationship
              </label>
              <select
                id="relationship-filter"
                value={relationshipFilter}
                onChange={event => {
                  setRelationshipFilter(
                    event.target.value as RelationshipFilter
                  );
                  if (page !== 1) setPage(1);
                }}
                className="w-full rounded-sm border border-gray-300 bg-white px-2.5 py-2 text-xs text-gray-900 transition-colors focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB] sm:text-sm"
              >
                {RELATIONSHIP_FILTERS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Official Page Filter */}
            <div>
              <label
                htmlFor="official-page-filter"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Official page
              </label>
              <select
                id="official-page-filter"
                value={officialPageFilter}
                onChange={event => {
                  setOfficialPageFilter(
                    event.target.value as OfficialPageFilter
                  );
                  if (page !== 1) setPage(1);
                }}
                className="w-full rounded-sm border border-gray-300 bg-white px-2.5 py-2 text-xs text-gray-900 transition-colors focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB] sm:text-sm"
              >
                {OFFICIAL_PAGE_FILTERS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label
                htmlFor="sort-filter"
                className="mb-1 block text-xs font-medium text-gray-700"
              >
                Sort by
              </label>
              <select
                id="sort-filter"
                value={sort}
                onChange={event => {
                  setSort(event.target.value as SortOption);
                  if (page !== 1) setPage(1);
                }}
                className="w-full rounded-sm border border-gray-300 bg-white px-2.5 py-2 text-xs text-gray-900 transition-colors focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB] sm:text-sm"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Counter */}
          <div className="mt-6 flex items-center justify-between text-xs text-gray-600 sm:text-sm">
            <p aria-live="polite">
              {filteredOffices.length > 0 ? (
                <>
                  Showing{' '}
                  <span className="font-semibold text-gray-950">
                    {startIndex}–{endIndex}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-gray-950">
                    {filteredOffices.length}
                  </span>{' '}
                  offices
                  {filteredOffices.length < totalOffices && (
                    <span className="text-gray-500">
                      {' '}
                      (filtered from {totalOffices} total)
                    </span>
                  )}
                </>
              ) : (
                '0 offices found'
              )}
            </p>
          </div>

          {/* Directory Rows */}
          {filteredOffices.length > 0 ? (
            <div className="mt-3 divide-y divide-gray-200 border-y border-gray-200 bg-white">
              {paginatedOffices.map(office => {
                const parent = getParentOffice(office);
                const primaryEmail = getPrimaryEmail(office);
                const emails = getEmails(office);

                return (
                  <article
                    key={office.office_id}
                    id={office.office_id}
                    className="scroll-mt-28 p-4 transition-colors hover:bg-[#F3F6FB] sm:p-5"
                  >
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(16rem,1fr)_minmax(9rem,0.45fr)] lg:items-start lg:gap-8">
                      {/* 1. Office Identity */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <Link
                            href={`/government/offices/${office.office_id}`}
                            className="text-base font-bold text-gray-950 hover:text-[#0066EB] transition-colors"
                          >
                            {office.office_name}
                          </Link>
                          {office.acronym && (
                            <span className="inline-block rounded-sm bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-gray-700">
                              {office.acronym}
                            </span>
                          )}
                        </div>

                        {parent && (
                          <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                            Verified subunit of{' '}
                            <Link
                              href={`/government/offices/${parent.office_id}`}
                              className="font-medium text-gray-900 underline decoration-gray-300 underline-offset-2 hover:text-[#0066EB]"
                            >
                              {parent.office_name}
                            </Link>
                          </p>
                        )}

                        {office.physical_address && (
                          <div className="mt-2 flex items-start gap-1.5 text-xs text-gray-600 sm:text-sm">
                            <MapPin
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400"
                              aria-hidden="true"
                            />
                            <span>{office.physical_address}</span>
                          </div>
                        )}

                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500">
                          <ShieldCheck
                            className="h-3.5 w-3.5 shrink-0 text-emerald-600"
                            aria-hidden="true"
                          />
                          <span>
                            Verified · Checked{' '}
                            {formatDate(
                              office.last_verified_at ?? metadata.lastVerified
                            )}
                          </span>
                        </div>
                      </div>

                      {/* 2. Contact Column */}
                      <div className="space-y-2 text-xs sm:text-sm">
                        {office.primary_phone && (
                          <div className="flex items-start gap-2">
                            <Phone
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400"
                              aria-hidden="true"
                            />
                            <div>
                              <a
                                href={`tel:${office.primary_phone.replace(/[^+\d]/g, '')}`}
                                className="font-medium text-gray-900 hover:text-[#0066EB]"
                              >
                                {office.primary_phone}
                              </a>
                              {office.phone_extensions?.length ? (
                                <span className="text-gray-500">
                                  {' '}
                                  · Ext. {office.phone_extensions.join(', ')}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        )}

                        {primaryEmail && (
                          <div className="flex items-start gap-2">
                            <Mail
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400"
                              aria-hidden="true"
                            />
                            <div className="min-w-0">
                              <a
                                href={`mailto:${primaryEmail}`}
                                className="break-all text-gray-700 hover:text-[#0066EB]"
                              >
                                {primaryEmail}
                              </a>
                              {emails.length > 1 && (
                                <span className="ml-1 text-[11px] text-gray-400">
                                  (+{emails.length - 1} more)
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {office.emergency_hotlines?.length ? (
                          <div className="inline-flex items-center gap-1.5 rounded-sm border border-red-200 bg-red-50/70 px-2.5 py-1 text-xs text-red-900">
                            <Siren
                              className="h-3.5 w-3.5 shrink-0 text-red-600"
                              aria-hidden="true"
                            />
                            <span>
                              Hotline:{' '}
                              <a
                                href={`tel:${office.emergency_hotlines[0].replace(/[^+\d]/g, '')}`}
                                className="font-bold text-red-700 hover:underline"
                              >
                                {office.emergency_hotlines[0]}
                              </a>
                            </span>
                          </div>
                        ) : null}

                        {!office.primary_phone &&
                          !primaryEmail &&
                          !office.emergency_hotlines?.length && (
                            <p className="text-xs italic text-gray-400">
                              No phone, email, or hotline recorded
                            </p>
                          )}
                      </div>

                      {/* 3. Actions Column */}
                      <div className="flex flex-col items-start gap-2 sm:flex-row lg:flex-col lg:items-end">
                        <Link
                          href={`/government/offices/${office.office_id}`}
                          className="group inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
                        >
                          <span>View office</span>
                          <ChevronRight
                            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </Link>

                        {office.official_page_url && (
                          <a
                            href={office.official_page_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 hover:underline"
                          >
                            <span>Official page</span>
                            <ArrowUpRight
                              className="h-3.5 w-3.5 text-gray-400"
                              aria-hidden="true"
                            />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="my-8 rounded-sm border border-gray-200 bg-white p-8 text-center sm:p-12">
              <SearchX
                className="mx-auto h-8 w-8 text-gray-400"
                aria-hidden="true"
              />
              <h3 className="mt-3 text-base font-bold text-gray-950">
                No offices match these filters.
              </h3>
              <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                Try changing or clearing one or more filters.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-sm bg-[#0066EB] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Clear filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <nav
              aria-label="Office directory pagination"
              className="mt-6 flex items-center justify-between gap-4 border-t border-gray-200 pt-5"
            >
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
                className="inline-flex h-9 items-center gap-1 rounded-sm border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 enabled:cursor-pointer enabled:hover:border-[#0066EB] enabled:hover:bg-[#F3F6FB] enabled:hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Previous
              </button>

              {/* Desktop Page Window */}
              <div className="hidden items-center gap-1.5 sm:flex">
                {getPageWindow(currentPage, totalPages).map((item, index) =>
                  item === '…' ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="flex h-9 min-w-9 items-center justify-center text-sm text-gray-400"
                      aria-hidden="true"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item)}
                      aria-current={item === currentPage ? 'page' : undefined}
                      className={`inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-sm border px-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] ${
                        item === currentPage
                          ? 'border-[#0066EB] bg-[#0066EB] text-white'
                          : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-[#F3F6FB]'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>

              {/* Mobile Page Indicator */}
              <p className="text-sm font-medium text-gray-700 sm:hidden">
                Page {currentPage} of {totalPages}
              </p>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
                className="inline-flex h-9 items-center gap-1 rounded-sm border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 enabled:cursor-pointer enabled:hover:border-[#0066EB] enabled:hover:bg-[#F3F6FB] enabled:hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          )}
        </section>

        {/* 4. How to Read These Records */}
        <section
          id="about-directory"
          className="scroll-mt-24 border-t border-gray-200 pt-8 sm:pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            ABOUT THE DIRECTORY
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl">
            How to read these records
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-sm border border-gray-200 bg-white p-5">
              <h3 className="text-sm font-bold text-gray-950 sm:text-base">
                Verified public information
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                Contact and location details are included when they are
                supported by the recorded official sources.
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5">
              <h3 className="text-sm font-bold text-gray-950 sm:text-base">
                Relationships are partial
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                A parent or subunit relationship is shown only when the current
                evidence supports it. The directory is not presented as a
                complete legal organizational chart.
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5">
              <h3 className="text-sm font-bold text-gray-950 sm:text-base">
                Missing details remain unknown
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                If a phone number, email address, or official page is not
                listed, BetterSanFernando has not established that detail in the
                current directory.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Keep Exploring */}
        <section
          id="keep-exploring"
          className="scroll-mt-24 border-t border-gray-200 pt-8 sm:pt-10 pb-8 sm:pb-10 lg:pb-12"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            KEEP EXPLORING
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl">
            Explore more government information
          </h2>

          {/* Two compact featured destinations in ONE coordinated 2-column surface */}
          <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white">
            <div className="grid grid-cols-1 divide-y divide-gray-200 md:grid-cols-2 md:divide-x md:divide-y-0">
              <div className="p-5 sm:p-6">
                <h3 className="text-sm font-bold text-gray-950 sm:text-base">
                  Government Overview
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                  Understand the City Government information currently organized
                  by BetterSanFernando.
                </p>
                <div className="mt-3.5">
                  <Link
                    href="/government"
                    className="inline-flex items-center text-xs font-bold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
                  >
                    View Government Overview →
                  </Link>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <h3 className="text-sm font-bold text-gray-950 sm:text-base">
                  Contact the City
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                  Find general City Government contact channels.
                </p>
                <div className="mt-3.5">
                  <Link
                    href="/government/contact"
                    className="inline-flex items-center text-xs font-bold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
                  >
                    View Contact Information →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 2x2 Related Resources Directory */}
          <div className="mt-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Related resources
            </h3>
            <div className="mt-3 overflow-hidden rounded-sm border border-gray-200 bg-white">
              <div className="grid grid-cols-1 divide-y divide-gray-200 md:grid-cols-2 md:divide-y-0">
                {RELATED_RESOURCES.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between gap-4 p-4 transition-colors hover:bg-[#F3F6FB] sm:p-5 ${
                      index % 2 === 1 ? 'md:border-l md:border-gray-200' : ''
                    } ${index >= 2 ? 'md:border-t md:border-gray-200' : ''}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-950 group-hover:text-[#0066EB]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#0066EB]"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
