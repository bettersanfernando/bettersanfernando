import { z } from 'zod';
import { PsgcCode } from './schemas.ts';

/**
 * Pure Zod schemas for the geography GeoJSON exports — deliberately has no
 * import of the actual .geojson files (see geography.ts), so it can be
 * reused outside Vite (e.g. scripts/smoke-civic-data-layer.ts, which runs
 * under plain Node and can't resolve Vite's `?raw` import convention).
 */

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

export const CityGeojsonSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(CityFeatureSchema),
});

export const BarangaysGeojsonSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(BarangayFeatureSchema),
});

export type CityFeature = z.infer<typeof CityFeatureSchema>;
export type BarangayFeature = z.infer<typeof BarangayFeatureSchema>;
