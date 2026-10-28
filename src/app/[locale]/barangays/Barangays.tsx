'use client';

import { useMemo } from 'react';
import { ArrowRight, Phone, RotateCcw, Search } from 'lucide-react';
import { parseAsInteger, useQueryState } from 'nuqs';
import Link from '../../../components/i18n/LocaleLink';
import { usePageT } from '../../../components/i18n/PageMessages';
import { useLocale } from '../../../components/i18n/useLocale';
import {
  filterAndSortBarangays,
  type BarangayDirectoryClassification,
  type BarangayDirectorySort,
} from '../../../data/civic/barangayDirectory';
import {
  getBarangays,
  getCityDemographicsSource,
  getCityTotalPopulation,
} from '../../../data/civic/demographics';
import { aggregatePopulationStatistics } from '../../../data/civic/populationStatistics';
import { INTL_LOCALES } from '../../../i18n/locale';
import {
  BarangayDirectoryPagination,
  BarangayFooterSections,
  BarangayGuideSection,
  BarangayHeroSection,
} from './BarangayDirectorySections';

const statistics = aggregatePopulationStatistics(
  getBarangays(),
  getCityTotalPopulation()
);
const source = getCityDemographicsSource();

const PAGE_SIZE = 10;

function isClassification(
  value: string
): value is BarangayDirectoryClassification {
  return value === 'All' || value === 'Urban' || value === 'Rural';
}

function isSort(value: string): value is BarangayDirectorySort {
  return (
    value === 'name-asc' ||
    value === 'name-desc' ||
    value === 'population-desc' ||
    value === 'population-asc' ||
    value === 'share-desc'
  );
}

export default function Barangays() {
  const t = usePageT();
  const locale = useLocale();
  const intlLocale = INTL_LOCALES[locale];

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(intlLocale),
    [intlLocale]
  );
  const percentFormatter = useMemo(
    () =>
      new Intl.NumberFormat(intlLocale, {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    [intlLocale]
  );

  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [classificationValue, setClassification] = useQueryState('type', {
    defaultValue: 'All',
  });
  const [sortValue, setSort] = useQueryState('sort', {
    defaultValue: 'name-asc',
  });
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));

  const classification = isClassification(classificationValue)
    ? classificationValue
    : 'All';
  const sort = isSort(sortValue) ? sortValue : 'name-asc';

  const hasFilters = Boolean(
    query.trim() ||
    classification !== 'All' ||
    sort !== 'name-asc' ||
    page !== 1
  );

  const visibleBarangays = useMemo(
    () =>
      filterAndSortBarangays(statistics.rankedBarangays, {
        query,
        classification,
        sort,
      }),
    [query, classification, sort]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(visibleBarangays.length / PAGE_SIZE)
  );
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const paginatedBarangays = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return visibleBarangays.slice(start, start + PAGE_SIZE);
  }, [visibleBarangays, currentPage]);

  const startCount =
    visibleBarangays.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endCount = Math.min(currentPage * PAGE_SIZE, visibleBarangays.length);
  const isFiltered = Boolean(query.trim() || classification !== 'All');

  function handleQueryChange(val: string) {
    void setQuery(val || null);
    void setPage(1);
  }

  function handleClassificationChange(val: string) {
    void setClassification(val === 'All' ? null : val);
    void setPage(1);
  }

  function handleSortChange(val: string) {
    void setSort(val === 'name-asc' ? null : val);
    void setPage(1);
  }

  function resetDirectory() {
    void Promise.all([
      setQuery(null),
      setClassification(null),
      setSort(null),
      setPage(1),
    ]);
  }

  function renderRowActions(name: string, encodedPsgc: string, mobile = false) {
    return (
      <div
        className={
          mobile
            ? 'flex flex-wrap items-center gap-4 pt-1'
            : 'flex flex-col items-end gap-1.5 text-right'
        }
      >
        <Link
          href={`/projects/city-projects?barangay=${encodedPsgc}`}
          aria-label={t('Browse projects for {{name}}', { name })}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
        >
          <span>{t('Browse Projects')}</span>
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
        <Link
          href={`/government/barangay-contacts?barangay=${encodedPsgc}`}
          aria-label={t('Barangay contacts for {{name}}', { name })}
          className={`inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-[#0066EB]${mobile ? ' sm:text-sm' : ''}`}
        >
          <Phone
            className={mobile ? 'h-3.5 w-3.5' : 'h-3 w-3'}
            aria-hidden="true"
          />
          <span>{t('Barangay Contacts')}</span>
        </Link>
      </div>
    );
  }

  return (
    <main className="flex-grow bg-white">
      <BarangayHeroSection
        barangayCount={statistics.barangayCount}
        formattedTotalPopulation={numberFormatter.format(
          statistics.totalPopulation
        )}
        source={source}
      />

      <BarangayGuideSection />

      <section
        id="directory"
        className="bg-white py-10 sm:py-12 lg:py-14"
        aria-labelledby="directory-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">
              {t('BARANGAY DIRECTORY')}
            </p>
            <h2
              id="directory-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              {t('Browse All Barangays')}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {t('Search, filter, and sort all 35 published barangays.')}
            </p>
          </div>

          <div className="mt-6 rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_13rem_15rem_auto] lg:items-end">
              <div>
                <label
                  htmlFor="barangay-search"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-700"
                >
                  {t('Search Barangays')}
                </label>
                <div className="relative mt-1.5">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    id="barangay-search"
                    type="search"
                    value={query}
                    onChange={event => handleQueryChange(event.target.value)}
                    placeholder={t('Search barangay name or PSGC code…')}
                    className="h-10 w-full rounded-sm border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="barangay-classification"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-700"
                >
                  {t('Classification')}
                </label>
                <select
                  id="barangay-classification"
                  value={classification}
                  onChange={event =>
                    handleClassificationChange(event.target.value)
                  }
                  className="mt-1.5 h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  <option value="All">{t('All Classifications')}</option>
                  <option value="Urban">{t('Urban')}</option>
                  <option value="Rural">{t('Rural')}</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="barangay-sort"
                  className="block text-xs font-bold uppercase tracking-wider text-gray-700"
                >
                  {t('Sort By')}
                </label>
                <select
                  id="barangay-sort"
                  value={sort}
                  onChange={event => handleSortChange(event.target.value)}
                  className="mt-1.5 h-10 w-full rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-[#0066EB] focus:outline-none focus:ring-1 focus:ring-[#0066EB]"
                >
                  <option value="name-asc">{t('Barangay: A–Z')}</option>
                  <option value="name-desc">{t('Barangay: Z–A')}</option>
                  <option value="population-desc">
                    {t('Population: High to Low')}
                  </option>
                  <option value="population-asc">
                    {t('Population: Low to High')}
                  </option>
                  <option value="share-desc">
                    {t('City Share: High to Low')}
                  </option>
                </select>
              </div>

              {hasFilters && (
                <div>
                  <button
                    type="button"
                    onClick={resetDirectory}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-sm border border-gray-300 bg-white px-4 text-xs font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t('Reset')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
            <p className="font-semibold text-gray-800" aria-live="polite">
              {visibleBarangays.length === 0
                ? t('No matching barangays')
                : isFiltered
                  ? t(
                      'Showing {{start}}–{{end}} of {{total}} matching barangays',
                      {
                        start: startCount,
                        end: endCount,
                        total: visibleBarangays.length,
                      }
                    )
                  : t('Showing {{start}}–{{end}} of {{total}} barangays', {
                      start: startCount,
                      end: endCount,
                      total: visibleBarangays.length,
                    })}
            </p>
            <p className="text-gray-500">
              {t('2024 POPCEN Population Reference')}
            </p>
          </div>

          {paginatedBarangays.length > 0 ? (
            <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white">
              <div className="hidden border-b border-gray-200 bg-gray-50/70 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500 sm:px-5 lg:grid lg:grid-cols-[minmax(0,3.6fr)_minmax(0,2.1fr)_minmax(0,1.9fr)_auto] lg:items-center lg:gap-4">
                <span>{t('Identity')}</span>
                <span>{t('Population')}</span>
                <span>{t('Classification')}</span>
                <span className="text-right">{t('Action')}</span>
              </div>

              <ol className="divide-y divide-gray-200">
                {paginatedBarangays.map(barangay => {
                  const classificationLabel =
                    barangay.classification === 'Urban'
                      ? t('Urban')
                      : t('Rural');
                  const encodedPsgc = encodeURIComponent(barangay.psgc_code);

                  return (
                    <li
                      key={barangay.psgc_code}
                      className="group px-4 py-4 transition-colors hover:bg-[#F3F6FB] sm:px-5"
                    >
                      <div className="hidden lg:grid lg:grid-cols-[minmax(0,3.6fr)_minmax(0,2.1fr)_minmax(0,1.9fr)_auto] lg:items-center lg:gap-4">
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-gray-950">
                            {barangay.name}
                          </h3>
                          <p className="mt-0.5 text-xs font-medium text-gray-500">
                            {t('PSGC {{code}}', { code: barangay.psgc_code })}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-bold tabular-nums text-gray-950">
                            {numberFormatter.format(barangay.population)}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {t('{{share}} of City Population', {
                              share: percentFormatter.format(barangay.share),
                            })}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {classificationLabel}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {t('Population Rank #{{rank}}', {
                              rank: barangay.rank,
                            })}
                          </p>
                        </div>

                        {renderRowActions(barangay.name, encodedPsgc)}
                      </div>

                      <div className="space-y-3 lg:hidden">
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="text-base font-bold text-gray-950">
                            {barangay.name}
                          </h3>
                          <span className="text-xs font-medium text-gray-500">
                            {t('PSGC {{code}}', { code: barangay.psgc_code })}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-xs sm:text-sm">
                          <div>
                            <span className="text-base font-bold tabular-nums text-gray-950">
                              {numberFormatter.format(barangay.population)}
                            </span>{' '}
                            <span className="text-gray-500">
                              {t('Population')}
                            </span>
                          </div>
                          <div className="text-gray-500">
                            {t('{{share}} of City Population', {
                              share: percentFormatter.format(barangay.share),
                            })}
                          </div>
                        </div>

                        <div className="text-xs text-gray-600">
                          <span className="font-semibold text-gray-900">
                            {classificationLabel}
                          </span>
                          <span className="mx-1.5 text-gray-300">·</span>
                          <span>
                            {t('Population Rank #{{rank}}', {
                              rank: barangay.rank,
                            })}
                          </span>
                        </div>

                        {renderRowActions(barangay.name, encodedPsgc, true)}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : (
            <div className="mt-6 rounded-sm border border-gray-200 bg-white px-5 py-12 text-center">
              <Search
                className="mx-auto h-7 w-7 text-gray-400"
                aria-hidden="true"
              />
              <h3 className="mt-3 text-base font-bold text-gray-950">
                {t('No barangays match these filters')}
              </h3>
              <p className="mx-auto mt-1 max-w-md text-xs text-gray-600 sm:text-sm">
                {t(
                  'Check the spelling or reset the directory to show all 35 barangays.'
                )}
              </p>
              <button
                type="button"
                onClick={resetDirectory}
                className="mt-4 inline-flex items-center gap-1.5 rounded-sm bg-[#0066EB] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t('Show all barangays')}</span>
              </button>
            </div>
          )}

          <BarangayDirectoryPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={nextPage => void setPage(nextPage)}
          />
        </div>
      </section>

      <BarangayFooterSections source={source} locale={locale} />
    </main>
  );
}
