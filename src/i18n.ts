import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { SUPPORTED_LANGUAGES } from './i18n/languages';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES.map(language => language.code),
    load: 'languageOnly',
    debug: import.meta.env.DEV,
    defaultNS: 'common',
    ns: ['common'],

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      // Locale JSON is a static public/ asset with no content hash in its
      // URL, so a browser that cached an earlier response (e.g. before new
      // keys were added) would keep serving it and render those keys raw.
      // Forcing revalidation on every fetch keeps translations current.
      requestOptions: { cache: 'no-cache' },
    },

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
