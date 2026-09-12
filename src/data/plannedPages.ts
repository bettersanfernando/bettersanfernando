// Every canonical planned route has shipped as a real page; kept as a typed
// empty registry (rather than deleted outright) since App.tsx's route-map
// wiring, PlannedPage, and numerous smoke tests still reference it as the
// live source of truth for "no planned routes remain."
const plannedPageRoutes: readonly { id: string; path: string }[] = [];

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
