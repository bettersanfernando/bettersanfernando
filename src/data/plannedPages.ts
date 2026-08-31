const plannedPageRoutes = [
  { id: 'employment', path: '/services/employment' },
  { id: 'livelihood', path: '/services/livelihood' },
  { id: 'assistancePrograms', path: '/services/assistance-programs' },
  { id: 'seniorCitizens', path: '/services/senior-citizens' },
  { id: 'pwdServices', path: '/services/pwd-services' },
  { id: 'procurementOverview', path: '/procurement' },
  { id: 'bidResults', path: '/procurement/bid-results' },
  { id: 'procurementContracts', path: '/procurement/contracts' },
  { id: 'projectSources', path: '/projects/sources' },
  { id: 'projectDataSources', path: '/projects/data-sources' },
  { id: 'projectMethodology', path: '/projects/methodology' },
  { id: 'governmentStructure', path: '/government/structure' },
  { id: 'governmentContact', path: '/government/contact' },
  { id: 'legislation', path: '/legislation' },
  { id: 'ordinances', path: '/legislation/ordinances' },
  { id: 'resolutions', path: '/legislation/resolutions' },
  { id: 'governmentDocuments', path: '/government/documents' },
  { id: 'governmentHotlines', path: '/government/hotlines' },
  { id: 'governmentLinks', path: '/government/links' },
  { id: 'transparency', path: '/transparency' },
  { id: 'fullDisclosure', path: '/transparency/full-disclosure' },
  { id: 'disclosureArchive', path: '/transparency/archive' },
  { id: 'transparencyDocuments', path: '/transparency/documents' },
  { id: 'transparencyProcurement', path: '/transparency/procurement' },
  { id: 'transparencyContracts', path: '/transparency/contracts' },
  { id: 'financialTransparency', path: '/transparency/finance' },
  { id: 'transparencySources', path: '/transparency/sources' },
  { id: 'transparencyMethodology', path: '/transparency/methodology' },
  { id: 'verification', path: '/transparency/verification' },
  { id: 'limitations', path: '/transparency/limitations' },
  { id: 'statistics', path: '/statistics' },
  { id: 'cityProfile', path: '/statistics/city-profile' },
  { id: 'demographics', path: '/statistics/demographics' },
  { id: 'projectSpending', path: '/statistics/project-spending' },
  { id: 'procurementStatistics', path: '/statistics/procurement' },
  { id: 'governmentStatistics', path: '/statistics/government' },
  { id: 'legislationStatistics', path: '/statistics/legislation' },
  { id: 'publicRecordsStatistics', path: '/statistics/public-records' },
  { id: 'barangays', path: '/barangays' },
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
