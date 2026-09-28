import SearchView from './Search';

import { buildPageMetadata } from '../../lib/metadata';
import { PageMessages } from '../../components/i18n/PageMessages';
import { getPageT } from '../../i18n/server';

// NOINDEX: this page's content is entirely a function of the request's own
// ?q=/?domain= query string, so an empty /search is a bare input box with
// no indexable content — a thin/duplicate search-results surface. `follow`
// stays true so link equity still flows through any result links.
export async function generateMetadata() {
  const { t, locale } = await getPageT('search');
  return {
    ...buildPageMetadata({
      title: t('Search BetterSanFernando'),
      description: t(
        'Search currently published BetterSanFernando projects, barangays, government offices, legislation, and project-source records.'
      ),
      path: '/search',
      locale,
    }),
    robots: { index: false, follow: true },
  };
}

// This page's entire content depends on the request's own query string
// (?q=, ?domain=), so it is rendered per request rather than statically
// generated — `force-dynamic` opts out of static generation (which would
// otherwise bake in a single Suspense-fallback shell shared by every query
// string, never the real filtered results) and, for the same reason, means
// no Suspense boundary is required around useSearchParams() here (that
// requirement is specific to the static-generation CSR-bailout path).
export const dynamic = 'force-dynamic';

export default async function SearchPage() {
  const { messages } = await getPageT('search');
  return (
    <PageMessages messages={messages}>
      <SearchView />
    </PageMessages>
  );
}
