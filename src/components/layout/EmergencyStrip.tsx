'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Flame,
  PhoneCall,
  Radio,
  Shield,
  Siren,
  TriangleAlert,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { localizeHref } from '../../i18n/locale';
import { useLocale } from '../i18n/useLocale';
import { getGovernmentHotlines } from '../../data/civic/governmentHotlines';

const focusStyles =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#002EAC] rounded-sm';

interface HotlineItem {
  id: string;
  nameKey: string;
  icon: React.ComponentType<{
    className?: string;
    'aria-hidden'?: boolean | 'true' | 'false';
  }>;
  wrapperClassName: string;
  separatorClassName: string;
  is911?: boolean;
  label: (t: TFunction) => React.ReactNode;
}

// The city name is a hidden-until-wide prefix in English and a suffix in Filipino.
function cityLabel(t: TFunction, word: string) {
  const prefix = t('navigation.emergencyStrip.labels.cityPrefix');
  const suffix = t('navigation.emergencyStrip.labels.citySuffix');
  return (
    <span>
      {prefix && <span className="hidden 2xl:inline">{prefix}</span>}
      {word}
      {suffix && <span className="hidden 2xl:inline">{suffix}</span>}
    </span>
  );
}

const hotlineDefinitions: readonly HotlineItem[] = [
  {
    id: 'national-911',
    nameKey: 'national911',
    icon: PhoneCall,
    wrapperClassName: 'inline-flex',
    separatorClassName: 'inline-block',
    is911: true,
    label: t => (
      <span>
        911
        <span className="hidden 2xl:inline">
          {` ${t('navigation.emergencyStrip.labels.national')}`}
        </span>
      </span>
    ),
  },
  {
    id: 'cdrrmo-command-center-help-line',
    nameKey: 'cdrrmoHelp',
    icon: Radio,
    wrapperClassName: 'inline-flex',
    separatorClassName: 'inline-block',
    label: () => (
      <span>
        CDRRMO<span className="hidden 2xl:inline"> HELP</span>
      </span>
    ),
  },
  {
    id: 'cdrrmo-safru-mobile-hotline',
    nameKey: 'safru',
    icon: Siren,
    wrapperClassName: 'hidden md:inline-flex',
    separatorClassName: 'hidden md:inline-block',
    label: () => (
      <span>
        SAFRU<span className="hidden 2xl:inline"> Rescue</span>
      </span>
    ),
  },
  {
    id: 'san-fernando-police-station-primary-hotline',
    nameKey: 'police',
    icon: Shield,
    wrapperClassName: 'hidden lg:inline-flex',
    separatorClassName: 'hidden lg:inline-block',
    label: t => cityLabel(t, t('navigation.emergencyStrip.labels.police')),
  },
  {
    id: 'san-fernando-fire-station-hotline',
    nameKey: 'fire',
    icon: Flame,
    wrapperClassName: 'hidden lg:inline-flex',
    separatorClassName: 'hidden lg:inline-block',
    label: t => cityLabel(t, t('navigation.emergencyStrip.labels.fire')),
  },
];

const hotlineById = new Map(
  getGovernmentHotlines().map(contact => [contact.id, contact])
);

function phoneHref(value: string) {
  return `tel:${value.replace(/[^+\d]/g, '')}`;
}

export default function EmergencyStrip() {
  const { t } = useTranslation('common');
  const locale = useLocale();

  return (
    <section
      aria-label={t('navigation.emergencyStrip.title')}
      className="bg-[#002EAC] text-white"
    >
      <div className="container mx-auto flex h-9.5 items-center justify-between gap-2 px-4 text-xs sm:h-10 sm:gap-3 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-1.5 font-semibold text-white">
          <TriangleAlert
            className="h-3.5 w-3.5 shrink-0 text-blue-200"
            aria-hidden="true"
          />
          <span>{t('navigation.emergencyStrip.label')}</span>
        </div>

        <nav
          aria-label={t('navigation.emergencyStrip.contacts')}
          className="flex min-w-0 flex-1 items-center justify-center overflow-hidden px-1"
        >
          <div className="flex items-center justify-center gap-1.5 text-[11px] sm:gap-2 lg:gap-1.5 xl:gap-2.5 xl:text-xs">
            {hotlineDefinitions.map(
              (
                {
                  id,
                  nameKey,
                  icon: Icon,
                  wrapperClassName,
                  separatorClassName,
                  is911,
                  label,
                },
                index
              ) => {
                const contact = hotlineById.get(id);
                if (!contact) return null;

                return (
                  <React.Fragment key={id}>
                    {index > 0 && (
                      <span
                        className={`h-3.5 w-px shrink-0 bg-white/20 ${separatorClassName}`}
                        aria-hidden="true"
                      />
                    )}
                    <a
                      href={phoneHref(contact.number)}
                      aria-label={`${t(`navigation.emergencyStrip.names.${nameKey}`)}: ${contact.number}`}
                      className={`group items-center gap-1 whitespace-nowrap text-white transition-colors hover:text-white hover:underline decoration-white/40 underline-offset-2 xl:gap-1.5 ${focusStyles} ${wrapperClassName}`}
                    >
                      <Icon
                        className="h-3.5 w-3.5 shrink-0 text-blue-200 transition-colors group-hover:text-white"
                        aria-hidden="true"
                      />
                      <span className="font-medium text-white">{label(t)}</span>
                      {!is911 && (
                        <span className="tabular-nums text-white transition-colors group-hover:text-white">
                          {contact.number}
                        </span>
                      )}
                    </a>
                  </React.Fragment>
                );
              }
            )}
          </div>
        </nav>

        <div className="flex shrink-0 items-center">
          <Link
            href={localizeHref('/government/hotlines', locale)}
            className={`inline-flex items-center gap-1 font-medium text-white transition-colors hover:text-white hover:underline decoration-white/40 underline-offset-2 ${focusStyles}`}
          >
            <span className="hidden xl:inline">
              {t('navigation.emergencyStrip.viewAll')}
            </span>
            <span className="hidden sm:inline xl:hidden">
              {t('navigation.emergencyStrip.hotlines')}
            </span>
            <span className="sm:hidden">
              {t('navigation.emergencyStrip.all')}
            </span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
