import { z } from 'zod';
import { IsoDateString, PsgcCode } from './schemas.ts';
import servicesJson from '../generated/civic/services/services.json' with { type: 'json' };

const Url = z.url();

const ServiceRequirementSchema = z.strictObject({
  condition: z.string().nullable(),
  ordinal: z.string(),
  text: z.string(),
  where_to_secure: z.string(),
});

const ClientStepSchema = z.strictObject({
  instruction: z.string(),
  sequence: z.string(),
});

const ServiceSchema = z.strictObject({
  appointment: z
    .strictObject({
      note: z.string(),
      status: z.literal('service_coverage_not_confirmed'),
      url: Url,
    })
    .nullable(),
  canonical_source: z.strictObject({
    edition: z.string(),
    label: z.string(),
    landing_page_url: Url,
    source_role: z.literal('CURRENT_CANONICAL'),
    url: Url,
  }),
  classification: z.strictObject({
    complexity: z.literal('Simple'),
    service_scope: z.literal('External'),
    transaction_types: z.array(z.enum(['G2B', 'G2C', 'G2G'])),
  }),
  client_steps: z.array(ClientStepSchema).min(1),
  description: z.string(),
  fee: z.strictObject({
    status: z.enum(['as_stated_in_charter', 'refer_to_charter']),
    text: z.string(),
  }),
  forms: z.array(
    z.strictObject({
      label: z.string(),
      scope: z.string(),
      url: Url,
      version: z.string().optional(),
    })
  ),
  freshness_status: z.enum(['verified', 'verify_with_office']),
  id: z.string(),
  last_verified: IsoDateString,
  office: z.strictObject({
    acronym: z.literal('BLPD'),
    division: z.literal('Business License and Permit Division'),
    name: z.literal('Business License and Permit Division'),
  }),
  office_contact: z.strictObject({
    emails: z.array(z.email()),
    extension_office_extension: z.string(),
    extensions: z.array(z.string()),
    phone: z.string(),
  }),
  office_hours: z.strictObject({
    schedule: z.string(),
    scope: z.string(),
  }),
  online_channels: z.array(
    z.strictObject({
      availability_note: z.string(),
      label: z.string(),
      url: Url,
    })
  ),
  processing_time: z.strictObject({
    status: z.enum(['as_stated_in_charter', 'refer_to_charter']),
    text: z.string(),
  }),
  public_notes: z.array(z.string()),
  requirements: z.array(ServiceRequirementSchema).min(1),
  slug: z.string(),
  title: z.string(),
  who_may_avail: z.string(),
});

const ServicesFileSchema = z
  .strictObject({
    dataset: z.literal('services'),
    jurisdiction_psgc: PsgcCode,
    last_verified: IsoDateString,
    office_scope: z.tuple([z.literal('Business License and Permit Division')]),
    publication_status: z.literal('INITIAL_PILOT'),
    record_count: z.literal(8),
    schema_version: z.literal(1),
    services: z.array(ServiceSchema).length(8),
  })
  .superRefine((file, context) => {
    for (const key of ['id', 'slug'] as const) {
      if (new Set(file.services.map(service => service[key])).size !== 8) {
        context.addIssue({
          code: 'custom',
          message: `Service ${key}s must be unique`,
          path: ['services'],
        });
      }
    }
  });

export type Service = z.infer<typeof ServiceSchema>;

const servicesFile = ServicesFileSchema.parse(servicesJson);
const services: readonly Service[] = Object.freeze(servicesFile.services);
const servicesBySlug = new Map(
  services.map(service => [service.slug, service])
);

export function getServices(): readonly Service[] {
  return services;
}

export function getServiceBySlug(slug: string): Service | undefined {
  return servicesBySlug.get(slug);
}
