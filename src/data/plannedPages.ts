const plannedPageRoutes = [
  { id: 'resolutions', path: '/legislation/resolutions' },
  { id: 'financialTransparency', path: '/transparency/finance' },
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
