import { notFound, permanentRedirect } from 'next/navigation';
import {
  getServiceBySlug,
  getServiceCategory,
  getServiceHref,
  getServices,
  type PublishedServiceCategory,
} from '../../../data/civic/services';
import { categories } from '../categories';
import { buildPageMetadata } from '../../../lib/metadata';
import ServiceCategoryView from '../service-category-view';

// Single dynamic segment handling BOTH real categories and legacy one-
// segment service-slug URLs — see docs/NEXTJS-MIGRATION-SPEC.md §5. A
// sibling [slug] folder at this same position is invalid: Next.js treats
// same-position dynamic segments as one route regardless of param name.
//
// Derived directly from the civic accessor (not a hardcoded list), so this
// always matches whatever the synced dataset actually publishes.
const validCategories = new Set<string>(
  getServices().map(service => getServiceCategory(service))
);

function isValidCategory(value: string): value is PublishedServiceCategory {
  return validCategories.has(value);
}

export function generateStaticParams() {
  return [...validCategories].map(category => ({ category }));
}

// Only the 16 real-category case gets real metadata — a legacy-slug or
// unknown segment redirects/404s before this would ever matter for a real
// response, and notFound()'s own metadata (noindex) takes over instead.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: segment } = await params;
  if (!isValidCategory(segment)) return {};

  const [name, , description] = categories.find(item => item[1] === segment)!;
  return buildPageMetadata({
    title: name,
    description: `Browse ${description.toLowerCase()} published by BetterSanFernando.`,
    path: `/services/${segment}`,
  });
}

export default async function ServiceCategoryOrLegacySlugPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: segment } = await params;

  // 1. Category match takes precedence — verified collision-free against
  //    every service slug (see docs/NEXTJS-MIGRATION-SPEC.md §5).
  if (isValidCategory(segment)) {
    return <ServiceCategoryView category={segment} />;
  }

  // 2. Legacy one-segment service-slug URL: redirect to the canonical
  //    category-qualified page. Never rendered as its own indexable page.
  const service = getServiceBySlug(segment);
  if (service) {
    permanentRedirect(getServiceHref(service));
  }

  // 3. Neither a category nor a known service slug.
  notFound();
}
