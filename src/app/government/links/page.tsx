import { buildPageMetadata } from '../../../lib/metadata';
import GovernmentOfficialLinksView from './GovernmentOfficialLinks';

export const metadata = buildPageMetadata({
  title: 'Official Government Links',
  description:
    'Find verified City Government websites and digital-service portals without having to search across multiple sources.',
  path: '/government/links',
});

export const dynamic = 'force-dynamic';

export default function GovernmentOfficialLinksPage() {
  return <GovernmentOfficialLinksView />;
}
