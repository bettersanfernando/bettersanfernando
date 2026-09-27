'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BreadcrumbListJsonLd } from '../../lib/json-ld';
import {
  localizeHref,
  withLocalePrefix,
  withoutLocalePrefix,
} from '../../i18n/locale';
import { useLocale } from '../i18n/useLocale';

// Shared breadcrumb navigation and structured-data companion for App Router pages.

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  const locale = useLocale();
  const { t } = useTranslation('common');
  // Canonical (unprefixed) path: '/fil' is a locale marker, not a page.
  const pathname = withoutLocalePrefix(usePathname() ?? '/');

  // Generate breadcrumbs from current path if no items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // Convert segment to readable label
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    });

    return breadcrumbs;
  };

  // The root crumb is shared chrome, so it is localized here rather than by
  // each caller; every other label is the caller's own (entity) name.
  const breadcrumbItems = (items || generateBreadcrumbs()).map(item => ({
    ...item,
    label: item.href === '/' ? t('breadcrumbs.home') : item.label,
    href: item.href && localizeHref(item.href, locale),
  }));

  return (
    <>
      <BreadcrumbListJsonLd
        items={breadcrumbItems}
        currentPath={withLocalePrefix(pathname, locale)}
      />
      <nav
        className={`flex items-center space-x-1 text-sm text-gray-600 ${className}`}
        aria-label={t('breadcrumbs.label')}
      >
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            {index === 0 && <Home className="h-4 w-4" />}
            {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-primary-600 transition-colors duration-200"
              >
                {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium" aria-current="page">
                {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    </>
  );
};

export default Breadcrumbs;
