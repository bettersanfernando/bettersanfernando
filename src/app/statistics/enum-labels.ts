import { titleCaseEnum } from '../../lib/utils';
import type { PageT } from '../../i18n/page-t';

// Display labels for the controlled lifecycle, project-type, project-category,
// evidence-stage and established-field values shown on the statistics, project
// and procurement pages. Only the label is localized; the
// stored value never changes, and an unknown value falls back to the same
// English label titleCaseEnum() produces.
const ENUM_LABELS = (t: PageT): Record<string, string> => ({
  PLANNED: t('Planned'),
  PROCUREMENT: t('Procurement'),
  AWARDED: t('Awarded'),
  CONTRACTED: t('Contracted'),
  IMPLEMENTATION_REPORTED: t('Implementation Reported'),
  ROAD: t('Road'),
  BUILDING: t('Building'),
  DRAINAGE: t('Drainage'),
  WATERWAY_WORKS: t('Waterway Works'),
  SLOPE_PROTECTION: t('Slope Protection'),
  OTHER_INFRASTRUCTURE: t('Other Infrastructure'),
  PARK_RECREATION: t('Park Recreation'),
  UTILITIES: t('Utilities'),
  BRIDGE: t('Bridge'),
  CEMETERY: t('Cemetery'),
  DISASTER_MITIGATION: t('Disaster Mitigation'),
  INFRASTRUCTURE_CAPITAL: t('Infrastructure Capital'),
  INFRASTRUCTURE_MAINTENANCE: t('Infrastructure Maintenance'),
  ITB: t('ITB'),
  NOTICE_OF_AWARD: t('Notice OF Award'),
  APP: t('APP'),
  BID_RESULTS: t('BID Results'),
  PROCUREMENT_MONITORING_REPORT: t('Procurement Monitoring Report'),
  NTA_UTILIZATION_REPORT: t('NTA Utilization Report'),
  project_name: t('project name'),
  primary_procurement_id: t('primary procurement id'),
  philgeps_reference: t('philgeps reference'),
  contract_number: t('contract number'),
  approved_budget_abc: t('approved budget abc'),
  contract_amount: t('contract amount'),
  contractor: t('contractor'),
  award_date: t('award date'),
  contract_effectivity_date: t('contract effectivity date'),
  contract_end_date: t('contract end date'),
  funding_source: t('funding source'),
  procurement_mode: t('procurement mode'),
  proceed_date: t('proceed date'),
  year: t('year'),
  implementing_office: t('implementing office'),
  location_text: t('location text'),
  barangay: t('barangay'),
  estimated_budget: t('estimated budget'),
  app_code: t('app code'),
  winning_bid_amount: t('winning bid amount'),
  winning_bidder: t('winning bidder'),
});

export function enumLabel(t: PageT, value: string): string {
  return ENUM_LABELS(t)[value] ?? titleCaseEnum(value);
}
