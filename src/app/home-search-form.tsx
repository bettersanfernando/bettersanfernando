'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search } from 'lucide-react';
import { getSearchHref } from '../data/navigation';

// The only interactive piece of the home page (Home.tsx): a controlled
// search input that navigates to /search?q=... on submit. Extracted into
// its own narrow Client Component so the rest of the home page stays a
// Server Component. Mirrors Home.tsx's submitSearch exactly, using
// next/navigation's useRouter() in place of react-router's useNavigate().
export default function HomeSearchForm() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(getSearchHref(searchQuery));
  }

  return (
    <form
      onSubmit={submitSearch}
      className="rounded-xl bg-primary-50 p-5 text-primary-950 md:p-6"
      role="search"
    >
      <label htmlFor="home-search" className="text-lg font-bold">
        Search BetterSanFernando
      </label>
      <p className="mt-1 text-sm leading-6 text-primary-900">
        Search currently published projects, barangays, offices, legislation,
        and project-source records.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-700"
            aria-hidden="true"
          />
          <input
            id="home-search"
            type="search"
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            placeholder="Project, barangay, office, or document"
            className="w-full rounded-lg border border-primary-200 bg-white py-3 pl-11 pr-4 text-base text-gray-900 outline-none transition placeholder:text-gray-600 focus:border-primary-600 focus:ring-2 focus:ring-primary-200"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          Search
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
