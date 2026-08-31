import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-PH', {
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
export function formatPeso(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'Not available';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
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
export function formatIsoDate(iso: string | null | undefined): string {
  if (!iso) return 'Not available';
  const [year, month, day] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
