import { useEffect, useState } from 'react';
import {
  ArrowLeftRight,
  CalendarDays,
  Cloud,
  CloudLightning,
  CloudRain,
  ExternalLink,
  Globe,
  MapPin,
  Sun,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  civicUtilityBar,
  formatPhilippineTime,
  SAN_FERNANDO_COORDINATES,
} from '../../data/headerUtility';
import type { LanguageType } from '../../types';

const focusStyles =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2';

const currencies = ['USD', 'JPY', 'EUR', 'SGD', 'SAR', 'AED'] as const;

function weatherIconFor(code: number) {
  if (code >= 95)
    return <CloudLightning className="h-3.5 w-3.5" aria-hidden="true" />;
  if (code >= 51)
    return <CloudRain className="h-3.5 w-3.5" aria-hidden="true" />;
  if (code <= 1) return <Sun className="h-3.5 w-3.5" aria-hidden="true" />;
  return <Cloud className="h-3.5 w-3.5" aria-hidden="true" />;
}

export default function CivicUtilityBar({
  currentLanguage,
  onChangeLanguage,
}: {
  currentLanguage: LanguageType;
  onChangeLanguage: (language: LanguageType) => void;
}) {
  const { t } = useTranslation('common');
  void onChangeLanguage;
  // Server and client first render must produce identical HTML: `new Date()`
  // evaluated at render time gives a different, format-precision-crossing
  // wall-clock moment on the server than on the client (React error #418).
  // Start with a stable placeholder and compute the real value only after
  // mount, matching this file's already-loading weather/currency widgets.
  const [phtTime, setPhtTime] = useState<string | null>(null);
  const [weather, setWeather] = useState<{
    temperature: number;
    code: number;
  } | null>(null);
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [currencyIndex, setCurrencyIndex] = useState(0);

  useEffect(() => {
    setPhtTime(formatPhilippineTime(new Date()));
    const timer = window.setInterval(() => {
      setPhtTime(formatPhilippineTime(new Date()));
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const { latitude, longitude } = SAN_FERNANDO_COORDINATES;
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
    )
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then(data =>
        setWeather({
          temperature: data.current.temperature_2m,
          code: data.current.weather_code,
        })
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then(data => setRates(data.rates))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(
      () => setCurrencyIndex(index => (index + 1) % currencies.length),
      4500
    );
    return () => window.clearInterval(timer);
  }, []);

  const currency = currencies[currencyIndex];
  const phpPerUnit = rates?.PHP
    ? currency === 'USD'
      ? rates.PHP
      : rates.PHP / (rates[currency] ?? 1)
    : null;

  return (
    <div
      data-current-language={currentLanguage}
      className="border-b border-slate-200 bg-white text-slate-700"
    >
      <div className="container mx-auto flex h-10 items-center justify-between gap-3 px-4 text-xs">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex min-w-0 items-center gap-1.5 whitespace-nowrap font-medium text-slate-700">
            <MapPin
              className="h-3.5 w-3.5 shrink-0 text-primary-700"
              aria-hidden="true"
            />
            San Fernando, Pampanga
          </span>
          <span
            className="hidden h-4 w-px bg-slate-300 sm:block"
            aria-hidden="true"
          />
          <a
            href={civicUtilityBar.betterGovHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden items-center gap-1 whitespace-nowrap text-primary-700 transition-colors hover:text-primary-900 sm:inline-flex ${focusStyles}`}
          >
            BetterGov Philippines
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>

        <div className="flex shrink-0 items-center gap-3 text-slate-600">
          <span
            className="hidden min-w-[7.5rem] items-center gap-1.5 whitespace-nowrap border-l border-slate-200 pl-3 md:inline-flex"
            aria-live="polite"
          >
            <ArrowLeftRight
              className="h-3.5 w-3.5 text-slate-500"
              aria-hidden="true"
            />
            {phpPerUnit !== null ? (
              <span
                key={currency}
                className="motion-reduce:animate-none animate-[slideIn_300ms_ease-out]"
              >
                1 {currency} = ₱{phpPerUnit.toFixed(2)}
              </span>
            ) : (
              t(civicUtilityBar.currencyLabelKey)
            )}
          </span>

          <span className="flex items-center gap-1.5 whitespace-nowrap border-l border-slate-200 pl-3">
            {weather ? (
              <>
                {weatherIconFor(weather.code)}
                {Math.round(weather.temperature)}°C
              </>
            ) : (
              t(civicUtilityBar.weatherLabelKey)
            )}
          </span>

          <span className="hidden items-center gap-1.5 whitespace-nowrap border-l border-slate-200 pl-3 xl:inline-flex">
            <CalendarDays
              className="h-3.5 w-3.5 text-slate-500"
              aria-hidden="true"
            />
            {phtTime ?? '—'}
          </span>

          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <Globe className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
            <div
              className="hidden items-center gap-0.5 rounded-full border border-slate-200 bg-white p-0.5 sm:flex"
              aria-label="Language selection"
            >
              {['EN', 'FIL', 'PAM'].map(language => (
                <span
                  key={language}
                  className={`rounded-full px-2 py-0.5 font-medium ${language === 'EN' ? 'bg-slate-100 text-primary-800' : 'text-slate-500'}`}
                >
                  {language}
                </span>
              ))}
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-2 py-1 font-medium text-primary-800 sm:hidden">
              EN
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
