import { buildPageMetadata } from '../../../lib/metadata';
import ProjectSpendingStatisticsView from './ProjectSpendingStatistics.next';

export const metadata = buildPageMetadata({
  title: 'Project Cost & Utilization',
  description:
    "Verified, source-reported cost-utilization observations for a bounded subset of BetterSanFernando's published city projects.",
  path: '/statistics/project-spending',
});

export default function ProjectSpendingStatisticsPage() {
  return <ProjectSpendingStatisticsView />;
}
