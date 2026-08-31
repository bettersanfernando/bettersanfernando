import type { Barangay } from './demographics.ts';

export interface RankedBarangayPopulation extends Barangay {
  rank: number;
  share: number;
}

export interface PopulationStatistics {
  totalPopulation: number;
  barangayCount: number;
  urbanBarangayCount: number;
  ruralBarangayCount: number;
  ruralBarangays: readonly RankedBarangayPopulation[];
  largestBarangay: RankedBarangayPopulation | null;
  smallestBarangay: RankedBarangayPopulation | null;
  rankedBarangays: readonly RankedBarangayPopulation[];
}

export function aggregatePopulationStatistics(
  barangays: readonly Barangay[],
  totalPopulation: number
): PopulationStatistics {
  const rankedBarangays = [...barangays]
    .sort(
      (a, b) =>
        b.population - a.population || a.name.localeCompare(b.name, 'en-PH')
    )
    .map((barangay, index) => ({
      ...barangay,
      rank: index + 1,
      share: totalPopulation === 0 ? 0 : barangay.population / totalPopulation,
    }));
  const ruralBarangays = rankedBarangays.filter(
    barangay => barangay.classification === 'Rural'
  );

  return {
    totalPopulation,
    barangayCount: rankedBarangays.length,
    urbanBarangayCount: rankedBarangays.filter(
      barangay => barangay.classification === 'Urban'
    ).length,
    ruralBarangayCount: ruralBarangays.length,
    ruralBarangays,
    largestBarangay: rankedBarangays[0] ?? null,
    smallestBarangay: rankedBarangays.at(-1) ?? null,
    rankedBarangays,
  };
}
