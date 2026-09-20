import type { MetadataRoute } from 'next';
import { absoluteUrl } from '../lib/site-url';

// General crawlers stay unrestricted except for the thin, request-only
// /search surface (see src/app/search/page.tsx's own noindex robots meta —
// this Disallow keeps crawl budget off it too). OAI-SearchBot (ChatGPT
// Search discovery) is explicitly allowed; GPTBot (OpenAI's separate
// training-corpus crawler) is disallowed — the two serve different
// purposes and blocking one must never collaterally block the other. No
// asset paths are blocked: /_next/static, /assets, and the icon files must
// stay crawlable for render-based and favicon indexing.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/search' },
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'GPTBot', disallow: '/' },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
