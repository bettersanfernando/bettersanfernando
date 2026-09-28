'use client';

import { type ReactNode, useEffect, useMemo } from 'react';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { I18nextProvider } from 'react-i18next';
import { createI18n } from '../i18n';
import type { LanguageType } from '../types';
import LocaleNavigation from '../components/i18n/LocaleNavigation';

const STORED_LANGUAGE_KEY = 'i18nextLng';

export default function Providers({
  children,
  locale,
}: {
  children: ReactNode;
  locale: LanguageType;
}) {
  const i18n = useMemo(() => createI18n(locale), [locale]);

  useEffect(() => {
    const persistLanguage = (language: string) => {
      try {
        window.localStorage.setItem(STORED_LANGUAGE_KEY, language);
      } catch {
        // Storage may be unavailable; the URL remains the source of truth.
      }
    };
    persistLanguage(locale);
    i18n.on('languageChanged', persistLanguage);
    return () => {
      i18n.off('languageChanged', persistLanguage);
    };
  }, [i18n, locale]);

  return (
    <NuqsAdapter>
      <I18nextProvider i18n={i18n}>
        <LocaleNavigation />
        {children}
      </I18nextProvider>
    </NuqsAdapter>
  );
}
