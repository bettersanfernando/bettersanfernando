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
  // ponytail: static "—" placeholders until a live rate/weather provider is wired up
  currencyLabelKey: 'navigation.civicUtility.currencyLabel',
  weatherLabelKey: 'navigation.civicUtility.weatherLabel',
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
