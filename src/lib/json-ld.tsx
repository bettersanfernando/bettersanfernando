import { absoluteUrl } from './site-url';
import { SITE_NAME, DEFAULT_DESCRIPTION } from './metadata';

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

/** Site-wide WebSite structured data, rendered once in the root layout. */
export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: absoluteUrl('/'),
        description: DEFAULT_DESCRIPTION,
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
