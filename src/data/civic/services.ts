import { z } from 'zod';
import { IsoDateString, PsgcCode } from './schemas.ts';
import servicesJson from '../generated/civic/services/services.json' with { type: 'json' };

const NonEmptyString = z.string().trim().min(1);
const PublicUrl = z.url().refine(url => /^https?:\/\//.test(url), {
  message: 'Expected a public HTTP(S) URL',
});
const ServiceId = z
  .string()
  .regex(/^charter-2026-2e-[a-z0-9]+(?:-[a-z0-9]+)*-external-\d{2}$/);
const Slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const BlpdRequirementSchema = z.strictObject({
  condition: NonEmptyString.nullable(),
  ordinal: NonEmptyString,
  text: NonEmptyString,
  where_to_secure: NonEmptyString,
});

const CdrrmoRequirementSchema = z.strictObject({
  condition: NonEmptyString.nullable(),
  ordinal: NonEmptyString.nullable(),
  text: NonEmptyString,
  where_to_secure: NonEmptyString.nullable(),
});

const ClientStepSchema = z.strictObject({
  instruction: NonEmptyString,
  sequence: NonEmptyString,
});

const CanonicalSourceSchema = z.strictObject({
  edition: NonEmptyString,
  label: NonEmptyString,
  landing_page_url: PublicUrl,
  source_role: z.literal('CURRENT_CANONICAL'),
  url: PublicUrl,
});

const FormsSchema = z.array(
  z.strictObject({
    label: NonEmptyString,
    scope: NonEmptyString,
    url: PublicUrl,
    version: NonEmptyString.optional(),
  })
);

const OnlineChannelsSchema = z.array(
  z.strictObject({
    availability_note: NonEmptyString,
    label: NonEmptyString,
    url: PublicUrl,
  })
);

const AppointmentSchema = z
  .strictObject({
    note: NonEmptyString,
    status: z.literal('service_coverage_not_confirmed'),
    url: PublicUrl,
  })
  .nullable();

const SharedServiceShape = {
  canonical_source: CanonicalSourceSchema,
  client_steps: z.array(ClientStepSchema).min(1),
  description: NonEmptyString,
  forms: FormsSchema,
  freshness_status: z.enum(['verified', 'verify_with_office']),
  id: ServiceId,
  last_verified: IsoDateString,
  online_channels: OnlineChannelsSchema,
  public_notes: z.array(NonEmptyString),
  slug: Slug,
  title: NonEmptyString,
  who_may_avail: NonEmptyString,
};

const BlpdServiceSchema = z.strictObject({
  ...SharedServiceShape,
  appointment: AppointmentSchema,
  classification: z.strictObject({
    complexity: z.literal('Simple'),
    service_scope: z.literal('External'),
    transaction_types: z.array(z.enum(['G2B', 'G2C', 'G2G'])).min(1),
  }),
  fee: z.strictObject({
    status: z.enum(['as_stated_in_charter', 'refer_to_charter']),
    text: NonEmptyString,
  }),
  office: z.strictObject({
    acronym: z.literal('BLPD'),
    division: z.literal('Business License and Permit Division'),
    name: z.literal('Business License and Permit Division'),
  }),
  office_contact: z.strictObject({
    emails: z.array(z.email()).min(1),
    extension_office_extension: NonEmptyString,
    extensions: z.array(NonEmptyString).min(1),
    phone: NonEmptyString,
  }),
  office_hours: z.strictObject({
    schedule: NonEmptyString,
    scope: NonEmptyString,
  }),
  processing_time: z.strictObject({
    status: z.enum(['as_stated_in_charter', 'refer_to_charter']),
    text: NonEmptyString,
  }),
  requirements: z.array(BlpdRequirementSchema).min(1),
});

const CdrrmoServiceSchema = z.strictObject({
  ...SharedServiceShape,
  appointment: z.null(),
  availability: z
    .strictObject({
      scope: NonEmptyString,
      status: z.literal('24/7'),
    })
    .nullable(),
  emergency_contacts: z.array(
    z.strictObject({
      label: NonEmptyString,
      phone: NonEmptyString,
      scope: NonEmptyString,
    })
  ),
  classification: z.strictObject({
    complexity: z.enum(['Simple', 'Complex']),
    service_scope: z.literal('External'),
    transaction_types: z.tuple([z.literal('G2C')]),
  }),
  fee: z.strictObject({
    status: z.enum(['as_stated_in_charter', 'not_stated', 'refer_to_charter']),
    text: NonEmptyString.nullable(),
  }),
  office: z.strictObject({
    acronym: z.literal('CDRRMO'),
    division: z.null(),
    name: z.literal('City Disaster Risk Reduction Management Office'),
  }),
  office_contact: z.strictObject({
    emails: z.array(z.email()).min(1),
    phone: NonEmptyString,
  }),
  office_hours: z.strictObject({
    schedule: NonEmptyString,
    scope: z.literal('Regular CDRRMO office operations only'),
  }),
  online_channels: z.tuple([]),
  forms: z.tuple([]),
  processing_time: z.strictObject({
    status: z.enum(['as_stated_in_charter', 'not_stated', 'refer_to_charter']),
    text: NonEmptyString.nullable(),
  }),
  requirements: z.array(CdrrmoRequirementSchema).min(1),
});

const ServiceSchema = z.union([BlpdServiceSchema, CdrrmoServiceSchema]);

const ServicesFileSchema = z
  .strictObject({
    dataset: z.literal('services'),
    jurisdiction_psgc: PsgcCode,
    last_verified: IsoDateString,
    office_scope: z.tuple([
      z.literal('Business License and Permit Division'),
      z.literal('City Disaster Risk Reduction Management Office'),
    ]),
    publication_status: z.literal('INITIAL_PILOT'),
    record_count: z.literal(15),
    schema_version: z.literal(1),
    services: z.array(ServiceSchema).length(15),
  })
  .superRefine((file, context) => {
    for (const key of ['id', 'slug'] as const) {
      if (new Set(file.services.map(service => service[key])).size !== 15) {
        context.addIssue({
          code: 'custom',
          message: `Service ${key}s must be unique`,
          path: ['services'],
        });
      }
    }

    const blpdCount = file.services.filter(
      service => service.office.acronym === 'BLPD'
    ).length;
    const cdrrmoCount = file.services.filter(
      service => service.office.acronym === 'CDRRMO'
    ).length;
    if (blpdCount !== 8 || cdrrmoCount !== 7) {
      context.addIssue({
        code: 'custom',
        message: 'Services must contain exactly 8 BLPD and 7 CDRRMO records',
        path: ['services'],
      });
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
