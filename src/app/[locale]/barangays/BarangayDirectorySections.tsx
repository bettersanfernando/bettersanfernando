'use client';

import {
  ArrowDown,
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FolderKanban,
  Hash,
  Users,
} from 'lucide-react';
import Link from '../../../components/i18n/LocaleLink';
import { usePageT } from '../../../components/i18n/PageMessages';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import type { getCityDemographicsSource } from '../../../data/civic/demographics';
import { formatIsoDate } from '../../../lib/utils';
import type { LanguageType } from '../../../types';

type CityDemographicsSource = ReturnType<typeof getCityDemographicsSource>;

interface BarangayHeroSectionProps {
  barangayCount: number;
  formattedTotalPopulation: string;
  source: CityDemographicsSource;
}

export function BarangayHeroSection({
  barangayCount,
  formattedTotalPopulation,
  source,
}: BarangayHeroSectionProps) {
  const t = usePageT();

  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
        <Breadcrumbs
          className="text-xs text-gray-500"
          items={[{ label: t('Home'), href: '/' }, { label: t('Barangays') }]}
        />

        <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">
              {t('CITY DIRECTORY · BARANGAYS')}
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.02em] text-gray-950 sm:text-4xl md:text-5xl">
              {t('Barangay Directory')}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">
              {t(
                'Find all 35 barangays in the City of San Fernando and review their published population, classification, PSGC identity, and related project records.'
              )}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href="#directory"
                className="inline-flex items-center gap-2 rounded-sm bg-[#0066EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                <span>{t('Browse Barangays')}</span>
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>

              <Link
                href="/statistics/population"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] hover:text-[#0052BC]"
              >
                <span>{t('View Population Statistics')}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <aside
            aria-label={t('Directory scope')}
            className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {t('DIRECTORY SCOPE')}
            </p>
            <h2 className="mt-1 text-base font-bold text-gray-950 sm:text-lg">
              {t('{{count}} Published Barangays', { count: barangayCount })}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
              {t(
                'Barangay names, PSGC identity, population, and classification use the current published civic datasets.'
              )}
            </p>

            <div className="mt-4 border-t border-gray-200/80 pt-3">
              <p className="text-xs font-medium text-gray-500">
                {source.census} ·{' '}
                {t('{{population}} City Population', {
                  population: formattedTotalPopulation,
                })}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export function BarangayGuideSection() {
  const t = usePageT();

  return (
    <section
      className="border-b border-gray-200 bg-white py-10 sm:py-12"
      aria-labelledby="guide-heading"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <p className="text-eyebrow text-[#0066EB]">{t('DIRECTORY GUIDE')}</p>
          <h2
            id="guide-heading"
            className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
          >
            {t('What You Can Find Here')}
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#F3F6FB] text-[#0066EB]">
              <Hash className="h-4 w-4" aria-hidden="true" />
            </div>
            <h3 className="pt-2 text-sm font-bold text-gray-950 sm:text-base">
              {t('PSGC Identity')}
            </h3>
            <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">
              {t('Official geographic identifier and published barangay name.')}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#F3F6FB] text-[#0066EB]">
              <Users className="h-4 w-4" aria-hidden="true" />
            </div>
            <h3 className="pt-2 text-sm font-bold text-gray-950 sm:text-base">
              {t('Population')}
            </h3>
            <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">
              {t(
                '2024 POPCEN population and share of San Fernando’s published city total.'
              )}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#F3F6FB] text-[#0066EB]">
              <Building2 className="h-4 w-4" aria-hidden="true" />
            </div>
            <h3 className="pt-2 text-sm font-bold text-gray-950 sm:text-base">
              {t('Classification')}
            </h3>
            <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">
              {t('Published Urban or Rural classification.')}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#F3F6FB] text-[#0066EB]">
              <FolderKanban className="h-4 w-4" aria-hidden="true" />
            </div>
            <h3 className="pt-2 text-sm font-bold text-gray-950 sm:text-base">
              {t('Related Projects')}
            </h3>
            <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">
              {t(
                'Published BetterSanFernando project records attributed to the barangay.'
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

interface BarangayDirectoryPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function BarangayDirectoryPagination({
  currentPage,
  totalPages,
  onPageChange,
}: BarangayDirectoryPaginationProps) {
  const t = usePageT();

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={t('Barangay directory pagination')}
      className="mt-6 flex items-center justify-between gap-4 border-t border-gray-200 pt-6"
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="inline-flex h-9 items-center gap-1 rounded-sm border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-900 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 enabled:cursor-pointer enabled:hover:border-[#0066EB] enabled:hover:bg-[#F3F6FB] enabled:hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span>{t('Previous')}</span>
      </button>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange(pageNum)}
            aria-current={pageNum === currentPage ? 'page' : undefined}
            className={`inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-sm border px-2.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] ${
              pageNum === currentPage
                ? 'border-[#0066EB] bg-[#0066EB] text-white'
                : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-[#F3F6FB]'
            }`}
          >
            {pageNum}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="inline-flex h-9 items-center gap-1 rounded-sm border border-gray-300 bg-white px-3 text-xs font-semibold text-gray-900 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 enabled:cursor-pointer enabled:hover:border-[#0066EB] enabled:hover:bg-[#F3F6FB] enabled:hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
      >
        <span>{t('Next')}</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}

interface BarangayFooterSectionsProps {
  source: CityDemographicsSource;
  locale: LanguageType;
}

export function BarangayFooterSections({
  source,
  locale,
}: BarangayFooterSectionsProps) {
  const t = usePageT();

  return (
    <>
      <section
        className="border-t border-gray-200 bg-white py-10 sm:py-12 lg:py-14"
        aria-labelledby="source-scope-heading"
      >
        <div className="container mx-auto px-4">
          <p className="text-eyebrow text-[#0066EB]">{t('PROVENANCE')}</p>
          <h2
            id="source-scope-heading"
            className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
          >
            {t('Source & Scope')}
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                {t('Population & Classification')}
              </p>
              <h3 className="mt-1 text-base font-bold text-gray-950">
                {source.publisher}
              </h3>
              <p className="mt-1 text-sm text-gray-600">{source.census}</p>
              <div className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
                <span>
                  {t('Last Verified: {{date}}', {
                    date: formatIsoDate(source.lastVerified, locale),
                  })}
                </span>
              </div>
              <div className="mt-4">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
                >
                  <span>{t('View Official PSA Source')}</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                {t('Directory Scope')}
              </p>
              <h3 className="mt-1 text-base font-bold text-gray-950">
                {t('What This Directory Represents')}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                {t(
                  'BetterSanFernando’s currently published 35-barangay directory. Population, classification, PSGC identity, and related project records keep their own source boundaries.'
                )}
              </p>
              <div className="mt-4 border-t border-gray-100 pt-3">
                <p className="text-xs leading-relaxed text-gray-500">
                  {t(
                    'Project links show published records attributed to a barangay; they do not establish exact project coordinates.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-t border-gray-200 bg-white py-10 pb-16 sm:py-12 sm:pb-24 lg:py-14 lg:pb-28"
        aria-labelledby="keep-exploring-heading"
      >
        <div className="container mx-auto px-4">
          <p className="text-eyebrow text-[#0066EB]">
            {t('RELATED INFORMATION')}
          </p>
          <h2
            id="keep-exploring-heading"
            className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
          >
            {t('Keep Exploring')}
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/statistics/population"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 transition-colors hover:border-[#0066EB] hover:bg-[#F3F6FB] sm:p-5"
            >
              <div>
                <h3 className="text-base font-bold text-gray-950 transition-colors group-hover:text-[#0066EB]">
                  {t('Population Statistics')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {t(
                    'Detailed demographic breakdown, population distribution, and city trends.'
                  )}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                <span>{t('View population statistics')}</span>
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>

            <Link
              href="/statistics/city-profile"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 transition-colors hover:border-[#0066EB] hover:bg-[#F3F6FB] sm:p-5"
            >
              <div>
                <h3 className="text-base font-bold text-gray-950 transition-colors group-hover:text-[#0066EB]">
                  {t('City Profile')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {t(
                    'Verified civic profile, governance facts, and citywide overview.'
                  )}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                <span>{t('View city profile')}</span>
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>

            <Link
              href="/projects/map"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 transition-colors hover:border-[#0066EB] hover:bg-[#F3F6FB] sm:p-5"
            >
              <div>
                <h3 className="text-base font-bold text-gray-950 transition-colors group-hover:text-[#0066EB]">
                  {t('Project Distribution Map')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {t(
                    'Geographic distribution of published city infrastructure and civil projects.'
                  )}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                <span>{t('Explore project distribution')}</span>
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>

            <Link
              href="/government/barangay-contacts"
              className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4 transition-colors hover:border-[#0066EB] hover:bg-[#F3F6FB] sm:p-5"
            >
              <div>
                <h3 className="text-base font-bold text-gray-950 transition-colors group-hover:text-[#0066EB]">
                  {t('Barangay Contacts')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {t(
                    'Hall locations and official contact information for all 35 barangays.'
                  )}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                <span>{t('Browse barangay contacts')}</span>
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
