'use client';

import { useState, useRef, useEffect, useMemo, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Search, ArrowUpRight } from 'lucide-react';
import {
  getServices,
  getServiceHref,
  type Service,
} from '../../data/civic/services';

const allServices: readonly Service[] = getServices();

interface HomeServiceSearchProps {
  className?: string;
}

export default function HomeServiceSearch({
  className = '',
}: HomeServiceSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matches = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length < 2) return [];

    return allServices
      .filter(service => {
        const titleMatch = service.title.toLowerCase().includes(trimmed);
        const acronymMatch = service.office.acronym
          .toLowerCase()
          .includes(trimmed);
        const descMatch = service.description.toLowerCase().includes(trimmed);
        return titleMatch || acronymMatch || descMatch;
      })
      .slice(0, 4);
  }, [query]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsOpen(false);
    if (query.trim()) {
      router.push(`/services?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/services');
    }
  }

  function handleViewAll() {
    setIsOpen(false);
    if (query.trim()) {
      router.push(`/services?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/services');
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`.trim()}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative flex items-center">
          <Search
            className="pointer-events-none absolute left-4 h-4 w-4 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="search"
            name="q"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (query.trim().length >= 2) setIsOpen(true);
            }}
            onKeyDown={e => {
              if (e.key === 'Escape') setIsOpen(false);
            }}
            placeholder="Search permits, certificates, assistance, health services, requirements…"
            aria-label="Search services"
            aria-expanded={isOpen && matches.length > 0}
            aria-autocomplete="list"
            className="h-12 w-full rounded-sm border border-gray-300 bg-white pl-11 pr-24 text-xs text-gray-950 placeholder:text-gray-500 transition-colors focus:border-[#0066EB] focus:outline-none focus:ring-2 focus:ring-[#0066EB]/20 sm:h-13 sm:pr-28 sm:text-sm"
          />
          <button
            type="submit"
            className="absolute right-1.5 inline-flex h-9 items-center gap-1.5 rounded-sm bg-[#0066EB] px-3.5 text-xs font-semibold text-white transition-colors hover:bg-[#0052BC] focus:outline-none focus:ring-2 focus:ring-[#0066EB] focus:ring-offset-1 sm:h-10 sm:px-4 sm:text-sm"
          >
            <span>Find</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </form>

      {/* Lightweight Autocomplete Overlay */}
      {isOpen && matches.length > 0 && (
        <div
          role="listbox"
          aria-label="Matching services"
          className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-sm border border-gray-200 bg-white shadow-lg"
        >
          <ul className="divide-y divide-gray-100">
            {matches.map(service => (
              <li key={service.slug}>
                <Link
                  href={getServiceHref(service)}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center justify-between gap-3 px-4 py-2.5 text-left text-xs transition-colors hover:bg-[#F3F6FB] sm:text-sm"
                >
                  <span className="truncate font-medium text-gray-900 group-hover:text-[#0066EB]">
                    {service.title}
                  </span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="font-mono text-[11px] text-gray-400">
                      {service.office.acronym}
                    </span>
                    <ArrowUpRight
                      className="h-3.5 w-3.5 text-gray-400 transition-transform group-hover:text-[#0066EB] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-100 bg-[#F8FAFC] px-4 py-2">
            <button
              type="button"
              onClick={handleViewAll}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066EB] transition-colors hover:text-[#0052BC]"
            >
              <span>View all results for &ldquo;{query.trim()}&rdquo;</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
