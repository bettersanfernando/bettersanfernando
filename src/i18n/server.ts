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
