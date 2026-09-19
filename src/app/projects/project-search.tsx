'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search, X } from 'lucide-react';
import { getProjects, type Project } from '../../data/civic/projects';

// Narrow client search feature for the /projects hub: ranks the existing
// canonical project dataset in memory (the same fields the City Projects
// listing already filters by — project_name, barangay, contractor, bid
// reference) and links straight to each project's real detail route. No
// backend, no external search dependency.
//
// One query/ranked-results state (held in ProjectSearchProvider) drives two
// presentations mounted in different parts of the page tree, mirroring the
// approved Services search:
//   - lg and up: ProjectSearchInput renders the input plus an absolutely
//     positioned overlay below it, inside the hero's white panel. The hero
//     never grows.
//   - below lg: ProjectSearchInput renders only the input, while
//     MobileProjectSearchResults renders the matching rows in a dedicated
//     white section below the hero, in normal document flow, so results can
//     never float over the sticky site header or bloat the hero card.

const projects = getProjects();

const MOBILE_MAX_RESULTS = 5;
const DESKTOP_MAX_RESULTS = 5;

// Ranks a project against a (lowercased) query: project-name matches beat
// barangay matches beat contractor matches beat bid-reference matches, and
// within a field a prefix ("starts with") match beats a later substring
// match. Lower score = stronger match; null means no match. Deterministic,
// no search dependency — mirrors the Services search's matchRank shape.
function matchRank(project: Project, query: string): number | null {
  const fields = [
    project.project_name,
    project.barangay ?? '',
    project.contractor ?? '',
    project.identifiers.bid_reference ?? '',
  ];

  for (let field = 0; field < fields.length; field++) {
    const index = fields[field].toLowerCase().indexOf(query);
    if (index === -1) continue;
    return field * 2 + (index === 0 ? 0 : 1);
  }

  return null;
}

interface ProjectSearchState {
  query: string;
  setQuery: (value: string) => void;
  results: Project[];
}

const ProjectSearchContext = createContext<ProjectSearchState | null>(null);

function useProjectSearchState(): ProjectSearchState {
  const context = useContext(ProjectSearchContext);
  if (!context) {
    throw new Error(
      'Project search components must be rendered within ProjectSearchProvider'
    );
  }
  return context;
}

export function ProjectSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return projects
      .map(project => ({ project, rank: matchRank(project, trimmed) }))
      .filter(
        (entry): entry is { project: Project; rank: number } =>
          entry.rank !== null
      )
      .sort((a, b) => a.rank - b.rank)
      .map(entry => entry.project);
  }, [query]);

  return (
    <ProjectSearchContext.Provider value={{ query, setQuery, results }}>
      {children}
    </ProjectSearchContext.Provider>
  );
}

function ProjectResultRow({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066EB]"
    >
      <span className="min-w-0">
        <span className="block truncate font-semibold text-gray-900">
          {project.project_name}
        </span>
        <span className="block text-xs text-gray-500">
          {project.barangay ?? 'Barangay not specified'} · {project.year}
        </span>
      </span>
      <ArrowRight
        className="h-4 w-4 shrink-0 text-gray-400"
        aria-hidden="true"
      />
    </Link>
  );
}

function NoMatches() {
  return (
    <div className="p-4">
      <p className="font-semibold text-gray-900">No matching projects found.</p>
      <p className="mt-1 text-sm text-gray-600">
        Try another term or{' '}
        <Link
          href="/projects/city-projects"
          className="font-semibold text-[#0066EB] hover:text-[#0052BC]"
        >
          browse the complete City Projects directory
        </Link>
        .
      </p>
    </div>
  );
}

// Rendered inside the hero's white "Start exploring" panel. Below `lg` it
// only ever shows the input — no result rows — so the panel stays compact;
// matching projects on mobile render in <MobileProjectSearchResults/>
// instead, mounted separately by page.tsx.
export default function ProjectSearchInput() {
  const { query, setQuery, results } = useProjectSearchState();
  const router = useRouter();
  const hasQuery = query.trim().length > 0;
  const desktopResults = results.slice(0, DESKTOP_MAX_RESULTS);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/projects/city-projects?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="project-search" className="sr-only">
        Search project name, barangay, contractor, or bid reference
      </label>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />

        <input
          id="project-search"
          type="text"
          value={query}
          onChange={event => setQuery(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Escape') setQuery('');
          }}
          placeholder="Search project name, barangay, contractor..."
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-10 text-sm text-gray-900 outline-none placeholder:text-gray-500 focus:border-[#0066EB] focus:outline-none focus:ring-2 focus:ring-[#0066EB]/20"
        />

        {hasQuery && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear project search"
            className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}

        {/* Desktop/tablet only: capped floating overlay. z-40 stays below
            the sticky site header's z-50 so the header always wins. */}
        {hasQuery && (
          <div
            className="absolute left-0 right-0 top-full z-40 mt-2 hidden max-h-[20rem] overflow-y-auto rounded-xl border border-gray-200 bg-white text-left shadow-lg lg:block"
            role="region"
            aria-label="Project search results"
          >
            {desktopResults.length === 0 ? (
              <NoMatches />
            ) : (
              <ul className="divide-y divide-gray-100">
                {desktopResults.map(project => (
                  <li key={project.id}>
                    <ProjectResultRow project={project} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {hasQuery
          ? `${results.length} ${results.length === 1 ? 'project' : 'projects'} found`
          : ''}
      </p>
    </form>
  );
}

// Dedicated below-hero results section for mobile/tablet (< lg), mounted by
// page.tsx as a sibling right after the hero. Renders nothing while the
// query is empty.
export function MobileProjectSearchResults() {
  const { query, results } = useProjectSearchState();
  const hasQuery = query.trim().length > 0;

  if (!hasQuery) return null;

  const mobileResults = results.slice(0, MOBILE_MAX_RESULTS);

  return (
    <section
      className="border-b border-gray-200 bg-white lg:hidden"
      aria-label="Project search results"
    >
      <div className="container mx-auto px-4 py-6">
        <p className="text-eyebrow text-[#0066EB]">Search Results</p>

        {mobileResults.length > 0 && (
          <p className="mt-2 text-sm font-semibold text-gray-900">
            Top matches for &ldquo;{query}&rdquo;
          </p>
        )}

        <div
          className={
            mobileResults.length > 0 ? 'mt-4 border-t border-gray-100' : 'mt-4'
          }
        >
          {mobileResults.length === 0 ? (
            <NoMatches />
          ) : (
            <ul className="divide-y divide-gray-100">
              {mobileResults.map(project => (
                <li key={project.id}>
                  <ProjectResultRow project={project} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {mobileResults.length > 0 && (
          <Link
            href={`/projects/city-projects?q=${encodeURIComponent(query.trim())}`}
            className="mt-3 inline-flex items-center gap-1.5 border-t border-gray-100 pt-3 text-sm font-semibold text-[#0066EB] hover:text-[#0052BC]"
          >
            View all matching projects
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </section>
  );
}
