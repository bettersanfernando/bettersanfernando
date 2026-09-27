import i18next, { type i18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from '../public/locales/en/common.json';
import filCommon from '../public/locales/fil/common.json';
import type { LanguageType } from './types';

export function createI18n(language: LanguageType): i18n {
  const instance = i18next.createInstance();
  void instance.use(initReactI18next).init({
    fallbackLng: 'en',
    lng: language,
    supportedLngs: ['en', 'fil'],
    load: 'languageOnly',
    defaultNS: 'common',
    ns: ['common'],
    resources: {
      en: { common: enCommon },
      fil: { common: filCommon },
    },
    react: { useSuspense: false },
    interpolation: { escapeValue: false },
  });
  return instance;
}
