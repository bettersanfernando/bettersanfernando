import { buildPageMetadata } from '../../../lib/metadata';
import { PageMessages } from '../../../components/i18n/PageMessages';
import { getPageT } from '../../../i18n/server';
import PublicRecordsStatisticsView from './PublicRecordsStatistics';

export async function generateMetadata() {
  const { t, locale } = await getPageT('statistics-public-records');
  return buildPageMetadata({
    title: t('Public Records Statistics'),
    description: t(
      'Coverage, publication status, and units for every dataset BetterSanFernando currently publishes, each kept in its own unit — never combined into a single total.'
    ),
    path: '/statistics/public-records',
    locale,
  });
}

export default async function PublicRecordsStatisticsPage() {
  const { messages } = await getPageT('statistics-public-records');
  return (
    <PageMessages messages={messages}>
      <PublicRecordsStatisticsView />
    </PageMessages>
  );
}
