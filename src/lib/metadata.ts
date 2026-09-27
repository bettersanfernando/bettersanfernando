import type { Metadata } from 'next';
import { absoluteUrl, getSiteUrl } from './site-url';
import { withLocalePrefix } from '../i18n/locale';
import type { LanguageType } from '../types';

// Centralized metadata building blocks. Every page's metadata (static
// `export const metadata` or dynamic `generateMetadata()`) should build on
// these rather than repeating the description/OG/Twitter boilerplate or
// re-deriving canonical URLs by hand.

export const SITE_NAME = 'BetterSanFernando';
export const SITE_ALTERNATE_NAME = 'Better San Fernando';

// The homepage's own title — distinct from SITE_NAME, which is the title
// template's brand suffix for every other page (`%s | BetterSanFernando`).
// A bare brand token gives search engines nothing to bind the brand to a
// place or subject, so the homepage states both explicitly.
export const HOME_TITLE =
  'BetterSanFernando — Civic Information for San Fernando, Pampanga';

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

export function getRootMetadata(locale: LanguageType = 'en'): Metadata {
  const path = withLocalePrefix('/', locale);
  const metadataBase = new URL(
    `${getSiteUrl()}${locale === 'fil' ? '/fil/' : '/'}`
  );
  const title =
    locale === 'fil'
      ? 'BetterSanFernando â€” Impormasyong Pampubliko para sa San Fernando, Pampanga'
      : HOME_TITLE;
  const description =
    locale === 'fil'
      ? 'Ang BetterSanFernando ay isang malaya at pinatatakbo-ng-komunidad na portal ng impormasyong pampubliko para sa Lungsod ng San Fernando, Pampanga. Hindi ito ang opisyal na website ng Pamahalaang Lungsod.'
      : DEFAULT_DESCRIPTION;
  return {
    metadataBase,
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    applicationName: SITE_NAME,
    // No `icons` entry: favicon.ico, icon.png, and apple-icon.png under
    // src/app/ are picked up automatically by Next's file-convention icons.
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url: absoluteUrl(path),
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE_PATH],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: absoluteUrl(path),
      languages: {
        en: absoluteUrl('/'),
        'fil-PH': absoluteUrl('/fil'),
      },
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
  // Page metadata is relative to the locale-specific root metadataBase. That
  // keeps English canonical URLs at their existing paths while /fil pages
  // emit their own canonical URLs without duplicating every route module.
  const canonical = path === '/' ? './' : path.replace(/^\//, '');
  const english = absoluteUrl(path);
  const filipino = absoluteUrl(withLocalePrefix(path, 'fil'));
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: { en: english, 'fil-PH': filipino },
    },
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
