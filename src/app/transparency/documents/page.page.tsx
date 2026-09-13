import { buildPageMetadata } from '../../../lib/metadata';
import OfficialDocumentsView from './OfficialDocuments.next';

export const metadata = buildPageMetadata({
  title: 'Official Documents',
  description:
    'A verified partial collection of official City Government documents, with links to related public-record collections.',
  path: '/transparency/documents',
});

export default function OfficialDocumentsPage() {
  return <OfficialDocumentsView />;
}
