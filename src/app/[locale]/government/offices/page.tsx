import { buildPageMetadata } from '../../../../lib/metadata';
import { PageMessages } from '../../../../components/i18n/PageMessages';
import { getPageT } from '../../../../i18n/server';
import { getCityOffices } from '../../../../data/civic/government';
import {
  cleanPaginationPage,
  type PageSearchParams,
} from '../../../../lib/pagination';
import GovernmentOfficesView from './GovernmentOffices';

const PAGE_SIZE = 10;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const { t, locale } = await getPageT('government-offices');
  const page = cleanPaginationPage(
    await searchParams,
    Math.ceil(getCityOffices().length / PAGE_SIZE)
  );
  return buildPageMetadata({
    title: t('City Offices'),
    description: t(
      'Browse verified City Government office locations and available institutional contact information in San Fernando, Pampanga.'
    ),
    path: '/government/offices',
    page,
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
