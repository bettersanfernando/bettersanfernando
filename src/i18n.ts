import i18next, { type i18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getI18nOptions } from './i18n/config';
import type { LanguageType } from './types';

export function createI18n(language: LanguageType): i18n {
  const instance = i18next.createInstance();
  void instance.use(initReactI18next).init(getI18nOptions(language));
  return instance;
}
