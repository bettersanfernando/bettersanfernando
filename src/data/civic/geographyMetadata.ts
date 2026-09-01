import { z } from 'zod';
import manifestJson from '../generated/civic/manifest.json' with { type: 'json' };

const DatasetMetadataSchema = z.object({
  record_count: z.number().int().nonnegative(),
});
const SourceSchema = z.object({
  id: z.string(),
  publisher: z.string(),
  reference_note: z.string(),
  url: z.url(),
});
const GeographyManifestSchema = z.object({
  datasets: z.object({
    'geography/city.geojson': DatasetMetadataSchema,
    'geography/barangays.geojson': DatasetMetadataSchema,
  }),
  jurisdiction: z.object({
    name: z.string(),
    province: z.string(),
    psgc_code: z.string(),
  }),
  sources: z.array(SourceSchema),
});

const manifest = GeographyManifestSchema.parse(manifestJson);
const geometrySource = manifest.sources.find(
  source => source.id === 'psgc-shapefiles-community'
);
const identitySource = manifest.sources.find(
  source => source.id === 'psa-psgc'
);

if (!geometrySource || !identitySource) {
  throw new Error(
    'Geography source metadata is missing from the civic manifest'
  );
}

export type GeographyMetadata = Readonly<{
  cityName: string;
  province: string;
  cityPsgcCode: string;
  cityBoundaryCount: number;
  barangayBoundaryCount: number;
  geometryPublisher: string;
  geometryUrl: string;
  geometryReferenceNote: string;
  identityPublisher: string;
  identityUrl: string;
}>;

const geographyMetadata: GeographyMetadata = Object.freeze({
  cityName: manifest.jurisdiction.name,
  province: manifest.jurisdiction.province,
  cityPsgcCode: manifest.jurisdiction.psgc_code,
  cityBoundaryCount: manifest.datasets['geography/city.geojson'].record_count,
  barangayBoundaryCount:
    manifest.datasets['geography/barangays.geojson'].record_count,
  geometryPublisher: geometrySource.publisher,
  geometryUrl: geometrySource.url,
  geometryReferenceNote: geometrySource.reference_note,
  identityPublisher: identitySource.publisher,
  identityUrl: identitySource.url,
});

export function getGeographyMetadata(): GeographyMetadata {
  return geographyMetadata;
}
