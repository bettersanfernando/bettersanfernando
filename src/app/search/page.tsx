import SearchView from './Search';

import { buildPageMetadata } from '../../lib/metadata';

// NOINDEX: this page's content is entirely a function of the request's own
// ?q=/?domain= query string, so an empty /search is a bare input box with
// no indexable content — a thin/duplicate search-results surface. `follow`
// stays true so link equity still flows through any result links.
export const metadata = {
  ...buildPageMetadata({
    title: 'Search BetterSanFernando',
    description:
      'Search currently published BetterSanFernando projects, barangays, government offices, legislation, and project-source records.',
    path: '/search',
  }),
  robots: { index: false, follow: true },
};

// This page's entire content depends on the request's own query string
// (?q=, ?domain=), so it is rendered per request rather than statically
// generated — `force-dynamic` opts out of static generation (which would
// otherwise bake in a single Suspense-fallback shell shared by every query
// string, never the real filtered results) and, for the same reason, means
// no Suspense boundary is required around useSearchParams() here (that
// requirement is specific to the static-generation CSR-bailout path).
export const dynamic = 'force-dynamic';

export default function SearchPage() {
  return <SearchView />;
}
