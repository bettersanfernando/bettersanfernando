// Config for the header's emergency and civic-utility strips, kept separate
// from Navbar.tsx so real hotline/currency/weather providers can be dropped
// in later without touching layout markup.

export const emergencyStrip = {
  href: '/government/hotlines',
  titleKey: 'navigation.emergencyStrip.title',
  ctaKey: 'navigation.emergencyStrip.cta',
} as const;

export const civicUtilityBar = {
  portalStatusKey: 'navigation.civicUtility.portalStatus',
  betterGovHref: 'https://bettergov.ph',
  betterGovLabelKey: 'navigation.civicUtility.betterGovLink',
  currencyLabelKey: 'navigation.civicUtility.currencyLabel',
  weatherLabelKey: 'navigation.civicUtility.weatherLabel',
} as const;

// No canonical San Fernando, Pampanga coordinate exists elsewhere in the
// repo (geographyMetadata.ts only carries jurisdiction/PSGC identity, not
// lat/lng) — this is City Hall's approximate location.
export const SAN_FERNANDO_COORDINATES = {
  latitude: 15.0344,
  longitude: 120.689,
} as const;

const PHT_TIME_ZONE = 'Asia/Manila';

export function formatPhilippineTime(date: Date): string {
  return `${new Intl.DateTimeFormat('en-US', {
    timeZone: PHT_TIME_ZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)} • ${new Intl.DateTimeFormat('en-US', {
    timeZone: PHT_TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)} PHT`;
}
