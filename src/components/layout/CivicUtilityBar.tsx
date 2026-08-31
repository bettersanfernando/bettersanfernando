import { useMemo } from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  civicUtilityBar,
  formatPhilippineTime,
} from '../../data/headerUtility';
import { SUPPORTED_LANGUAGES } from '../../i18n/languages';
import type { LanguageType } from '../../types';

const focusStyles =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2';

export default function CivicUtilityBar({
  currentLanguage,
  onChangeLanguage,
}: {
  currentLanguage: LanguageType;
  onChangeLanguage: (language: LanguageType) => void;
}) {
  const { t } = useTranslation('common');
  // Computed once per mount; a live-ticking clock isn't worth the timer for a date/time strip.
  const phtTime = useMemo(() => formatPhilippineTime(new Date()), []);

  return (
    <div className="border-b border-gray-200 bg-gray-50">
      <div className="container mx-auto flex h-9 items-center justify-between gap-4 px-4 text-xs">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium whitespace-nowrap text-gray-700">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600"
              aria-hidden="true"
            />
            {t(civicUtilityBar.portalStatusKey)}
          </span>
          <a
            href={civicUtilityBar.betterGovHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden items-center gap-1 whitespace-nowrap text-primary-700 transition-colors hover:text-primary-900 sm:inline-flex ${focusStyles}`}
          >
            {t(civicUtilityBar.betterGovLabelKey)}
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>

        <div className="flex shrink-0 items-center gap-3 text-gray-600">
          <span className="hidden md:inline">
            {t(civicUtilityBar.currencyLabelKey)}
          </span>
          <span className="hidden lg:inline">
            {t(civicUtilityBar.weatherLabelKey)}
          </span>
          <span className="hidden whitespace-nowrap sm:inline">{phtTime}</span>

          <div className="flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-gray-500" aria-hidden="true" />
            <select
              value={currentLanguage}
              onChange={event =>
                onChangeLanguage(event.target.value as LanguageType)
              }
              aria-label={t('navigation.language')}
              className={`rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-800 hover:border-primary-600 ${focusStyles}`}
            >
              {SUPPORTED_LANGUAGES.map(language => (
                <option key={language.code} value={language.code}>
                  {t(language.labelKey)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
