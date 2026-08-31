import { type FormEvent, useEffect, useRef, useState } from 'react';
import {
  Accessibility,
  Archive,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  ChevronDown,
  Construction,
  Database,
  ExternalLink,
  FileCheck2,
  FileText,
  GraduationCap,
  HandHeart,
  HeartPulse,
  Landmark,
  Leaf,
  LibraryBig,
  ListChecks,
  MapPinned,
  Menu,
  Network,
  Phone,
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
import { Link, useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  getActiveNavigationId,
  getSearchHref,
  mainNavigation,
  searchNavigation,
} from '../../data/navigation';
import { SUPPORTED_LANGUAGES } from '../../i18n/languages';
import type {
  LanguageType,
  NavigationDestination,
  NavigationIcon,
  NavigationId,
} from '../../types';
import EmergencyStrip from './EmergencyStrip';
import CivicUtilityBar from './CivicUtilityBar';

const BRAND_LOGO =
  '/assets/brand/logos/horizontal/better-san-fernando-horizontal-blue-transparent.svg';
const DESKTOP_CLOSE_DELAY_MS = 160;
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

  // The horizontal lockup's own artboard has generous padding around the
  // mark, so sizing by height (not width) with intrinsic aspect ratio is
  // what keeps the full symbol and wordmark visible without cropping.
  return (
    <img
      src={BRAND_LOGO}
      alt={t('site_name')}
      className="block h-16 w-auto object-contain"
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
  const className = `group flex rounded-lg px-2.5 py-2.5 text-gray-800 transition-colors hover:bg-primary-50 hover:text-primary-800 ${focusStyles}`;
  const content = (
    <>
      <span className="mt-0.5 mr-2.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition-colors group-hover:bg-white">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold leading-5">
          {t(destination.labelKey)}
        </span>
        {showDescription && (
          <span className="mt-0.5 block text-xs leading-4 text-gray-600 group-hover:text-gray-700">
            {t(destination.descriptionKey)}
          </span>
        )}
      </span>
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
    <Link to={destination.href} className={className} onClick={onNavigate}>
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
  const desktopTriggerRefs = useRef(new Map<NavigationId, HTMLButtonElement>());
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressFocusOpenRef = useRef<NavigationId | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('common');
  const activeNavigationId = getActiveNavigationId(location.pathname);
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

  const changeLanguage = (language: LanguageType) => {
    void i18n.changeLanguage(language);
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    navigate(getSearchHref(String(formData.get('q') ?? '')));
    closeNavigation();
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
        className="relative"
        onPointerLeave={event => {
          if (event.pointerType === 'mouse') scheduleDesktopClose();
        }}
      >
        <div className="container mx-auto flex min-h-20 items-center gap-4 px-4 py-2">
          <Link
            to="/"
            onClick={closeNavigation}
            className={`flex shrink-0 items-center rounded-md ${focusStyles}`}
          >
            <BrandLogo />
          </Link>

          <div className="ml-auto hidden items-center gap-0.5 xl:flex">
            {mainNavigation.map(item => {
              const isActive = activeNavigationId === item.id;
              const isOpen = openDesktopMenu === item.id;
              return (
                <div
                  key={item.id}
                  className="flex items-center"
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
                    to={item.href}
                    onClick={closeNavigation}
                    aria-current={isActive ? 'page' : undefined}
                    className={`border-b-2 px-2 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${focusStyles} ${
                      isActive
                        ? 'border-primary-600 text-primary-800'
                        : 'border-transparent text-gray-700 hover:border-primary-200 hover:text-primary-700'
                    }`}
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
                      className={`-ml-1 rounded-md p-2 text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-700 ${focusStyles}`}
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
              to={searchNavigation.href}
              onClick={closeNavigation}
              aria-label={t(searchNavigation.labelKey)}
              className={`ml-1 hidden h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-700 xl:flex ${focusStyles}`}
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsMobileOpen(open => !open);
              setOpenMobileMenu(null);
            }}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-navigation"
            className={`ml-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-gray-700 transition-colors hover:bg-gray-100 hover:text-primary-700 xl:hidden ${focusStyles}`}
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
              <Menu className="h-6 w-6" aria-hidden="true" />
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
              <div className="container mx-auto grid max-w-7xl grid-cols-4 gap-5 rounded-xl bg-white px-6 py-6 shadow-[0_18px_48px_rgba(15,23,42,0.16)] ring-1 ring-gray-200">
                {item.sections!.map(section => (
                  <div key={section.labelKey} className="min-w-0">
                    <h2 className="mb-2 border-b border-primary-100 px-2.5 pb-3 text-xs font-bold tracking-wide text-gray-900 uppercase">
                      {t(section.labelKey)}
                    </h2>
                    <ul className="space-y-0.5">
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
                ))}
              </div>
            </div>
          ))}

        <div
          id="mobile-navigation"
          className={`border-t border-gray-200 bg-white xl:hidden ${isMobileOpen ? 'block' : 'hidden'}`}
        >
          <div className="container mx-auto max-h-[calc(100vh-7.5rem)] overflow-x-hidden overflow-y-auto px-4 py-4">
            <form role="search" onSubmit={submitSearch} className="mb-4">
              <label htmlFor="mobile-search" className="sr-only">
                {t(searchNavigation.labelKey)}
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-gray-500"
                  aria-hidden="true"
                />
                <input
                  id="mobile-search"
                  name="q"
                  type="search"
                  placeholder={t(searchNavigation.placeholderKey)}
                  className={`min-h-11 w-full rounded-lg border border-gray-300 bg-gray-50 pr-4 pl-11 text-base text-gray-900 placeholder:text-gray-600 focus:bg-white ${focusStyles}`}
                />
              </div>
            </form>

            {mainNavigation.map(item => {
              const isActive = activeNavigationId === item.id;
              const isOpen = openMobileMenu === item.id;
              return (
                <div
                  key={item.id}
                  className="border-b border-gray-100 py-1 last:border-b-0"
                >
                  <div className="flex min-h-11 items-center gap-1">
                    <Link
                      to={item.href}
                      onClick={closeNavigation}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex-1 rounded-md px-3 py-2.5 text-base font-medium transition-colors ${focusStyles} ${
                        isActive
                          ? 'bg-primary-50 text-primary-800'
                          : 'text-gray-800 hover:bg-gray-50 hover:text-primary-700'
                      }`}
                    >
                      {t(item.labelKey)}
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
                        className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-gray-600 hover:bg-gray-50 hover:text-primary-700 ${focusStyles}`}
                      >
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          aria-hidden="true"
                        />
                      </button>
                    )}
                  </div>
                  {item.sections && isOpen && (
                    <div
                      id={`mobile-mega-${item.id}`}
                      className="space-y-5 px-3 pt-2 pb-5"
                    >
                      {item.sections.map(section => (
                        <div key={section.labelKey}>
                          <h2 className="mb-2 border-b border-primary-100 pb-2 text-xs font-bold tracking-wide text-gray-900 uppercase">
                            {t(section.labelKey)}
                          </h2>
                          <ul className="space-y-0.5">
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
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}
