import type { LanguageType } from '../types';

export interface LanguageInfo {
  code: LanguageType;
  name: string;
  nativeName: string;
}

export const LANGUAGES: Record<LanguageType, LanguageInfo> = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  fil: { code: 'fil', name: 'Filipino', nativeName: 'Filipino' },
};

export const DEFAULT_LANGUAGE: LanguageType = 'en';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', labelKey: 'languages.en.short' },
  { code: 'fil', labelKey: 'languages.fil.short' },
] as const satisfies ReadonlyArray<{
  code: LanguageType;
  labelKey: string;
}>;
