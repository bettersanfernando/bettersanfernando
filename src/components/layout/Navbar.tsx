'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Accessibility,
  Archive,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  Construction,
  Database,
  Droplets,
  ExternalLink,
  FileCheck2,
  FileSearch,
  FileText,
  FolderKanban,
  GraduationCap,
  HandHeart,
  HeartPulse,
  House,
  Info,
  Landmark,
  Leaf,
  LibraryBig,
  ListChecks,
  LayoutGrid,
  MapPinned,
  Mail,
  Network,
  Phone,
  Receipt,
  Scale,
  Search,
  ShieldCheck,
  ShoppingCart,
  TriangleAlert,
  UsersRound,
  WalletCards,
  Wheat,
  X,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  getActiveNavigationId,
  mainNavigation,
  searchNavigation,
} from '../../data/navigation';
import { civicUtilityBar } from '../../data/headerUtility';
import { SUPPORTED_LANGUAGES } from '../../i18n/languages';
import type {
  LanguageType,
  NavigationDestination,
  NavigationIcon,
  NavigationId,
} from '../../types';
import EmergencyStrip from './EmergencyStrip';
import CivicUtilityBar from './CivicUtilityBar';

// Next.js port of Navbar.tsx. Consumes the same ../../data/navigation
// source as the Vite version (no navigation data is duplicated); only the
// router bindings differ (next/link + next/navigation in place of
// react-router). Keep both files in sync until src/pages/ + the Vite build
// are retired and this becomes the only Navbar.

const BRAND_LOGO =
  '/assets/brand/logos/horizontal/better-san-fernando-horizontal-blue-transparent-cropped.png';
const DESKTOP_CLOSE_DELAY_MS = 160;
// Every section count a mega menu can actually have must map to its own
// column count — falling through to the 'grid-cols-4' default for an
// unmapped count (e.g. a 1- or 2-section menu) leaves the container at
// full width with mostly-empty columns, which is exactly the "content
// disappeared" look a too-narrow mega menu produces.
const DESKTOP_MEGA_MENU_GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
};
const mobileNavigationIcons: Record<NavigationId, LucideIcon> = {
  home: House,
  services: LayoutGrid,
  projects: FolderKanban,
  government: Landmark,
  transparency: FileSearch,
  about: Info,
  contact: Mail,
};
const focusStyles =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2';

const destinationIcons: Record<NavigationIcon, LucideIcon> = {
  accessibility: Accessibility,
  archive: Archive,
  'badge-check': BadgeCheck,
  briefcase: BriefcaseBusiness,
  building: Building2,
  chart: ChartNoAxesCombined,
  construction: Construction,
  database: Database,
  droplet: Droplets,
  'external-link': ExternalLink,
  'file-check': FileCheck2,
  'file-text': FileText,
  'graduation-cap': GraduationCap,
  'hand-heart': HandHeart,
  'heart-pulse': HeartPulse,
  landmark: Landmark,
  leaf: Leaf,
  library: LibraryBig,
  'list-checks': ListChecks,
  map: MapPinned,
  network: Network,
  phone: Phone,
  receipt: Receipt,
  scale: Scale,
  search: Search,
  'shield-check': ShieldCheck,
  'shopping-cart': ShoppingCart,
  'triangle-alert': TriangleAlert,
  users: UsersRound,
  wallet: WalletCards,
  wheat: Wheat,
};

function BrandLogo() {
  const { t } = useTranslation('common');

  return (
    <img
      src={BRAND_LOGO}
      alt={t('site_name')}
      className="block h-11 w-auto object-contain"
    />
  );
}

function DestinationLink({
  destination,
  onNavigate,
  showDescription = false,
}: {
  destination: NavigationDestination;
  onNavigate: () => void;
  showDescription?: boolean;
}) {
  const { t } = useTranslation('common');
  const Icon = destinationIcons[destination.icon];
  const className = `group flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2.5 text-gray-800 transition-colors duration-200 hover:bg-primary-50 hover:text-primary-800 ${focusStyles}`;
  const content = (
    <>
      <span className="flex min-w-0 items-start">
        <span className="mt-0.5 mr-2.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition-colors duration-200 group-hover:bg-primary-100 group-hover:text-primary-800">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold leading-5 transition-colors duration-200 group-hover:text-primary-700">
            {t(destination.labelKey)}
          </span>
          {showDescription && (
            <span className="mt-0.5 block text-xs leading-4 text-gray-600">
              {t(destination.descriptionKey)}
            </span>
          )}
        </span>
      </span>
      <ChevronRight
        className="h-4 w-4 shrink-0 text-slate-400 transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-primary-700"
        aria-hidden="true"
      />
    </>
  );

  if (destination.kind === 'external') {
    return (
      <a
        href={destination.href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={destination.href} className={className} onClick={onNavigate}>
      {content}
    </Link>
  );
}

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDesktopMenu, setOpenDesktopMenu] = useState<NavigationId | null>(
    null
  );
  const [openMobileMenu, setOpenMobileMenu] = useState<NavigationId | null>(
    null
  );
  const headerRef = useRef<HTMLElement>(null);
  const mobileDrawerRef = useRef<HTMLElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const desktopTriggerRefs = useRef(new Map<NavigationId, HTMLButtonElement>());
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressFocusOpenRef = useRef<NavigationId | null>(null);
  const pathname = usePathname() ?? '/';
  const { t, i18n } = useTranslation('common');
  const activeNavigationId = getActiveNavigationId(pathname);
  const currentLanguage = SUPPORTED_LANGUAGES.some(
    language => language.code === i18n.resolvedLanguage
  )
    ? (i18n.resolvedLanguage as LanguageType)
    : 'en';

  const cancelDesktopClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openDesktopNavigation = (id: NavigationId) => {
    cancelDesktopClose();
    setOpenDesktopMenu(id);
  };

  const scheduleDesktopClose = () => {
    cancelDesktopClose();
    closeTimerRef.current = setTimeout(() => {
      setOpenDesktopMenu(null);
      closeTimerRef.current = null;
    }, DESKTOP_CLOSE_DELAY_MS);
  };

  const closeNavigation = () => {
    cancelDesktopClose();
    setIsMobileOpen(false);
    setOpenDesktopMenu(null);
    setOpenMobileMenu(null);
    if (isMobileOpen)
      requestAnimationFrame(() => mobileTriggerRef.current?.focus());
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!openDesktopMenu) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOpenDesktopMenu(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const trigger = desktopTriggerRefs.current.get(openDesktopMenu);
      suppressFocusOpenRef.current = openDesktopMenu;
      setOpenDesktopMenu(null);
      trigger?.focus();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openDesktopMenu]);

  useEffect(() => {
    if (!isMobileOpen) return;

    const hadScrollLock = document.body.classList.contains('overflow-hidden');
    document.body.classList.add('overflow-hidden');
    const drawer = mobileDrawerRef.current;
    const focusable = () =>
      Array.from(
        drawer?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileOpen(false);
        setOpenMobileMenu(null);
        requestAnimationFrame(() => mobileTriggerRef.current?.focus());
        return;
      }
      if (event.key !== 'Tab') return;
      const elements = focusable();
      if (!elements.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    requestAnimationFrame(() => focusable()[0]?.focus());
    return () => {
      if (!hadScrollLock) document.body.classList.remove('overflow-hidden');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileOpen]);

  const changeLanguage = (language: LanguageType) => {
    void i18n.changeLanguage(language);
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-50 bg-white shadow-sm">
      <EmergencyStrip />
      <CivicUtilityBar
        currentLanguage={currentLanguage}
        onChangeLanguage={changeLanguage}
      />

      <nav
        aria-label={t('navigation.accessibility.primary')}
        className="relative border-b border-slate-100"
        onPointerLeave={event => {
          if (event.pointerType === 'mouse') scheduleDesktopClose();
        }}
      >
        <div className="container mx-auto flex h-[72px] items-center gap-4 px-4">
          <Link
            href="/"
            onClick={closeNavigation}
            className={`flex shrink-0 items-center rounded-md ${focusStyles}`}
          >
            <BrandLogo />
          </Link>

          <div className="ml-auto hidden items-center gap-2 xl:flex">
            {mainNavigation.map(item => {
              const isActive = activeNavigationId === item.id;
              const isOpen = openDesktopMenu === item.id;
              return (
                <div
                  key={item.id}
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 transition-colors duration-200 ${
                    isActive || isOpen
                      ? 'bg-primary-50 text-primary-800'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                  }`}
                  onPointerEnter={event => {
                    if (event.pointerType !== 'mouse') return;
                    if (item.sections) openDesktopNavigation(item.id);
                    else {
                      cancelDesktopClose();
                      setOpenDesktopMenu(null);
                    }
                  }}
                  onFocus={() => {
                    if (!item.sections) {
                      setOpenDesktopMenu(null);
                      return;
                    }
                    if (suppressFocusOpenRef.current === item.id) {
                      suppressFocusOpenRef.current = null;
                      return;
                    }
                    openDesktopNavigation(item.id);
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={closeNavigation}
                    aria-current={isActive ? 'page' : undefined}
                    className={`rounded-md p-0 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${isActive || isOpen ? 'font-semibold text-primary-800' : 'text-inherit'} ${focusStyles}`}
                  >
                    {t(item.labelKey)}
                  </Link>
                  {item.sections && (
                    <button
                      ref={element => {
                        if (element)
                          desktopTriggerRefs.current.set(item.id, element);
                        else desktopTriggerRefs.current.delete(item.id);
                      }}
                      type="button"
                      onClick={() => {
                        cancelDesktopClose();
                        setOpenDesktopMenu(isOpen ? null : item.id);
                      }}
                      aria-expanded={isOpen}
                      aria-controls={`desktop-mega-${item.id}`}
                      aria-label={t(
                        isOpen
                          ? 'navigation.accessibility.closeSection'
                          : 'navigation.accessibility.openSection',
                        { section: t(item.labelKey) }
                      )}
                      className={`rounded-md p-0.5 text-inherit transition-colors duration-200 ${focusStyles}`}
                    >
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </div>
              );
            })}

            <Link
              href={searchNavigation.href}
              onClick={closeNavigation}
              aria-label={t(searchNavigation.labelKey)}
              className={`hidden h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition-colors duration-200 hover:bg-primary-50 hover:text-primary-700 xl:flex ${focusStyles}`}
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>

          <button
            ref={mobileTriggerRef}
            type="button"
            onClick={() => {
              setIsMobileOpen(open => !open);
              setOpenMobileMenu(null);
            }}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-navigation"
            className={`ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition-colors duration-200 hover:bg-primary-50 hover:text-primary-700 xl:hidden ${focusStyles}`}
          >
            <span className="sr-only">
              {t(
                isMobileOpen
                  ? 'navigation.accessibility.closeMenu'
                  : 'navigation.accessibility.openMenu'
              )}
            </span>
            {isMobileOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 8h16" />
                <path d="M4 16h11" />
              </svg>
            )}
          </button>
        </div>

        {mainNavigation
          .filter(item => item.sections && openDesktopMenu === item.id)
          .map(item => (
            <div
              key={item.id}
              id={`desktop-mega-${item.id}`}
              className="absolute inset-x-0 top-full hidden px-4 pt-2 pb-4 xl:block"
              onPointerEnter={cancelDesktopClose}
            >
              <div
                className={`container mx-auto grid max-h-[calc(100vh-10rem)] max-w-7xl items-start gap-5 overflow-y-auto rounded-xl bg-white px-6 py-6 shadow-[0_18px_48px_rgba(15,23,42,0.16)] ring-1 ring-gray-200 ${
                  DESKTOP_MEGA_MENU_GRID_COLS[item.sections!.length] ??
                  'grid-cols-4'
                }`}
              >
                {item.sections!.map(section => {
                  const sectionIdx = item.sections!.indexOf(section);
                  return (
                    <div key={section.labelKey} className="min-w-0">
                      <div className="mb-3 flex items-center gap-2 border-b border-gray-100 pb-3">
                        <span
                          className="rounded bg-primary-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary-600"
                          aria-hidden="true"
                        >
                          {String(sectionIdx + 1).padStart(2, '0')}
                        </span>
                        <h2 className="text-sm font-semibold text-gray-900">
                          {t(section.labelKey)}
                        </h2>
                      </div>
                      <ul className="space-y-1">
                        {section.items.map(destination => (
                          <li key={destination.href}>
                            <DestinationLink
                              destination={destination}
                              onNavigate={closeNavigation}
                              showDescription
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        <div
          className={`fixed inset-0 z-[60] bg-slate-950/35 transition-opacity duration-[250ms] motion-reduce:transition-none xl:hidden ${isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          aria-hidden="true"
          onClick={closeNavigation}
        />

        <aside
          ref={mobileDrawerRef}
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label={t('navigation.accessibility.primary')}
          inert={!isMobileOpen}
          className={`fixed inset-y-0 right-0 z-[61] flex w-[min(90vw,400px)] max-w-full flex-col bg-white shadow-[-12px_0_40px_rgba(15,23,42,0.14)] transition-transform duration-[250ms] motion-reduce:transition-none xl:hidden ${isMobileOpen ? 'translate-x-0' : 'pointer-events-none translate-x-full'}`}
        >
          <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-100 px-5">
            <Link
              href="/"
              onClick={closeNavigation}
              className={`rounded-md ${focusStyles}`}
            >
              <BrandLogo />
            </Link>
            <button
              type="button"
              onClick={closeNavigation}
              aria-label={t('navigation.accessibility.closeMenu')}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-colors duration-200 hover:bg-primary-50 hover:text-primary-700 ${focusStyles}`}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            <Link
              href={searchNavigation.href}
              onClick={closeNavigation}
              className={`mb-4 flex min-h-[52px] items-center justify-between rounded-lg bg-slate-50 px-4 text-base font-semibold text-slate-800 transition-colors duration-200 hover:bg-primary-50 hover:text-primary-800 ${focusStyles}`}
            >
              <span className="flex items-center gap-3">
                <Search
                  className="h-5 w-5 text-primary-700"
                  aria-hidden="true"
                />
                {t(searchNavigation.labelKey)}
              </span>
              <ChevronRight
                className="h-4 w-4 text-slate-400"
                aria-hidden="true"
              />
            </Link>

            <nav aria-label={t('navigation.accessibility.primary')}>
              <div className="space-y-1">
                {mainNavigation.map(item => {
                  const isActive = activeNavigationId === item.id;
                  const isOpen = openMobileMenu === item.id;
                  const Icon = mobileNavigationIcons[item.id];
                  return (
                    <div key={item.id}>
                      <div className="flex min-h-[52px] items-center gap-1">
                        <Link
                          href={item.href}
                          onClick={closeNavigation}
                          aria-current={isActive ? 'page' : undefined}
                          className={`group flex min-h-[52px] flex-1 items-center rounded-lg px-4 text-base font-medium transition-colors duration-200 ${focusStyles} ${
                            isActive
                              ? 'bg-primary-50 font-semibold text-primary-800'
                              : 'text-slate-800 hover:bg-slate-50 hover:text-primary-700'
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon
                              className={`h-5 w-5 shrink-0 transition-colors duration-200 ${isActive ? 'text-primary-700' : 'text-slate-600 group-hover:text-primary-700'}`}
                              aria-hidden="true"
                            />
                            {t(item.labelKey)}
                          </span>
                        </Link>
                        {item.sections && (
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMobileMenu(isOpen ? null : item.id)
                            }
                            aria-expanded={isOpen}
                            aria-controls={`mobile-mega-${item.id}`}
                            aria-label={t(
                              isOpen
                                ? 'navigation.accessibility.closeSection'
                                : 'navigation.accessibility.openSection',
                              { section: t(item.labelKey) }
                            )}
                            className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors duration-200 hover:bg-primary-50 hover:text-primary-700 ${focusStyles}`}
                          >
                            <ChevronDown
                              className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                              aria-hidden="true"
                            />
                          </button>
                        )}
                      </div>

                      {item.sections && (
                        <div
                          id={`mobile-mega-${item.id}`}
                          className={`grid transition-[grid-template-rows,opacity] duration-[250ms] motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                        >
                          <div className="min-h-0 overflow-hidden">
                            <div className="space-y-5 px-3 pt-3 pb-4">
                              {item.sections.map(section => {
                                const sectionIdx =
                                  item.sections!.indexOf(section);
                                return (
                                  <div key={section.labelKey}>
                                    <div className="mb-2 flex items-center gap-2 border-b border-gray-100 pb-2">
                                      <span
                                        className="rounded bg-primary-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary-600"
                                        aria-hidden="true"
                                      >
                                        {String(sectionIdx + 1).padStart(
                                          2,
                                          '0'
                                        )}
                                      </span>
                                      <h2 className="text-xs font-semibold text-gray-900">
                                        {t(section.labelKey)}
                                      </h2>
                                    </div>
                                    <ul className="space-y-1">
                                      {section.items.map(destination => (
                                        <li key={destination.href}>
                                          <DestinationLink
                                            destination={destination}
                                            onNavigate={closeNavigation}
                                          />
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </nav>
          </div>

          <div className="relative h-32 shrink-0 overflow-hidden border-t border-slate-100 bg-primary-50/50 px-5 py-4 text-xs">
            <div className="relative z-10">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <MapPinned
                  className="h-3.5 w-3.5 text-primary-700"
                  aria-hidden="true"
                />
                San Fernando, Pampanga
              </span>
              <a
                href={civicUtilityBar.betterGovHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-2 inline-flex items-center gap-1 text-primary-700 transition-colors duration-200 hover:text-primary-900 ${focusStyles}`}
              >
                BetterGov Philippines
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
            <img
              src="/assets/brand/illustrations/san-fernando-civic-skyline-blue.png"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-1/2 h-28 w-auto max-w-none -translate-x-1/2 opacity-25"
            />
          </div>
        </aside>
      </nav>
    </header>
  );
}
