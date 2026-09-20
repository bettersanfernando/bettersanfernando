import { absoluteUrl } from './site-url';
import {
  SITE_NAME,
  SITE_ALTERNATE_NAME,
  DEFAULT_DESCRIPTION,
} from './metadata';

// Safe JSON-LD serialization: JSON.stringify can legally produce a
// `</script>` (or `<!--`) substring if a source field contains one, which
// would break out of the surrounding <script> tag and inject HTML/script
// into the page. Escaping `<` as `<` (valid inside a JSON string,
// invisible to JSON-LD consumers) neutralizes that without touching any
// other character.
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Renders one JSON-LD <script> tag. Always pass data through this component
 *  — never dangerouslySetInnerHTML a JSON.stringify() result directly. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}

/**
 * Site-wide Organization + WebSite structured data, rendered once in the
 * root layout as a single `@graph`. Organization is used deliberately —
 * never GovernmentOrganization — because BetterSanFernando is an
 * independent community project, not the City Government. `sameAs` lists
 * only verified BetterSanFernando profiles (currently just the GitHub
 * repository); the footer's Facebook/LinkedIn links have no href yet and
 * must not be guessed into this list.
 */
export function OrganizationWebSiteJsonLd() {
  const organizationId = absoluteUrl('/#organization');
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': organizationId,
            name: SITE_NAME,
            alternateName: SITE_ALTERNATE_NAME,
            url: absoluteUrl('/'),
            logo: {
              '@type': 'ImageObject',
              url: absoluteUrl('/logo-512.png'),
              width: 512,
              height: 512,
            },
            description: DEFAULT_DESCRIPTION,
            sameAs: ['https://github.com/bettersanfernando/bettersanfernando'],
          },
          {
            '@type': 'WebSite',
            '@id': absoluteUrl('/#website'),
            name: SITE_NAME,
            alternateName: SITE_ALTERNATE_NAME,
            url: absoluteUrl('/'),
            description: DEFAULT_DESCRIPTION,
            inLanguage: 'en',
            publisher: { '@id': organizationId },
          },
        ],
      }}
    />
  );
}

export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

/**
 * BreadcrumbList structured data matching the visible Breadcrumbs.next
 * trail exactly — same labels, same order, same hrefs. The last (current
 * page) entry commonly has no href in the visible trail; BreadcrumbList
 * still requires an `item` URL for every position, so the current page's
 * own canonical path is used for it.
 */
export function BreadcrumbListJsonLd({
  items,
  currentPath,
}: {
  items: readonly BreadcrumbEntry[];
  currentPath: string;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.label,
          item: absoluteUrl(item.href ?? currentPath),
        })),
      }}
    />
  );
}
