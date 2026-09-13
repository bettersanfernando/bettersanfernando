import Link from 'next/link';
import Breadcrumbs from '../../components/ui/Breadcrumbs.next';
import { categories } from './categories';

import { buildPageMetadata } from '../../lib/metadata';

export const metadata = buildPageMetadata({
  title: 'Services',
  description:
    "Browse BetterSanFernando's progressively published City service guidance by need.",
  path: '/services',
});

// Next.js port of src/pages/Services.tsx's ServicesHub view (Batch 3).
// The category-detail view (ServiceCategory in the legacy file) now lives
// in service-category-view.next.tsx, rendered by the [category] dispatcher
// (Batch 4) — this file only ever needs the hub.
export default function ServicesHubPage() {
  return (
    <main className="flex-grow bg-gray-50">
      <section className="border-b border-primary-100 bg-white">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <Breadcrumbs
            className="mb-8"
            items={[{ label: 'Home', href: '/' }, { label: 'Services' }]}
          />
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
              Services
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
              Browse City service guidance by need. BetterSanFernando is
              progressively publishing reviewed information, so these categories
              are not complete service inventories.
            </p>
          </div>
        </div>
      </section>

      <section
        className="container mx-auto px-4 py-8 md:py-12"
        aria-labelledby="service-categories-heading"
      >
        <h2
          id="service-categories-heading"
          className="text-2xl font-bold text-gray-900 md:text-3xl"
        >
          Browse by need
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700">
          Published categories contain reviewed service records. Planned
          categories remain visible while their local sources are prepared.
        </p>
        <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map(([name, slug, description, status]) => (
            <article
              key={slug}
              className="flex flex-col border border-gray-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-bold text-gray-900">
                  <Link
                    href={`/services/${slug}`}
                    className="hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600"
                  >
                    {name}
                  </Link>
                </h3>
                <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-800">
                  {status === 'published' ? 'Published' : 'Planned'}
                </span>
              </div>
              <p className="mt-3 flex-grow text-sm leading-6 text-gray-700">
                {description}
              </p>
              <Link
                href={`/services/${slug}`}
                className="mt-5 inline-flex self-start font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
              >
                {status === 'published'
                  ? 'Browse reviewed services'
                  : 'View planned section'}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
