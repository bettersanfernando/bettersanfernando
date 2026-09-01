import type { RankedBarangayPopulation } from './populationStatistics.ts';

export type BarangayDirectoryClassification = 'All' | 'Urban' | 'Rural';
export type BarangayDirectorySort =
  'name-asc' | 'population-desc' | 'population-asc';

export interface BarangayDirectoryOptions {
  query: string;
  classification: BarangayDirectoryClassification;
  sort: BarangayDirectorySort;
}

export function filterAndSortBarangays(
  barangays: readonly RankedBarangayPopulation[],
  options: BarangayDirectoryOptions
): RankedBarangayPopulation[] {
  const query = options.query.trim().toLocaleLowerCase('en-PH');
  const filtered = barangays.filter(
    barangay =>
      (!query || barangay.name.toLocaleLowerCase('en-PH').includes(query)) &&
      (options.classification === 'All' ||
        barangay.classification === options.classification)
  );

  return [...filtered].sort((a, b) => {
    if (options.sort === 'population-desc') {
      return (
        b.population - a.population || a.name.localeCompare(b.name, 'en-PH')
      );
    }
    if (options.sort === 'population-asc') {
      return (
        a.population - b.population || a.name.localeCompare(b.name, 'en-PH')
      );
    }
    return a.name.localeCompare(b.name, 'en-PH');
  });
}
