import { createParser } from 'nuqs/server';

export type PageSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Returns the requested positive integer page, falling back to page one. */
export function parsePage(value: string | string[] | undefined): number {
  const raw = firstValue(value);
  return raw ? (parsePageValue(raw) ?? 1) : 1;
}

/** Parses one positive, safe integer page value; invalid values return null. */
export function parsePageValue(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

/** Strictly mirrors server pagination parsing for client-side query state. */
export const pageQueryParser = createParser({
  parse: parsePage,
  serialize: String,
});

/** Keeps an inventory page within the range represented by its listing. */
export function clampPage(page: number, totalPages: number): number {
  return Math.min(Math.max(page, 1), Math.max(totalPages, 1));
}

export function paginationHref(path: string, page: number): string {
  return page > 1 ? `${path}?page=${page}` : path;
}

/**
 * Pagination is indexable only for the clean directory inventory. Any other
 * query parameter is an interactive search/filter/sort variant and retains
 * the listing's base canonical.
 */
export function cleanPaginationPage(
  searchParams: PageSearchParams,
  totalPages: number
): number {
  if (Object.keys(searchParams).some(key => key !== 'page')) return 1;
  return clampPage(parsePage(searchParams.page), totalPages);
}
