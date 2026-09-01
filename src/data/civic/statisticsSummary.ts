import {
  getBarangays,
  getCityDemographicsSource,
  getCityTotalPopulation,
} from './demographics.ts';
import { getGeographyMetadata } from './geographyMetadata.ts';
import { getCityOfficesMetadata } from './government.ts';
import { aggregatePopulationStatistics } from './populationStatistics.ts';
import { getProcurementStatistics } from './procurementStatistics.ts';
import { getProjects } from './projects.ts';
import { aggregateProjectStatistics } from './projectStatistics.ts';

export function getStatisticsSummary() {
  const population = aggregatePopulationStatistics(
    getBarangays(),
    getCityTotalPopulation()
  );
  const populationSource = getCityDemographicsSource();
  const projectStatistics = aggregateProjectStatistics(getProjects());
  const procurementStatistics = getProcurementStatistics();
  const geography = getGeographyMetadata();
  const offices = getCityOfficesMetadata();

  return {
    population: {
      total: population.totalPopulation,
      referenceYear: populationSource.referenceYear,
      census: populationSource.census,
      barangays: population.barangayCount,
      urbanBarangays: population.urbanBarangayCount,
      ruralBarangays: population.ruralBarangayCount,
    },
    projects: {
      total: projectStatistics.totalProjects,
      lifecycle: {
        PLANNED:
          projectStatistics.lifecycle.find(item => item.key === 'PLANNED')
            ?.count ?? 0,
        PROCUREMENT:
          projectStatistics.lifecycle.find(item => item.key === 'PROCUREMENT')
            ?.count ?? 0,
        AWARDED:
          projectStatistics.lifecycle.find(item => item.key === 'AWARDED')
            ?.count ?? 0,
        CONTRACTED:
          projectStatistics.lifecycle.find(item => item.key === 'CONTRACTED')
            ?.count ?? 0,
      },
      attributedToBarangay: projectStatistics.barangayAttribution.attributed,
      unattributed: projectStatistics.barangayAttribution.unattributed,
    },
    procurement: {
      evidence: procurementStatistics.evidence.total,
      bidResults: procurementStatistics.bidResults.total,
      bidResultProjects: procurementStatistics.bidResults.projectsRepresented,
    },
    geography: {
      cityBoundaries: geography.cityBoundaryCount,
      barangayBoundaries: geography.barangayBoundaryCount,
    },
    government: {
      officeRecords: offices.officeCount,
    },
  } as const;
}
