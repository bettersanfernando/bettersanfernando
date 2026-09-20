import { buildPageMetadata } from '../../../lib/metadata';
import GovernmentOfficesView from './GovernmentOffices';

export const metadata = buildPageMetadata({
  title: 'City Offices',
  description:
    'Browse verified City Government office locations and available institutional contact information in San Fernando, Pampanga.',
  path: '/government/offices',
});

// This page's entire content depends on the request's own query string
// (filters/sort/pagination), so it is rendered per request rather than
// statically generated — `force-dynamic` opts out of static generation.
export const dynamic = 'force-dynamic';

export default function GovernmentOfficesPage() {
  return <GovernmentOfficesView />;
}
