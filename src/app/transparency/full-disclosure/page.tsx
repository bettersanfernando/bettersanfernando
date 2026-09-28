import { buildPageMetadata } from '../../../lib/metadata';
import { PageMessages } from '../../../components/i18n/PageMessages';
import { getPageT } from '../../../i18n/server';
import FullDisclosureView from './FullDisclosure';

export async function generateMetadata() {
  const { t, locale } = await getPageT('transparency-full-disclosure');
  return buildPageMetadata({
    title: t('Full Disclosure Reports'),
    description: t(
      'Verified Full Disclosure Policy report metadata — Annual Procurement Plans, Procurement Monitoring Reports, and Trust Fund and Special Education Fund utilization reports — for the City Government of San Fernando, Pampanga.'
    ),
    path: '/transparency/full-disclosure',
    locale,
  });
}

export default async function FullDisclosurePage() {
  const { messages } = await getPageT('transparency-full-disclosure');
  return (
    <PageMessages messages={messages}>
      <FullDisclosureView />
    </PageMessages>
  );
}
