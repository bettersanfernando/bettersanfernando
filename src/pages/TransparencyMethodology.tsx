import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Database,
  ExternalLink,
  FileCheck2,
  LockKeyhole,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Section from '../components/ui/Section';
import SEO from '../components/SEO';
import { getTransparencySourceInventory } from '../data/civic/transparencySources';

const SECTION_LINKS = [
  ['trust-authority', 'Trust and source authority'],
  ['verification', 'Verification workflow'],
  ['normalization', 'Normalization'],
  ['claim-boundaries', 'Evidence and claims'],
  ['publication-boundary', 'Privacy and publication'],
  ['versioned-releases', 'Versioned releases'],
  ['domain-limitations', 'Limits by domain'],
  ['limitations', 'Data limitations'],
] as const;

const VERIFICATION_STEPS = [
  [
    'Locate a public source',
    'Start with a relevant public page, document, archive, or dataset and identify who published it.',
  ],
  [
    'Preserve source identity',
    'Keep the publisher, source authority, reference period, and public link attached to the record.',
  ],
  [
    'Extract supported facts',
    'Record only the fields the source actually establishes; unrelated claims do not inherit its authority.',
  ],
  [
    'Normalize without changing meaning',
    'Represent dates, identifiers, amounts, places, and documentary states consistently while retaining their original meaning.',
  ],
  [
    'Validate relationships and totals',
    'Check identities, references, joins, expected totals, and cross-dataset consistency before publication.',
  ],
  [
    'Keep uncertainty visible',
    'Leave unsupported values unknown, preserve meaningful distinctions, and state the dataset’s coverage.',
  ],
  [
    'Publish reviewed fields only',
    'Move only approved, frontend-safe fields into a versioned public export used by the website.',
  ],
  [
    'Keep the trust path open',
    'Where available, retain a public link so readers can inspect the source behind a published fact.',
  ],
] as const;

const AUTHORITY_ROWS = [
  [
    'Population and PSGC identity',
    'Philippine Statistics Authority',
    'Supports the 2024 POPCEN population baseline, official names, codes, and classifications.',
  ],
  [
    'Geographic polygons',
    'Community-maintained geography source',
    'Supplies polygon geometry. It is not presented as an official PSA shapefile.',
  ],
  [
    'Project evidence',
    'Record-specific primary official publishers',
    'Authority and public links remain attached to each evidence record and documentary stage.',
  ],
  [
    'City offices',
    'Record-specific City Government sources',
    'Office identity and contact fields retain the public sources used for each directory record.',
  ],
] as const;

const NORMALIZATION_ROWS = [
  [
    'Documentary state',
    'AWARDED is not CONTRACTED. Each state describes the strongest published documentary evidence, not physical progress.',
  ],
  [
    'Financial meaning',
    'ABC is not a winning bid, contract amount, or actual expenditure. These values describe different stages and remain separate.',
  ],
  [
    'Missing values',
    'Unknown is not zero. An unavailable value stays absent or is shown as “Not specified.”',
  ],
  [
    'Place',
    'Missing barangay attribution is not converted into an invented location or map point.',
  ],
  [
    'Identifiers',
    'Project IDs, APP codes, procurement references, PhilGEPS references, contract numbers, and source identifiers retain separate namespaces.',
  ],
] as const;

function MethodSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-gray-300 pt-10">
      <h2 className="text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl">
        {title}
      </h2>
      <div className="mt-4 space-y-5 text-base leading-7 text-gray-700">
        {children}
      </div>
    </section>
  );
}

export default function TransparencyMethodology() {
  const inventory = getTransparencySourceInventory();
  const hasUnpublishedFinance = inventory.unavailableDomains.some(
    domain => domain.id === 'finance' && domain.status === 'NOT_EXPORTED'
  );
  const hasUnpublishedDisclosure = inventory.unavailableDomains.some(
    domain =>
      domain.id === 'full-disclosure' && domain.status === 'NOT_EXPORTED'
  );

  return (
    <>
      <SEO
        title="Transparency Methodology"
        description="How BetterSanFernando sources, verifies, normalizes, limits, and responsibly publishes civic information."
        keywords="civic data methodology, data verification, public records, transparency, San Fernando Pampanga"
      />
      <main className="bg-[#f7f8fa] pb-16 md:pb-24">
        <Section className="p-3">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Transparency', href: '/transparency' },
              { label: 'Methodology' },
            ]}
            className="mb-8"
          />

          <header className="max-w-4xl border-b border-gray-300 pb-10">
            <h1 className="text-4xl font-bold tracking-[-0.03em] text-gray-950 sm:text-5xl">
              How BetterSanFernando publishes civic data
            </h1>
            <p className="mt-5 max-w-[72ch] text-lg leading-8 text-gray-700">
              BetterSanFernando is an independent, community-run civic
              information project—not the official City Government website. We
              publish bounded facts only when the current public data model can
              keep them connected to supporting sources and honest limits.
            </p>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-700">
              <span>
                <strong className="text-gray-950">Public export:</strong>{' '}
                <span className="tabular-nums">
                  {inventory.release.exportVersion}
                </span>
              </span>
              <span>
                <strong className="text-gray-950">Source data:</strong>{' '}
                <span className="tabular-nums">
                  {inventory.release.sourceDataVersion}
                </span>
              </span>
              <span>
                <strong className="text-gray-950">Published domains:</strong>{' '}
                <span className="tabular-nums">
                  {inventory.publishedDomains.length}
                </span>
              </span>
            </div>
          </header>

          <div className="mt-10 grid gap-10 xl:grid-cols-[15rem_minmax(0,48rem)] xl:items-start xl:gap-16">
            <nav
              aria-label="Methodology contents"
              className="border-y border-gray-300 py-5 xl:sticky xl:top-24"
            >
              <p className="text-sm font-bold text-gray-950">On this page</p>
              <ol className="mt-3 grid gap-1 sm:grid-cols-2 xl:grid-cols-1">
                {SECTION_LINKS.map(([id, label]) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className="block rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-white hover:text-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ol>
              <Link
                to="/transparency/sources"
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary-700 underline decoration-primary-200 underline-offset-4 hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                Inspect published sources
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </nav>

            <article className="space-y-12">
              <section aria-labelledby="method-summary-heading">
                <h2 id="method-summary-heading" className="sr-only">
                  Methodology summary
                </h2>
                <div className="grid overflow-hidden rounded-xl shadow-[0_10px_32px_rgba(0,41,94,0.09)] sm:grid-cols-3">
                  <div className="bg-primary-800 p-5 text-white sm:p-6">
                    <FileCheck2
                      className="h-5 w-5 text-primary-200"
                      aria-hidden="true"
                    />
                    <p className="mt-4 font-bold">Fact</p>
                    <p className="mt-1 text-sm leading-6 text-primary-100">
                      A value supported by the published record.
                    </p>
                  </div>
                  <div className="bg-primary-900 p-5 text-white sm:p-6">
                    <Database
                      className="h-5 w-5 text-primary-200"
                      aria-hidden="true"
                    />
                    <p className="mt-4 font-bold">Source</p>
                    <p className="mt-1 text-sm leading-6 text-primary-100">
                      Evidence that establishes that fact and its authority.
                    </p>
                  </div>
                  <div className="bg-white p-5 sm:p-6">
                    <ExternalLink
                      className="h-5 w-5 text-primary-700"
                      aria-hidden="true"
                    />
                    <p className="mt-4 font-bold text-gray-950">Public link</p>
                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      A recorded page or document readers can inspect.
                    </p>
                  </div>
                </div>
              </section>

              <MethodSection
                id="trust-authority"
                title="Trust and source authority"
              >
                <p>
                  The public trust path is{' '}
                  <strong className="text-gray-950">
                    fact → source → public link
                  </strong>
                  . A link alone does not establish authority, and no generic
                  “official source” label is applied across every domain.
                </p>
                <div className="divide-y divide-gray-200 border-y border-gray-300">
                  {AUTHORITY_ROWS.map(([domain, authority, role]) => (
                    <dl
                      key={domain}
                      className="grid gap-2 py-4 sm:grid-cols-[11rem_1fr] sm:gap-5"
                    >
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                          Domain
                        </dt>
                        <dd className="mt-1 font-bold text-gray-950">
                          {domain}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-bold text-gray-950">{authority}</dt>
                        <dd className="mt-1 text-sm leading-6">{role}</dd>
                      </div>
                    </dl>
                  ))}
                </div>
                <p>
                  Secondary validation may support identity or context, but it
                  does not silently become a primary publisher. Authority labels
                  remain attached to the role each source actually plays.
                </p>
              </MethodSection>

              <MethodSection
                id="verification"
                title="How information is verified"
              >
                <p>
                  Verification is a sequence of evidence and consistency checks,
                  not a promise that every public record has been found. The
                  website publishes only the reviewed result of this workflow.
                </p>
                <ol className="divide-y divide-gray-200 border-y border-gray-300">
                  {VERIFICATION_STEPS.map(([title, description], index) => (
                    <li
                      key={title}
                      className="grid gap-2 py-4 sm:grid-cols-[2rem_12rem_1fr] sm:gap-4"
                    >
                      <span className="font-bold tabular-nums text-primary-700">
                        {index + 1}
                      </span>
                      <strong className="text-gray-950">{title}</strong>
                      <span className="text-sm leading-6">{description}</span>
                    </li>
                  ))}
                </ol>
              </MethodSection>

              <MethodSection
                id="normalization"
                title="Normalization without changing meaning"
              >
                <p>
                  Public records use different formats and terminology.
                  Normalization makes them comparable and searchable while
                  preserving the distinctions needed to interpret them.
                </p>
                <div className="divide-y divide-gray-200 border-y border-gray-300">
                  {NORMALIZATION_ROWS.map(([concept, rule]) => (
                    <dl
                      key={concept}
                      className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-5"
                    >
                      <dt className="font-bold text-gray-950">{concept}</dt>
                      <dd className="text-sm leading-6">{rule}</dd>
                    </dl>
                  ))}
                </div>
              </MethodSection>

              <MethodSection
                id="claim-boundaries"
                title="Evidence supports bounded claims"
              >
                <p>
                  A source supports only the facts it actually establishes. An
                  award document may support an award decision, bidder, or
                  winning bid. It does not automatically prove contract
                  execution, a Notice to Proceed, completion, physical progress,
                  or actual expenditure.
                </p>
                <div className="flex gap-3 rounded-xl bg-primary-50 p-5 text-gray-950">
                  <Scale
                    className="mt-0.5 h-5 w-5 shrink-0 text-primary-700"
                    aria-hidden="true"
                  />
                  <p className="text-sm leading-6">
                    Missing evidence is not proof that an event never happened.
                    It means the current public dataset does not contain
                    qualifying evidence for that claim.
                  </p>
                </div>
                <p>
                  The detailed project-specific lifecycle, amount, identifier,
                  and linkage rules remain on the{' '}
                  <Link
                    to="/projects/methodology"
                    className="font-bold text-primary-700 underline decoration-primary-200 underline-offset-4 hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                  >
                    Project Methodology page
                  </Link>
                  . Readers can inspect individual records through{' '}
                  <Link
                    to="/projects/sources"
                    className="font-bold text-primary-700 underline decoration-primary-200 underline-offset-4 hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                  >
                    Project Sources
                  </Link>
                  .
                </p>
              </MethodSection>

              <MethodSection
                id="publication-boundary"
                title="Privacy and the publication boundary"
              >
                <p>
                  The public website consumes only reviewed, versioned,
                  frontend-safe exports. Research material may include raw
                  sources, working notes, unresolved records, or information
                  needing additional verification or privacy review. Its
                  existence does not authorize publication.
                </p>
                <div className="grid gap-px overflow-hidden rounded-xl bg-gray-300 sm:grid-cols-2">
                  <div className="bg-white p-5">
                    <CheckCircle2
                      className="h-5 w-5 text-green-700"
                      aria-hidden="true"
                    />
                    <h3 className="mt-3 font-bold text-gray-950">
                      Public frontend export
                    </h3>
                    <p className="mt-2 text-sm leading-6">
                      Reviewed fields, validated relationships, documented
                      coverage, and public source links appropriate for the
                      website.
                    </p>
                  </div>
                  <div className="bg-gray-950 p-5 text-white">
                    <LockKeyhole
                      className="h-5 w-5 text-primary-200"
                      aria-hidden="true"
                    />
                    <h3 className="mt-3 font-bold">Not automatically public</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-300">
                      Unresolved, sensitive, or unreviewed information stays
                      outside the frontend until verification, minimization, and
                      publication decisions support release.
                    </p>
                  </div>
                </div>
                <p>
                  A publicly accessible source does not mean every field should
                  be republished or aggregated. Person-level information may
                  require stronger minimization, maintenance, and publication
                  decisions. BetterSanFernando does not claim that this
                  conservative review is a formal legal compliance program.
                </p>
              </MethodSection>

              <MethodSection
                id="versioned-releases"
                title="Versioned public releases"
              >
                <p>
                  The current website reads source data release{' '}
                  <strong className="tabular-nums text-gray-950">
                    {inventory.release.sourceDataVersion}
                  </strong>{' '}
                  through public export contract{' '}
                  <strong className="tabular-nums text-gray-950">
                    {inventory.release.exportVersion}
                  </strong>
                  . The public manifest declares{' '}
                  <strong className="tabular-nums text-gray-950">
                    {inventory.release.datasetCount} dataset files
                  </strong>{' '}
                  grouped into{' '}
                  <strong className="tabular-nums text-gray-950">
                    {inventory.publishedDomains.length} published domains
                  </strong>
                  .
                </p>
                <p>
                  Versioning makes changes deliberate: the website can validate
                  the expected release, reject unexpected structures, reproduce
                  what a release contained, and avoid silent changes to field
                  meaning. No release date is shown because the current public
                  manifest does not expose one.
                </p>
                <div className="flex gap-3 rounded-xl bg-gray-100 p-5 text-gray-950">
                  <ShieldCheck
                    className="mt-0.5 h-5 w-5 shrink-0 text-primary-700"
                    aria-hidden="true"
                  />
                  <p className="text-sm leading-6">
                    Structured exports are checked for valid identifiers,
                    project-to-evidence relationships, reconciled population
                    totals, PSGC consistency, valid source relationships, and
                    manifest integrity before use. The public page explains the
                    outcome without exposing internal validation values.
                  </p>
                </div>
              </MethodSection>

              <MethodSection
                id="domain-limitations"
                title="Different domains have different limits"
              >
                <div className="divide-y divide-gray-200 border-y border-gray-300">
                  {[
                    [
                      'Projects',
                      'A bounded infrastructure and public-works subset. Lifecycle is documentary, not physical progress, and no verified project point coordinates currently exist.',
                    ],
                    [
                      'Population',
                      'The PSA 2024 POPCEN baseline, not a projection or current-year estimate.',
                    ],
                    [
                      'Geography',
                      'City and barangay polygons come from a community-maintained geometry source and are not official PSA shapefiles.',
                    ],
                    [
                      'Legislation',
                      'Archive coverage varies by document type and period. Absence from BetterSanFernando does not prove that a measure does not exist.',
                    ],
                    [
                      'City offices',
                      'The current published directory is bounded coverage, not necessarily a complete organizational chart.',
                    ],
                    ...(hasUnpublishedFinance && hasUnpublishedDisclosure
                      ? ([
                          [
                            'Finance and Full Disclosure',
                            'Not currently included in the public frontend export. This describes release availability, not whether records exist elsewhere.',
                          ],
                        ] as const)
                      : []),
                  ].map(([domain, limitation]) => (
                    <dl
                      key={domain}
                      className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-5"
                    >
                      <dt className="font-bold text-gray-950">{domain}</dt>
                      <dd className="text-sm leading-6">{limitation}</dd>
                    </dl>
                  ))}
                </div>
              </MethodSection>

              <MethodSection id="limitations" title="Data limitations">
                <p>
                  Limitations define what the published information can
                  responsibly support. They are part of the data, not a footnote
                  to it.
                </p>
                <ul className="space-y-3 pl-5 marker:text-primary-700">
                  <li>
                    Published datasets are bounded and may not represent all
                    City Government activity or complete historical coverage.
                  </li>
                  <li>
                    Source availability, authority, and verification dates vary
                    by domain and record.
                  </li>
                  <li>
                    Different datasets may describe different reference periods
                    and should not be treated as one simultaneous snapshot.
                  </li>
                  <li>
                    Missing records and unsupported fields remain missing rather
                    than becoming zero, inferred events, invented dates,
                    coordinates, officials, or claims of completeness.
                  </li>
                  <li>
                    Some information remains outside the public export because
                    additional verification, privacy review, minimization, or a
                    publication-policy decision is still required.
                  </li>
                  <li>
                    Evidence uncertainty is preserved when a public source
                    supports only metadata, a limited stage, or a bounded claim.
                  </li>
                </ul>
                <div className="flex gap-3 rounded-xl bg-amber-50 p-5 text-amber-950">
                  <CircleAlert
                    className="mt-0.5 h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />
                  <p className="text-sm leading-6">
                    BetterSanFernando prefers visible uncertainty over
                    unsupported certainty. If a fact cannot be supported by the
                    current public record, it is omitted or clearly marked
                    unavailable.
                  </p>
                </div>
              </MethodSection>

              <section
                className="border-t border-gray-300 pt-10"
                aria-labelledby="related-heading"
              >
                <h2
                  id="related-heading"
                  className="text-2xl font-bold tracking-[-0.02em] text-gray-950"
                >
                  Inspect the published record
                </h2>
                <div className="mt-5 grid divide-y divide-gray-200 border-y border-gray-300 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                  {[
                    [
                      '/transparency/sources',
                      'Transparency Sources',
                      'See the current dataset and authority inventory.',
                    ],
                    [
                      '/projects/methodology',
                      'Project Methodology',
                      'Read the detailed project evidence and modeling rules.',
                    ],
                    [
                      '/projects/sources',
                      'Project Sources',
                      'Inspect record-level evidence and public links.',
                    ],
                  ].map(([href, title, description]) => (
                    <Link
                      key={href}
                      to={href}
                      className="group p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                    >
                      <span className="flex items-center justify-between gap-3 font-bold text-gray-950 group-hover:text-primary-700">
                        {title}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="mt-2 block text-sm leading-6 text-gray-700">
                        {description}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            </article>
          </div>
        </Section>
      </main>
    </>
  );
}
