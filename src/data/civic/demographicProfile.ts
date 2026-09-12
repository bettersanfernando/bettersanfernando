import { z } from 'zod';
import { IsoDateString, PsgcCode } from './schemas.ts';
import demographicProfileJson from '../generated/civic/demographics/demographic-profile.json' with { type: 'json' };

const NonEmptyString = z.string().trim().min(1);
const PublicUrl = z.url().refine(url => /^https?:\/\//.test(url), {
  message: 'Expected a public HTTP(S) URL',
});

export const DemographicDimension = z.enum([
  'household_population',
  'number_of_households',
  'age_sex_population',
  'age_band_population',
  'poverty_incidence',
]);
export const DemographicGeographyLevel = z.enum(['city', 'barangay']);
export const DemographicPopulationUniverse = z.enum([
  'household_population',
  'total_population',
]);
export const DemographicSex = z.enum(['both', 'male', 'female']);
export const DemographicMeasureType = z.enum(['count', 'rate']);
export const DemographicSourceType = z.enum([
  'census',
  'model_based_small_area_estimate',
]);
export const DemographicUnit = z.enum(['persons', 'households', 'percent']);

export const DemographicRecordSchema = z
  .object({
    category: NonEmptyString.nullable(),
    coefficient_of_variation: z.number().nullable(),
    comparability_group: NonEmptyString,
    confidence_interval_lower: z.number().nullable(),
    confidence_interval_upper: z.number().nullable(),
    dataset_table_id: NonEmptyString.nullable(),
    denominator: z.number().nullable(),
    derivation: NonEmptyString.nullable(),
    dimension: DemographicDimension,
    geography_level: DemographicGeographyLevel,
    geography_name: NonEmptyString,
    geography_psgc: PsgcCode,
    id: NonEmptyString,
    is_derived: z.boolean(),
    measure_type: DemographicMeasureType,
    notes: NonEmptyString.nullable(),
    official_download_url: PublicUrl.nullable(),
    official_page_url: PublicUrl,
    parent_psgc: PsgcCode,
    population_universe: DemographicPopulationUniverse,
    publication_date: IsoDateString,
    reference_date: IsoDateString,
    sex: DemographicSex.nullable(),
    source_last_updated: IsoDateString,
    source_type: DemographicSourceType,
    standard_error: z.number().nullable(),
    unit: DemographicUnit,
    value: z.number(),
    verification_date: IsoDateString,
  })
  .strict();
export type DemographicRecord = z.infer<typeof DemographicRecordSchema>;

const HeldDimensionSchema = z
  .object({
    dimension: NonEmptyString,
    reason: NonEmptyString,
    retry_target: PublicUrl,
  })
  .strict();

const DemographicProfileFileSchema = z
  .object({
    dataset: z.literal('demographic_profile'),
    dimension_breakdown: z.record(
      DemographicDimension,
      z.number().int().nonnegative()
    ),
    geography_coverage: z
      .object({
        barangay: z.number().int().nonnegative(),
        city: z.number().int().nonnegative(),
      })
      .strict(),
    held_dimensions: z.array(HeldDimensionSchema),
    intended_route: z.literal('/statistics/demographics'),
    jurisdiction_name: NonEmptyString,
    jurisdiction_psgc: PsgcCode,
    last_verified: IsoDateString,
    province: NonEmptyString,
    public_limitations: z.array(NonEmptyString).min(1),
    publication_status: z.literal('PUBLICATION_REVIEW_COMPLETE'),
    record_count: z.number().int().nonnegative(),
    records: z.array(DemographicRecordSchema),
    schema_version: z.literal(1),
    source_year_coverage: z.array(z.number().int()),
  })
  .strict()
  .refine(file => file.record_count === file.records.length, {
    message: 'record_count must match records length',
  })
  .refine(
    file =>
      new Set(file.records.map(record => record.id)).size ===
      file.records.length,
    { message: 'record IDs must be unique' }
  )
  .refine(
    file => file.geography_coverage.barangay === 35,
    'geography_coverage.barangay must cover all 35 barangays'
  )
  .refine(file => {
    const cityHouseholdPop = file.records.find(
      record =>
        record.dimension === 'household_population' &&
        record.geography_level === 'city'
    );
    return cityHouseholdPop?.value === 375498;
  }, '2024 city household population must equal 375498')
  .refine(file => {
    const cityHouseholds = file.records.find(
      record =>
        record.dimension === 'number_of_households' &&
        record.geography_level === 'city'
    );
    return cityHouseholds?.value === 95139;
  }, '2024 city number of households must equal 95139')
  .refine(file => {
    const male = file.records.find(
      record =>
        record.dimension === 'age_sex_population' &&
        record.sex === 'male' &&
        record.category === 'all_ages'
    );
    const female = file.records.find(
      record =>
        record.dimension === 'age_sex_population' &&
        record.sex === 'female' &&
        record.category === 'all_ages'
    );
    const both = file.records.find(
      record =>
        record.dimension === 'age_sex_population' &&
        record.sex === 'both' &&
        record.category === 'all_ages'
    );
    if (!male || !female || !both) return false;
    return (
      male.value === 178906 &&
      female.value === 173895 &&
      both.value === 352801 &&
      male.value + female.value === both.value
    );
  }, '2020 CPH male + female household population must equal the published total');

const file = DemographicProfileFileSchema.parse(demographicProfileJson);
const records: readonly DemographicRecord[] = Object.freeze(file.records);

export function getDemographicProfileRecords(): readonly DemographicRecord[] {
  return records;
}

export function getDemographicProfileMetadata() {
  return Object.freeze({
    dimensionBreakdown: Object.freeze({ ...file.dimension_breakdown }),
    geographyCoverage: Object.freeze({ ...file.geography_coverage }),
    heldDimensions: Object.freeze(file.held_dimensions.map(d => ({ ...d }))),
    jurisdictionName: file.jurisdiction_name,
    jurisdictionPsgc: file.jurisdiction_psgc,
    lastVerified: file.last_verified,
    province: file.province,
    publicLimitations: Object.freeze([...file.public_limitations]),
    publicationStatus: file.publication_status,
    recordCount: file.record_count,
    sourceYearCoverage: Object.freeze([...file.source_year_coverage]),
  });
}

export function getHouseholdPopulation2024() {
  const city = records.find(
    r => r.dimension === 'household_population' && r.geography_level === 'city'
  );
  const numberOfHouseholds = records.find(
    r => r.dimension === 'number_of_households' && r.geography_level === 'city'
  );
  const barangays = records
    .filter(
      r =>
        r.dimension === 'household_population' &&
        r.geography_level === 'barangay'
    )
    .map(r => ({
      psgc: r.geography_psgc,
      name: r.geography_name,
      householdPopulation: r.value,
    }));

  return {
    cityHouseholdPopulation: city?.value ?? null,
    cityNumberOfHouseholds: numberOfHouseholds?.value ?? null,
    referenceDate: city?.reference_date ?? null,
    barangayCount: barangays.length,
    barangays,
  };
}

export function getAgeSexPopulation2020() {
  return records.filter(r => r.dimension === 'age_sex_population');
}

export function getAgeBandPopulation2020() {
  return records.filter(r => r.dimension === 'age_band_population');
}

export function getPovertyIncidence2023() {
  return records.find(r => r.dimension === 'poverty_incidence') ?? null;
}
