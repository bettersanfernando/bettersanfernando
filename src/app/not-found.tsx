import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, Landmark, FolderKanban, Wrench, Search } from 'lucide-react';

// App Router's not-found convention file — rendered for every notFound()
// call (unknown service/project/office/category) and for any unmatched
// URL, always with a real HTTP 404 status. Named not-found.page.tsx, not
// not-found.tsx, per the temporary pageExtensions workaround (next.config.ts).
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

const destinations = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/services', label: 'Services', icon: Wrench },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/government', label: 'Government', icon: Landmark },
  { href: '/search', label: 'Search', icon: Search },
];

export default function NotFound() {
  return (
    <main className="flex-grow bg-gray-50">
      <section className="container mx-auto flex flex-col items-center px-4 py-20 text-center md:py-28">
        <p className="text-sm font-bold tracking-wide text-primary-700 uppercase">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-gray-700">
          The page you requested does not exist in BetterSanFernando’s currently
          published collection. It may have moved, never existed, or referred to
          a record that is not (yet) published.
        </p>

        <div className="mt-10 grid w-full max-w-2xl gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {destinations.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-5 text-sm font-semibold text-gray-800 transition hover:border-primary-300 hover:text-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              <Icon className="h-5 w-5 text-primary-700" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
