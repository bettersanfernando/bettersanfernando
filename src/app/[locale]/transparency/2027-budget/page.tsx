import { buildPageMetadata } from '../../../../lib/metadata';
import { getPageT } from '../../../../i18n/server';
import NationalBudgetView from './NationalBudget';

export const dynamicParams = false;

export async function generateMetadata() {
  const { t, locale } = await getPageT('transparency-2027-budget');
  return buildPageMetadata({
    title: t('2027 National Budget'),
    description: t(
      'Compare verified FY2027 national-budget project lines associated with the City of San Fernando, Pampanga across the National Expenditure Program and House Bill No. 10858. Proposed national appropriations, not City spending.'
    ),
    path: '/transparency/2027-budget',
    locale,
  });
}

export default function NationalBudgetPage() {
  return <NationalBudgetView />;
}
