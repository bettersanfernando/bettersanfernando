import GovernmentBarangayContactsView from './GovernmentBarangayContacts';

import { buildPageMetadata } from '../../../lib/metadata';

export const metadata = buildPageMetadata({
  title: 'Barangay Contacts',
  description:
    'Browse the published Barangay Secretary and BHERT (Barangay Health Emergency Response Team) contact directory for all 35 barangays in the City of San Fernando, Pampanga.',
  path: '/government/barangay-contacts',
});

// This page's entire content depends on the request's own query string
// (filters/sort/pagination), so it is rendered per request rather than
// statically generated — `force-dynamic` opts out of static generation
// (which would otherwise bake in a single Suspense-fallback shell shared
// by every query string, never the real filtered results) and, for the
// same reason, means no Suspense boundary is required around
// useSearchParams() here (that requirement is specific to the
// static-generation CSR-bailout path).
export const dynamic = 'force-dynamic';

export default function GovernmentBarangayContactsPage() {
  return <GovernmentBarangayContactsView />;
}
