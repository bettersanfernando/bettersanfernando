import { useMemo } from 'react';
import { useQueryState } from 'nuqs';
import { Link } from 'react-router';
import {
  ArrowRight,
  Building2,
  FileSearch2,
  FileText,
  FolderKanban,
  MapPinned,
  Search as SearchIcon,
  X,
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import {
  CIVIC_SEARCH_DOMAINS,
  searchCivicRecords,
  type CivicSearchDomain,
  type CivicSearchResult,
} from '../data/civic/search';

type SearchFilter = CivicSearchDomain | 'all';

const FILTERS: ReadonlyArray<{ value: SearchFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'projects', label: 'Projects' },
  { value: 'barangays', label: 'Barangays' },
  { value: 'government', label: 'Government' },
  { value: 'legislation', label: 'Legislation' },
  { value: 'sources', label: 'Sources' },
];

const DOMAIN_ICONS = {
  projects: FolderKanban,
  barangays: MapPinned,
  government: Building2,
  legislation: FileText,
  sources: FileSearch2,
} satisfies Record<CivicSearchDomain, typeof SearchIcon>;

function isSearchFilter(value: string): value is SearchFilter {
  return (
    value === 'all' || CIVIC_SEARCH_DOMAINS.includes(value as CivicSearchDomain)
  );
}

function ResultRow({ result }: { result: CivicSearchResult }) {
  const Icon = DOMAIN_ICONS[result.domain];

  return (
    <li className="border-b border-gray-200 last:border-b-0">
      <Link
        to={result.href}
        className="group grid gap-4 px-5 py-6 transition-colors hover:bg-primary-50 focus-visible:bg-primary-50 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-primary-600 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:items-start sm:px-6"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700 group-hover:bg-white group-hover:text-primary-800">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-xs font-bold uppercase tracking-wide text-primary-700">
              {result.kind}
            </span>
            <span className="break-all text-xs text-gray-600">
              {result.metadata}
            </span>
          </div>
          <h2 className="mt-1.5 break-words text-lg font-bold leading-7 text-gray-900 group-hover:text-primary-800">
            {result.title}
          </h2>
          <p className="mt-1 max-w-[72ch] text-sm leading-6 text-gray-700">
            {result.description}
          </p>
        </div>
        <span className="inline-flex min-h-11 items-center gap-1.5 justify-self-start text-sm font-bold text-primary-700 underline decoration-primary-300 underline-offset-4 group-hover:text-primary-900 sm:justify-self-end">
          Open record
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </Link>
    </li>
  );
}

export default function Search() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [filterValue, setFilter] = useQueryState('domain', {
    defaultValue: 'all',
  });
  const filter = isSearchFilter(filterValue) ? filterValue : 'all';
  const normalizedQuery = query.trim();
  const queryIsTooShort = normalizedQuery.length === 1;
  const hasSearchQuery = normalizedQuery.length >= 2;
  const results = useMemo(
    () =>
      hasSearchQuery ? searchCivicRecords(normalizedQuery, filter, 100) : [],
    [filter, hasSearchQuery, normalizedQuery]
  );

  const clearSearch = () => {
    void Promise.all([setQuery(null), setFilter(null)]);
  };

  return (
    <>
      <SEO
        title="Search BetterSanFernando"
        description="Search currently published BetterSanFernando projects, barangays, government offices, legislation, and project-source records."
        keywords="BetterSanFernando search, civic records, projects, barangays, government offices, legislation"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/search`}
        siteName="BetterSanFernando"
      />
      <main className="flex-grow bg-gray-50">
        <section className="border-b border-primary-100 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <Breadcrumbs
              className="mb-8"
              items={[{ label: 'Home', href: '/' }, { label: 'Search' }]}
            />
            <header className="max-w-3xl">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
                <SearchIcon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                Search BetterSanFernando
              </h1>
              <p className="mt-4 max-w-[70ch] text-base leading-relaxed text-gray-700 md:text-lg">
                Search records currently published by BetterSanFernando across
                projects, barangays, government offices, legislation, and
                project sources. This is a bounded public-data search, not a
                search of every City Government record.
              </p>
            </header>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="rounded-xl bg-white p-5 shadow-[0_8px_28px_rgba(0,41,94,0.08)] md:p-7">
            <label
              htmlFor="civic-search"
              className="block text-sm font-bold text-gray-900"
            >
              Search published civic records
            </label>
            <div className="relative mt-2">
              <SearchIcon
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600"
                aria-hidden="true"
              />
              <input
                id="civic-search"
                type="search"
                value={query}
                onChange={event => void setQuery(event.target.value || null)}
                placeholder="Search projects, barangays, offices, legislation..."
                className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-12 pr-12 text-base text-gray-900 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-200"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </div>
            <p className="mt-2 text-xs leading-5 text-gray-600">
              Try a project title, barangay, office acronym, document number, or
              public project identifier.
            </p>

            <fieldset className="mt-6 border-t border-gray-200 pt-5">
              <legend className="text-sm font-bold text-gray-900">
                Filter by domain
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {FILTERS.map(option => {
                  const selected = option.value === filter;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        void setFilter(
                          option.value === 'all' ? null : option.value
                        )
                      }
                      aria-pressed={selected}
                      className={`min-h-11 rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${
                        selected
                          ? 'bg-primary-700 text-white hover:bg-primary-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          <div className="mt-8" aria-live="polite" aria-atomic="true">
            {!normalizedQuery && (
              <div className="border-y border-gray-200 bg-white px-5 py-10 text-center md:px-8">
                <SearchIcon
                  className="mx-auto h-7 w-7 text-primary-700"
                  aria-hidden="true"
                />
                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  Start with a name, title, location, or identifier
                </h2>
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-gray-700">
                  Search published projects and their sources, barangays,
                  institutional office records, Executive Orders, and
                  Ordinances.
                </p>
              </div>
            )}

            {queryIsTooShort && (
              <div className="border-y border-gray-200 bg-white px-5 py-10 text-center md:px-8">
                <h2 className="text-xl font-bold text-gray-900">
                  Enter at least 2 characters
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-700">
                  A slightly longer query keeps typo-tolerant results relevant.
                </p>
              </div>
            )}

            {hasSearchQuery && results.length === 0 && (
              <div className="border-y border-gray-200 bg-white px-5 py-10 text-center md:px-8">
                <FileSearch2
                  className="mx-auto h-7 w-7 text-primary-700"
                  aria-hidden="true"
                />
                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  No published BetterSanFernando records matched
                </h2>
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-gray-700">
                  Check the spelling, try fewer words, switch to All domains, or
                  browse the{' '}
                  <Link
                    to="/government"
                    className="font-bold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                  >
                    Government
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="/projects"
                    className="font-bold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                  >
                    Projects
                  </Link>{' '}
                  sections directly.
                </p>
              </div>
            )}
          </div>

          {hasSearchQuery && results.length > 0 && (
            <section aria-labelledby="search-results-heading" className="mt-8">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <h2
                    id="search-results-heading"
                    className="text-2xl font-bold text-gray-900"
                  >
                    Search results
                  </h2>
                  <p className="mt-1 text-sm text-gray-700" aria-live="polite">
                    {results.length} matching published{' '}
                    {results.length === 1 ? 'record' : 'records'} shown for{' '}
                    <span className="font-semibold text-gray-900">
                      &ldquo;{normalizedQuery}&rdquo;
                    </span>
                  </p>
                </div>
                {results.length === 100 && (
                  <p className="text-xs text-gray-600">
                    Refine the query to narrow the first 100 results.
                  </p>
                )}
              </div>
              <ul className="mt-5 overflow-hidden rounded-xl bg-white shadow-[0_8px_28px_rgba(0,41,94,0.08)]">
                {results.map(result => (
                  <ResultRow key={result.id} result={result} />
                ))}
              </ul>
            </section>
          )}
        </section>

        <section className="border-y border-gray-200 bg-white">
          <div className="container mx-auto grid gap-6 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center md:py-12">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-gray-900">
                Search coverage
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                Search results cover frontend-safe records currently published
                by BetterSanFernando. Absence from search does not mean a City
                record, office, project, or document does not exist.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold">
              <Link
                to="/transparency/sources"
                className="inline-flex min-h-11 items-center text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
              >
                Explore Sources
              </Link>
              <Link
                to="/transparency/methodology"
                className="inline-flex min-h-11 items-center text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
              >
                Read Methodology
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
