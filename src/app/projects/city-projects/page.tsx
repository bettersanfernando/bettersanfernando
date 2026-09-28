import ProjectsView from './Projects';

import { buildPageMetadata } from '../../../lib/metadata';
import { PageMessages } from '../../../components/i18n/PageMessages';
import { getPageT } from '../../../i18n/server';

export async function generateMetadata() {
  const { t, locale } = await getPageT('projects-city-projects');
  return buildPageMetadata({
    title: t('City Projects'),
    description: t(
      'Browse the full list of infrastructure and procurement projects of the City of San Fernando, Pampanga, with sourced evidence for every fact.'
    ),
    path: '/projects/city-projects',
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

export default async function ProjectsPage() {
  const { messages } = await getPageT('projects-city-projects');
  return (
    <PageMessages messages={messages}>
      <ProjectsView />
    </PageMessages>
  );
}
