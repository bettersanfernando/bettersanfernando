import { buildPageMetadata } from '../../../lib/metadata';
import { PageMessages } from '../../../components/i18n/PageMessages';
import { getPageT } from '../../../i18n/server';
import CityFinancesView from './CityFinances';

export async function generateMetadata() {
  const { t, locale } = await getPageT('transparency-finance');
  return buildPageMetadata({
    title: t('City Finances'),
    description: t(
      'Verified, source-reported official aggregate finance reports for the City of San Fernando, Pampanga, with safe comparisons only where funds, periods, and accounting bases match.'
    ),
    path: '/transparency/finance',
    locale,
  });
}

export default async function CityFinancesPage() {
  const { messages } = await getPageT('transparency-finance');
  return (
    <PageMessages messages={messages}>
      <CityFinancesView />
    </PageMessages>
  );
}
