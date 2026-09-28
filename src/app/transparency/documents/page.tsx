import { buildPageMetadata } from '../../../lib/metadata';
import { PageMessages } from '../../../components/i18n/PageMessages';
import { getPageT } from '../../../i18n/server';
import OfficialDocumentsView from './OfficialDocuments';

export async function generateMetadata() {
  const { t, locale } = await getPageT('transparency-documents');
  return buildPageMetadata({
    title: t('Official Documents'),
    description: t(
      'A verified partial collection of official City Government documents, with links to related public-record collections.'
    ),
    path: '/transparency/documents',
    locale,
  });
}

export default async function OfficialDocumentsPage() {
  const { messages } = await getPageT('transparency-documents');
  return (
    <PageMessages messages={messages}>
      <OfficialDocumentsView />
    </PageMessages>
  );
}
