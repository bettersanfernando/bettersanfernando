import ProjectSourcesView from './ProjectSources';

import { buildPageMetadata } from '../../../lib/metadata';
import { PageMessages } from '../../../components/i18n/PageMessages';
import { getPageT } from '../../../i18n/server';

export async function generateMetadata() {
  const { t, locale } = await getPageT('projects-sources');
  return buildPageMetadata({
    title: t('Project Sources'),
    description: t(
      "Browse the public evidence records that support BetterSanFernando's published project facts."
    ),
    path: '/projects/sources',
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

export default async function ProjectSourcesPage() {
  const { messages } = await getPageT('projects-sources');
  return (
    <PageMessages messages={messages}>
      <ProjectSourcesView />
    </PageMessages>
  );
}
