import {
  getBarangays,
  getCityDemographicsSource,
  getCityTotalPopulation,
} from './demographics.ts';
import { getGeographyMetadata } from './geographyMetadata.ts';
import { getGovernmentContactSummary } from './governmentContacts.ts';
import { getLegislationSummary } from './legislationSummary.ts';
import { getProcurementStatistics } from './procurementStatistics.ts';
import { getTransparencySourceInventory } from './transparencySources.ts';

export function getTransparencySummary() {
  const inventory = getTransparencySourceInventory();
  const procurement = getProcurementStatistics();
  const government = getGovernmentContactSummary();
  const legislation = getLegislationSummary();
  const barangays = getBarangays();
  const demographics = getCityDemographicsSource();
  const geography = getGeographyMetadata();

  return Object.freeze({
    release: Object.freeze({
      datasetFiles: inventory.release.datasetCount,
      publishedDomains: inventory.publishedDomains.length,
      exportVersion: inventory.release.exportVersion,
    }),
    projects: Object.freeze({
      total: procurement.projects.total,
      evidence: procurement.evidence.total,
      bidResults: procurement.bidResults.total,
      awarded: procurement.awardsAndContracts.awarded,
      contracted: procurement.awardsAndContracts.contracted,
    }),
    government: Object.freeze({ officeRecords: government.total }),
    legislation: Object.freeze({
      executiveOrders: legislation.executiveOrders.total,
      ordinances: legislation.ordinances.total,
      ordinanceFullText: legislation.ordinances.withFullText,
      resolutions: legislation.resolutions.total,
    }),
    population: Object.freeze({
      total: getCityTotalPopulation(),
      census: demographics.census,
      barangays: barangays.length,
      urbanBarangays: barangays.filter(
        barangay => barangay.classification === 'Urban'
      ).length,
      ruralBarangays: barangays.filter(
        barangay => barangay.classification === 'Rural'
      ).length,
    }),
    geography: Object.freeze({
      cityBoundaries: geography.cityBoundaryCount,
      barangayBoundaries: geography.barangayBoundaryCount,
      geometryPublisher: geography.geometryPublisher,
    }),
    unavailable: inventory.unavailableDomains,
  });
}
