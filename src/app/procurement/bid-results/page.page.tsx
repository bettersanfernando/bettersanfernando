import BidResultsView from './BidResults.next';

import { buildPageMetadata } from '../../../lib/metadata';

export const metadata = buildPageMetadata({
  title: 'Bid Results',
  description:
    "Browse published bid-result evidence connected to BetterSanFernando's verified infrastructure and public-works project subset.",
  path: '/procurement/bid-results',
});

// This page's entire content depends on the request's own query string
// (filters/sort/pagination), so it is rendered per request rather than
// statically generated — `force-dynamic` opts out of static generation
// (which would otherwise bake in a single Suspense-fallback shell shared
// by every query string, never the real filtered results) and, for the
// same reason, means no Suspense boundary is required around
// useSearchParams() here (that requirement is specific to the
// static-generation CSR-bailout path).
export const dynamic = 'force-dynamic';

export default function BidResultsPage() {
  return <BidResultsView />;
}
