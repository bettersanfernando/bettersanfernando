import type { Metadata } from 'next';
import { absoluteUrl, getSiteUrl } from './site-url';

// Centralized metadata building blocks. Every page's metadata (static
// `export const metadata` or dynamic `generateMetadata()`) should build on
// these rather than repeating the description/OG/Twitter boilerplate or
// re-deriving canonical URLs by hand.

export const SITE_NAME = 'BetterSanFernando';

// Truthful identity, repeated verbatim everywhere the portal describes
// itself: independent and community-run, never implying it is the official
// City Government website, an authority, or a live government integration.
export const DEFAULT_DESCRIPTION =
  'BetterSanFernando is an independent, community-run civic-information portal for the City of San Fernando, Pampanga. It is not the official City Government website.';

export const DEFAULT_OG_IMAGE_PATH = '/og-default.png';
export const DEFAULT_OG_IMAGE = {
  url: DEFAULT_OG_IMAGE_PATH,
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — Independent Civic Information Portal for the City of San Fernando, Pampanga`,
} as const;

export function getRootMetadata(): Metadata {
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    applicationName: SITE_NAME,
    icons: {
      icon: '/assets/brand/symbols/better-san-fernando-symbol-blue-transparent.png',
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      url: absoluteUrl('/'),
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE_PATH],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Metadata for one canonical, indexable page. `path` must be the page's
 * own canonical route (no query string) — every canonical URL in the app
 * is derived from this one helper via absoluteUrl().
 */
export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
}: {
  /** Omit only for the home page, so the root template's default title applies. */
  title?: string;
  description?: string;
  path: string;
}): Metadata {
  const canonical = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: 'website',
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE_PATH],
    },
  };
}

// The 9 filter/search pages (?q=, ?sort=, etc.) use buildPageMetadata()
// directly with their own base path (never the request's query string) —
// that's what makes every ?q=/?sort=/... combination canonicalize back to
// the same clean URL instead of getting its own canonical.
