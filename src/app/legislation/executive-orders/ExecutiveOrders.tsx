'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useQueryState, parseAsInteger } from 'nuqs';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileCheck2,
  FileText,
  RotateCcw,
  Search,
  SearchX,
} from 'lucide-react';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getExecutiveOrders,
  getExecutiveOrdersMetadata,
  getLegislationTitle,
  type LegislationRecord,
} from '../../../data/civic/legislation';

type RecordStatusFilter = 'all' | 'full-official' | 'subject-verified';
type DocumentAvailabilityFilter = 'all' | 'available' | 'not-recovered';
type SortOrder = 'newest' | 'oldest' | 'reference';

const PAGE_SIZE = 10;
const eyebrowTracking = { letterSpacing: '0.08em' };

const allOrders = getExecutiveOrders();
const metadata = getExecutiveOrdersMetadata();

const availableYears = Array.from(
  new Set(allOrders.map(order => order.year))
).sort((a, b) => b - a);

const fullTextCount = allOrders.filter(
  order => order.full_text_available && Boolean(order.official_pdf_url)
).length;

const subjectVerifiedCount = allOrders.filter(
  order => order.verification_level === 'SUBJECT_VERIFIED'
).length;

const STATUS_OPTIONS: Array<{ value: RecordStatusFilter; label: string }> = [
  { value: 'all', label: 'All records' },
  { value: 'full-official', label: 'Full official record' },
  { value: 'subject-verified', label: 'Subject verified' },
];

const DOCUMENT_OPTIONS: Array<{
  value: DocumentAvailabilityFilter;
  label: string;
}> = [
  { value: 'all', label: 'All documents' },
  { value: 'available', label: 'Full text available' },
  { value: 'not-recovered', label: 'Full text not recovered' },
];

const SORT_OPTIONS: Array<{ value: SortOrder; label: string }> = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'reference', label: 'Order number A–Z' },
];

const RELATED_RESOURCES = [
  {
    title: 'Resolutions',
    description: 'Browse the current published Resolution collection.',
    href: '/legislation/resolutions',
  },
  {
    title: 'Official Government Links',
    description: 'Open verified City Government websites and online services.',
    href: '/government/links',
  },
];

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

function matchesQuery(order: LegislationRecord, query: string): boolean {
  const normalizedQuery = query.toLowerCase();

  return [
    order.document_number,
    order.title,
    order.official_title,
    order.subject,
    order.issuer_name,
    order.issuer_title,
    order.issuing_body,
  ].some(value => value?.toLowerCase().includes(normalizedQuery));
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

function OrderDateDisplay({ order }: { order: LegislationRecord }) {
  if (order.date_precision === 'year' || !order.date_issued) {
    return (
      <span className="inline-flex flex-wrap items-baseline gap-1.5">
        <span className="font-semibold text-gray-950">{order.year}</span>
        <span className="text-xs text-gray-500">
          (Exact issue date not recovered)
        </span>
      </span>
    );
  }

  return (
    <time dateTime={order.date_issued} className="font-medium text-gray-900">
      {formatDate(order.date_issued)}
    </time>
  );
}

function OrderRow({ order }: { order: LegislationRecord }) {
  const isSubjectVerified = order.verification_level === 'SUBJECT_VERIFIED';
  const hasFullText =
    order.full_text_available && Boolean(order.official_pdf_url);
  const formalTitle = getLegislationTitle(order);

  return (
    <article
      aria-label={`Executive Order ${order.document_number}`}
      className="p-5 transition-colors hover:bg-[#F3F6FB] sm:p-6"
    >
      {/* Header bar: Reference + Date + Status */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
          <span className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            EXECUTIVE ORDER
          </span>
          <span className="font-mono text-sm font-bold text-gray-950 sm:text-base">
            {order.document_number}
          </span>
          <span className="text-gray-300" aria-hidden="true">
            ·
          </span>
          <span className="text-xs text-gray-600 sm:text-sm">
            <OrderDateDisplay order={order} />
          </span>
        </div>

        <div>
          {isSubjectVerified ? (
            <span
              className="text-eyebrow text-gray-600"
              style={eyebrowTracking}
            >
              SUBJECT VERIFIED
            </span>
          ) : (
            <span
              className="text-eyebrow text-[#0066EB]"
              style={eyebrowTracking}
            >
              FULL OFFICIAL RECORD
            </span>
          )}
        </div>
      </div>

      {/* Main content: Formal Title OR Verified Subject */}
      <div className="mt-3">
        {isSubjectVerified ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Verified subject
            </p>
            <p className="mt-1 text-sm font-normal leading-relaxed text-gray-900 sm:text-base">
              {order.subject}
            </p>
            <p className="mt-2 text-xs italic text-gray-500">
              Formal title and full text have not been recovered in the
              currently published record.
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-sm font-semibold leading-relaxed text-gray-950 sm:text-base">
              {formalTitle}
            </h2>
          </div>
        )}
      </div>

      {/* Metadata & Actions row */}
      <div className="mt-4 flex flex-col justify-between gap-3 border-t border-gray-100 pt-3.5 sm:flex-row sm:items-center">
        <div className="text-xs text-gray-600 sm:text-sm">
          <p>
            {order.issuing_body}
            {order.issuer_name && (
              <>
                {' · '}
                <span className="font-medium text-gray-800">
                  {order.issuer_name}
                  {order.issuer_title && `, ${order.issuer_title}`}
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#0066EB] sm:text-sm">
          {isSubjectVerified ? (
            order.reference_url && (
              <a
                href={order.reference_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open official reference for Executive Order ${order.document_number} (opens in a new tab)`}
                className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-[#002EAC]"
              >
                Official reference
                <ExternalLink
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
              </a>
            )
          ) : (
            <>
              {order.official_page_url && (
                <a
                  href={order.official_page_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open official source page for Executive Order ${order.document_number} (opens in a new tab)`}
                  className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-[#002EAC]"
                >
                  Official source
                  <ExternalLink
                    className="h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                </a>
              )}
              {hasFullText && order.official_pdf_url && (
                <a
                  href={order.official_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Read full text PDF for Executive Order ${order.document_number} (opens in a new tab)`}
                  className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-[#002EAC]"
                >
                  Read full text PDF
                  <ExternalLink
                    className="h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ExecutiveOrders() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [yearFilter, setYearFilter] = useQueryState('year', {
    defaultValue: 'all',
  });
  const [statusFilter, setStatusFilter] = useQueryState('status', {
    defaultValue: 'all',
  });
  const [documentFilter, setDocumentFilter] = useQueryState('document', {
    defaultValue: 'all',
  });
  const [sort, setSort] = useQueryState('sort', {
    defaultValue: 'newest' as SortOrder,
  });
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const hasActiveFilters = Boolean(
    query.trim() ||
    yearFilter !== 'all' ||
    statusFilter !== 'all' ||
    documentFilter !== 'all' ||
    sort !== 'newest'
  );

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim();

    const result = allOrders.filter(order => {
      // 1. Search query
      if (normalizedQuery && !matchesQuery(order, normalizedQuery)) {
        return false;
      }

      // 2. Year filter
      if (yearFilter !== 'all' && order.year.toString() !== yearFilter) {
        return false;
      }

      // 3. Status filter
      if (statusFilter === 'full-official') {
        if (order.verification_level === 'SUBJECT_VERIFIED') return false;
      } else if (statusFilter === 'subject-verified') {
        if (order.verification_level !== 'SUBJECT_VERIFIED') return false;
      }

      // 4. Document availability filter
      const hasPdf =
        order.full_text_available && Boolean(order.official_pdf_url);
      if (documentFilter === 'available' && !hasPdf) {
        return false;
      }
      if (documentFilter === 'not-recovered' && hasPdf) {
        return false;
      }

      return true;
    });

    return result.sort((a, b) => {
      if (sort === 'reference') {
        return a.document_number.localeCompare(b.document_number, 'en-PH');
      }

      const dateA = a.date_issued ?? `${a.year}-00-00`;
      const dateB = b.date_issued ?? `${b.year}-00-00`;

      if (sort === 'oldest') {
        const cmp = dateA.localeCompare(dateB);
        if (cmp !== 0) return cmp;
        return a.document_number.localeCompare(b.document_number, 'en-PH');
      }

      // Default: newest
      const cmp = dateB.localeCompare(dateA);
      if (cmp !== 0) return cmp;
      return a.document_number.localeCompare(b.document_number, 'en-PH');
    });
  }, [query, yearFilter, statusFilter, documentFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const paginatedOrders = useMemo(
    () =>
      filteredOrders.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
      ),
    [currentPage, filteredOrders]
  );

  const startIndex = (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, filteredOrders.length);

  const resetFilters = () => {
    void Promise.all([
      setQuery(null),
      setYearFilter(null),
      setStatusFilter(null),
      setDocumentFilter(null),
      setSort(null),
      setPage(1),
    ]);
  };

  return (
    <main className="bg-white text-gray-900">
      {/* 1. Header / Editorial Intro */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Legislation', href: '/legislation' },
              { label: 'Executive Orders' },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
            <div>
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                EXECUTIVE ORDERS
              </p>
              <h1 className="mt-1.5 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl lg:text-4xl">
                Verified Executive Order records
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base sm:leading-7">
                Browse Executive Order records currently verified for
                publication by BetterSanFernando, including available official
                pages and full-text documents.
              </p>
            </div>

            <aside className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
              <p className="text-eyebrow text-gray-500" style={eyebrowTracking}>
                ABOUT THIS COLLECTION
              </p>
              <h2 className="mt-1 text-sm font-bold text-gray-950">
                A verified, bounded archive
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                This collection contains Executive Orders that BetterSanFernando
                has been able to verify from official City sources. It is not a
                complete historical register, and an order missing here may
                still have been issued by the City.
              </p>
              <p className="mt-3 border-t border-gray-200/80 pt-2 text-[11px] text-gray-500">
                Independent and community-run. Not an official City Government
                website.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <div className="container mx-auto space-y-12 px-4 pb-20 sm:space-y-16 sm:pb-24 lg:pb-28">
        {/* 2. Top Summary Metrics */}
        <section aria-labelledby="metrics-heading" className="pt-8 sm:pt-10">
          <h2 id="metrics-heading" className="sr-only">
            Executive Orders overview
          </h2>
          <div className="grid grid-cols-1 divide-y divide-gray-200 border-y border-gray-200 py-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:py-7">
            <div className="pb-4 sm:pb-0 sm:pr-6">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Verified records
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-gray-950 sm:text-4xl">
                {allOrders.length}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Verified Executive Order subset
              </p>
            </div>

            <div className="py-4 sm:py-0 sm:px-6">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                With official full text
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-gray-950 sm:text-4xl">
                {fullTextCount}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Recovered official PDF documents
              </p>
            </div>

            <div className="pt-4 sm:pt-0 sm:pl-6">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Subject-verified records
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-gray-950 sm:text-4xl">
                {subjectVerifiedCount}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Verified via official cross-references
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 sm:text-sm">
            Last verified: {formatDate(metadata.lastVerified)}
          </p>
        </section>

        {/* 3. How to Read This Archive */}
        <section aria-labelledby="how-to-read-heading">
          <div className="rounded-sm border border-gray-200 bg-white p-6 sm:p-8">
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              HOW TO READ THIS ARCHIVE
            </p>
            <h2
              id="how-to-read-heading"
              className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
            >
              Two levels of published evidence
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-6 border-t border-gray-200 pt-6 md:grid-cols-2 md:gap-8">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xs bg-[#F3F6FB] text-[#0066EB]">
                  <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-950">
                    Full official record
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    The Executive Order has an official City record and a
                    recovered official full-text document.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xs bg-[#F3F6FB] text-gray-600">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-950">
                    Subject verified from an official reference
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    An official City record confirms the Executive Order number
                    and subject, but BetterSanFernando has not recovered the
                    order’s formal title or full text.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Executive Order Archive — Primary Interaction */}
        <section aria-labelledby="archive-heading" className="space-y-6">
          <div>
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              EXECUTIVE ORDER ARCHIVE
            </p>
            <h2
              id="archive-heading"
              className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
            >
              Find an Executive Order
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Search verified Executive Order records or narrow the archive by
              year, evidence status, or document availability.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_9rem_11rem_12rem_11rem_auto] lg:items-center">
              {/* Search */}
              <div className="relative sm:col-span-2 lg:col-span-1">
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
                  placeholder="Search order number, title, subject, or issuer..."
                  className="h-10 w-full rounded-sm border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                />
              </div>

              {/* Year Select */}
              <div>
                <label htmlFor="year-select" className="sr-only">
                  Filter by year
                </label>
                <select
                  id="year-select"
                  value={yearFilter}
                  onChange={e => {
                    void setYearFilter(
                      e.target.value === 'all' ? null : e.target.value
                    );
                    void setPage(1);
                  }}
                  className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  <option value="all">All years</option>
                  {availableYears.map(year => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Record Status Select */}
              <div>
                <label htmlFor="status-select" className="sr-only">
                  Filter by record status
                </label>
                <select
                  id="status-select"
                  value={statusFilter}
                  onChange={e => {
                    void setStatusFilter(
                      e.target.value === 'all'
                        ? null
                        : (e.target.value as RecordStatusFilter)
                    );
                    void setPage(1);
                  }}
                  className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Availability Select */}
              <div>
                <label htmlFor="document-select" className="sr-only">
                  Filter by document availability
                </label>
                <select
                  id="document-select"
                  value={documentFilter}
                  onChange={e => {
                    void setDocumentFilter(
                      e.target.value === 'all'
                        ? null
                        : (e.target.value as DocumentAvailabilityFilter)
                    );
                    void setPage(1);
                  }}
                  className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  {DOCUMENT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Select */}
              <div>
                <label htmlFor="sort-select" className="sr-only">
                  Sort Executive Orders
                </label>
                <select
                  id="sort-select"
                  value={sort}
                  onChange={e => {
                    void setSort(
                      e.target.value === 'newest'
                        ? null
                        : (e.target.value as SortOrder)
                    );
                    void setPage(1);
                  }}
                  className="h-10 w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Button */}
              <div>
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                  className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-sm border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] disabled:cursor-not-allowed disabled:opacity-40 lg:w-auto"
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
              {filteredOrders.length === 0
                ? 'Showing 0 Executive Orders'
                : filteredOrders.length === 1
                  ? 'Showing 1 of 1 Executive Order'
                  : `Showing ${startIndex}–${endIndex} of ${filteredOrders.length} Executive Orders`}
            </p>
          </div>

          {/* Results List / Empty State */}
          {filteredOrders.length === 0 ? (
            <div className="rounded-sm border border-gray-200 bg-white px-6 py-12 text-center sm:py-16">
              <SearchX
                className="mx-auto h-10 w-10 text-gray-400"
                aria-hidden="true"
              />
              <h3 className="mt-3 text-base font-bold text-gray-950">
                No matching Executive Orders
              </h3>
              <p className="mt-1.5 text-sm text-gray-600">
                Try another order number, title, subject, year, or issuer.
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
              {paginatedOrders.map(order => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="Executive Orders pagination"
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

        {/* 5. Source and Coverage */}
        <section aria-labelledby="source-coverage-heading">
          <div className="rounded-sm border border-gray-200 bg-white p-6 sm:p-8">
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              SOURCE AND COVERAGE
            </p>
            <h2
              id="source-coverage-heading"
              className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
            >
              What this archive represents
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-6 border-t border-gray-200 pt-6 md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-base font-bold text-gray-950">Included</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                  Executive Order records that BetterSanFernando has verified
                  sufficiently for publication using official City sources.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-950">
                  Not implied
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                  Absence from this page does not mean an Executive Order was
                  never issued. This collection is not a complete historical
                  register.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col justify-between gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center">
              <p className="text-xs text-gray-500 sm:text-sm">
                The City’s official Executive Orders archive remains the primary
                official publication source for the records it hosts.
              </p>
              {metadata.sourceArchiveUrl && (
                <a
                  href={metadata.sourceArchiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#0066EB] underline underline-offset-4 hover:text-[#002EAC] sm:text-sm"
                >
                  View official Executive Orders archive
                  <ExternalLink
                    className="h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                </a>
              )}
            </div>
          </div>
        </section>

        {/* 6. Keep Exploring */}
        <section aria-labelledby="keep-exploring-heading" className="space-y-8">
          <div>
            <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
              KEEP EXPLORING
            </p>
            <h2
              id="keep-exploring-heading"
              className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
            >
              Explore City legislation
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div>
                <h3 className="text-base font-bold text-gray-950">
                  Legislation Overview
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                  Browse the legislation collections currently published by
                  BetterSanFernando.
                </p>
              </div>
              <div className="mt-5">
                <Link
                  href="/legislation"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#0066EB] hover:text-[#002EAC]"
                >
                  View Legislation Overview
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <div>
                <h3 className="text-base font-bold text-gray-950">
                  Ordinances
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                  Browse verified City Ordinance records.
                </p>
              </div>
              <div className="mt-5">
                <Link
                  href="/legislation/ordinances"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#0066EB] hover:text-[#002EAC]"
                >
                  Browse Ordinances
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
