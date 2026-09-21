'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Search, X } from 'lucide-react';
import { getSearchHref } from '../data/navigation';
import {
  searchCivicRecordsDetailed,
  type CivicSearchResult,
} from '../data/civic/search';

function subscribeMobile(callback: () => void) {
  const mql = window.matchMedia('(max-width: 639px)');
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getMobileSnapshot() {
  return window.matchMedia('(max-width: 639px)').matches;
}

function getServerSnapshot() {
  return false;
}

function getDomainBadge(result: CivicSearchResult): string {
  switch (result.domain) {
    case 'services':
      return 'SERVICE';
    case 'projects':
      return 'PROJECT';
    case 'government':
      return 'GOVERNMENT';
    case 'barangays':
      return 'BARANGAY';
    case 'public-records':
      return result.kind ? result.kind.toUpperCase() : 'PUBLIC RECORD';
    case 'pages':
      return 'PAGE';
    default:
      return (result.kind || result.domain).toUpperCase();
  }
}

export default function HomeSearchForm() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const isMobile = useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getServerSnapshot
  );

  const listboxId = useId();
  const optionIdPrefix = `${listboxId}-option`;
  const viewAllId = `${listboxId}-view-all`;

  const normalizedQuery = searchQuery.trim();
  const isSearchMode = isOpen && normalizedQuery.length >= 2;

  // Strict suggestion limits: 3 on mobile (< 640px), 4 on desktop/laptop (>= 640px)
  const searchResults = useMemo(() => {
    if (normalizedQuery.length < 2) return [];
    const maxItems = isMobile ? 3 : 4;
    return searchCivicRecordsDetailed(normalizedQuery, 'all', maxItems).results;
  }, [normalizedQuery, isMobile]);

  const totalInteractiveItems = useMemo(() => {
    if (normalizedQuery.length < 2) return 0;
    return searchResults.length > 0 ? searchResults.length + 1 : 1;
  }, [normalizedQuery.length, searchResults.length]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [closeDropdown]);

  const handleQueryChange = (value: string) => {
    setSearchQuery(value);
    setHighlightedIndex(-1);
    if (value.trim().length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    closeDropdown();
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (normalizedQuery.length >= 2) {
      setIsOpen(true);
    }
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    closeDropdown();
    router.push(getSearchHref(searchQuery));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      if (isOpen) {
        event.preventDefault();
        event.stopPropagation();
        closeDropdown();
      }
      return;
    }

    if (!isOpen || totalInteractiveItems === 0) {
      if (event.key === 'ArrowDown' && normalizedQuery.length >= 2) {
        event.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex(previous => {
        if (previous < totalInteractiveItems - 1) {
          return previous + 1;
        }
        return 0; // wrap around
      });
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex(previous => {
        if (previous > 0) {
          return previous - 1;
        }
        return totalInteractiveItems - 1; // wrap around
      });
      return;
    }

    if (event.key === 'Enter' && highlightedIndex >= 0) {
      event.preventDefault();
      closeDropdown();

      if (searchResults.length > 0) {
        if (highlightedIndex < searchResults.length) {
          router.push(searchResults[highlightedIndex].href);
        } else {
          router.push(getSearchHref(searchQuery));
        }
      } else {
        router.push(getSearchHref(searchQuery));
      }
    }
  };

  const activeDescendantId = useMemo(() => {
    if (!isOpen || highlightedIndex < 0) return undefined;
    if (highlightedIndex < searchResults.length) {
      return `${optionIdPrefix}-${highlightedIndex}`;
    }
    return viewAllId;
  }, [
    isOpen,
    highlightedIndex,
    searchResults.length,
    optionIdPrefix,
    viewAllId,
  ]);

  const searchPlaceholder = isMobile
    ? 'Search public information…'
    : 'Search services, projects, offices, barangays, or public records…';

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-[720px] xl:max-w-[760px] 2xl:max-w-[800px]"
    >
      {/* Robust Flexbox Search Control: Icon, Flexible Input, Clear X Button, Submit Button */}
      <form onSubmit={submitSearch} role="search">
        <label htmlFor="home-search" className="sr-only">
          Search BetterSanFernando
        </label>
        <div className="flex h-14 sm:h-[58px] 2xl:h-[64px] w-full items-center rounded-sm bg-white pl-3.5 pr-1.5 sm:pl-5 sm:pr-2 shadow-lg border border-transparent transition focus-within:border-[#002EAC] focus-within:ring-4 focus-within:ring-[#0066EB]/30">
          <div className="shrink-0 text-gray-400 mr-2 sm:mr-3.5 2xl:mr-4">
            <Search
              className="h-5 w-5 sm:h-5.5 sm:w-5.5 2xl:h-6 2xl:w-6"
              aria-hidden="true"
            />
          </div>

          <input
            ref={inputRef}
            id="home-search"
            type="text"
            inputMode="search"
            role="combobox"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-autocomplete="list"
            aria-expanded={isSearchMode}
            aria-haspopup="listbox"
            aria-controls={listboxId}
            aria-activedescendant={activeDescendantId}
            value={searchQuery}
            onChange={event => handleQueryChange(event.target.value)}
            onFocus={handleFocus}
            onClick={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            className="h-full flex-1 min-w-0 bg-transparent text-sm sm:text-base 2xl:text-lg text-gray-950 placeholder:text-gray-500 outline-none border-0 p-0 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
          />

          {/* Exactly one clear control (Lucide X) in flex flow, visible against white input */}
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="shrink-0 mx-0.5 sm:mx-1 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0066EB]"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 sm:h-4.5 sm:w-4.5" aria-hidden="true" />
            </button>
          )}

          {/* Search Submit Button */}
          <button
            type="submit"
            className="shrink-0 inline-flex h-11 sm:h-11.5 2xl:h-12 items-center gap-1.5 sm:gap-2 rounded-sm bg-[#002EAC] hover:bg-[#002488] active:bg-[#001c6d] px-3 sm:px-5 2xl:px-6 text-xs sm:text-sm 2xl:text-base font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] cursor-pointer"
          >
            <span>Search</span>
            <ArrowRight
              className="h-3.5 w-3.5 sm:h-4 sm:w-4 2xl:h-5 2xl:w-5"
              aria-hidden="true"
            />
          </button>
        </div>
      </form>

      {/* Autocomplete Dropdown: Absolute Overlay floating cleanly over hero content beneath it */}
      {isSearchMode && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search suggestions"
          className="absolute left-0 right-0 top-full z-40 mt-1.5 w-full overflow-hidden rounded-sm border border-gray-200 bg-white text-left shadow-xl"
        >
          {searchResults.length > 0 ? (
            <>
              <ul className="divide-y divide-gray-100">
                {searchResults.map((result, index) => {
                  const isHighlighted = highlightedIndex === index;
                  const metadataText = result.metadata;

                  return (
                    <li
                      key={result.id}
                      id={`${optionIdPrefix}-${index}`}
                      role="option"
                      aria-selected={isHighlighted}
                    >
                      <Link
                        href={result.href}
                        onClick={closeDropdown}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={`group flex items-center justify-between gap-3 px-3.5 py-2 sm:px-4 sm:py-2.5 transition-colors ${
                          isHighlighted
                            ? 'bg-[#F3F6FB]'
                            : 'bg-white hover:bg-[#F3F6FB]'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <span className="block font-mono text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-[#0066EB] leading-none">
                            {getDomainBadge(result)}
                          </span>
                          <div className="mt-0.5 truncate text-xs sm:text-[13px] font-bold text-gray-950 transition-colors group-hover:text-[#0066EB] leading-snug">
                            {result.title}
                          </div>
                          {metadataText && (
                            <p className="mt-0.5 truncate text-[11px] sm:text-xs text-gray-500 leading-none">
                              {metadataText}
                            </p>
                          )}
                        </div>
                        <ArrowRight
                          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 transition-all ${
                            isHighlighted
                              ? 'translate-x-0.5 text-[#0066EB]'
                              : 'text-gray-400 group-hover:translate-x-0.5 group-hover:text-[#0066EB]'
                          }`}
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* View all results footer row */}
              <div
                id={viewAllId}
                role="option"
                aria-selected={highlightedIndex === searchResults.length}
                className="border-t border-gray-100 bg-[#F9FAFB] p-1 sm:p-1.5"
              >
                <Link
                  href={getSearchHref(searchQuery)}
                  onClick={closeDropdown}
                  onMouseEnter={() => setHighlightedIndex(searchResults.length)}
                  className={`group flex items-center justify-between rounded-xs px-3 py-1.5 sm:py-2 text-xs sm:text-[13px] font-semibold transition-colors ${
                    highlightedIndex === searchResults.length
                      ? 'bg-[#F3F6FB] text-[#0066EB]'
                      : 'text-[#0066EB] hover:bg-[#F3F6FB]'
                  }`}
                >
                  <span className="truncate pr-2">
                    View all results for &ldquo;{normalizedQuery}&rdquo;
                  </span>
                  <ArrowRight
                    className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </>
          ) : (
            /* Compact no-results state */
            <div className="px-4 py-3 sm:px-4.5 sm:py-3.5">
              <p className="text-xs sm:text-sm font-semibold text-gray-900">
                No published matches found for &ldquo;{normalizedQuery}&rdquo;.
              </p>
              <div
                id={viewAllId}
                role="option"
                aria-selected={highlightedIndex === 0}
                className="mt-1.5"
              >
                <Link
                  href={getSearchHref(searchQuery)}
                  onClick={closeDropdown}
                  onMouseEnter={() => setHighlightedIndex(0)}
                  className={`group inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#0066EB] hover:text-[#0052BC] transition-colors ${
                    highlightedIndex === 0 ? 'underline' : ''
                  }`}
                >
                  <span>View all search results</span>
                  <ArrowRight
                    className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
