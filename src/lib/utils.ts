import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { INTL_LOCALES } from '../i18n/locale';
import type { LanguageType } from '../types';

const NOT_AVAILABLE: Record<LanguageType, string> = {
  en: 'Not available',
  fil: 'Hindi available',
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date, locale: LanguageType = 'en'): string {
  return new Intl.DateTimeFormat(INTL_LOCALES[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/** Formats a peso amount, or a neutral placeholder when the value is genuinely unavailable. */
export function formatPeso(
  amount: number | null | undefined,
  locale: LanguageType = 'en'
): string {
  if (amount === null || amount === undefined) return NOT_AVAILABLE[locale];
  return new Intl.NumberFormat(INTL_LOCALES[locale], {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
}

/**
 * Formats a numeric amount whose source document never states a currency
 * unit. Never attach a currency symbol or code here — pair the result with
 * an explicit "Currency not stated in source" label instead of guessing PHP.
 */
export function formatUnstatedAmount(
  amount: number | null | undefined,
  locale: LanguageType = 'en'
): string {
  if (amount === null || amount === undefined) return NOT_AVAILABLE[locale];
  return new Intl.NumberFormat(INTL_LOCALES[locale], {
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Turns a SNAKE_CASE enum value into a display label without changing its meaning. */
export function titleCaseEnum(value: string): string {
  return value
    .split('_')
    .map(word =>
      word.length <= 3 ? word : word.charAt(0) + word.slice(1).toLowerCase()
    )
    .join(' ');
}

/** Formats a YYYY-MM-DD date string without shifting days across timezones. */
export function formatIsoDate(
  iso: string | null | undefined,
  locale: LanguageType = 'en'
): string {
  if (!iso) return NOT_AVAILABLE[locale];
  const [year, month, day] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat(INTL_LOCALES[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
