import type { LanguageType } from '../types';

export const FILIPINO_PREFIX = '/fil';

export function isLanguage(value: string | undefined): value is LanguageType {
  return value === 'en' || value === 'fil';
}

export function localeFromPathname(pathname: string): LanguageType {
  return pathname === FILIPINO_PREFIX ||
    pathname.startsWith(`${FILIPINO_PREFIX}/`)
    ? 'fil'
    : 'en';
}

export function withoutLocalePrefix(pathname: string): string {
  if (pathname === FILIPINO_PREFIX) return '/';
  return pathname.startsWith(`${FILIPINO_PREFIX}/`)
    ? pathname.slice(FILIPINO_PREFIX.length)
    : pathname;
}

export function withLocalePrefix(
  pathname: string,
  locale: LanguageType
): string {
  const normalized = withoutLocalePrefix(pathname);
  return locale === 'fil'
    ? `${FILIPINO_PREFIX}${normalized === '/' ? '' : normalized}`
    : normalized;
}

export const INTL_LOCALES: Record<LanguageType, string> = {
  en: 'en-PH',
  fil: 'fil-PH',
};

export const OPEN_GRAPH_LOCALES: Record<LanguageType, string> = {
  en: 'en_PH',
  fil: 'fil_PH',
};

/**
 * Locale-prefixes an internal href, keeping its query string and fragment.
 * External, protocol-relative, fragment-only, and non-path hrefs (mailto:,
 * tel:) are returned untouched, and an already-prefixed href is not
 * prefixed twice.
 */
export function localizeHref(href: string, locale: LanguageType): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  const suffixStart = href.search(/[?#]/);
  const pathname = suffixStart === -1 ? href : href.slice(0, suffixStart);
  const suffix = suffixStart === -1 ? '' : href.slice(suffixStart);
  return `${withLocalePrefix(pathname, locale)}${suffix}`;
}
