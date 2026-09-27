'use client';

import type { ComponentProps } from 'react';
import Link from 'next/link';
import { localizeHref } from '../../i18n/locale';
import { useLocale } from './useLocale';

// Drop-in for next/link that emits the /fil-prefixed href in server-rendered
// HTML too (LocaleNavigation only corrects clicks after hydration).
export default function LocaleLink({
  href,
  ...props
}: ComponentProps<typeof Link>) {
  const locale = useLocale();
  const localized =
    typeof href === 'string'
      ? localizeHref(href, locale)
      : href.pathname
        ? { ...href, pathname: localizeHref(href.pathname, locale) }
        : href;

  return <Link href={localized} {...props} />;
}
