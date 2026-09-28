import { buildPageMetadata } from '../../../lib/metadata';
import { PageMessages } from '../../../components/i18n/PageMessages';
import { getPageT } from '../../../i18n/server';
import GovernmentOfficesView from './GovernmentOffices';

export async function generateMetadata() {
  const { t, locale } = await getPageT('government-offices');
  return buildPageMetadata({
    title: t('City Offices'),
    description: t(
      'Browse verified City Government office locations and available institutional contact information in San Fernando, Pampanga.'
    ),
    path: '/government/offices',
    locale,
  });
}

// This page's entire content depends on the request's own query string
// (filters/sort/pagination), so it is rendered per request rather than
// statically generated — `force-dynamic` opts out of static generation.
export const dynamic = 'force-dynamic';

export default async function GovernmentOfficesPage() {
  const { messages } = await getPageT('government-offices');
  return (
    <PageMessages messages={messages}>
      <GovernmentOfficesView />
    </PageMessages>
  );
}
