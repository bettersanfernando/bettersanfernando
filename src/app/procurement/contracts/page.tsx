import ContractsView from './Contracts';

import { buildPageMetadata } from '../../../lib/metadata';
import { PageMessages } from '../../../components/i18n/PageMessages';
import { getPageT } from '../../../i18n/server';

export async function generateMetadata() {
  const { t, locale } = await getPageT('procurement-contracts');
  return buildPageMetadata({
    title: t('Contracts and Awards'),
    description: t(
      "Browse the award and contract lifecycle evidence published for BetterSanFernando's bounded infrastructure and public-works project subset."
    ),
    path: '/procurement/contracts',
    locale,
  });
}

// This page's entire content depends on the request's own query string
// (filters/sort/pagination), so it is rendered per request rather than
// statically generated — `force-dynamic` opts out of static generation
// (which would otherwise bake in a single Suspense-fallback shell shared
// by every query string, never the real filtered results) and, for the
// same reason, means no Suspense boundary is required around
// useSearchParams() here (that requirement is specific to the
// static-generation CSR-bailout path).
export const dynamic = 'force-dynamic';

export default async function ContractsPage() {
  const { messages } = await getPageT('procurement-contracts');
  return (
    <PageMessages messages={messages}>
      <ContractsView />
    </PageMessages>
  );
}
