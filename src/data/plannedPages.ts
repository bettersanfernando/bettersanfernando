const plannedPageRoutes = [
  { id: 'resolutions', path: '/legislation/resolutions' },
  { id: 'transparencyDocuments', path: '/transparency/documents' },
  { id: 'financialTransparency', path: '/transparency/finance' },
  { id: 'demographics', path: '/statistics/demographics' },
  { id: 'projectSpending', path: '/statistics/project-spending' },
  { id: 'governmentStatistics', path: '/statistics/government' },
  { id: 'legislationStatistics', path: '/statistics/legislation' },
  { id: 'publicRecordsStatistics', path: '/statistics/public-records' },
] as const;

export type PlannedPageId = (typeof plannedPageRoutes)[number]['id'];

export type PlannedPageDefinition = (typeof plannedPageRoutes)[number] & {
  titleKey: string;
  descriptionKey: string;
};

export const plannedPages: PlannedPageDefinition[] = plannedPageRoutes.map(
  page => ({
    ...page,
    titleKey: `plannedPages.pages.${page.id}.title`,
    descriptionKey: `plannedPages.pages.${page.id}.description`,
  })
);

export function getPlannedPage(pageId: PlannedPageId) {
  return plannedPages.find(page => page.id === pageId)!;
}
