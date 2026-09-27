import { titleCaseEnum } from '../../lib/utils';
import type { PageT } from '../../i18n/page-t';

// Display labels for the controlled lifecycle, project-type and project-category
// values shown on the statistics pages. Only the label is localized; the
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
});

export function enumLabel(t: PageT, value: string): string {
  return ENUM_LABELS(t)[value] ?? titleCaseEnum(value);
}
