import type { InitOptions } from 'i18next';
import enCommon from '../../public/locales/en/common.json';
import filCommon from '../../public/locales/fil/common.json';
import type { LanguageType } from '../types';

// Shared by the client provider (src/i18n.ts) and the server helper
// (src/i18n/server.ts) so both read the same resources.
export function getI18nOptions(language: LanguageType): InitOptions {
  return {
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
  };
}
