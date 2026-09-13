// Service-category tile presentation (display name, slug, description,
// publication status), shared by the /services hub and the
// [category]/service-category-view.next.tsx detail view so the two never
// drift out of sync. Ported verbatim from src/pages/Services.tsx.
export const categories = [
  [
    'Business Services',
    'business',
    'Permits, registration guidance, and business information.',
    'published',
  ],
  [
    'Employment',
    'employment',
    'Employment services, opportunities, and workforce support.',
    'published',
  ],
  [
    'Health Services',
    'health-services',
    'Local health services and access guidance.',
    'published',
  ],
  [
    'Education Services',
    'education',
    'Reviewed City College services and student support procedures.',
    'published',
  ],
  [
    'Assistance Programs',
    'assistance-programs',
    'Public assistance programs and eligibility guidance.',
    'published',
  ],
  [
    'Social Welfare',
    'social-welfare',
    'Local social-welfare services and referral routes.',
    'published',
  ],
  [
    'Senior Citizens',
    'senior-citizens',
    'Reviewed OSCA senior citizen ID application and replacement procedures.',
    'published',
  ],
  [
    'PWD Services',
    'pwd-services',
    'Services and support for persons with disabilities.',
    'published',
  ],
  [
    'Civil Registry',
    'civil-registry',
    'Reviewed local civil-registration and certification procedures.',
    'published',
  ],
  [
    'Infrastructure & Public Works',
    'infrastructure-public-works',
    'Reviewed complaint intake and referral procedure for roads, bridges, drainage, streetlights, and public facilities.',
    'published',
  ],
  [
    'Housing & Land Use',
    'housing-land-use',
    'Reviewed OCBO annual inspection, operation, and electrical-completion certificate procedures.',
    'published',
  ],
  [
    'Utilities & Water',
    'utilities-water',
    'Reviewed CSFWD water-service transactions plus billing-inquiry and complaints resources.',
    'published',
  ],
  [
    'Property & Taxes',
    'property-taxes',
    'Reviewed City Assessor and City Treasurer property-tax procedures.',
    'published',
  ],
  [
    'Agriculture & Fisheries',
    'agriculture-fisheries',
    'Local CAVO agriculture, crop, animal health, and meat-regulation services.',
    'published',
  ],
  [
    'Environment',
    'environment',
    'Reviewed environmental services and access guidance.',
    'published',
  ],
  [
    'Disaster Preparedness',
    'disaster-preparedness',
    'Preparedness guidance and reviewed response services.',
    'published',
  ],
] as const;
