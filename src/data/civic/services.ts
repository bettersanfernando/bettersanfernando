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

const CswdoRequirementSchema = z.strictObject({
  condition: NonEmptyString.nullable(),
  ordinal: NonEmptyString,
  text: NonEmptyString,
  where_to_secure: NonEmptyString,
});

const CswdoServiceSchema = z.strictObject({
  ...SharedServiceShape,
  appointment: z.null(),
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
    acronym: z.literal('CSWDO'),
    division: z.null(),
    name: z.literal('City Social Welfare and Development Office'),
  }),
  office_contact: z.strictObject({
    address: NonEmptyString,
    emails: z.array(z.email()).min(1),
    phone: NonEmptyString,
  }),
  office_hours: z.strictObject({
    schedule: NonEmptyString,
    scope: z.literal('Published CSWDO office hours only'),
  }),
  online_channels: z.tuple([]),
  forms: z.tuple([]),
  processing_time: z.strictObject({
    status: z.enum(['as_stated_in_charter', 'not_stated', 'refer_to_charter']),
    text: NonEmptyString.nullable(),
  }),
  requirements: z.array(CswdoRequirementSchema).min(1),
});

const ChoServiceSchema = z.strictObject({
  ...SharedServiceShape,
  appointment: z.null(),
  classification: z.strictObject({
    complexity: z.union([z.literal('Simple'), z.literal(''), z.null()]),
    service_scope: z.literal('External'),
    transaction_types: z.tuple([z.literal('G2C')]),
  }),
  fee: z.strictObject({
    status: z.enum(['as_stated_in_charter', 'refer_to_charter']),
    text: NonEmptyString,
  }),
  office: z.strictObject({
    acronym: z.literal('CHO'),
    division: z.null(),
    name: z.literal('City Health Office'),
  }),
  office_contact: z.strictObject({
    address: NonEmptyString,
    emails: z.array(z.email()).min(1),
    extensions: z.array(NonEmptyString).min(1),
    phone: NonEmptyString,
  }),
  office_hours: z.strictObject({
    schedule: NonEmptyString,
    scope: z.literal('Published CHO main office hours only'),
  }),
  online_channels: z.tuple([]),
  forms: z.tuple([]),
  processing_time: z.strictObject({
    status: z.enum(['as_stated_in_charter', 'refer_to_charter']),
    text: NonEmptyString,
  }),
  requirements: z
    .array(
      z.strictObject({
        condition: NonEmptyString.nullable(),
        ordinal: NonEmptyString,
        text: NonEmptyString,
        where_to_secure: z.string().nullable(),
      })
    )
    .min(1),
});

const CippesoServiceSchema = z.strictObject({
  ...SharedServiceShape,
  appointment: z.null(),
  classification: z.strictObject({
    complexity: z.literal('Simple'),
    service_scope: z.literal('External'),
    transaction_types: z.tuple([z.literal('G2C')]),
  }),
  fee: z.strictObject({
    status: z.enum(['as_stated_in_charter', 'refer_to_charter']),
    text: NonEmptyString,
  }),
  office: z.strictObject({
    acronym: z.literal('CIPPESO'),
    division: z.literal('City Public Employment Services Office (CPESO)'),
    name: z.literal(
      'City Investment Promotions and Public Employment Services Office'
    ),
  }),
  office_contact: z.strictObject({
    address: NonEmptyString,
    emails: z.array(z.email()).min(1),
    extension: NonEmptyString,
    phone: NonEmptyString,
  }),
  office_hours: z.strictObject({
    schedule: z.null(),
    scope: z.literal('Not established by current evidence.'),
  }),
  processing_time: z.strictObject({
    status: z.enum(['as_stated_in_charter', 'refer_to_charter']),
    text: NonEmptyString,
  }),
  requirements: z.array(CswdoRequirementSchema).min(1),
});

const CavoVariantSchema = z.strictObject({
  label: NonEmptyString,
  note: NonEmptyString.optional(),
  processing_time: NonEmptyString,
});

const CavoServiceSchema = z.strictObject({
  ...SharedServiceShape,
  appointment: z.null(),
  category: z.literal('agriculture-fisheries'),
  classification: z.strictObject({
    complexity: z.literal('Simple'),
    service_scope: z.literal('External'),
    transaction_types: z.array(z.enum(['G2C', 'G2G'])).min(1),
  }),
  fee: z.strictObject({
    status: z.enum(['as_stated_in_charter', 'refer_to_charter']),
    text: NonEmptyString,
  }),
  office: z.strictObject({
    acronym: z.literal('CAVO'),
    division: z.enum([
      'City Agriculture and Veterinary Office – Agriculture Division',
      'City Agriculture and Veterinary Office – Veterinary Division',
      'City Agriculture and Veterinary Office – Veterinary Division / Regulatory Unit',
    ]),
    name: z.literal('City Agriculture and Veterinary Office'),
  }),
  office_contact: z.strictObject({
    emails: z.array(z.email()).min(1),
    phone: NonEmptyString,
  }),
  office_hours: z.strictObject({
    schedule: NonEmptyString,
    scope: z.literal('Published CAVO main office hours only'),
  }),
  processing_time: z.strictObject({
    status: z.enum(['as_stated_in_charter', 'refer_to_charter']),
    text: NonEmptyString,
  }),
  requirements: z.array(CdrrmoRequirementSchema).min(1),
  variants: z.array(CavoVariantSchema).min(1).optional(),
});

const CcsfpServiceSchema = z.strictObject({
  ...SharedServiceShape,
  appointment: z.null(),
  category: z.literal('education'),
  classification: z.strictObject({
    complexity: z.literal('Simple'),
    service_scope: z.literal('External'),
    transaction_types: z.tuple([z.literal('G2C')]),
  }),
  fee: z.strictObject({
    status: z.literal('as_stated_in_charter'),
    text: NonEmptyString,
  }),
  office: z.strictObject({
    acronym: z.literal('CCSFP'),
    division: z.enum([
      'Guidance Office',
      'Clinic',
      'Office of the Registrar',
      'Learning Resource Center (LRC)',
    ]),
    name: z.literal('City College of San Fernando Pampanga'),
  }),
  office_contact: z.strictObject({
    emails: z.array(z.email()).min(1),
    phone: NonEmptyString,
  }),
  office_hours: z.strictObject({
    schedule: NonEmptyString,
    scope: z.literal('Published City College main office hours only'),
  }),
  online_channels: z.tuple([]),
  forms: z.tuple([]),
  processing_time: z.strictObject({
    status: z.literal('as_stated_in_charter'),
    text: NonEmptyString,
  }),
  requirements: z.array(CdrrmoRequirementSchema).min(1),
});

const CenroServiceSchema = z.strictObject({
  ...SharedServiceShape,
  appointment: z.null(),
  category: z.literal('environment'),
  classification: z.strictObject({
    complexity: z.literal('G2C \u2013 Government to Citizen'),
    service_scope: z.literal('External'),
    transaction_types: z.tuple([]),
  }),
  fee: z.strictObject({
    status: z.literal('as_stated_in_charter'),
    text: NonEmptyString,
  }),
  office: z.strictObject({
    acronym: z.literal('CENRO'),
    division: z.literal('City Composting Center'),
    name: z.literal('City Environment and Natural Resources Office'),
  }),
  office_contact: z.strictObject({
    emails: z.array(z.email()).min(1),
    phone: z.null(),
  }),
  office_hours: z.null(),
  online_channels: z.tuple([]),
  forms: z.tuple([]),
  processing_time: z.strictObject({
    status: z.literal('as_stated_in_charter'),
    text: NonEmptyString,
  }),
  requirements: z.array(CswdoRequirementSchema).min(1),
});

const ServiceSchema = z.union([
  BlpdServiceSchema,
  CdrrmoServiceSchema,
  CswdoServiceSchema,
  ChoServiceSchema,
  CippesoServiceSchema,
  CavoServiceSchema,
  CcsfpServiceSchema,
  CenroServiceSchema,
]);

const ServicesFileSchema = z
  .strictObject({
    dataset: z.literal('services'),
    jurisdiction_psgc: PsgcCode,
    last_verified: IsoDateString,
    office_scope: z.tuple([
      z.literal('Business License and Permit Division'),
      z.literal('City Disaster Risk Reduction Management Office'),
      z.literal('City Social Welfare and Development Office'),
      z.literal('City Health Office'),
      z.literal(
        'City Investment Promotions and Public Employment Services Office'
      ),
      z.literal('City Agriculture and Veterinary Office'),
      z.literal('City College of San Fernando Pampanga'),
      z.literal('City Environment and Natural Resources Office'),
    ]),
    publication_status: z.literal('INITIAL_PILOT'),
    record_count: z.literal(137),
    schema_version: z.literal(1),
    services: z.array(ServiceSchema).length(137),
  })
  .superRefine((file, context) => {
    for (const key of ['id', 'slug'] as const) {
      if (new Set(file.services.map(service => service[key])).size !== 137) {
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
    const cswdoCount = file.services.filter(
      service => service.office.acronym === 'CSWDO'
    ).length;
    const choCount = file.services.filter(
      service => service.office.acronym === 'CHO'
    ).length;
    const cippesoCount = file.services.filter(
      service => service.office.acronym === 'CIPPESO'
    ).length;
    const cavoCount = file.services.filter(
      service => service.office.acronym === 'CAVO'
    ).length;
    const ccsfpCount = file.services.filter(
      service => service.office.acronym === 'CCSFP'
    ).length;
    const cenroCount = file.services.filter(
      service => service.office.acronym === 'CENRO'
    ).length;
    if (
      blpdCount !== 8 ||
      cdrrmoCount !== 7 ||
      cswdoCount !== 39 ||
      choCount !== 59 ||
      cippesoCount !== 7 ||
      cavoCount !== 7 ||
      ccsfpCount !== 9 ||
      cenroCount !== 1
    ) {
      context.addIssue({
        code: 'custom',
        message:
          'Services must contain exactly 8 BLPD, 7 CDRRMO, 39 CSWDO, 59 CHO, 7 CIPPESO, 7 CAVO, 9 CCSFP, and 1 CENRO record',
        path: ['services'],
      });
    }
  });

export type Service = z.infer<typeof ServiceSchema>;
export type PublishedServiceCategory =
  | 'business'
  | 'disaster-preparedness'
  | 'assistance-programs'
  | 'social-welfare'
  | 'pwd-services'
  | 'health-services'
  | 'employment'
  | 'agriculture-fisheries'
  | 'education'
  | 'environment';

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

const categoryByAcronym: Record<
  Service['office']['acronym'],
  PublishedServiceCategory
> = {
  BLPD: 'business',
  CDRRMO: 'disaster-preparedness',
  CSWDO: 'assistance-programs',
  CHO: 'health-services',
  CIPPESO: 'employment',
  CAVO: 'agriculture-fisheries',
  CCSFP: 'education',
  CENRO: 'environment',
};

// CSWDO covers three resident-facing purposes, not one category: reviewed
// PWD ID/registration records and Solo Parent ID/registration records are
// carved out of the general Assistance Programs bucket by stable service id.
const pwdServiceIds = new Set([
  'charter-2026-2e-city-social-welfare-and-development-office-external-14',
  'charter-2026-2e-city-social-welfare-and-development-office-external-15',
  'charter-2026-2e-city-social-welfare-and-development-office-external-16',
  'charter-2026-2e-city-social-welfare-and-development-office-external-17',
  'charter-2026-2e-city-social-welfare-and-development-office-external-18',
  'charter-2026-2e-city-social-welfare-and-development-office-external-19',
]);
const soloParentServiceIds = new Set([
  'charter-2026-2e-city-social-welfare-and-development-office-external-27',
  'charter-2026-2e-city-social-welfare-and-development-office-external-28',
  'charter-2026-2e-city-social-welfare-and-development-office-external-29',
  'charter-2026-2e-city-social-welfare-and-development-office-external-30',
  'charter-2026-2e-city-social-welfare-and-development-office-external-31',
  'charter-2026-2e-city-social-welfare-and-development-office-external-32',
  'charter-2026-2e-city-social-welfare-and-development-office-external-33',
  'charter-2026-2e-city-social-welfare-and-development-office-external-34',
  'charter-2026-2e-city-social-welfare-and-development-office-external-35',
  'charter-2026-2e-city-social-welfare-and-development-office-external-36',
  'charter-2026-2e-city-social-welfare-and-development-office-external-37',
  'charter-2026-2e-city-social-welfare-and-development-office-external-38',
  'charter-2026-2e-city-social-welfare-and-development-office-external-39',
  'charter-2026-2e-city-social-welfare-and-development-office-external-40',
]);

export function getServiceCategory(service: Service): PublishedServiceCategory {
  if (pwdServiceIds.has(service.id)) return 'pwd-services';
  if (soloParentServiceIds.has(service.id)) return 'social-welfare';
  return categoryByAcronym[service.office.acronym];
}

export function getServiceHref(service: Service): string {
  return `/services/${getServiceCategory(service)}/${service.slug}`;
}
