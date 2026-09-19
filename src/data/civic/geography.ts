import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  CityGeojsonSchema,
  BarangaysGeojsonSchema,
  type CityFeature,
  type BarangayFeature,
} from './geography.schemas.ts';

// Next.js equivalent of geography.ts. Vite's `?raw` raw-text-import suffix
// (used there because Vite/Rolldown can't parse .geojson as JSON) has no
// Next.js/webpack equivalent, so this reads the same already-synced files
// directly from disk instead — safe because it only ever runs at build/
// server-render time (via the Server Component page that calls
// getCityBoundary()/getBarangayBoundaries()), never in the browser. Keep
// both files in sync until geography.ts and the Vite build it serves are
// retired.
const GEOGRAPHY_DIR = path.join(
  process.cwd(),
  'src/data/generated/civic/geography'
);

function readGeojson(fileName: string): unknown {
  return JSON.parse(readFileSync(path.join(GEOGRAPHY_DIR, fileName), 'utf8'));
}

export type { CityFeature, BarangayFeature };

const cityBoundary = CityGeojsonSchema.parse(readGeojson('city.geojson'));
const barangayBoundaries = BarangaysGeojsonSchema.parse(
  readGeojson('barangays.geojson')
);

export function getCityBoundary(): CityFeature {
  return cityBoundary.features[0];
}

export function getBarangayBoundaries(): readonly BarangayFeature[] {
  return barangayBoundaries.features;
}

export function getBarangayBoundaryByPsgc(
  psgc: string
): BarangayFeature | undefined {
  return barangayBoundaries.features.find(f => f.properties.psgc_code === psgc);
}
