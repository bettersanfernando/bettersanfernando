import { buildPageMetadata } from '../../../lib/metadata';
import CityFinancesView from './CityFinances.next';

export const metadata = buildPageMetadata({
  title: 'City Finances',
  description:
    'Verified, source-reported official aggregate finance reports for the City of San Fernando, Pampanga, with safe comparisons only where funds, periods, and accounting bases match.',
  path: '/transparency/finance',
});

export default function CityFinancesPage() {
  return <CityFinancesView />;
}
