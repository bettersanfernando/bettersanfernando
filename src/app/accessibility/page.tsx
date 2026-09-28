import {
  ArrowRight,
  ExternalLink,
  Eye,
  Github,
  Keyboard,
  Layers,
} from 'lucide-react';
import Link from '../../components/i18n/LocaleLink';

import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { buildPageMetadata } from '../../lib/metadata';
import { getPageT, type PageT } from '../../i18n/server';

export async function generateMetadata() {
  const { t, locale } = await getPageT('accessibility');
  return buildPageMetadata({
    title: t('Accessibility'),
    description: t(
      'BetterSanFernando’s accessibility statement: working standard, measures in place, known limitations, and how to report an accessibility issue.'
    ),
    path: '/accessibility',
    locale,
  });
}

const WCAG_URL =
  'https://www.w3.org/WAI/WCAG22/quickref/?currentsidebar=%23col_overview&levels=aaa&levels=aa';
const GITHUB_ISSUE_URL =
  'https://github.com/bettersanfernando/bettersanfernando/issues/new';

const MEASURES = (t: PageT) =>
  [
    {
      title: t('Semantic Structure'),
      description: t(
        'Pages use landmark regions (header, nav, main, footer) and heading levels that follow the visible content order, so screen readers can navigate by structure.'
      ),
      icon: Eye,
    },
    {
      title: t('Keyboard Operability'),
      description: t(
        'Interactive elements — links, buttons, form controls, and menus — are reachable and operable by keyboard, with a visible focus outline on every focusable element.'
      ),
      icon: Keyboard,
    },
    {
      title: t('Text Alternatives'),
      description: t(
        'Meaningful images carry descriptive alternative text; decorative icons are marked so assistive technology skips them.'
      ),
      icon: Layers,
    },
  ] as const;

export default async function AccessibilityStatement() {
  const { t } = await getPageT('accessibility');
  return (
    <main className="flex-grow bg-white">
      {/* 1. EDITORIAL HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[
              { label: t('Home'), href: '/' },
              { label: t('Accessibility') },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
            <div className="max-w-3xl">
              <p className="text-eyebrow text-[#0066EB]">
                {t('ABOUT THIS SITE · ACCESSIBILITY')}
              </p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.02em] text-gray-950 sm:text-4xl md:text-5xl">
                {t('Accessibility')}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-gray-700 sm:text-lg">
                {t(
                  'BetterSanFernando aims to make published civic information usable by as many people as possible, including people using assistive technology, keyboard-only navigation, or mobile devices on slower connections.'
                )}
              </p>
            </div>

            {/* RIGHT-SIDE SCOPE MODULE */}
            <aside
              aria-label={t('Working standard')}
              className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 sm:p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('WORKING STANDARD')}
              </p>
              <h2 className="mt-1 text-base font-bold text-gray-950 sm:text-lg">
                {t('WCAG 2.1 Level AA')}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                {t(
                  'BetterSanFernando uses WCAG 2.1 Level AA as a working accessibility goal. This statement is not a formal accessibility certification or third-party audit.'
                )}
              </p>

              <div className="mt-4 border-t border-gray-200/80 pt-3">
                <a
                  href={WCAG_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC]"
                >
                  <span>{t('Read the WCAG Guidelines')}</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 2. ACCESSIBILITY APPROACH */}
      <section
        className="border-b border-gray-200 bg-white py-10 sm:py-12 lg:py-14"
        aria-labelledby="approach-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">
              {t('ACCESSIBILITY APPROACH')}
            </p>
            <h2
              id="approach-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              {t('Our Working Approach')}
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
            {/* Left: Working Standard */}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-gray-950 sm:text-lg">
                {t('Working Standard')}
              </h3>
              <p className="text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                {t(
                  'WCAG 2.1 Level AA is the current working accessibility goal for BetterSanFernando.'
                )}
              </p>
              <div className="pt-2">
                <a
                  href={WCAG_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
                >
                  <span>{t('Read the WCAG Guidelines')}</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Right: What This Statement Means */}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-gray-950 sm:text-lg">
                {t('What This Statement Means')}
              </h3>
              <p className="text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                {t(
                  'The site has not undergone a formal third-party accessibility audit, and some pages may not yet meet every criterion.'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MEASURES IN PLACE */}
      <section
        className="border-b border-gray-200 bg-white py-10 sm:py-12 lg:py-14"
        aria-labelledby="measures-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">
              {t('MEASURES IN PLACE')}
            </p>
            <h2
              id="measures-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              {t('Measures in Place')}
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-10">
            {MEASURES(t).map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="space-y-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#F3F6FB] text-[#0066EB]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <h3 className="pt-1 text-base font-bold text-gray-950">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. KNOWN LIMITATIONS */}
      <section
        className="border-b border-gray-200 bg-white py-10 sm:py-12 lg:py-14"
        aria-labelledby="limitations-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">
              {t('KNOWN LIMITATIONS')}
            </p>
            <h2
              id="limitations-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 md:text-3xl"
            >
              {t('Current Accessibility Limitations')}
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
            {/* Left: Complex Interactive Views */}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-gray-950 sm:text-lg">
                {t('Complex Interactive Views')}
              </h3>
              <p className="text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                {t(
                  'Some interactive data tables, map views, and filter controls may be more complex to navigate with some screen readers or assistive technologies than a plain document.'
                )}
              </p>
            </div>

            {/* Right: Third-Party Content */}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-gray-950 sm:text-lg">
                {t('Third-Party Content')}
              </h3>
              <p className="text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                {t(
                  'Third-party embeds and external interfaces, including the project map where applicable, may not provide the same accessibility behavior as the rest of the site.'
                )}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-4">
            <p className="text-xs leading-relaxed text-gray-500 sm:text-sm">
              {t(
                'If part of the site is difficult to use with assistive technology, reporting the page and what happened helps identify where improvements are needed.'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* 5. ACCESSIBILITY FEEDBACK */}
      <section
        className="border-b border-gray-200 bg-white py-10 pb-16 sm:py-12 sm:pb-20 lg:py-14 lg:pb-24"
        aria-labelledby="feedback-heading"
      >
        <div className="container mx-auto px-4">
          <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="max-w-2xl">
                <p className="text-eyebrow text-[#0066EB]">
                  {t('ACCESSIBILITY FEEDBACK')}
                </p>
                <h2
                  id="feedback-heading"
                  className="mt-1 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
                >
                  {t('Report an Accessibility Issue')}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                  {t(
                    'Tell us what you were trying to do, which page the problem occurred on, and the assistive technology or browser you were using.'
                  )}
                </p>
              </div>

              <div>
                <a
                  href={GITHUB_ISSUE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-sm bg-[#0066EB] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] sm:text-sm"
                >
                  <Github className="h-4 w-4" aria-hidden="true" />
                  <span>{t('Open an Accessibility Issue on GitHub')}</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick link to Site Index */}
          <div className="mt-8 text-xs text-gray-500 sm:text-sm">
            <Link
              href="/sitemap"
              className="inline-flex items-center gap-1 font-semibold text-[#0066EB] hover:text-[#0052BC]"
            >
              <span>{t('View Site Index')}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
