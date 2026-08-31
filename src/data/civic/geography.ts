import { z } from 'zod';
import { PsgcCode } from './schemas.ts';
import cityGeojson from '../generated/civic/geography/city.geojson' with { type: 'json' };
import barangaysGeojson from '../generated/civic/geography/barangays.geojson' with { type: 'json' };

// Minimal Polygon-only GeoJSON modeling — sufficient for this dataset,
// avoids pulling in a full @types/geojson-style dependency.
const LngLat = z.tuple([z.number(), z.number()]);
const PolygonGeometry = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(LngLat)),
});

const CityFeatureSchema = z.object({
  type: z.literal('Feature'),
  properties: z.object({
    name: z.string(),
    psgc_code: PsgcCode,
    geographic_level: z.literal('City'),
  }),
  geometry: PolygonGeometry,
});

const BarangayFeatureSchema = z.object({
  type: z.literal('Feature'),
  properties: z.object({
    name: z.string(),
    psgc_code: PsgcCode,
    city_psgc_code: PsgcCode,
    geographic_level: z.literal('Barangay'),
  }),
  geometry: PolygonGeometry,
});

const CityGeojsonSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(CityFeatureSchema),
});

const BarangaysGeojsonSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(BarangayFeatureSchema),
});

export type CityFeature = z.infer<typeof CityFeatureSchema>;
export type BarangayFeature = z.infer<typeof BarangayFeatureSchema>;

const cityBoundary = CityGeojsonSchema.parse(cityGeojson);
const barangayBoundaries = BarangaysGeojsonSchema.parse(barangaysGeojson);

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
