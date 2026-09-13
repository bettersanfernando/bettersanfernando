// Centralized production site-URL resolver. Every canonical/OG/sitemap/
// robots/JSON-LD URL in the app must go through getSiteUrl()/absoluteUrl()
// — changing NEXT_PUBLIC_SITE_URL later (once a custom domain exists) then
// updates all of them automatically, with nothing else to touch.
//
// Priority, per docs/NEXTJS-MIGRATION-SPEC.md:
//   1. NEXT_PUBLIC_SITE_URL, when explicitly configured.
//   2. https://${VERCEL_PROJECT_PRODUCTION_URL}, when provided by Vercel.
//   3. http://localhost:3000, for non-Vercel local development/builds only.
//
// VERCEL_URL and VERCEL_BRANCH_URL are deliberately never read here — both
// identify a specific (possibly preview) deployment, not the stable
// production hostname, and using either would leak preview URLs into
// canonical metadata.

function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function isValidAbsoluteHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    if (!isValidAbsoluteHttpUrl(explicit)) {
      throw new Error(
        `NEXT_PUBLIC_SITE_URL is set but is not a valid absolute http(s) URL: "${explicit}"`
      );
    }
    return normalizeUrl(explicit);
  }

  const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProductionHost) {
    const candidate = `https://${vercelProductionHost}`;
    if (!isValidAbsoluteHttpUrl(candidate)) {
      throw new Error(
        `VERCEL_PROJECT_PRODUCTION_URL produced an invalid URL: "${candidate}"`
      );
    }
    return normalizeUrl(candidate);
  }

  if (process.env.VERCEL === '1') {
    throw new Error(
      'Running on Vercel (VERCEL=1) but neither NEXT_PUBLIC_SITE_URL nor ' +
        'VERCEL_PROJECT_PRODUCTION_URL is set. Refusing to fall back to ' +
        'localhost for canonical metadata — VERCEL_URL/VERCEL_BRANCH_URL ' +
        'identify preview deployments, not the stable production hostname, ' +
        'and must never be used for canonical URLs. Set ' +
        'NEXT_PUBLIC_SITE_URL explicitly (or confirm ' +
        'VERCEL_PROJECT_PRODUCTION_URL is provided) before building.'
    );
  }

  return 'http://localhost:3000';
}

/** Absolute URL for a site-relative path, e.g. absoluteUrl('/about'). */
export function absoluteUrl(path = '/'): string {
  const base = getSiteUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
