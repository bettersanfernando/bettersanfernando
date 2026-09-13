#!/usr/bin/env -S node --experimental-strip-types
/**
 * Proves that the hardened public civic schemas (Scope B) reject unknown
 * fields rather than silently stripping them. Each case takes a REAL parsed
 * record (already valid) and injects one unexpected key, then asserts the
 * schema's own `.parse()` throws a ZodError for that exact record.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import {
  BarangaySchema,
  getBarangays,
} from '../src/data/civic/demographics.ts';
import {
  FinanceObservationSchema,
  FinanceReportSchema,
  getFinanceObservations,
  getFinanceReports,
} from '../src/data/civic/finance.ts';
import {
  LegislationRecordSchema,
  getExecutiveOrders,
} from '../src/data/civic/legislation.ts';
import {
  PublicRecordsArchiveCoverageSchema,
  PublicRecordsCoverageMetricSchema,
  PublicRecordsRelatedCollectionSchema,
  getPublicRecordsArchiveCoverage,
  getPublicRecordsMetrics,
  getPublicRecordsRelatedCollections,
} from '../src/data/civic/publicRecordsCoverage.ts';
import {
  BarangaysGeojsonSchema,
  CityGeojsonSchema,
} from '../src/data/civic/geography.schemas.ts';
import { ManifestSchema } from '../src/data/civic/transparencySources.ts';

function assertRejectsUnknownField(
  label: string,
  schema: z.ZodTypeAny,
  validValue: unknown
) {
  // Sanity check: the unmodified real record must still be accepted.
  schema.parse(validValue);

  const withUnknownField = {
    ...(validValue as Record<string, unknown>),
    __injected_unknown_field__: 'should be rejected',
  };
  assert.throws(
    () => schema.parse(withUnknownField),
    /Unrecognized key|__injected_unknown_field__/,
    `${label} must reject an injected unknown field`
  );
}

assertRejectsUnknownField('BarangaySchema', BarangaySchema, getBarangays()[0]);
assertRejectsUnknownField(
  'FinanceReportSchema',
  FinanceReportSchema,
  getFinanceReports()[0]
);
assertRejectsUnknownField(
  'FinanceObservationSchema',
  FinanceObservationSchema,
  getFinanceObservations()[0]
);
assertRejectsUnknownField(
  'LegislationRecordSchema',
  LegislationRecordSchema,
  getExecutiveOrders()[0]
);
assertRejectsUnknownField(
  'PublicRecordsCoverageMetricSchema',
  PublicRecordsCoverageMetricSchema,
  getPublicRecordsMetrics()[0]
);
assertRejectsUnknownField(
  'PublicRecordsArchiveCoverageSchema',
  PublicRecordsArchiveCoverageSchema,
  getPublicRecordsArchiveCoverage()[0]
);
assertRejectsUnknownField(
  'PublicRecordsRelatedCollectionSchema',
  PublicRecordsRelatedCollectionSchema,
  getPublicRecordsRelatedCollections()[0]
);

const genDir = fileURLToPath(
  new URL('../src/data/generated/civic/', import.meta.url)
);
const cityGeojson = JSON.parse(
  readFileSync(genDir + 'geography/city.geojson', 'utf8')
);
const barangaysGeojson = JSON.parse(
  readFileSync(genDir + 'geography/barangays.geojson', 'utf8')
);

assertRejectsUnknownField('CityGeojsonSchema', CityGeojsonSchema, cityGeojson);
assertRejectsUnknownField(
  'BarangaysGeojsonSchema (feature collection level)',
  BarangaysGeojsonSchema,
  barangaysGeojson
);

// Nested-object strictness: an unknown key inside one feature's `properties`
// must also be rejected, not just at the top level.
const featureWithUnknownProperty = {
  ...cityGeojson,
  features: [
    {
      ...cityGeojson.features[0],
      properties: {
        ...cityGeojson.features[0].properties,
        __injected_unknown_field__: 'should be rejected',
      },
    },
  ],
};
assert.throws(
  () => CityGeojsonSchema.parse(featureWithUnknownProperty),
  /Unrecognized key|__injected_unknown_field__/,
  'CityGeojsonSchema must reject an unknown field nested inside feature properties'
);

const manifestJson = JSON.parse(readFileSync(genDir + 'manifest.json', 'utf8'));
assertRejectsUnknownField('ManifestSchema', ManifestSchema, manifestJson);

// Nested-object strictness inside the manifest's per-dataset entries.
const manifestDatasetKey = Object.keys(manifestJson.datasets)[0];
const manifestWithUnknownDatasetField = {
  ...manifestJson,
  datasets: {
    ...manifestJson.datasets,
    [manifestDatasetKey]: {
      ...manifestJson.datasets[manifestDatasetKey],
      __injected_unknown_field__: 'should be rejected',
    },
  },
};
assert.throws(
  () => ManifestSchema.parse(manifestWithUnknownDatasetField),
  /Unrecognized key|__injected_unknown_field__/,
  'ManifestSchema must reject an unknown field nested inside a dataset entry'
);

console.log(
  '[smoke-strict-schemas] OK — all hardened public schemas reject injected unknown fields'
);
