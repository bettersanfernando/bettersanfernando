import { buildPageMetadata } from '../../../lib/metadata';
import GovernmentOfficesView from './GovernmentOffices';

export const metadata = buildPageMetadata({
  title: 'City Offices',
  description:
    'Browse verified City Government office locations and available institutional contact information in San Fernando, Pampanga.',
  path: '/government/offices',
});

export default function GovernmentOfficesPage() {
  return <GovernmentOfficesView />;
}
