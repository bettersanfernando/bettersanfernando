import Link from 'next/link';
import { ArrowDown, ArrowRight, ExternalLink, Globe } from 'lucide-react';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { buildPageMetadata } from '../../lib/metadata';
import { getServices } from '../../data/civic/services';
import { getProjects } from '../../data/civic/projects';
import { getProcurementStatistics } from '../../data/civic/procurementStatistics';
import { getCityOffices } from '../../data/civic/government';
import { getBarangays } from '../../data/civic/demographics';
import { getLegislationSummary } from '../../data/civic/legislationSummary';

export const metadata = buildPageMetadata({
  title: 'About BetterSanFernando',
  description:
    'BetterSanFernando makes public information about the City of San Fernando, Pampanga easier to find, understand, and verify.',
  path: '/about',
});

const BETTERGOV_URL = 'https://bettergov.ph';

const COVERAGE_LIMITATION_NOTE =
  'Each collection uses its own unit, coverage, reference period, and limitations. These figures should not be added together as one combined total. These metrics describe current published scope, not every City dataset or government record. Absence from BetterSanFernando does not mean that a record, office, service, or document does not exist.';

export default function About() {
  const servicesCount = getServices().length;
  const projectsCount = getProjects().length;
  const evidenceCount = getProcurementStatistics().evidence.total;
  const officesCount = getCityOffices().length;
  const barangaysCount = getBarangays().length;

  const legSummary = getLegislationSummary();
  const legislationCount =
    legSummary.executiveOrders.total +
    legSummary.ordinances.total +
    legSummary.resolutions.total;

  return (
    <main className="flex-grow bg-white text-gray-900">
      {/* 1. HERO */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12 min-[1180px]:py-16">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[{ label: 'Home', href: '/' }, { label: 'About' }]}
          />

          <div className="mt-5 grid grid-cols-1 gap-6 sm:gap-8 md:gap-9 min-[1180px]:mt-6 min-[1180px]:grid-cols-[54fr_46fr] min-[1180px]:items-center min-[1180px]:gap-16 xl:gap-20">
            {/* Left Column (Controlled measure on desktop, comfortable measure on tablet/mobile) */}
            <div className="w-full max-w-xl md:max-w-[720px] min-[1180px]:max-w-xl">
              <p className="text-eyebrow text-[#0066EB]">
                ABOUT BETTERSANFERNANDO
              </p>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.02em] text-gray-950 sm:text-4xl min-[1180px]:text-5xl">
                Public Information Should Be Easier to Use
              </h1>
              <div className="mt-4 space-y-2 md:max-w-[680px] min-[1180px]:max-w-lg">
                <p className="text-base leading-relaxed text-gray-800 sm:text-lg">
                  BetterSanFernando makes public information about the City of
                  San Fernando, Pampanga easier to find, understand, and verify.
                </p>
                <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                  An independent civic portal organizing public services,
                  projects, government information, records, and official-source
                  data in one place.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4 pt-1">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1.5 rounded-sm bg-[#0066EB] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] sm:text-sm"
                >
                  <span>Explore BetterSanFernando</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>

                <Link
                  href="/transparency/methodology"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
                >
                  <span>How We Publish Data</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Right Column: Restrained Editorial Information Architecture Visual */}
            <div className="w-full max-w-full md:max-w-[800px] min-[1180px]:max-w-none">
              <div className="relative overflow-hidden rounded-sm border border-gray-200/90 bg-[#F3F6FB]/80 p-5 sm:p-6 min-[1180px]:p-7">
                {/* Subtle watermark brand symbol */}
                <img
                  src="/assets/brand/symbols/better-san-fernando-symbol-blue-transparent.svg"
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-10 -right-10 h-56 w-56 opacity-[0.03]"
                />

                <div className="relative z-10 space-y-2.5 sm:space-y-3">
                  {/* Step 1 */}
                  <div className="rounded-sm border border-gray-200 bg-white p-3 text-center">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      ORIGIN
                    </p>
                    <p className="text-xs font-bold text-gray-950 sm:text-sm">
                      Official Sources
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Charters · Documents · Disclosures · Archives
                    </p>
                  </div>

                  {/* Connector */}
                  <div className="flex justify-center py-0.5">
                    <ArrowDown
                      className="h-3.5 w-3.5 text-[#0066EB]"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Step 2: 6 Civic Domains */}
                  <div className="rounded-sm border border-[#0066EB]/30 bg-white p-3.5 text-center">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#0066EB]">
                      BETTERSANFERNANDO ARCHITECTURE
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-1.5 text-[11px] font-semibold text-gray-800">
                      <span className="rounded bg-gray-50 px-1 py-0.5">
                        Services
                      </span>
                      <span className="rounded bg-gray-50 px-1 py-0.5">
                        Projects
                      </span>
                      <span className="rounded bg-gray-50 px-1 py-0.5">
                        Government
                      </span>
                      <span className="rounded bg-gray-50 px-1 py-0.5">
                        Transparency
                      </span>
                      <span className="rounded bg-gray-50 px-1 py-0.5">
                        Statistics
                      </span>
                      <span className="rounded bg-gray-50 px-1 py-0.5">
                        Legislation
                      </span>
                    </div>
                  </div>

                  {/* Connector */}
                  <div className="flex justify-center py-0.5">
                    <ArrowDown
                      className="h-3.5 w-3.5 text-[#0066EB]"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Step 3 */}
                  <div className="rounded-sm border border-gray-200 bg-white p-3 text-center">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#0066EB]">
                      CIVIC RESULT
                    </p>
                    <p className="text-xs font-bold text-gray-950 sm:text-sm">
                      Clearer Public Information
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Searchable · Structured · Verified to Source
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY IT EXISTS */}
      <section
        id="why-it-exists"
        className="border-b border-gray-200 bg-white py-12 sm:py-16"
        aria-labelledby="why-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">WHY IT EXISTS</p>
            <h2
              id="why-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl lg:text-4xl"
            >
              Public Information Should Not Be Difficult to Find Just Because It
              Lives in Different Places
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[54fr_46fr] lg:gap-12 xl:gap-16">
            {/* Left: Narrative & Concluding Statement */}
            <div>
              <div className="space-y-5 text-sm leading-relaxed text-gray-700 sm:space-y-6 sm:text-base sm:leading-7">
                <p>
                  In any local government, public civic information is
                  distributed across many locations. Related facts often reside
                  in Citizen’s Charters, department offices, Full Disclosure
                  postings, procurement notices, PDF files, official government
                  pages, legislation archives, and social accounts.
                </p>
                <p>
                  BetterSanFernando brings those sources into a clearer
                  resident-facing structure while keeping the original evidence
                  visible. It organizes published material so residents,
                  researchers, and civil society can find what they need without
                  first knowing the internal department structure.
                </p>
              </div>

              {/* Concluding Statement: Natural final thought of the narrative */}
              <div className="mt-8 sm:mt-9">
                <p className="text-xl font-semibold leading-snug tracking-[-0.01em] text-gray-950 sm:text-2xl">
                  The goal is not to replace official sources. It is to make
                  them easier to discover, understand, and verify.
                </p>
              </div>
            </div>

            {/* Right: Grouped Editorial Sources List (Natural Content Height) */}
            <div className="rounded-sm border border-gray-200/80 bg-[#F3F6FB]/40 p-4 sm:p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-950 sm:text-sm">
                Public Information Lives Across Many Sources
              </h3>

              <div className="mt-3 divide-y divide-gray-200/70">
                <div className="py-2.5 first:pt-0">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#0066EB]">
                    Service Information
                  </p>
                  <p className="mt-0.5 text-xs text-gray-700 sm:text-sm">
                    Citizen’s Charters · Department Pages
                  </p>
                </div>

                <div className="py-2.5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#0066EB]">
                    Financial &amp; Disclosure Records
                  </p>
                  <p className="mt-0.5 text-xs text-gray-700 sm:text-sm">
                    Full Disclosure Reports · Public Notices
                  </p>
                </div>

                <div className="py-2.5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#0066EB]">
                    Projects &amp; Procurement
                  </p>
                  <p className="mt-0.5 text-xs text-gray-700 sm:text-sm">
                    Procurement Records · Supporting Documents
                  </p>
                </div>

                <div className="py-2.5 last:pb-0">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#0066EB]">
                    Government &amp; Legislation
                  </p>
                  <p className="mt-0.5 text-xs text-gray-700 sm:text-sm">
                    Official Portals · Legislation Archives
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHAT BETTERSANFERNANDO ORGANIZES */}
      <section
        id="what-we-organize"
        className="border-b border-gray-200 bg-white py-12 sm:py-16"
        aria-labelledby="organizes-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">EXPLORE THE PORTAL</p>
            <h2
              id="organizes-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
            >
              What BetterSanFernando Organizes
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
              Published municipal information structured into six primary
              directories:
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 divide-y divide-gray-200 border-y border-gray-200 md:grid-cols-2 md:divide-y-0 md:gap-x-12">
            <div className="divide-y divide-gray-200">
              {[
                {
                  num: '01',
                  title: 'Services',
                  desc: 'Procedures, requirements, fees, responsible offices, and source references.',
                  href: '/services',
                },
                {
                  num: '02',
                  title: 'Projects',
                  desc: 'Published project records, evidence, procurement information, and geography.',
                  href: '/projects',
                },
                {
                  num: '03',
                  title: 'Government',
                  desc: 'Offices, contact channels, hotlines, barangay information, and official destinations.',
                  href: '/government',
                },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between gap-4 py-5 transition-colors hover:text-[#0066EB]"
                >
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-sm font-bold text-[#0066EB]">
                      {item.num}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-[#0066EB]"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>

            <div className="divide-y divide-gray-200">
              {[
                {
                  num: '04',
                  title: 'Transparency',
                  desc: 'Disclosure records, City finances, official documents, sources, and publication methodology.',
                  href: '/transparency',
                },
                {
                  num: '05',
                  title: 'Statistics',
                  desc: 'Population, projects, procurement, legislation, government, and public-record views.',
                  href: '/statistics',
                },
                {
                  num: '06',
                  title: 'Legislation',
                  desc: 'Published Executive Order, Ordinance, and Resolution records.',
                  href: '/legislation',
                },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between gap-4 py-5 transition-colors hover:text-[#0066EB]"
                >
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-sm font-bold text-[#0066EB]">
                      {item.num}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-[#0066EB]"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. BETTERSANFERNANDO TODAY */}
      <section
        id="coverage"
        className="border-b border-gray-200 bg-[#F3F6FB]/60 py-10 sm:py-12"
        aria-labelledby="coverage-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">
              CURRENT PUBLIC COVERAGE
            </p>
            <h2
              id="coverage-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
            >
              BetterSanFernando Today
            </h2>
          </div>

          {/* Wide horizontal factual data strip */}
          <div className="mt-8 border-y border-gray-200 bg-white py-6">
            <div className="grid grid-cols-2 divide-y divide-gray-100 sm:grid-cols-3 sm:divide-y-0 lg:grid-cols-6 lg:divide-x lg:divide-gray-200">
              {[
                {
                  count: servicesCount,
                  label: 'Services',
                  href: '/services',
                },
                {
                  count: projectsCount,
                  label: 'Projects',
                  href: '/projects',
                },
                {
                  count: evidenceCount,
                  label: 'Evidence Records',
                  href: '/projects/sources',
                },
                {
                  count: officesCount,
                  label: 'Offices',
                  href: '/government/offices',
                },
                {
                  count: barangaysCount,
                  label: 'Barangays',
                  href: '/barangays',
                },
                {
                  count: legislationCount,
                  label: 'Legislative Records',
                  href: '/legislation',
                },
              ].map(metric => (
                <Link
                  key={metric.label}
                  href={metric.href}
                  className="group px-4 py-2 text-center transition-colors hover:text-[#0066EB]"
                >
                  <p className="text-2xl font-extrabold tabular-nums tracking-tight text-gray-950 group-hover:text-[#0066EB] sm:text-3xl">
                    {metric.count.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {metric.label}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs leading-relaxed text-gray-500 sm:text-sm">
              {COVERAGE_LIMITATION_NOTE}
            </p>
          </div>
        </div>
      </section>

      {/* 5. PUBLICATION PROCESS */}
      <section
        id="publication-process"
        className="border-b border-gray-200 bg-white py-12 sm:py-16"
        aria-labelledby="process-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">PUBLICATION PROCESS</p>
            <h2
              id="process-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
            >
              From Official Source to Usable Civic Information
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
              How civic information moves through verification and structuring
              before publication:
            </p>
          </div>

          {/* Clean 4-column sequence — NO connecting horizontal lines */}
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {[
              {
                step: '01',
                title: 'FIND THE SOURCE',
                desc: 'Official public page, document, archive, dataset, or attributable source.',
              },
              {
                step: '02',
                title: 'VERIFY THE RECORD',
                desc: 'Authority, identity, dates, references, and supporting facts.',
              },
              {
                step: '03',
                title: 'STRUCTURE THE INFORMATION',
                desc: 'Normalize fields while preserving what the source actually establishes.',
              },
              {
                step: '04',
                title: 'PUBLISH WITH CONTEXT',
                desc: 'Present source, scope, reference period, and limitations.',
              },
            ].map(stage => (
              <div key={stage.step} className="space-y-2">
                <span className="inline-block font-mono text-xl font-extrabold text-[#0066EB]">
                  {stage.step}
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-950 sm:text-sm">
                  {stage.title}
                </h3>
                <p className="text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                  {stage.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/transparency/methodology"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
            >
              <span>Read How We Publish Data</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. OUR APPROACH (Two-Tier Editorial Framework) */}
      <section
        id="our-approach"
        className="border-b border-gray-200 bg-[#F3F6FB]/50 py-12 sm:py-16"
        aria-labelledby="approach-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">OUR APPROACH</p>
            <h2
              id="approach-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
            >
              How BetterSanFernando Approaches Public Information
            </h2>
          </div>

          {/* Tier 1: Principles (4 columns desktop, 2x2 tablet, 1 mobile) */}
          <div className="mt-10 sm:mt-12">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#0066EB]">
              PRINCIPLES
            </p>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {[
                {
                  title: 'Source First',
                  desc: 'Published facts remain connected to their original public source.',
                },
                {
                  title: 'Scope Stays Visible',
                  desc: 'A dataset is presented as what it actually covers — not as something broader.',
                },
                {
                  title: 'Unknown Stays Unknown',
                  desc: 'Missing or unsupported information is not silently guessed or converted into certainty.',
                },
                {
                  title: 'Residents First',
                  desc: 'Information is reorganized around what people are trying to understand or accomplish.',
                },
              ].map(item => (
                <div key={item.title} className="space-y-1.5">
                  <h3 className="text-sm font-bold text-gray-950 sm:text-base">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tier 2: Role of the Portal (Two equal 50/50 columns) */}
          <div className="mt-10 border-t border-gray-200/80 pt-8 sm:mt-12 sm:pt-10">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-gray-950">
              ROLE OF THE PORTAL
            </p>
            <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:gap-16">
              {/* Column 1: What We Do */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-950 sm:text-sm">
                  WHAT WE DO
                </h3>
                <ul className="mt-4 space-y-3 text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                  {[
                    'Organize public information from official sources',
                    'Create resident-friendly directories and statistical views',
                    'Preserve source links and provenance',
                    'Make gaps and limitations visible',
                    'Maintain an independent civic-information portal',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span
                        className="select-none font-bold text-gray-400"
                        aria-hidden="true"
                      >
                        —
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: What We Do Not Do */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 sm:text-sm">
                  WHAT WE DO NOT DO
                </h3>
                <ul className="mt-4 space-y-3 text-xs leading-relaxed text-gray-700 sm:text-sm sm:leading-6">
                  {[
                    'Replace the official City Government website',
                    'Speak on behalf of the City Government',
                    'Create or alter official government records',
                    'Infer unsupported facts',
                    'Receive or process City Government applications, payments, complaints, or emergency requests',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span
                        className="select-none font-bold text-gray-400"
                        aria-hidden="true"
                      >
                        —
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TRUST & INDEPENDENCE (Balanced 50/50 Columns) */}
      <section
        id="trust-and-independence"
        className="border-b border-gray-200 bg-white py-12 sm:py-16"
        aria-labelledby="trust-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">
              TRUST &amp; INDEPENDENCE
            </p>
            <h2
              id="trust-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
            >
              Built for Inspection, Not Authority
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
            {/* Left: Inspect the Evidence */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-950 sm:text-lg">
                Inspect the Evidence
              </h3>
              <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">
                BetterSanFernando keeps the path from published fact to original
                source visible wherever the current public record allows —
                tracing FACT (a claim supported by a record) to SOURCE (its
                provenance) and OFFICIAL LINK (a public inspection path).
              </p>

              <div className="divide-y divide-gray-200 border-y border-gray-200 pt-1">
                <Link
                  href="/transparency/sources"
                  className="group flex items-center justify-between py-3.5 transition-colors hover:text-[#0066EB]"
                >
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-950 group-hover:text-[#0066EB] sm:text-sm">
                      Data Sources
                    </h4>
                    <p className="mt-0.5 text-xs text-gray-500">
                      See where published datasets and records come from.
                    </p>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-[#0066EB]"
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  href="/transparency/methodology"
                  className="group flex items-center justify-between py-3.5 transition-colors hover:text-[#0066EB]"
                >
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-950 group-hover:text-[#0066EB] sm:text-sm">
                      How We Publish Data
                    </h4>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Review verification, normalization, publication
                      boundaries, and limitations.
                    </p>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-[#0066EB]"
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  href="/statistics/public-records"
                  className="group flex items-center justify-between py-3.5 transition-colors hover:text-[#0066EB]"
                >
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-950 group-hover:text-[#0066EB] sm:text-sm">
                      Public Records Statistics
                    </h4>
                    <p className="mt-0.5 text-xs text-gray-500">
                      See what BetterSanFernando currently publishes and what
                      those counts represent.
                    </p>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-[#0066EB]"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>

            {/* Right: Independent by Design */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-950 sm:text-lg">
                Independent by Design
              </h3>
              <div className="divide-y divide-gray-200 border-y border-gray-200 pt-1">
                <div className="py-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-950 sm:text-sm">
                    Not an Official City Government Website
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                    BetterSanFernando is independent and community-run. It is
                    {'not an official City Government website'} and is
                    {'not affiliated with or endorsed by the City Government'}
                    {
                      ' unless a future verified relationship is explicitly documented.'
                    }
                  </p>
                </div>

                <div className="py-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-950 sm:text-sm">
                    Source Links Are Attribution, Not Endorsement
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                    Official-source links identify where information came from;
                    they do not imply government endorsement, partnership, or
                    authorship of BetterSanFernando.
                  </p>
                </div>

                <div className="py-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-950 sm:text-sm">
                    Use Original Sources for Consequential Decisions
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                    For legal, administrative, financial, or otherwise
                    consequential decisions, residents should inspect the linked
                    original public source.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. BETTERGOV.PH COMMUNITY */}
      <section
        id="community"
        className="border-b border-gray-200 bg-[#F3F6FB]/50 py-10 sm:py-12"
        aria-labelledby="community-heading"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 items-center justify-between gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="max-w-2xl">
              <p className="text-eyebrow text-[#0066EB]">
                BETTERGOV.PH COMMUNITY
              </p>
              <h2
                id="community-heading"
                className="mt-1 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
              >
                Part of a Wider Civic-Information Effort
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                BetterSanFernando is part of the BetterGov.ph community of
                independent civic-information projects working to make public
                information easier to access and understand. BetterSanFernando
                is independently built and publicly maintained as an open
                civic-information project.
              </p>
            </div>

            <div>
              <a
                href={BETTERGOV_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-sm border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-900 transition-colors hover:border-gray-300 hover:bg-gray-50 sm:text-sm"
              >
                <Globe className="h-4 w-4 text-[#0066EB]" aria-hidden="true" />
                <span>Visit BetterGov.ph</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 9. START EXPLORING */}
      <section
        id="start-exploring"
        className="bg-white py-12 pb-16 sm:py-16 sm:pb-20 lg:py-20 lg:pb-24"
        aria-labelledby="start-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">START EXPLORING</p>
            <h2
              id="start-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
            >
              Start With the Information You Need
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
              Explore primary public directories and resources across the
              portal:
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                title: 'Browse Services',
                desc: 'Requirements, procedures, and fees for resident transactions.',
                href: '/services',
              },
              {
                title: 'Explore Projects',
                desc: 'Published municipal projects, contracts, and evidence records.',
                href: '/projects',
              },
              {
                title: 'View Government Information',
                desc: 'City offices, hotlines, contacts, and official public channels.',
                href: '/government',
              },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col justify-between rounded-sm border border-gray-200 p-5 transition-colors hover:border-[#0066EB]"
              >
                <div>
                  <h3 className="text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                  <span>Open Directory</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
