import i18next from 'i18next';
import { headers } from 'next/headers';
import type { LanguageType } from '../types';
import { getI18nOptions } from './config';
import { isLanguage } from './locale';

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
  | 'legislation';

/**
 * Translations for BetterSanFernando-authored page copy in server
 * components. The English source text is the key, so English needs no
 * resource file and cannot drift from its translation; `fil/<namespace>.json`
 * holds that route's Filipino text and `fil/shared.json` the text several
 * routes reuse. Bundles load on the server only, keeping them out of the
 * client i18n bundle. A missing entry renders the English text.
 */
export async function getPageT(namespace: PageNamespace) {
  const locale = await getLocale();
  const resources: Record<string, Record<string, string>> = {};
  if (locale === 'fil') {
    const load = async (name: string) =>
      (await import(`../../public/locales/fil/${name}.json`)).default;
    resources[namespace] = await load(namespace);
    resources.shared = await load('shared');
  }
  const instance = i18next.createInstance();
  void instance.init({
    lng: locale,
    fallbackLng: false,
    keySeparator: false,
    nsSeparator: false,
    defaultNS: namespace,
    fallbackNS: 'shared',
    ns: [namespace, 'shared'],
    resources: { [locale]: resources },
    interpolation: { escapeValue: false },
  });
  return { locale, t: instance.getFixedT(locale, namespace) };
}

export type PageT = Awaited<ReturnType<typeof getPageT>>['t'];
