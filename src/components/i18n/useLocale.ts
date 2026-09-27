'use client';

import { useTranslation } from 'react-i18next';
import type { LanguageType } from '../../types';

/** The request locale, as seeded into the provider from the server. */
export function useLocale(): LanguageType {
  return useTranslation('common').i18n.language === 'fil' ? 'fil' : 'en';
}
