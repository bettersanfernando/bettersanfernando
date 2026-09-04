import type {
  NavigationDestination,
  NavigationIcon,
  NavigationId,
  NavigationItem,
} from '../types';

const destinationPresentation = {
  businessServices: ['briefcase', 'businessServices'],
  permitsLicenses: ['file-check', 'permitsLicenses'],
  employment: ['users', 'employment'],
  livelihood: ['hand-heart', 'livelihood'],
  healthServices: ['heart-pulse', 'healthServices'],
  educationServices: ['graduation-cap', 'educationServices'],
  assistancePrograms: ['hand-heart', 'assistancePrograms'],
  socialWelfare: ['users', 'socialWelfare'],
  seniorCitizens: ['users', 'seniorCitizens'],
  pwdServices: ['accessibility', 'pwdServices'],
  hotlines: ['phone', 'hotlines'],
  infrastructurePublicWorks: ['construction', 'infrastructurePublicWorks'],
  agriculture: ['wheat', 'agriculture'],
  environment: ['leaf', 'environment'],
  emergencyInformation: ['triangle-alert', 'emergencyInformation'],
  allCityProjects: ['list-checks', 'allCityProjects'],
  projectMap: ['map', 'projectMap'],
  procurementOverview: ['shopping-cart', 'procurementOverview'],
  bidResults: ['scale', 'bidResults'],
  contractsAwards: ['file-check', 'contractsAwards'],
  evidenceSources: ['shield-check', 'evidenceSources'],
  projectDataSources: ['database', 'projectDataSources'],
  projectMethodology: ['file-text', 'projectMethodology'],
  projectStatistics: ['chart', 'projectStatistics'],
  spendingStatistics: ['wallet', 'spendingStatistics'],
  procurementStatistics: ['chart', 'procurementStatistics'],
  governmentOverview: ['landmark', 'governmentOverview'],
  cityStructure: ['network', 'cityStructure'],
  contactCity: ['phone', 'contactCity'],
  cityOffices: ['building', 'cityOffices'],
  executiveOrders: ['file-text', 'executiveOrders'],
  ordinances: ['file-text', 'ordinances'],
  resolutions: ['file-check', 'resolutions'],
  officialDocuments: ['file-text', 'officialDocuments'],
  hotlinesContacts: ['phone', 'hotlinesContacts'],
  officialGovernmentLinks: ['external-link', 'officialGovernmentLinks'],
  fullDisclosureReports: ['file-check', 'fullDisclosureReports'],
  disclosureArchive: ['archive', 'disclosureArchive'],
  cityProjects: ['list-checks', 'cityProjects'],
  procurementRecords: ['shopping-cart', 'procurementRecords'],
  financialTransparency: ['wallet', 'financialTransparency'],
  dataSources: ['database', 'dataSources'],
  methodology: ['file-text', 'methodology'],
  howWeVerify: ['shield-check', 'howWeVerify'],
  dataLimitations: ['triangle-alert', 'dataLimitations'],
  statisticsOverview: ['chart', 'statisticsOverview'],
  cityProfile: ['landmark', 'cityProfile'],
  populationDemographics: ['users', 'populationDemographics'],
  barangayDirectory: ['map', 'barangayDirectory'],
  publicRecordsStatistics: ['library', 'publicRecordsStatistics'],
} as const satisfies Record<string, readonly [NavigationIcon, string]>;

type NavigationDestinationInput = Omit<
  NavigationDestination,
  'descriptionKey' | 'icon'
> & {
  labelKey: `navigation.items.${keyof typeof destinationPresentation}`;
};

type NavigationItemInput = Omit<NavigationItem, 'sections'> & {
  sections?: Array<{
    labelKey: string;
    items: NavigationDestinationInput[];
  }>;
};

function addDestinationPresentation(
  destination: NavigationDestinationInput
): NavigationDestination {
  const itemKey = destination.labelKey.replace(
    'navigation.items.',
    ''
  ) as keyof typeof destinationPresentation;
  const [icon, descriptionName] = destinationPresentation[itemKey];

  return {
    ...destination,
    descriptionKey: `navigation.descriptions.${descriptionName}`,
    icon,
  };
}

const navigationStructure = [
  {
    id: 'home',
    labelKey: 'navigation.topLevel.home',
    href: '/',
    activePathPrefixes: ['/'],
  },
  {
    id: 'services',
    labelKey: 'navigation.topLevel.services',
    href: '/services',
    activePathPrefixes: ['/services'],
    sections: [
      {
        labelKey: 'navigation.sections.businessLivelihood',
        items: [
          {
            labelKey: 'navigation.items.businessServices',
            href: '/services/business',
            kind: 'real',
          },
          {
            labelKey: 'navigation.items.employment',
            href: '/services/employment',
            kind: 'planned',
          },
          {
            labelKey: 'navigation.items.livelihood',
            href: '/services/livelihood',
            kind: 'planned',
          },
        ],
      },
      {
        labelKey: 'navigation.sections.healthEducation',
        items: [
          {
            labelKey: 'navigation.items.healthServices',
            href: '/services/health-services',
            kind: 'planned',
          },
          {
            labelKey: 'navigation.items.educationServices',
            href: '/services/education',
            kind: 'planned',
          },
        ],
      },
      {
        labelKey: 'navigation.sections.communitySupport',
        items: [
          {
            labelKey: 'navigation.items.assistancePrograms',
            href: '/services/assistance-programs',
            kind: 'real',
          },
          {
            labelKey: 'navigation.items.socialWelfare',
            href: '/services/social-welfare',
            kind: 'real',
          },
          {
            labelKey: 'navigation.items.seniorCitizens',
            href: '/services/senior-citizens',
            kind: 'planned',
          },
          {
            labelKey: 'navigation.items.pwdServices',
            href: '/services/pwd-services',
            kind: 'real',
          },
        ],
      },
      {
        labelKey: 'navigation.sections.publicServices',
        items: [
          {
            labelKey: 'navigation.items.infrastructurePublicWorks',
            href: '/services/infrastructure-public-works',
            kind: 'planned',
          },
          {
            labelKey: 'navigation.items.agriculture',
            href: '/services/agriculture-fisheries',
            kind: 'planned',
          },
          {
            labelKey: 'navigation.items.environment',
            href: '/services/environment',
            kind: 'planned',
          },
          {
            labelKey: 'navigation.items.emergencyInformation',
            href: '/services/disaster-preparedness',
            kind: 'real',
          },
        ],
      },
    ],
  },
  {
    id: 'projects',
    labelKey: 'navigation.topLevel.projects',
    href: '/projects',
    activePathPrefixes: ['/projects', '/procurement'],
    sections: [
      {
        labelKey: 'navigation.sections.cityProjects',
        items: [
          {
            labelKey: 'navigation.items.allCityProjects',
            href: '/projects',
            kind: 'real',
          },
          {
            labelKey: 'navigation.items.projectMap',
            href: '/projects/map',
            kind: 'real',
          },
          {
            labelKey: 'navigation.items.projectStatistics',
            href: '/statistics/projects',
            kind: 'real',
          },
        ],
      },
      {
        labelKey: 'navigation.sections.procurement',
        items: [
          {
            labelKey: 'navigation.items.procurementOverview',
            href: '/procurement',
            kind: 'real',
          },
          {
            labelKey: 'navigation.items.bidResults',
            href: '/procurement/bid-results',
            kind: 'real',
          },
          {
            labelKey: 'navigation.items.contractsAwards',
            href: '/procurement/contracts',
            kind: 'real',
          },
        ],
      },
      {
        labelKey: 'navigation.sections.projectTransparency',
        items: [
          {
            labelKey: 'navigation.items.evidenceSources',
            href: '/projects/sources',
            kind: 'real',
          },
          {
            labelKey: 'navigation.items.projectMethodology',
            href: '/projects/methodology',
            kind: 'real',
          },
        ],
      },
      {
        labelKey: 'navigation.sections.reportsStatistics',
        items: [
          {
            labelKey: 'navigation.items.projectStatistics',
            href: '/statistics/projects',
            kind: 'real',
          },
          {
            labelKey: 'navigation.items.spendingStatistics',
            href: '/statistics/project-spending',
            kind: 'planned',
          },
          {
            labelKey: 'navigation.items.procurementStatistics',
            href: '/statistics/procurement',
            kind: 'real',
          },
        ],
      },
    ],
  },
  {
    id: 'government',
    labelKey: 'navigation.topLevel.government',
    href: '/government',
    activePathPrefixes: ['/government', '/legislation'],
    sections: [
      {
        labelKey: 'navigation.sections.cityGovernment',
        items: [
          {
            labelKey: 'navigation.items.governmentOverview',
            href: '/government',
            kind: 'real',
          },
          {
            labelKey: 'navigation.items.contactCity',
            href: '/government/contact',
            kind: 'real',
          },
        ],
      },
      {
        labelKey: 'navigation.sections.officesDepartments',
        items: [
          {
            labelKey: 'navigation.items.cityOffices',
            href: '/government/offices',
            kind: 'real',
          },
        ],
      },
      {
        labelKey: 'navigation.sections.legislation',
        items: [
          {
            labelKey: 'navigation.items.executiveOrders',
            href: '/legislation/executive-orders',
            kind: 'real',
          },
          {
            labelKey: 'navigation.items.ordinances',
            href: '/legislation/ordinances',
            kind: 'real',
          },
          {
            labelKey: 'navigation.items.resolutions',
            href: '/legislation/resolutions',
            kind: 'planned',
          },
        ],
      },
      {
        labelKey: 'navigation.sections.publicInformation',
        items: [
          {
            labelKey: 'navigation.items.officialDocuments',
            href: '/government/documents',
            kind: 'planned',
          },
          {
            labelKey: 'navigation.items.hotlinesContacts',
            href: '/government/hotlines',
            kind: 'planned',
          },
          {
            labelKey: 'navigation.items.officialGovernmentLinks',
            href: '/government/links',
            kind: 'planned',
          },
        ],
      },
    ],
  },
  {
    id: 'transparency',
    labelKey: 'navigation.topLevel.transparency',
    href: '/transparency',
    activePathPrefixes: ['/transparency', '/statistics', '/barangays'],
    sections: [
      {
        labelKey: 'navigation.sections.fullDisclosure',
        items: [
          {
            labelKey: 'navigation.items.fullDisclosureReports',
            href: '/transparency/full-disclosure',
            kind: 'planned',
          },
          {
            labelKey: 'navigation.items.disclosureArchive',
            href: '/transparency/archive',
            kind: 'planned',
          },
          {
            labelKey: 'navigation.items.officialDocuments',
            href: '/transparency/documents',
            kind: 'planned',
          },
        ],
      },
      {
        labelKey: 'navigation.sections.procurementSpending',
        items: [
          {
            labelKey: 'navigation.items.cityProjects',
            href: '/projects',
            kind: 'real',
          },
          {
            labelKey: 'navigation.items.procurementRecords',
            href: '/procurement',
            kind: 'real',
          },
          {
            labelKey: 'navigation.items.contractsAwards',
            href: '/procurement/contracts',
            kind: 'real',
          },
          {
            labelKey: 'navigation.items.financialTransparency',
            href: '/transparency/finance',
            kind: 'planned',
          },
        ],
      },
      {
        labelKey: 'navigation.sections.dataVerification',
        items: [
          {
            labelKey: 'navigation.items.dataSources',
            href: '/transparency/sources',
            kind: 'real',
          },
          {
            labelKey: 'navigation.items.methodology',
            href: '/transparency/methodology',
            kind: 'real',
          },
          {
            labelKey: 'navigation.items.howWeVerify',
            href: '/transparency/verification',
            kind: 'real',
          },
          {
            labelKey: 'navigation.items.dataLimitations',
            href: '/transparency/limitations',
            kind: 'real',
          },
        ],
      },
      {
        labelKey: 'navigation.sections.statisticsInsights',
        items: [
          {
            labelKey: 'navigation.items.statisticsOverview',
            href: '/statistics',
            kind: 'real',
          },
          {
            labelKey: 'navigation.items.cityProfile',
            href: '/statistics/city-profile',
            kind: 'real',
          },
          {
            labelKey: 'navigation.items.populationDemographics',
            href: '/statistics/population',
            kind: 'real',
          },
          {
            labelKey: 'navigation.items.barangayDirectory',
            href: '/barangays',
            kind: 'real',
          },
          {
            labelKey: 'navigation.items.projectStatistics',
            href: '/statistics/projects',
            kind: 'real',
          },
          {
            labelKey: 'navigation.items.publicRecordsStatistics',
            href: '/statistics/public-records',
            kind: 'planned',
          },
        ],
      },
    ],
  },
  {
    id: 'about',
    labelKey: 'navigation.topLevel.about',
    href: '/about',
    activePathPrefixes: ['/about'],
  },
  {
    id: 'contact',
    labelKey: 'navigation.topLevel.contact',
    href: '/contact',
    activePathPrefixes: ['/contact'],
  },
] satisfies NavigationItemInput[];

export const mainNavigation: NavigationItem[] = navigationStructure.map(item =>
  item.sections
    ? {
        ...item,
        sections: item.sections.map(section => ({
          ...section,
          items: section.items.map(addDestinationPresentation),
        })),
      }
    : item
);

export const searchNavigation = {
  href: '/search',
  labelKey: 'navigation.search',
  placeholderKey: 'navigation.searchPlaceholder',
  submitLabelKey: 'navigation.searchSubmit',
} as const;

export function getSearchHref(query: string) {
  const normalizedQuery = query.trim();
  return normalizedQuery
    ? `${searchNavigation.href}?q=${encodeURIComponent(normalizedQuery)}`
    : searchNavigation.href;
}

export function getActiveNavigationId(pathname: string): NavigationId | null {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';

  return (
    mainNavigation.find(item =>
      item.activePathPrefixes.some(prefix =>
        prefix === '/'
          ? normalizedPath === '/'
          : normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
      )
    )?.id ?? null
  );
}

export const footerNavigation = {
  mainSections: [
    {
      title: 'About',
      links: [
        { label: 'About the Portal', href: '/about' },
        // { label: 'Privacy Policy', href: '/privacy' },
        // { label: 'Terms of Use', href: '/terms' },
        { label: 'Accessibility', href: '/accessibility' },
        { label: 'Contact Us', href: '/contact' },
        { label: 'Community Discord', href: '/discord' },
      ],
    },
    {
      title: 'Services',
      links: [
        { label: 'All Services', href: '/services' },
        { label: 'Hotlines', href: '/philippines/hotlines' },
        { label: 'Holidays', href: '/philippines/holidays' },
      ],
    },
    {
      title: 'Government',
      links: [
        { label: 'Open Data', href: 'https://data.gov.ph' },
        { label: 'Freedom of Information', href: 'https://www.foi.gov.ph' },
        {
          label: 'Contact Center',
          href: 'https://contactcenterngbayan.gov.ph',
        },
        {
          label: 'Official Gazette',
          href: 'https://www.officialgazette.gov.ph',
        },
      ],
    },
  ],
  socialLinks: [
    { label: 'Facebook', href: 'https://facebook.com/govph' },
    { label: 'Twitter', href: 'https://twitter.com/govph' },
    { label: 'Instagram', href: 'https://instagram.com/govph' },
    { label: 'YouTube', href: 'https://youtube.com/govph' },
  ],
};
