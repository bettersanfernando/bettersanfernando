import { Link } from 'react-router';
import {
  ArrowRight,
  BookOpenCheck,
  CircleAlert,
  ExternalLink,
  FileCheck2,
  Landmark,
  Link2,
  Scale,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';

const scopeAreas = [
  [
    'Projects and procurement',
    'Published project records, documentary stages, bid results, and contract information.',
  ],
  [
    'Population and place',
    'Population statistics, city profile information, barangay records, and geographic context.',
  ],
  [
    'Government information',
    'Published office identities, institutional contact details, and bounded legislation collections.',
  ],
  [
    'Transparency documentation',
    'The sources, methods, verification practices, and limitations behind published information.',
  ],
] as const;

const principles = [
  'Prefer official and primary sources when they are available and suitable.',
  'Keep provenance and public source links attached to published facts.',
  'Distinguish verified facts from unavailable or incomplete information.',
  'Keep bounded datasets clearly scoped instead of implying complete coverage.',
  'Publish only reviewed, frontend-safe information with minimal personal data.',
] as const;

const trustSteps = [
  ['FACT', 'A claim supported by a published record.', FileCheck2],
  ['SOURCE', 'The record and provenance behind that claim.', Link2],
  [
    'OFFICIAL LINK',
    'A public path to inspect the source when available.',
    ExternalLink,
  ],
] as const;

export default function About() {
  return (
    <>
      <SEO
        title="About BetterSanFernando"
        description="Learn what BetterSanFernando is, why the independent civic transparency project exists, and how it publishes sourced public information about the City of San Fernando, Pampanga."
        keywords="About BetterSanFernando, civic transparency, San Fernando Pampanga, public information, data sources"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/about`}
        siteName="BetterSanFernando"
      />
      <main className="flex-grow bg-gray-50">
        <section className="border-b border-primary-100 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <Breadcrumbs
              className="mb-8"
              items={[{ label: 'Home', href: '/' }, { label: 'About' }]}
            />
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <header className="max-w-3xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
                  <BookOpenCheck className="h-6 w-6" aria-hidden="true" />
                </div>
                <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                  About BetterSanFernando
                </h1>
                <p className="mt-4 max-w-[68ch] text-base leading-relaxed text-gray-700 md:text-lg">
                  BetterSanFernando is an independent civic transparency project
                  focused on the City of San Fernando, Pampanga. It organizes
                  verified public information so it is easier to navigate,
                  understand, and trace to its source.
                </p>
              </header>
              <aside className="rounded-xl bg-primary-50 p-5 text-sm leading-6 text-primary-900">
                <p className="font-semibold">Independent and non-official</p>
                <p className="mt-1">
                  BetterSanFernando is not an official City Government website
                  and is not affiliated with or endorsed by the City Government
                  unless a future verified relationship is explicitly
                  documented.
                </p>
              </aside>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,48rem)] lg:gap-14">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                Why the project exists
              </h2>
            </div>
            <div className="space-y-4 text-base leading-7 text-gray-700">
              <p>
                Public civic information is often published across different
                official pages, documents, archives, and government systems.
                That can make related information difficult to find together,
                compare, or trace back to the record that supports it.
              </p>
              <p>
                BetterSanFernando organizes verified public records into clearer
                user-facing pages while keeping source links visible. It is a
                navigation and interpretation layer, not a replacement for
                official sources.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,48rem)] lg:gap-14">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                  How information is published
                </h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  A short trust path connects what the site says to evidence
                  readers can inspect.
                </p>
              </div>
              <div>
                <ol className="grid overflow-hidden rounded-xl shadow-[0_10px_32px_rgba(0,41,94,0.09)] sm:grid-cols-3">
                  {trustSteps.map(([label, description, Icon], index) => (
                    <li
                      key={label}
                      className={`p-5 text-white sm:p-6 ${index === 1 ? 'bg-primary-900' : 'bg-primary-800'} ${index > 0 ? 'border-t border-primary-700 sm:border-l sm:border-t-0' : ''}`}
                    >
                      <Icon
                        className="h-5 w-5 text-primary-200"
                        aria-hidden="true"
                      />
                      <p className="mt-4 font-bold">{label}</p>
                      <p className="mt-1 text-sm leading-6 text-primary-100">
                        {description}
                      </p>
                    </li>
                  ))}
                </ol>

                <ul className="mt-8 divide-y divide-gray-200 border-y border-gray-200">
                  {principles.map(principle => (
                    <li
                      key={principle}
                      className="flex items-start gap-3 py-3.5 text-sm leading-6 text-gray-700"
                    >
                      <ShieldCheck
                        className="mt-0.5 h-5 w-5 shrink-0 text-primary-700"
                        aria-hidden="true"
                      />
                      {principle}
                    </li>
                  ))}
                </ul>

                <p className="mt-5 text-sm leading-6 text-gray-700">
                  Missing data is not treated as zero, and gaps are not silently
                  filled with assumptions. Read the full{' '}
                  <Link
                    to="/transparency/methodology"
                    className="font-bold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                  >
                    publication methodology
                  </Link>{' '}
                  for the verification and limitation rules.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,48rem)] lg:gap-14">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                Current scope
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Published coverage grows only when information can be supported
                and presented responsibly.
              </p>
            </div>
            <div>
              <div className="divide-y divide-gray-200 border-y border-gray-200">
                {scopeAreas.map(([title, description]) => (
                  <div
                    key={title}
                    className="py-5 sm:grid sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-6"
                  >
                    <h3 className="font-bold text-gray-900">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-700 sm:mt-0">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm leading-6 text-gray-700">
                These areas describe current published scope, not every City
                dataset or government record. Browse the{' '}
                <Link
                  to="/transparency/sources"
                  className="font-bold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  source inventory
                </Link>{' '}
                to see what supports each available domain.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <div className="grid gap-6 rounded-xl bg-warning-50 p-6 text-warning-950 md:p-8 lg:grid-cols-[3rem_minmax(0,1fr)]">
              <CircleAlert className="h-7 w-7" aria-hidden="true" />
              <div className="max-w-[72ch]">
                <h2 className="text-2xl font-bold">Limitations</h2>
                <div className="mt-3 space-y-3 text-sm leading-6">
                  <p>
                    Coverage is incomplete. Some public records are not yet
                    available in a frontend-safe form, and some domains still
                    require research or publication review.
                  </p>
                  <p>
                    Absence from BetterSanFernando does not mean that a record,
                    office, service, or document does not exist. Source
                    availability and official publication practices can change,
                    so readers should confirm time-sensitive information through
                    the linked source when possible.
                  </p>
                </div>
                <Link
                  to="/transparency/methodology"
                  className="mt-5 inline-flex min-h-11 items-center gap-2 font-bold underline decoration-warning-300 underline-offset-4 hover:text-warning-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warning-700"
                >
                  Review data limitations
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 md:py-14">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="flex items-center gap-3">
                <Landmark
                  className="h-6 w-6 text-primary-700"
                  aria-hidden="true"
                />
                <h2 className="text-2xl font-bold text-gray-900">
                  Independence and attribution
                </h2>
              </div>
              <p className="mt-4 max-w-[68ch] text-sm leading-6 text-gray-700">
                BetterSanFernando independently organizes and presents public
                information. Government names, documents, logos, and source
                material remain attributable to their respective official
                sources; the project does not claim official authorship of
                government records or use government seals to imply official
                status.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <UsersRound
                  className="h-6 w-6 text-primary-700"
                  aria-hidden="true"
                />
                <h2 className="text-2xl font-bold text-gray-900">
                  A community civic project
                </h2>
              </div>
              <p className="mt-4 max-w-[68ch] text-sm leading-6 text-gray-700">
                BetterSanFernando is community-maintained and guided by
                accuracy, accessibility, mobile usability, neutrality, minimal
                personal data, and explicit handling of uncertainty.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-gray-200 bg-primary-900 text-white">
          <div className="container mx-auto px-4 py-10 md:py-12">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="max-w-2xl">
                <Scale
                  className="h-7 w-7 text-primary-200"
                  aria-hidden="true"
                />
                <h2 className="mt-4 text-2xl font-bold md:text-3xl">
                  Inspect the information for yourself
                </h2>
                <p className="mt-2 text-sm leading-6 text-primary-100">
                  Start with published sources and methodology, or continue to
                  the site’s current government and project information.
                </p>
              </div>
              <nav
                aria-label="About page next steps"
                className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold"
              >
                {[
                  ['/transparency/sources', 'Explore Sources'],
                  ['/transparency/methodology', 'Read Methodology'],
                  ['/government', 'Browse Government'],
                  ['/projects', 'Explore Projects'],
                ].map(([href, label]) => (
                  <Link
                    key={href}
                    to={href}
                    className="inline-flex min-h-11 items-center gap-1.5 text-white underline decoration-primary-400 underline-offset-4 hover:text-primary-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {label}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
