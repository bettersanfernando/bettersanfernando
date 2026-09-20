'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQueryState, parseAsInteger } from 'nuqs';
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info,
  Phone,
  RotateCcw,
  Search,
  SearchX,
  UserRound,
  Users,
} from 'lucide-react';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getBarangayContactGroups,
  getBarangayContactsMetadata,
  type BarangayContact,
  type BarangayContactGroup,
} from '../../../data/civic/governmentBarangayContacts';

type ContactTypeFilter = 'all' | 'BARANGAY_SECRETARY' | 'BHERT_MEMBER';

const PAGE_SIZE = 10;
const eyebrowTracking = { letterSpacing: '0.08em' };

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

const CONTACT_TYPE_OPTIONS: Array<{
  value: ContactTypeFilter;
  label: string;
}> = [
  { value: 'all', label: 'All contacts' },
  { value: 'BARANGAY_SECRETARY', label: 'Barangay Secretary' },
  { value: 'BHERT_MEMBER', label: 'BHERT' },
];

const RELATED_RESOURCES = [
  {
    title: 'City Offices',
    description:
      'Find office-specific phone numbers, emails, locations, and official pages.',
    href: '/government/offices',
  },
  {
    title: 'Official Government Links',
    description:
      'Open verified government websites, portals, and public channels.',
    href: '/government/links',
  },
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

function ContactNumbers({ contact }: { contact: BarangayContact }) {
  if (contact.contact_numbers.length === 0) {
    return (
      <p className="text-xs italic text-gray-500 sm:text-sm">
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
                className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-[#0066EB] underline decoration-[#0066EB]/30 underline-offset-4 hover:text-[#002EAC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                <Phone
                  className="h-4 w-4 shrink-0 text-[#0066EB]"
                  aria-hidden="true"
                />
                {entry.number}
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-gray-800">
                <Phone
                  className="h-4 w-4 shrink-0 text-gray-400"
                  aria-hidden="true"
                />
                {entry.number}
              </span>
            )}
            {entry.status === 'invalid_length' && (
              <span className="text-xs text-gray-500">
                Published with non-standard length · not call-linked
              </span>
            )}
            {entry.status === 'non_mobile_published' && (
              <span className="text-xs text-gray-500">
                Published as landline
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function SecretaryRow({ contact }: { contact: BarangayContact }) {
  return (
    <div className="flex flex-col gap-2 py-3.5 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-950 sm:text-base">
          {contact.name ?? (
            <span className="italic font-normal text-gray-500">
              Name not published in the official source
            </span>
          )}
        </p>
        <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
          {contact.designation}
        </p>
      </div>
      <div className="shrink-0">
        <ContactNumbers contact={contact} />
      </div>
    </div>
  );
}

function BhertRow({ contact }: { contact: BarangayContact }) {
  return (
    <div className="flex flex-col gap-2 py-3 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {contact.name ?? (
            <span className="italic text-gray-500">
              Name not published in the official source
            </span>
          )}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">{contact.designation}</p>
      </div>
      <div className="shrink-0">
        <ContactNumbers contact={contact} />
      </div>
    </div>
  );
}

interface FilteredGroup extends BarangayContactGroup {
  matches: readonly BarangayContact[];
}

export default function GovernmentBarangayContacts() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [barangayFilter, setBarangayFilter] = useQueryState('barangay', {
    defaultValue: '',
  });
  const [contactTypeFilter, setContactTypeFilter] = useQueryState('type', {
    defaultValue: 'all',
  });
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [expandedOverride, setExpandedOverride] = useState<
    Record<string, boolean>
  >({});

  const hasActiveFilters = Boolean(
    query.trim() ||
    barangayFilter ||
    (contactTypeFilter && contactTypeFilter !== 'all')
  );

  const filteredGroups = useMemo<FilteredGroup[]>(() => {
    const normalizedQuery = query.trim();
    const hasTypeFilter = contactTypeFilter && contactTypeFilter !== 'all';

    return groups
      .filter(group => !barangayFilter || group.barangayPsgc === barangayFilter)
      .map(group => {
        let matchingContacts = group.contacts;

        if (hasTypeFilter) {
          matchingContacts = matchingContacts.filter(
            c => c.contact_type === contactTypeFilter
          );
        }

        if (normalizedQuery) {
          matchingContacts = matchingContacts.filter(c =>
            matchesQuery(c, normalizedQuery)
          );
        }

        return {
          ...group,
          matches: matchingContacts,
        };
      })
      .filter(group => {
        if (normalizedQuery || hasTypeFilter) {
          return group.matches.length > 0;
        }
        return true;
      });
  }, [query, barangayFilter, contactTypeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const paginatedGroups = useMemo(
    () =>
      filteredGroups.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
      ),
    [currentPage, filteredGroups]
  );

  const startIndex = (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, filteredGroups.length);

  const resetFilters = () => {
    void Promise.all([
      setQuery(null),
      setBarangayFilter(null),
      setContactTypeFilter(null),
      setPage(1),
    ]);
  };

  const toggleBarangay = (psgc: string) => {
    setExpandedOverride(prev => {
      const current = prev[psgc] ?? hasActiveFilters;
      return { ...prev, [psgc]: !current };
    });
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
              { label: 'Barangay Contacts' },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
            <div>
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                BARANGAY DIRECTORY
              </p>
              <h1 className="mt-1.5 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl lg:text-4xl">
                Barangay contacts across San Fernando
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base sm:leading-7">
                Find published Barangay Secretary and Barangay Health Emergency
                Response Team (BHERT) contacts for all 35 barangays in the City
                of San Fernando, Pampanga.
              </p>
            </div>

            <aside className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
              <p className="text-eyebrow text-gray-500" style={eyebrowTracking}>
                ABOUT THIS DIRECTORY
              </p>
              <h2 className="mt-1 text-sm font-bold text-gray-950">
                Barangay-level contacts
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                These records are intended for barangay-level contact and
                coordination. For citywide emergency dispatch, use Government
                Hotlines.
              </p>
              <div className="mt-3 border-t border-gray-200/80 pt-2">
                <Link
                  href="/government/hotlines"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB] hover:text-[#002EAC]"
                >
                  View Government Hotlines
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div className="container mx-auto space-y-12 px-4 pb-20 sm:space-y-16 sm:pb-24 lg:pb-28">
        {/* 2. Top Summary Metrics */}
        <section aria-labelledby="metrics-heading" className="pt-8 sm:pt-10">
          <h2 id="metrics-heading" className="sr-only">
            Barangay directory overview
          </h2>
          <div className="grid grid-cols-1 divide-y divide-gray-200 border-y border-gray-200 py-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:py-7">
            <div className="pb-4 sm:pb-0 sm:pr-6">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Barangays represented
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-gray-950 sm:text-4xl">
                {groups.length}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Complete coverage of San Fernando
              </p>
            </div>

            <div className="py-4 sm:py-0 sm:px-6">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Published contact records
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-gray-950 sm:text-4xl">
                {allContacts.length}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Official publication-reviewed records
              </p>
            </div>

            <div className="pt-4 sm:pt-0 sm:pl-6">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Last verified
              </p>
              <p className="mt-2 text-xl font-bold text-gray-950 sm:text-2xl">
                {formatDate(metadata.lastVerified)}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Official published batch review
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 sm:text-sm">
            Includes {secretaryCount} Barangay Secretary records and{' '}
            {bhertCount} BHERT contacts.
          </p>
        </section>

        {/* 3. How to Use This Directory */}
        <section aria-labelledby="how-to-use-heading">
          <div className="rounded-sm border border-gray-200 bg-white p-6 sm:p-8">
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              HOW TO USE THIS DIRECTORY
            </p>
            <h2
              id="how-to-use-heading"
              className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
            >
              Two types of barangay contacts
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-6 border-t border-gray-200 pt-6 md:grid-cols-2 md:gap-8">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xs bg-[#F3F6FB] text-[#0066EB]">
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-950">
                    Barangay Secretary
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    The published Barangay Secretary contact included in the
                    current official directory.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xs bg-[#F3F6FB] text-[#0066EB]">
                  <Users className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-950">
                    BHERT contact
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    Published Barangay Health Emergency Response Team contacts
                    associated with the barangay.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 border-t border-gray-200 pt-4 text-xs text-gray-600 sm:text-sm">
              <Info
                className="h-4 w-4 shrink-0 text-gray-500"
                aria-hidden="true"
              />
              <span>
                These records are not a substitute for 911 or citywide
                emergency-dispatch numbers.
              </span>
            </div>
          </div>
        </section>

        {/* 4. Before You Use These Contacts */}
        <section aria-labelledby="limitation-heading">
          <aside className="flex items-start gap-3.5 rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
            <Info
              className="mt-0.5 h-5 w-5 shrink-0 text-gray-700"
              aria-hidden="true"
            />
            <div className="text-sm leading-relaxed text-gray-700">
              <h2 id="limitation-heading" className="font-bold text-gray-950">
                Before you use these contacts
              </h2>
              <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                These contacts are reproduced from published official source
                directories. BetterSanFernando does not independently call-test
                every number or guarantee that a listed person or number remains
                current.
              </p>
              <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                For emergencies requiring citywide dispatch, use{' '}
                <Link
                  href="/government/hotlines"
                  className="font-semibold text-[#0066EB] underline underline-offset-4 hover:text-[#002EAC]"
                >
                  Government Hotlines
                </Link>
                .
              </p>
            </div>
          </aside>
        </section>

        {/* 5. Find a Barangay — Primary Interaction */}
        <section
          aria-labelledby="directory-search-heading"
          className="space-y-6"
        >
          <div>
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              BARANGAY DIRECTORY
            </p>
            <h2
              id="directory-search-heading"
              className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
            >
              Find a barangay
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Search the published contacts or narrow the directory to a
              specific barangay or contact type.
            </p>
          </div>

          {/* Filter Bar Surface */}
          <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_14rem_12rem_auto] md:items-center">
              {/* Search */}
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={e => {
                    void setQuery(e.target.value || null);
                    void setPage(1);
                  }}
                  placeholder="Search barangay, contact name, designation, or phone number..."
                  className="h-10 w-full rounded-sm border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                />
              </div>

              {/* Barangay Select */}
              <div>
                <label htmlFor="barangay-select" className="sr-only">
                  Filter by barangay
                </label>
                <select
                  id="barangay-select"
                  value={barangayFilter}
                  onChange={e => {
                    void setBarangayFilter(e.target.value || null);
                    void setPage(1);
                  }}
                  className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  <option value="">All barangays</option>
                  {groups.map(g => (
                    <option key={g.barangayPsgc} value={g.barangayPsgc}>
                      {g.barangayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contact Type Select */}
              <div>
                <label htmlFor="contact-type-select" className="sr-only">
                  Filter by contact type
                </label>
                <select
                  id="contact-type-select"
                  value={contactTypeFilter}
                  onChange={e => {
                    void setContactTypeFilter(
                      e.target.value === 'all'
                        ? null
                        : (e.target.value as ContactTypeFilter)
                    );
                    void setPage(1);
                  }}
                  className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  {CONTACT_TYPE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset */}
              <div>
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                  className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-sm border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] disabled:cursor-not-allowed disabled:opacity-40 md:w-auto"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Results Summary Counter */}
          <div className="flex items-center justify-between text-xs font-semibold text-gray-600 sm:text-sm">
            <p aria-live="polite">
              {filteredGroups.length === 0
                ? 'Showing 0 barangays'
                : filteredGroups.length === 1
                  ? 'Showing 1 of 1 barangay'
                  : `Showing ${startIndex}–${endIndex} of ${filteredGroups.length} barangays`}
            </p>
          </div>

          {/* Directory Content / Empty State */}
          {filteredGroups.length === 0 ? (
            <div className="rounded-sm border border-gray-200 bg-white px-6 py-12 text-center sm:py-16">
              <SearchX
                className="mx-auto h-10 w-10 text-gray-400"
                aria-hidden="true"
              />
              <h3 className="mt-3 text-base font-bold text-gray-950">
                No matching contacts
              </h3>
              <p className="mt-1.5 text-sm text-gray-600">
                Try another name, barangay, designation, or phone number.
              </p>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-9 items-center justify-center rounded-sm border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                >
                  Clear filters
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 border-y border-gray-200 bg-white sm:rounded-sm sm:border">
              {paginatedGroups.map(group => {
                const isExpanded =
                  expandedOverride[group.barangayPsgc] ?? hasActiveFilters;
                const groupSecCount = group.contacts.filter(
                  c => c.contact_type === 'BARANGAY_SECRETARY'
                ).length;
                const groupBhertCount = group.contacts.filter(
                  c => c.contact_type === 'BHERT_MEMBER'
                ).length;

                const secretaries = group.matches.filter(
                  c => c.contact_type === 'BARANGAY_SECRETARY'
                );
                const bhertMembers = group.matches.filter(
                  c => c.contact_type === 'BHERT_MEMBER'
                );

                const headerId = `barangay-header-${group.barangayPsgc}`;
                const contentId = `barangay-content-${group.barangayPsgc}`;

                return (
                  <div key={group.barangayPsgc}>
                    <button
                      type="button"
                      id={headerId}
                      aria-expanded={isExpanded}
                      aria-controls={contentId}
                      onClick={() => toggleBarangay(group.barangayPsgc)}
                      className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-[#F3F6FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066EB] sm:p-5"
                    >
                      <div className="min-w-0">
                        <p className="text-base font-bold text-gray-950 sm:text-lg">
                          {group.barangayName}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                          {groupSecCount} Barangay Secretary · {groupBhertCount}{' '}
                          BHERT contact
                          {groupBhertCount === 1 ? '' : 's'}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
                        <span className="text-xs font-medium text-gray-600 sm:text-sm">
                          {group.matches.length !== group.contacts.length
                            ? `${group.matches.length} of ${group.contacts.length} contacts`
                            : `${group.contacts.length} contacts`}
                        </span>
                        {isExpanded ? (
                          <ChevronDown
                            className="h-5 w-5 text-gray-500"
                            aria-hidden="true"
                          />
                        ) : (
                          <ChevronRight
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div
                        id={contentId}
                        role="region"
                        aria-labelledby={headerId}
                        className="border-t border-gray-200 bg-[#FAFCFF] p-4 sm:p-6"
                      >
                        <div className="space-y-6">
                          {/* Barangay Secretary records */}
                          {secretaries.length > 0 && (
                            <div>
                              <p
                                className="text-eyebrow text-[#0066EB]"
                                style={eyebrowTracking}
                              >
                                BARANGAY SECRETARY
                              </p>
                              <div className="mt-2 divide-y divide-gray-200/70 border-t border-gray-200/70">
                                {secretaries.map(contact => (
                                  <SecretaryRow
                                    key={contact.id}
                                    contact={contact}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* BHERT records */}
                          {bhertMembers.length > 0 && (
                            <div>
                              <p
                                className="text-eyebrow text-gray-500"
                                style={eyebrowTracking}
                              >
                                BHERT CONTACTS
                              </p>
                              <div className="mt-2 divide-y divide-gray-200/70 border-t border-gray-200/70">
                                {bhertMembers.map(contact => (
                                  <BhertRow
                                    key={contact.id}
                                    contact={contact}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {secretaries.length === 0 &&
                            bhertMembers.length === 0 && (
                              <p className="text-xs italic text-gray-500 sm:text-sm">
                                No contacts in this barangay match your active
                                filter.
                              </p>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="Barangay directory pagination"
              className="flex items-center justify-between gap-4 border-t border-gray-200 pt-5"
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

        {/* 6. Source and Verification */}
        <section aria-labelledby="source-heading">
          <div className="rounded-sm border border-gray-200 bg-white p-6 sm:p-8">
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              SOURCE AND VERIFICATION
            </p>
            <h2
              id="source-heading"
              className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
            >
              Where these contacts come from
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-6 border-t border-gray-200 pt-6 md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-base font-bold text-gray-950">
                  Barangay Secretaries
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                  Published City Information Office Barangay Secretary directory
                  source.
                </p>
                {secretarySource && (
                  <div className="mt-3">
                    <a
                      href={secretarySource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066EB] hover:text-[#002EAC] sm:text-sm"
                    >
                      View official source
                      <ExternalLink
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-950">
                  BHERT contacts
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                  Published Barangay Health Emergency Response Team contact
                  directory source.
                </p>
                {bhertSource && (
                  <div className="mt-3">
                    <a
                      href={bhertSource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066EB] hover:text-[#002EAC] sm:text-sm"
                    >
                      View official source
                      <ExternalLink
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-6 border-t border-gray-200 pt-4 text-xs text-gray-500 sm:text-sm">
              This is a bounded, publication-reviewed directory and not an
              independently call-tested roster.
            </p>
          </div>
        </section>

        {/* 7. Keep Exploring */}
        <section aria-labelledby="keep-exploring-heading" className="space-y-8">
          <div>
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              KEEP EXPLORING
            </p>
            <h2
              id="keep-exploring-heading"
              className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
            >
              Find another government contact
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div>
                <h3 className="text-base font-bold text-gray-950">
                  Contact the City
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                  Start with general City Government contact routes.
                </p>
              </div>
              <div className="mt-5">
                <Link
                  href="/government/contact"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#0066EB] hover:text-[#002EAC]"
                >
                  Contact the City
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div>
                <h3 className="text-base font-bold text-gray-950">
                  Government Hotlines
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                  Find citywide emergency, disaster-response, police, fire, and
                  related institutional numbers.
                </p>
              </div>
              <div className="mt-5">
                <Link
                  href="/government/hotlines"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#0066EB] hover:text-[#002EAC]"
                >
                  View Government Hotlines
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              RELATED RESOURCES
            </p>
            <div className="mt-3 divide-y divide-gray-200 border-y border-gray-200 bg-white sm:rounded-sm sm:border">
              {RELATED_RESOURCES.map(resource => (
                <div
                  key={resource.href}
                  className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5"
                >
                  <div>
                    <h4 className="text-sm font-bold text-gray-950 sm:text-base">
                      {resource.title}
                    </h4>
                    <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
                      {resource.description}
                    </p>
                  </div>
                  <Link
                    href={resource.href}
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#0066EB] hover:text-[#002EAC] sm:text-sm"
                  >
                    View directory
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
