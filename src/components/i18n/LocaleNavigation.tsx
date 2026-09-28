'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { localeFromPathname, withLocalePrefix } from '../../i18n/locale';

export default function LocaleNavigation() {
  const pathname = usePathname() ?? '/';
  const locale = localeFromPathname(pathname);
  const router = useRouter();

  useEffect(() => {
    if (locale !== 'fil') return;

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target || anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('/') || href.startsWith('//')) return;

      const localized = withLocalePrefix(href, locale);
      if (localized === href) return;

      event.preventDefault();
      router.push(localized);
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [locale, router]);

  return null;
}
