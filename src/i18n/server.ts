import i18next from 'i18next';
import { headers } from 'next/headers';
import type { LanguageType } from '../types';
import { getI18nOptions } from './config';
import { isLanguage } from './locale';
import { createPageT, type PageT } from './page-t';

export async function getLocale(): Promise<LanguageType> {
  const locale = (await headers()).get('x-bsf-locale') ?? undefined;
  return isLanguage(locale) ? locale : 'en';
}

/** Server-component counterpart of useTranslation('common'). */
export async function getServerT() {
  const locale = await getLocale();
  const instance = i18next.createInstance();
  void instance.init(getI18nOptions(locale));
  return { locale, t: instance.getFixedT(locale, 'common') };
}

export type PageNamespace =
  | 'about'
  | 'accessibility'
  | 'sitemap'
  | 'not-found'
  | 'government'
  | 'government-contact'
  | 'projects'
  | 'statistics'
  | 'transparency'
  | 'legislation'
  | 'home'
  | 'statistics-shared'
  | 'statistics-projects'
  | 'statistics-procurement'
  | 'statistics-project-spending'
  | 'statistics-population'
  | 'statistics-demographics'
  | 'statistics-government'
  | 'statistics-legislation'
  | 'statistics-public-records'
  | 'statistics-city-profile'
  | 'projects-shared'
  | 'projects-city-projects'
  | 'projects-map'
  | 'projects-methodology'
  | 'projects-sources'
  | 'projects-detail'
  | 'procurement-shared'
  | 'procurement'
  | 'procurement-bid-results'
  | 'procurement-contracts';

// Route families that keep their own shared bundle (`<family>-shared.json`).
function pageFamily(namespace: string): string | null {
  if (namespace.startsWith('statistics-')) return 'statistics';
  if (namespace.startsWith('projects-')) return 'projects';
  if (namespace === 'procurement' || namespace.startsWith('procurement-')) {
    return 'procurement';
  }
  return null;
}

/**
 * Filipino messages for BetterSanFernando-authored page copy (English is the
 * key, so English needs none). `fil/shared.json` holds text several routes
 * reuse, `fil/<family>-shared.json` the text shared by one route family
 * (statistics, projects, procurement), and `fil/<namespace>.json` the route's own. These load on the
 * server only; client components receive them through <PageMessages>.
 */
export async function getPageMessages(
  namespace: PageNamespace
): Promise<Record<string, string>> {
  if ((await getLocale()) !== 'fil') return {};
  const load = async (name: string): Promise<Record<string, string>> =>
    (await import(`../../public/locales/fil/${name}.json`)).default;
  const family = pageFamily(namespace)
    ? [`${pageFamily(namespace)}-shared`]
    : [];
  const bundles = await Promise.all(['shared', ...family, namespace].map(load));
  return Object.assign({}, ...bundles);
}

export async function getPageT(namespace: PageNamespace) {
  const [locale, messages] = await Promise.all([
    getLocale(),
    getPageMessages(namespace),
  ]);
  return { locale, messages, t: createPageT(messages) };
}

export type { PageT };
