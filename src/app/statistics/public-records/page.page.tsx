import { buildPageMetadata } from '../../../lib/metadata';
import PublicRecordsStatisticsView from './PublicRecordsStatistics.next';

export const metadata = buildPageMetadata({
  title: 'Public Records Statistics',
  description:
    'Coverage, publication status, and units for every dataset BetterSanFernando currently publishes, each kept in its own unit — never combined into a single total.',
  path: '/statistics/public-records',
});

export default function PublicRecordsStatisticsPage() {
  return <PublicRecordsStatisticsView />;
}
