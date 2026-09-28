import { buildPageMetadata } from '../../../lib/metadata';
import GovernmentOfficialLinksView from './GovernmentOfficialLinks';
import { getPageT } from '../../../i18n/server';
import { PageMessages } from '../../../components/i18n/PageMessages';

export async function generateMetadata() {
  const { t, locale } = await getPageT('government-links');
  return buildPageMetadata({
    title: t('Official Government Links'),
    description: t(
      'Find verified City Government websites and digital-service portals without having to search across multiple sources.'
    ),
    path: '/government/links',
    locale,
  });
}

export const dynamic = 'force-dynamic';

export default async function GovernmentOfficialLinksPage() {
  const { messages } = await getPageT('government-links');
  return (
    <PageMessages messages={messages}>
      <GovernmentOfficialLinksView />
    </PageMessages>
  );
}
