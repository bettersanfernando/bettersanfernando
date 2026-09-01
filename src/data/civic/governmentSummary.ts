import { getCityOffices } from './government.ts';
import { getLegislationSummary } from './legislationSummary.ts';

export function getGovernmentSummary() {
  const legislation = getLegislationSummary();

  return Object.freeze({
    officeRecords: getCityOffices().length,
    executiveOrders: legislation.executiveOrders.total,
    ordinances: legislation.ordinances.total,
  });
}
