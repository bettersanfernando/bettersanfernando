import type { MetadataRoute } from 'next';
import { getServices, getServiceCategory } from '../data/civic/services';
import { getProjects } from '../data/civic/projects';
import { getCityOffices } from '../data/civic/government';
import { absoluteUrl } from '../lib/site-url';

// The 28 Batch 3 static routes + 9 Batch 5 interactive routes + 2 Batch 9
// SEO-pass routes. These are literal App Router pages, not data records, so
// a fixed list here (unlike the dynamic sections below) is not "hardcoding
// a title table" — there is no civic accessor that could enumerate "which
// literal pages exist."
//
// /search is deliberately absent: its content is entirely a function of the
// request's own query string, so it's a thin/duplicate surface — see its
// own `robots: { index: false }` in src/app/search/page.tsx.
const STATIC_ROUTES: readonly string[] = [
  // Batch 3 (28)
  '/',
  '/about',
  '/services',
  '/government',
  '/government/offices',
  '/government/contact',
  '/government/hotlines',
  '/government/links',
  '/procurement',
  '/projects/methodology',
  '/statistics',
  '/statistics/projects',
  '/statistics/procurement',
  '/statistics/project-spending',
  '/statistics/population',
  '/statistics/demographics',
  '/statistics/government',
  '/statistics/legislation',
  '/statistics/public-records',
  '/statistics/city-profile',
  '/legislation',
  '/legislation/resolutions',
  '/transparency',
  '/transparency/sources',
  '/transparency/methodology',
  '/transparency/documents',
  '/transparency/full-disclosure',
  '/transparency/finance',
  // Batch 5 (9; /search excluded — see note above)
  '/projects',
  '/projects/city-projects',
  '/projects/map',
  '/projects/sources',
  '/barangays',
  '/procurement/bid-results',
  '/procurement/contracts',
  '/legislation/executive-orders',
  '/legislation/ordinances',
  '/government/barangay-contacts',
  // Batch 9 (2)
  '/sitemap',
  '/accessibility',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const services = getServices();
  const categoryPaths = [...new Set(services.map(getServiceCategory))].map(
    category => `/services/${category}`
  );
  const servicePaths = services.map(
    service => `/services/${getServiceCategory(service)}/${service.slug}`
  );
  const projectPaths = getProjects().map(project => `/projects/${project.id}`);
  const officePaths = getCityOffices().map(
    office => `/government/offices/${office.office_id}`
  );

  const allPaths = [
    ...STATIC_ROUTES,
    ...categoryPaths,
    ...servicePaths,
    ...projectPaths,
    ...officePaths,
  ];

  // Deliberately no per-URL modification date field: none of these routes
  // has a verified publication date, and the build timestamp is not a real
  // modification date for the underlying record.
  return allPaths.map(path => ({ url: absoluteUrl(path) }));
}
