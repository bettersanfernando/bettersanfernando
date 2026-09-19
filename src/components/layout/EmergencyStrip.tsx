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
import { getGovernmentHotlines } from '../../data/civic/governmentHotlines';

const focusStyles =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-red-700 rounded-sm';

interface HotlineItem {
  id: string;
  accessibleName: string;
  icon: React.ComponentType<{
    className?: string;
    'aria-hidden'?: boolean | 'true' | 'false';
  }>;
  wrapperClassName: string;
  separatorClassName: string;
  is911?: boolean;
  label: React.ReactNode;
}

const hotlineDefinitions: readonly HotlineItem[] = [
  {
    id: 'national-911',
    accessibleName: 'National Emergency Hotline 911',
    icon: PhoneCall,
    wrapperClassName: 'inline-flex',
    separatorClassName: 'inline-block',
    is911: true,
    label: (
      <span>
        911<span className="hidden 2xl:inline"> National</span>
      </span>
    ),
  },
  {
    id: 'cdrrmo-command-center-help-line',
    accessibleName: 'CDRRMO Command Center Help Line',
    icon: Radio,
    wrapperClassName: 'inline-flex',
    separatorClassName: 'inline-block',
    label: (
      <span>
        CDRRMO<span className="hidden 2xl:inline"> HELP</span>
      </span>
    ),
  },
  {
    id: 'cdrrmo-safru-mobile-hotline',
    accessibleName: 'CDRRMO SAFRU Rescue Hotline',
    icon: Siren,
    wrapperClassName: 'hidden md:inline-flex',
    separatorClassName: 'hidden md:inline-block',
    label: (
      <span>
        SAFRU<span className="hidden 2xl:inline"> Rescue</span>
      </span>
    ),
  },
  {
    id: 'san-fernando-police-station-primary-hotline',
    accessibleName: 'San Fernando Police Station Hotline',
    icon: Shield,
    wrapperClassName: 'hidden lg:inline-flex',
    separatorClassName: 'hidden lg:inline-block',
    label: (
      <span>
        <span className="hidden 2xl:inline">San Fernando </span>Police
      </span>
    ),
  },
  {
    id: 'san-fernando-fire-station-hotline',
    accessibleName: 'San Fernando Fire Station Hotline',
    icon: Flame,
    wrapperClassName: 'hidden lg:inline-flex',
    separatorClassName: 'hidden lg:inline-block',
    label: (
      <span>
        <span className="hidden 2xl:inline">San Fernando </span>Fire
      </span>
    ),
  },
];

const hotlineById = new Map(
  getGovernmentHotlines().map(contact => [contact.id, contact])
);

function phoneHref(value: string) {
  return `tel:${value.replace(/[^+\d]/g, '')}`;
}

export default function EmergencyStrip() {
  return (
    <section aria-label="Emergency hotlines" className="bg-red-700 text-white">
      <div className="container mx-auto flex h-9.5 items-center justify-between gap-2 px-4 text-xs sm:h-10 sm:gap-3 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-1.5 font-semibold text-white">
          <TriangleAlert
            className="h-3.5 w-3.5 shrink-0 text-red-200"
            aria-hidden="true"
          />
          <span>Emergency</span>
        </div>

        <nav
          aria-label="Emergency contacts"
          className="flex min-w-0 flex-1 items-center justify-center overflow-hidden px-1"
        >
          <div className="flex items-center justify-center gap-1.5 text-[11px] sm:gap-2 lg:gap-1.5 xl:gap-2.5 xl:text-xs">
            {hotlineDefinitions.map(
              (
                {
                  id,
                  accessibleName,
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
                      aria-label={`${accessibleName}: ${contact.number}`}
                      className={`group items-center gap-1 whitespace-nowrap text-red-100 transition-colors hover:text-white hover:underline decoration-white/40 underline-offset-2 xl:gap-1.5 ${focusStyles} ${wrapperClassName}`}
                    >
                      <Icon
                        className="h-3.5 w-3.5 shrink-0 text-red-200 transition-colors group-hover:text-white"
                        aria-hidden="true"
                      />
                      <span className="font-medium text-white">{label}</span>
                      {!is911 && (
                        <span className="tabular-nums text-red-100 transition-colors group-hover:text-white">
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
            href="/government/hotlines"
            className={`inline-flex items-center gap-1 font-medium text-red-100 transition-colors hover:text-white hover:underline decoration-white/40 underline-offset-2 ${focusStyles}`}
          >
            <span className="hidden xl:inline">View all hotlines</span>
            <span className="hidden sm:inline xl:hidden">Hotlines</span>
            <span className="sm:hidden">All</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
