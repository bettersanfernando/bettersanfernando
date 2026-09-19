'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search, X } from 'lucide-react';
import {
  getServiceCategory,
  getServiceHref,
  getServices,
  type Service,
} from '../../data/civic/services';
import { categories } from './categories';

// Narrow client search feature for the /services hub, filtering and ranking
// the existing published service dataset in memory and linking straight to
// each service's canonical detail route via getServiceHref(). No backend,
// no external search dependency.
//
// One query/ranked-results state (held in ServiceSearchProvider) drives two
// separate presentations that live in different parts of the page tree:
//   - lg and up: ServiceSearchInput renders the input plus an absolutely
//     positioned overlay below it, inside the editorial header's finder panel.
//     The finder never grows.
//   - below lg: ServiceSearchInput renders only the input/helper text (kept
//     compact), while MobileSearchResults renders the matching rows in a
//     dedicated white section below the hero, in normal document flow, so
//     the finder card itself never becomes a tall results panel and results
//     can never float over the sticky site header.
// A shared React Context (no new dependency) is what lets those two
// sibling client components — mounted in different places by page.tsx —
// see the same query and results.

const services = getServices();
const categoryNameBySlug = new Map(
  categories.map(([name, slug]) => [slug, name])
);

const MOBILE_MAX_RESULTS = 5;
const DESKTOP_MAX_RESULTS = 6;

// Ranks a service against a (lowercased) query: title matches beat category
// matches beat description matches beat who_may_avail matches, and within a
// field a prefix ("starts with") match beats a later substring match — e.g.
// "civil" surfaces Civil Registry services before something that merely
// mentions "civil" deep in its description. Lower score = stronger match;
// null means no match at all. Deterministic, no search dependency.
function matchRank(service: Service, query: string): number | null {
  const categoryName =
    categoryNameBySlug.get(getServiceCategory(service)) ?? '';
  const fields = [
    service.title,
    categoryName,
    service.description,
    service.who_may_avail,
  ];

  for (let field = 0; field < fields.length; field++) {
    const index = fields[field].toLowerCase().indexOf(query);
    if (index === -1) continue;
    return field * 2 + (index === 0 ? 0 : 1);
  }

  return null;
}

interface SearchState {
  query: string;
  setQuery: (value: string) => void;
  results: Service[];
}

const SearchContext = createContext<SearchState | null>(null);

function useSearchState(): SearchState {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error(
      'Service search components must be rendered within ServiceSearchProvider'
    );
  }
  return context;
}

export function ServiceSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return services
      .map(service => ({ service, rank: matchRank(service, trimmed) }))
      .filter(
        (entry): entry is { service: Service; rank: number } =>
          entry.rank !== null
      )
      .sort((a, b) => a.rank - b.rank)
      .map(entry => entry.service);
  }, [query]);

  return (
    <SearchContext.Provider value={{ query, setQuery, results }}>
      {children}
    </SearchContext.Provider>
  );
}

function ResultsPanelContent({
  visibleResults,
  hiddenCount,
  totalCount,
  wrapTitles = false,
}: {
  visibleResults: readonly Service[];
  hiddenCount: number;
  totalCount: number;
  wrapTitles?: boolean;
}) {
  if (visibleResults.length === 0) {
    return (
      <div className="p-4">
        <p className="font-semibold text-gray-900">
          No matching services found.
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Try another term or{' '}
          <a
            href="#categories"
            className="font-semibold text-[#0066EB] hover:text-[#0052BC]"
          >
            browse the service categories below
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="divide-y divide-gray-100">
        {visibleResults.map(service => (
          <li key={service.slug}>
            <Link
              href={getServiceHref(service)}
              className="group flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-[#F3F6FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066EB]"
            >
              <span className="min-w-0">
                <span
                  className={`block font-semibold text-gray-900 ${wrapTitles ? 'line-clamp-2' : 'truncate'}`}
                >
                  {service.title}
                </span>
                <span className="block text-xs text-gray-500">
                  {categoryNameBySlug.get(getServiceCategory(service))} ·{' '}
                  {service.office.acronym}
                </span>
              </span>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-gray-400 transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0066EB] group-focus-visible:text-[#0066EB]"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>

      {hiddenCount > 0 && (
        <p className="border-t border-gray-100 px-4 py-2.5 text-xs text-gray-500">
          Showing {visibleResults.length} of {totalCount} matching services
        </p>
      )}
    </>
  );
}

// Rendered inside the editorial header's finder panel. Below `lg` it only ever
// shows the input and helper text — no result rows — so the finder stays
// compact; matching services on mobile render in <MobileSearchResults/>
// instead, mounted separately by page.tsx.
export default function ServiceSearchInput() {
  const { query, setQuery, results } = useSearchState();
  const hasQuery = query.trim().length > 0;

  const desktopResults = results.slice(0, DESKTOP_MAX_RESULTS);
  const desktopHiddenCount = results.length - desktopResults.length;

  return (
    <div>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />

        <input
          id="service-search"
          type="text"
          value={query}
          onChange={event => setQuery(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Escape') setQuery('');
          }}
          aria-labelledby="service-finder-heading"
          placeholder="Search permits, certificates, health services, taxes..."
          className="h-12 w-full rounded-sm border border-gray-300 bg-white pl-12 pr-12 text-base text-gray-900 outline-none placeholder:text-gray-500 focus:border-[#0066EB] focus:outline-none focus:ring-2 focus:ring-[#0066EB]/20"
        />

        {hasQuery && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-sm text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}

        {/* Desktop/tablet only: floating overlay, capped height. z-40 stays
            below the sticky site header's z-50 so the header always wins. */}
        {hasQuery && (
          <div
            className="absolute left-0 right-0 top-full z-40 mt-2 hidden max-h-[20rem] overflow-y-auto rounded-sm border border-gray-200 bg-white shadow-lg lg:block"
            role="region"
            aria-label="Search results"
          >
            <ResultsPanelContent
              visibleResults={desktopResults}
              hiddenCount={desktopHiddenCount}
              totalCount={results.length}
            />
          </div>
        )}
      </div>

      {!hasQuery && (
        <p className="mt-3 text-sm text-gray-500">
          Search by service name, document, permit, or need. Try &ldquo;birth
          certificate&rdquo;, &ldquo;business permit&rdquo;, &ldquo;PWD
          ID&rdquo;, or &ldquo;real property tax&rdquo;.
        </p>
      )}

      <p className="sr-only" aria-live="polite">
        {hasQuery
          ? `${results.length} ${results.length === 1 ? 'service' : 'services'} found`
          : ''}
      </p>
    </div>
  );
}

// Dedicated below-hero results section for mobile/tablet (< lg), mounted by
// page.tsx as a sibling right after the hero and before the category
// directory. Renders nothing while the query is empty.
export function MobileSearchResults() {
  const { query, results } = useSearchState();
  const hasQuery = query.trim().length > 0;

  if (!hasQuery) return null;

  const mobileResults = results.slice(0, MOBILE_MAX_RESULTS);
  const mobileHiddenCount = results.length - mobileResults.length;

  return (
    <section
      className="border-b border-gray-200 bg-white lg:hidden"
      aria-label="Search results"
    >
      <div className="container mx-auto px-4 py-6">
        <p className="text-eyebrow text-[#0066EB]">Search Results</p>

        {results.length > 0 && (
          <p className="mt-2 text-sm font-semibold text-gray-900">
            {results.length} {results.length === 1 ? 'match' : 'matches'} for
            &ldquo;{query}&rdquo;
          </p>
        )}

        <div
          className={
            results.length > 0 ? 'mt-4 border-t border-gray-100' : 'mt-4'
          }
        >
          <ResultsPanelContent
            visibleResults={mobileResults}
            hiddenCount={mobileHiddenCount}
            totalCount={results.length}
            wrapTitles
          />
        </div>
      </div>
    </section>
  );
}
