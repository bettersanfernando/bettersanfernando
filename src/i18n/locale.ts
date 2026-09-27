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
