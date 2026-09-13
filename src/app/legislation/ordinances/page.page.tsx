import OrdinancesView from './Ordinances.next';

import { buildPageMetadata } from '../../../lib/metadata';

export const metadata = buildPageMetadata({
  title: 'Ordinances',
  description:
    'Browse the City of San Fernando ordinance records currently verified and published by BetterSanFernando.',
  path: '/legislation/ordinances',
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

export default function OrdinancesPage() {
  return <OrdinancesView />;
}
