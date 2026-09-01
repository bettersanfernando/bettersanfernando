import {
  getExecutiveOrders,
  getOrdinances,
  getResolutions,
  hasLegislationFullText,
  type LegislationRecord,
} from './legislation.ts';

export type LegislationPreviewRecord = Readonly<{
  id: string;
  documentNumber: string;
  title: string | null;
  date: string | null;
  year: number;
  fullTextAvailable: boolean;
}>;

function relevantDate(record: LegislationRecord) {
  return (
    record.date_issued ?? record.date_adopted ?? record.date_approved ?? null
  );
}

function displayTitle(record: LegislationRecord) {
  return record.title ?? record.official_title ?? record.official_alias ?? null;
}

function preview(records: readonly LegislationRecord[]) {
  return [...records]
    .sort((left, right) => {
      const leftDate = relevantDate(left) ?? `${left.year}`;
      const rightDate = relevantDate(right) ?? `${right.year}`;
      return (
        rightDate.localeCompare(leftDate) ||
        right.document_number.localeCompare(left.document_number)
      );
    })
    .slice(0, 3)
    .map(record =>
      Object.freeze({
        id: record.id,
        documentNumber: record.document_number,
        title: displayTitle(record),
        date: relevantDate(record),
        year: record.year,
        fullTextAvailable: hasLegislationFullText(record),
      })
    );
}

export function getLegislationSummary() {
  const executiveOrders = getExecutiveOrders();
  const ordinances = getOrdinances();
  const resolutions = getResolutions();
  const ordinanceFullText = ordinances.filter(hasLegislationFullText).length;

  return Object.freeze({
    executiveOrders: Object.freeze({
      total: executiveOrders.length,
      withFullText: executiveOrders.filter(hasLegislationFullText).length,
      preview: Object.freeze(preview(executiveOrders)),
    }),
    ordinances: Object.freeze({
      total: ordinances.length,
      withFullText: ordinanceFullText,
      referenceOnly: ordinances.length - ordinanceFullText,
      preview: Object.freeze(preview(ordinances)),
    }),
    resolutions: Object.freeze({ total: resolutions.length }),
  });
}
