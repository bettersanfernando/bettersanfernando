import { z } from 'zod';
import { PsgcCode } from './schemas.ts';
import barangaysJson from '../generated/civic/demographics/barangays.json' with { type: 'json' };

export const BarangayClassification = z.enum(['Urban', 'Rural']);

export const BarangaySchema = z.object({
  psgc_code: PsgcCode,
  name: z.string(),
  classification: BarangayClassification,
  population: z.number().int().nonnegative(),
});
export type Barangay = z.infer<typeof BarangaySchema>;

const BarangaysFileSchema = z.object({
  city_name: z.string(),
  city_psgc_code: PsgcCode,
  province: z.string(),
  region: z.string(),
  reference_year: z.number().int(),
  psgc_release: z.string(),
  source_publisher: z.string(),
  source_url: z.url(),
  census: z.string(),
  last_verified: z.string(),
  barangay_count: z.number().int(),
  total_population: z.number().int().nonnegative(),
  barangays: z.array(BarangaySchema),
});
export type BarangaysFile = z.infer<typeof BarangaysFileSchema>;

const barangaysFile = BarangaysFileSchema.parse(barangaysJson);

const barangays: readonly Barangay[] = Object.freeze(barangaysFile.barangays);
const barangayByPsgc = new Map(barangays.map(b => [b.psgc_code, b]));

export function getBarangays(): readonly Barangay[] {
  return barangays;
}

export function getBarangayByPsgc(psgc: string): Barangay | undefined {
  return barangayByPsgc.get(psgc);
}

export function getBarangayPopulation(psgc: string): number | undefined {
  return barangayByPsgc.get(psgc)?.population;
}

export function getCityTotalPopulation(): number {
  return barangaysFile.total_population;
}

export function getCityDemographicsSource(): {
  publisher: string;
  url: string;
  referenceYear: number;
  census: string;
  lastVerified: string;
} {
  return {
    publisher: barangaysFile.source_publisher,
    url: barangaysFile.source_url,
    referenceYear: barangaysFile.reference_year,
    census: barangaysFile.census,
    lastVerified: barangaysFile.last_verified,
  };
}
