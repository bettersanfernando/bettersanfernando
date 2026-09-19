'use client';

import { TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { emergencyStrip } from '../../data/headerUtility';

const focusStyles =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-red-900';

// Next.js port of EmergencyStrip.tsx — identical markup, next/link instead
// of react-router's Link. See ../../data/headerUtility for the shared copy.
export default function EmergencyStrip() {
  const { t } = useTranslation('common');

  return (
    <div className="bg-red-900 text-white">
      <div className="container mx-auto flex h-8 items-center justify-between gap-3 px-4 text-xs">
        <span className="flex min-w-0 items-center gap-1.5 font-semibold tracking-wide">
          <TriangleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{t(emergencyStrip.titleKey)}</span>
        </span>
        <Link
          href={emergencyStrip.href}
          className={`shrink-0 whitespace-nowrap font-medium text-white/90 underline decoration-white/40 underline-offset-2 transition-colors hover:text-white ${focusStyles}`}
        >
          {t(emergencyStrip.ctaKey)} →
        </Link>
      </div>
    </div>
  );
}
