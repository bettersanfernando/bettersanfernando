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
const PolygonGeometry = z
  .object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(LngLat)),
  })
  .strict();

const CityFeatureSchema = z
  .object({
    type: z.literal('Feature'),
    properties: z
      .object({
        name: z.string(),
        psgc_code: PsgcCode,
        geographic_level: z.literal('City'),
      })
      .strict(),
    geometry: PolygonGeometry,
  })
  .strict();

const BarangayFeatureSchema = z
  .object({
    type: z.literal('Feature'),
    properties: z
      .object({
        name: z.string(),
        psgc_code: PsgcCode,
        city_psgc_code: PsgcCode,
        geographic_level: z.literal('Barangay'),
      })
      .strict(),
    geometry: PolygonGeometry,
  })
  .strict();

export const CityGeojsonSchema = z
  .object({
    type: z.literal('FeatureCollection'),
    features: z.array(CityFeatureSchema),
  })
  .strict();

export const BarangaysGeojsonSchema = z
  .object({
    type: z.literal('FeatureCollection'),
    features: z.array(BarangayFeatureSchema),
  })
  .strict();

export type CityFeature = z.infer<typeof CityFeatureSchema>;
export type BarangayFeature = z.infer<typeof BarangayFeatureSchema>;
