'use client';

import { type ReactNode, useEffect } from 'react';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n.next';
import { SUPPORTED_LANGUAGES } from '../i18n/languages';
import type { LanguageType } from '../types';

// Matches i18next-browser-languagedetector's default localStorage key, so a
// preference saved by either build is honored by the other.
const STORED_LANGUAGE_KEY = 'i18nextLng';

function readStoredLanguage(): string | null {
  try {
    return window.localStorage.getItem(STORED_LANGUAGE_KEY);
  } catch {
    return null;
  }
}

function detectSupportedLanguage(): LanguageType | null {
  const supportedCodes: readonly string[] = SUPPORTED_LANGUAGES.map(
    language => language.code
  );
  const candidates = [
    readStoredLanguage(),
    ...navigator.languages,
    navigator.language,
    document.documentElement.lang,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const code = candidate.split('-')[0].toLowerCase();
    if (supportedCodes.includes(code)) return code as LanguageType;
  }
  return null;
}

// Narrow client boundary for the two providers the shared shell genuinely
// needs client behavior for. Keeping this out of the root layout is what
// lets layout.page.tsx stay a Server Component.
export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Browser-only language detection/persistence — deliberately run here,
    // in an effect, so it only ever applies after the first client render
    // has already matched the server's English HTML. Applying it earlier
    // (e.g. during i18n.next.ts's module-level init) is exactly what would
    // make that first client render disagree with the server.
    const detected = detectSupportedLanguage();
    if (detected && detected !== i18n.language) {
      void i18n.changeLanguage(detected);
    }

    const persistLanguage = (language: string) => {
      try {
        window.localStorage.setItem(STORED_LANGUAGE_KEY, language);
      } catch {
        // Storage may be unavailable (private browsing, disabled cookies);
        // the language switcher still works for the current session.
      }
    };
    i18n.on('languageChanged', persistLanguage);
    return () => {
      i18n.off('languageChanged', persistLanguage);
    };
  }, []);

  return (
    <NuqsAdapter>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </NuqsAdapter>
  );
}
