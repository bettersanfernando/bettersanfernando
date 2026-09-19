import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import { SUPPORTED_LANGUAGES } from './i18n/languages';
import enCommon from '../public/locales/en/common.json';

// Next.js equivalent of src/i18n.ts, reusing the same public/locales/*
// files as the single source of truth (no translation text is duplicated).
// Differences from the legacy Vite instance, both required because this
// module also runs during `next build`'s server-side prerender and the
// first client hydration of the same Client Component tree:
//
// - A dedicated instance (i18next.createInstance()), not the shared
//   `i18next` default-export singleton the legacy build mutates — a Next.js
//   server process is long-lived across requests, and mutating a
//   process-wide instance's language state risks leaking between them.
// - English is bundled directly (`resources`) and set as the initial
//   `lng`, so the server render and the first client render before
//   hydration produce byte-identical, real English text — never an
//   HttpBackend fetch that could hang `next build`'s prerender, and never
//   a raw i18n key. `partialBundledLanguages: true` keeps Filipino/
//   Kapampangan lazily fetchable via HttpBackend after hydration, exactly
//   as the legacy build already does.
// - No i18next-browser-languagedetector here: it would resolve navigator/
//   localStorage synchronously during this same module-eval init, which on
//   the client would disagree with the server-rendered English before
//   hydration completes. Browser-only detection happens instead in
//   src/app/providers.tsx, strictly after mount (see there).
// - `import.meta.env.DEV` (Vite-only) becomes `process.env.NODE_ENV`.
//
// Keep both files in sync until src/i18n.ts and the Vite build it serves
// are retired.
const i18n = i18next.createInstance();
const isBrowser = typeof window !== 'undefined';

(isBrowser ? i18n.use(HttpBackend) : i18n).use(initReactI18next).init({
  fallbackLng: 'en',
  lng: 'en',
  supportedLngs: SUPPORTED_LANGUAGES.map(language => language.code),
  load: 'languageOnly',
  debug: process.env.NODE_ENV !== 'production',
  defaultNS: 'common',
  ns: ['common'],
  resources: { en: { common: enCommon } },
  partialBundledLanguages: true,

  react: {
    useSuspense: false,
  },

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
});

export default i18n;
