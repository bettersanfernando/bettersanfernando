import Link from 'next/link';
import {
  Accessibility,
  ArrowUpRight,
  Keyboard,
  Eye,
  Github,
} from 'lucide-react';
import Breadcrumbs from '../../components/ui/Breadcrumbs';

import { buildPageMetadata } from '../../lib/metadata';

export const metadata = buildPageMetadata({
  title: 'Accessibility',
  description:
    "BetterSanFernando's accessibility statement: the standard it aims for, the measures already in place, known limitations, and how to report an accessibility issue.",
  path: '/accessibility',
});

const measures = [
  [
    'Semantic structure',
    'Pages use landmark regions (header, nav, main, footer) and heading levels that follow the visible content order, so screen readers can navigate by structure.',
    Eye,
  ],
  [
    'Keyboard operability',
    'Interactive elements — links, buttons, form controls, menus — are reachable and operable by keyboard, with a visible focus outline on every focusable element.',
    Keyboard,
  ],
  [
    'Text alternatives',
    'Meaningful images carry descriptive alt text; decorative icons are marked so assistive technology skips them.',
    Accessibility,
  ],
] as const;

export default function AccessibilityStatement() {
  return (
    <main className="flex-grow bg-gray-50">
      <section className="border-b border-primary-100 bg-white">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <Breadcrumbs
            className="mb-8"
            items={[{ label: 'Home', href: '/' }, { label: 'Accessibility' }]}
          />
          <header className="max-w-3xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
              <Accessibility className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
              Accessibility
            </h1>
            <p className="mt-4 max-w-[68ch] text-base leading-relaxed text-gray-700 md:text-lg">
              BetterSanFernando aims to make published civic information usable
              by as many people as possible, including people using assistive
              technology, keyboard-only navigation, or a mobile device on a slow
              connection.
            </p>
          </header>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,48rem)] lg:gap-14">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Standard
            </h2>
          </div>
          <div className="space-y-4 text-base leading-7 text-gray-700">
            <p>
              This site targets the{' '}
              <a
                href="https://www.w3.org/WAI/WCAG22/quickref/?currentsidebar=%23col_overview&levels=aaa&levels=aa"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
              >
                Web Content Accessibility Guidelines (WCAG) 2.1, Level AA
              </a>{' '}
              as a working goal. This is a stated aim, not a conformance claim —
              BetterSanFernando has not undergone a formal third-party
              accessibility audit, and some pages may not yet meet every
              criterion.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,48rem)] lg:gap-14">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                Measures in place
              </h2>
            </div>
            <ul className="divide-y divide-gray-200 border-y border-gray-200">
              {measures.map(([title, description, Icon]) => (
                <li key={title} className="flex items-start gap-3 py-4">
                  <Icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-primary-700"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-bold text-gray-900">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-gray-700">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,48rem)] lg:gap-14">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Known limitations
            </h2>
          </div>
          <div className="space-y-4 text-sm leading-6 text-gray-700">
            <p>
              Some interactive data tables, map views, and filter controls are
              more complex to navigate by screen reader than a plain document.
              Third-party embeds (such as the project map) may not fully meet
              the same standard as the rest of the site.
            </p>
            <p>
              If part of the site is difficult to use with assistive technology,
              that is useful information — please report it using the link
              below.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-primary-900 text-white">
        <div className="container mx-auto px-4 py-10 md:py-12">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold md:text-3xl">
                Report an accessibility issue
              </h2>
              <p className="mt-2 text-sm leading-6 text-primary-100">
                Tell us what you were trying to do, the page it happened on, and
                the assistive technology or browser you were using.
              </p>
            </div>
            <a
              href="https://github.com/bettersanfernando/bettersanfernando/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-primary-900 transition hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              Open an issue on GitHub
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 text-sm text-gray-600">
        <Link
          href="/sitemap"
          className="font-bold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
        >
          View the site index
        </Link>
      </section>
    </main>
  );
}
