import type { PageT } from '../../i18n/page-t';

// Service-category tile presentation (display name, slug, description,
// publication status), shared by the /services hub and the
// [category]/service-category-view.tsx detail view so the two never
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

export type CategorySlug = (typeof categories)[number][1];

// Localized display text for a category tile — canonical `categories` above
// stays English; only this display layer is translated, keyed by the stable
// slug rather than by re-parsing the English name/description (which would
// break if the English wording ever changes). Used by every page that shows
// a category name or description, so the Filipino text exists exactly once.
export function getCategoryDisplay(
  slug: string,
  t: PageT
): { name: string; description: string } {
  switch (slug as CategorySlug) {
    case 'business':
      return {
        name: t('Business Services'),
        description: t(
          'Permits, registration guidance, and business information.'
        ),
      };
    case 'employment':
      return {
        name: t('Employment'),
        description: t(
          'Employment services, opportunities, and workforce support.'
        ),
      };
    case 'health-services':
      return {
        name: t('Health Services'),
        description: t('Local health services and access guidance.'),
      };
    case 'education':
      return {
        name: t('Education Services'),
        description: t(
          'Reviewed City College services and student support procedures.'
        ),
      };
    case 'assistance-programs':
      return {
        name: t('Assistance Programs'),
        description: t('Public assistance programs and eligibility guidance.'),
      };
    case 'social-welfare':
      return {
        name: t('Social Welfare'),
        description: t('Local social-welfare services and referral routes.'),
      };
    case 'senior-citizens':
      return {
        name: t('Senior Citizens'),
        description: t(
          'Reviewed OSCA senior citizen ID application and replacement procedures.'
        ),
      };
    case 'pwd-services':
      return {
        name: t('PWD Services'),
        description: t('Services and support for persons with disabilities.'),
      };
    case 'civil-registry':
      return {
        name: t('Civil Registry'),
        description: t(
          'Reviewed local civil-registration and certification procedures.'
        ),
      };
    case 'infrastructure-public-works':
      return {
        name: t('Infrastructure & Public Works'),
        description: t(
          'Reviewed complaint intake and referral procedure for roads, bridges, drainage, streetlights, and public facilities.'
        ),
      };
    case 'housing-land-use':
      return {
        name: t('Housing & Land Use'),
        description: t(
          'Reviewed OCBO annual inspection, operation, and electrical-completion certificate procedures.'
        ),
      };
    case 'utilities-water':
      return {
        name: t('Utilities & Water'),
        description: t(
          'Reviewed CSFWD water-service transactions plus billing-inquiry and complaints resources.'
        ),
      };
    case 'property-taxes':
      return {
        name: t('Property & Taxes'),
        description: t(
          'Reviewed City Assessor and City Treasurer property-tax procedures.'
        ),
      };
    case 'agriculture-fisheries':
      return {
        name: t('Agriculture & Fisheries'),
        description: t(
          'Local CAVO agriculture, crop, animal health, and meat-regulation services.'
        ),
      };
    case 'environment':
      return {
        name: t('Environment'),
        description: t('Reviewed environmental services and access guidance.'),
      };
    case 'disaster-preparedness':
      return {
        name: t('Disaster Preparedness'),
        description: t('Preparedness guidance and reviewed response services.'),
      };
    default:
      return { name: slug, description: '' };
  }
}
