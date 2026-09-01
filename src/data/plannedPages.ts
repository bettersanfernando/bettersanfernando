const plannedPageRoutes = [
  { id: 'employment', path: '/services/employment' },
  { id: 'livelihood', path: '/services/livelihood' },
  { id: 'assistancePrograms', path: '/services/assistance-programs' },
  { id: 'seniorCitizens', path: '/services/senior-citizens' },
  { id: 'pwdServices', path: '/services/pwd-services' },
  { id: 'governmentStructure', path: '/government/structure' },
  { id: 'resolutions', path: '/legislation/resolutions' },
  { id: 'governmentDocuments', path: '/government/documents' },
  { id: 'governmentHotlines', path: '/government/hotlines' },
  { id: 'governmentLinks', path: '/government/links' },
  { id: 'transparency', path: '/transparency' },
  { id: 'fullDisclosure', path: '/transparency/full-disclosure' },
  { id: 'disclosureArchive', path: '/transparency/archive' },
  { id: 'transparencyDocuments', path: '/transparency/documents' },
  { id: 'financialTransparency', path: '/transparency/finance' },
  { id: 'statistics', path: '/statistics' },
  { id: 'demographics', path: '/statistics/demographics' },
  { id: 'projectSpending', path: '/statistics/project-spending' },
  { id: 'governmentStatistics', path: '/statistics/government' },
  { id: 'legislationStatistics', path: '/statistics/legislation' },
  { id: 'publicRecordsStatistics', path: '/statistics/public-records' },
  { id: 'about', path: '/about' },
  { id: 'contact', path: '/contact' },
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
