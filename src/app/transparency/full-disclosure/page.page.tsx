import { buildPageMetadata } from '../../../lib/metadata';
import FullDisclosureView from './FullDisclosure.next';

export const metadata = buildPageMetadata({
  title: 'Full Disclosure Reports',
  description:
    'Verified Full Disclosure Policy report metadata — Annual Procurement Plans, Procurement Monitoring Reports, and Trust Fund and Special Education Fund utilization reports — for the City Government of San Fernando, Pampanga.',
  path: '/transparency/full-disclosure',
});

export default function FullDisclosurePage() {
  return <FullDisclosureView />;
}
