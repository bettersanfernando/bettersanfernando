import {
  CityGeojsonSchema,
  BarangaysGeojsonSchema,
  type CityFeature,
  type BarangayFeature,
} from './geography.schemas.ts';
// Vite/Rolldown can't parse .geojson as JSON by default (unlike .json, it has
// no built-in JSON transform and gets treated as a JS module, which fails to
// parse). `?raw` is Vite's native raw-text-import convention — no plugin, no
// dependency — so we load the text ourselves and parse it explicitly.
import cityGeojsonRaw from '../generated/civic/geography/city.geojson?raw';
import barangaysGeojsonRaw from '../generated/civic/geography/barangays.geojson?raw';

export type { CityFeature, BarangayFeature };

const cityBoundary = CityGeojsonSchema.parse(JSON.parse(cityGeojsonRaw));
const barangayBoundaries = BarangaysGeojsonSchema.parse(
  JSON.parse(barangaysGeojsonRaw)
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
