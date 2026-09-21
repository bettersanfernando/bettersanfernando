import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  CityGeojsonSchema,
  BarangaysGeojsonSchema,
  type CityFeature,
  type BarangayFeature,
} from './geography.schemas.ts';

// Geography exports are read from the committed public-safe data at build or
// server-render time, never in the browser.
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
