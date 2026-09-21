'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search } from 'lucide-react';
import { getSearchHref } from '../data/navigation';

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
      className="mx-auto w-full max-w-[720px] xl:max-w-[760px] 2xl:max-w-[800px]"
      role="search"
    >
      <label htmlFor="home-search" className="sr-only">
        Search BetterSanFernando
      </label>
      <div className="relative flex items-center shadow-lg">
        <div className="pointer-events-none absolute left-4 sm:left-5 2xl:left-6 text-gray-400">
          <Search
            className="h-5 w-5 sm:h-5.5 sm:w-5.5 2xl:h-6 2xl:w-6"
            aria-hidden="true"
          />
        </div>
        <input
          id="home-search"
          type="search"
          value={searchQuery}
          onChange={event => setSearchQuery(event.target.value)}
          placeholder="Search services, projects, offices, barangays, or public records…"
          className="h-14 sm:h-[58px] 2xl:h-[64px] w-full rounded-sm border border-transparent bg-white pl-12 sm:pl-14 2xl:pl-16 pr-28 sm:pr-34 2xl:pr-38 text-sm sm:text-base 2xl:text-lg text-gray-950 placeholder:text-gray-500 outline-none transition focus:border-[#002EAC] focus:ring-4 focus:ring-[#0066EB]/30"
        />
        <button
          type="submit"
          className="absolute right-1.5 sm:right-2 2xl:right-2.5 inline-flex h-11 sm:h-11.5 2xl:h-12 items-center gap-1.5 2xl:gap-2 rounded-sm bg-[#002EAC] hover:bg-[#002488] active:bg-[#001c6d] px-4 sm:px-5 2xl:px-6 text-xs sm:text-sm 2xl:text-base font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] cursor-pointer"
        >
          <span>Search</span>
          <ArrowRight className="h-4 w-4 2xl:h-5 2xl:w-5" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
