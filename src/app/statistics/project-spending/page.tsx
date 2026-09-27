import { buildPageMetadata } from '../../../lib/metadata';
import { PageMessages } from '../../../components/i18n/PageMessages';
import { getPageT } from '../../../i18n/server';
import ProjectSpendingStatisticsView from './ProjectSpendingStatistics';

export async function generateMetadata() {
  const { t, locale } = await getPageT('statistics-project-spending');
  return buildPageMetadata({
    title: t('Project Cost & Utilization'),
    description: t(
      "Verified, source-reported cost-utilization observations for a bounded subset of BetterSanFernando's published city projects."
    ),
    path: '/statistics/project-spending',
    locale,
  });
}

export default async function ProjectSpendingStatisticsPage() {
  const { messages } = await getPageT('statistics-project-spending');
  return (
    <PageMessages messages={messages}>
      <ProjectSpendingStatisticsView />
    </PageMessages>
  );
}
