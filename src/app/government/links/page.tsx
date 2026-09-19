import { buildPageMetadata } from '../../../lib/metadata';
import GovernmentOfficialLinksView from './GovernmentOfficialLinks';

export const metadata = buildPageMetadata({
  title: 'Official Government Links',
  description:
    'Find verified official City Government of San Fernando, Pampanga websites, digital-service portals, and institutional Facebook pages.',
  path: '/government/links',
});

export default function GovernmentOfficialLinksPage() {
  return <GovernmentOfficialLinksView />;
}
