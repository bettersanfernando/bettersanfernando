import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  BriefcaseBusiness,
  Building2,
  Database,
  ExternalLink,
  FileCheck2,
  FileText,
  Globe,
  GraduationCap,
  HeartPulse,
  Link2,
  MapPin,
  PhoneCall,
  UsersRound,
} from 'lucide-react';

import HomeSearchForm from './home-search-form';
import HomeCivicMetrics from './home-civic-metrics';
import HomeGeographicDecoration from '../components/home/HomeGeographicDecoration';
import HomeProjectMapSection from '../components/home/HomeProjectMapSection';
import HomeServiceSearch from '../components/home/HomeServiceSearch';

import { getHomeSummary } from '../data/civic/homeSummary';
import { getServices, getServiceCategory } from '../data/civic/services';
import {
  getBarangays,
  getCityTotalPopulation,
} from '../data/civic/demographics';
import { aggregatePopulationStatistics } from '../data/civic/populationStatistics';
import {
  getBarangayBoundaries,
  getCityBoundary,
} from '../data/civic/geography';
import { aggregateProjectsByBarangay } from '../data/civic/projectMap';
import { getProjects } from '../data/civic/projects';
import { getLegislationSummary } from '../data/civic/legislationSummary';
import { getFullDisclosureRecords } from '../data/civic/fullDisclosure';
import { getFinanceReports } from '../data/civic/finance';
import { absoluteUrl } from '../lib/site-url';

export const metadata = {
  title: 'BetterSanFernando — Public Information for San Fernando, Pampanga',
  description:
    'An independent civic transparency portal that makes verified public information about the City of San Fernando, Pampanga easier to find, understand, and trace back to sources.',
  alternates: { canonical: absoluteUrl('/') },
};

const numberFormatter = new Intl.NumberFormat('en-PH');

export default function Home() {
  const summary = getHomeSummary();
  const services = getServices();
  const projects = getProjects();
  const boundaries = getBarangayBoundaries();
  const cityBoundary = getCityBoundary();
  const distribution = aggregateProjectsByBarangay(projects, boundaries);
  const legislationSummary = getLegislationSummary();
  const fdpRecords = getFullDisclosureRecords();
  const financeReports = getFinanceReports();

  // Population statistics & top 5 most populous barangays
  const populationStats = aggregatePopulationStatistics(
    getBarangays(),
    getCityTotalPopulation()
  );
  const top5Barangays = populationStats.rankedBarangays.slice(0, 5);
  const maxPopulationScale = 35000;

  // Service category counts
  const categoryCounts = new Map<string, number>();
  for (const service of services) {
    const slug = getServiceCategory(service);
    categoryCounts.set(slug, (categoryCounts.get(slug) ?? 0) + 1);
  }

  // Selected major service categories for homepage directory
  const topCategories = [
    {
      slug: 'health-services',
      name: 'Health Services',
      icon: HeartPulse,
      description:
        'Healthcare procedures, certificates, and related public health services.',
      href: '/services/health-services',
    },
    {
      slug: 'assistance-programs',
      name: 'Assistance Programs',
      icon: UsersRound,
      description:
        'Social welfare support, financial aid, and community assistance programs.',
      href: '/services/assistance-programs',
    },
    {
      slug: 'civil-registry',
      name: 'Civil Registry',
      icon: FileText,
      description:
        'Birth, marriage, death, and related civil-registration procedures.',
      href: '/services/civil-registry',
    },
    {
      slug: 'education',
      name: 'Education Services',
      icon: GraduationCap,
      description:
        'Scholarships, school credentials, and educational support programs.',
      href: '/services/education',
    },
    {
      slug: 'business',
      name: 'Business Services',
      icon: BriefcaseBusiness,
      description:
        'Permits, licensing, and other business-related City procedures.',
      href: '/services/business',
    },
    {
      slug: 'employment',
      name: 'Employment',
      icon: Briefcase,
      description:
        'Job facilitation, clearance, and public employment services.',
      href: '/services/employment',
    },
  ];

  const quickSearches = [
    { label: 'Permits', href: '/services?q=permits' },
    { label: 'Civil Registry', href: '/services/civil-registry' },
    { label: 'Health', href: '/services/health-services' },
    { label: 'Assistance', href: '/services/assistance-programs' },
    { label: 'Business', href: '/services/business' },
    { label: 'Education', href: '/services/education' },
  ];

  return (
    <main className="flex-grow bg-white text-gray-900">
      {/* ========================================================================= */}
      {/* 1. HERO — CENTERED, HIGH-IMPACT CIVIC BRAND EXPERIENCE                    */}
      {/* ========================================================================= */}
      <section
        className="relative overflow-hidden bg-[#002EAC] text-white min-h-0 lg:min-h-[clamp(540px,calc(100svh-148px),700px)] xl:min-h-[clamp(620px,calc(100svh-148px),780px)] 2xl:min-h-[clamp(700px,calc(100svh-148px),860px)] lg:flex lg:flex-col lg:justify-center"
        aria-labelledby="hero-heading"
      >
        {/* Real geographic boundary linework watermark (responsive scale and subtle opacity) */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none"
          aria-hidden="true"
        >
          <HomeGeographicDecoration className="h-[115%] sm:h-[125%] md:h-[135%] lg:h-[145%] xl:h-[160%] 2xl:h-[175%] w-auto max-w-none transform translate-y-1 lg:translate-y-2" />
        </div>

        {/* Hero entrance motion CSS — respects prefers-reduced-motion */}
        <style>{`
          @keyframes heroRiseFade {
            from {
              opacity: 0;
              transform: translateY(var(--enter-y, 8px));
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @media (prefers-reduced-motion: no-preference) {
            .animate-hero-brand { animation: heroRiseFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.04s; --enter-y: 6px; }
            .animate-hero-eyebrow { animation: heroRiseFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.09s; --enter-y: 6px; }
            .animate-hero-heading { animation: heroRiseFade 0.65s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.14s; --enter-y: 8px; }
            .animate-hero-copy { animation: heroRiseFade 0.65s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.19s; --enter-y: 0px; }
            .animate-hero-search { animation: heroRiseFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.24s; --enter-y: 10px; }
            .animate-hero-actions { animation: heroRiseFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.29s; --enter-y: 6px; }
            .animate-hero-metrics { animation: heroRiseFade 0.75s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.34s; --enter-y: 8px; }
          }
        `}</style>

        <div className="relative z-10 container mx-auto px-4 py-8 sm:py-10 md:py-12 lg:py-8 xl:py-12 2xl:py-16 text-center">
          {/* Brand Logo */}
          <div className="animate-hero-brand mx-auto flex max-w-[190px] justify-center sm:max-w-[210px] xl:max-w-[230px] 2xl:max-w-[260px]">
            <img
              src="/assets/brand/logos/horizontal/better-san-fernando-horizontal-white-transparent-cropped.png"
              alt="BetterSanFernando"
              className="h-9 sm:h-10 md:h-11 xl:h-12 2xl:h-14 w-auto object-contain"
            />
          </div>

          {/* Location Eyebrow */}
          <p className="animate-hero-eyebrow mt-2.5 sm:mt-3 xl:mt-3.5 font-mono text-xs sm:text-[13px] xl:text-sm 2xl:text-[15px] font-semibold tracking-[0.16em] 2xl:tracking-[0.18em] uppercase text-blue-200/90">
            CITY OF SAN FERNANDO, PAMPANGA
          </p>

          {/* Centered H1 */}
          <h1
            id="hero-heading"
            className="animate-hero-heading mx-auto mt-2.5 sm:mt-3 xl:mt-4 max-w-3xl xl:max-w-4xl 2xl:max-w-5xl text-3xl font-extrabold leading-tight tracking-[-0.03em] text-white sm:text-4xl md:text-[46px] lg:text-[50px] xl:text-[58px] 2xl:text-[66px] lg:leading-[1.12] 2xl:leading-[1.1]"
          >
            Public Information for San Fernando, Made Easier to Use.
          </h1>

          {/* Supporting copy */}
          <p className="animate-hero-copy mx-auto mt-3 sm:mt-3.5 xl:mt-4 max-w-xl xl:max-w-2xl 2xl:max-w-3xl text-sm leading-relaxed text-blue-100 sm:text-base xl:text-lg 2xl:text-xl sm:leading-7 xl:leading-8">
            Find verified public services, projects, government contacts,
            statistics, legislation, and official-source information in one
            place.
          </p>

          {/* Large Central Search Box */}
          <div className="animate-hero-search relative z-30 mt-6 sm:mt-7 xl:mt-8 2xl:mt-9">
            <HomeSearchForm />
          </div>

          {/* Quick Action Shortcuts */}
          <div className="animate-hero-actions relative z-10 mt-4 sm:mt-4.5 xl:mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 xl:gap-3">
            {[
              { label: 'Find a Service', href: '/services' },
              { label: 'Explore Projects', href: '/projects' },
              { label: 'Contact the City', href: '/government/contact' },
              { label: 'View Statistics', href: '/statistics' },
            ].map(action => (
              <Link
                key={action.href}
                href={action.href}
                className="inline-flex items-center gap-1.5 rounded-xs border border-white/20 bg-white/10 px-3 sm:px-3.5 xl:px-4 py-1.5 xl:py-2 text-xs xl:text-sm font-semibold text-white transition-colors hover:bg-white hover:text-[#002EAC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span>{action.label}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            ))}
          </div>

          {/* Civic Snapshot (Integrated horizontal metrics with count-up animation) */}
          <div className="animate-hero-metrics relative z-10">
            <HomeCivicMetrics
              population={summary.population.total}
              barangays={summary.population.barangays}
              projects={summary.projects.total}
              services={services.length}
            />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. TRUST / IDENTITY STRIP                                                 */}
      {/* ========================================================================= */}
      <section
        className="bg-white text-gray-700"
        aria-label="Civic portal trust and independence notice"
      >
        <div className="container mx-auto px-4 py-5 sm:py-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-0 md:divide-x md:divide-gray-200/80">
            {/* Column 1: Independent */}
            <div className="text-left md:pr-8 lg:pr-10 xl:pr-12">
              <p className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">
                INDEPENDENT
              </p>
              <h2 className="mt-1.5 text-sm sm:text-base font-bold tracking-tight text-gray-950">
                Independent & Community-Run
              </h2>
              <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-gray-600">
                BetterSanFernando is{' '}
                <strong className="font-semibold text-gray-800">
                  not an official City Government website
                </strong>
                .
              </p>
            </div>

            {/* Column 2: Place */}
            <div className="text-left md:px-8 lg:px-10 xl:px-12">
              <p className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">
                PLACE
              </p>
              <h2 className="mt-1.5 text-sm sm:text-base font-bold tracking-tight text-gray-950">
                City of San Fernando, Pampanga
              </h2>
              <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-gray-600">
                A resident-facing civic-information portal focused on published
                public information about San Fernando.
              </p>
            </div>

            {/* Column 3: Source Approach */}
            <div className="text-left md:pl-8 lg:pl-10 xl:pl-12">
              <p className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">
                SOURCE APPROACH
              </p>
              <h2 className="mt-1.5 text-sm sm:text-base font-bold tracking-tight text-gray-950">
                Official-Source Information
              </h2>
              <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-gray-600">
                Published information remains connected to inspectable public
                sources and visible scope.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. START HERE — WHAT DO YOU NEED TODAY?                                   */}
      {/* ========================================================================= */}
      <section
        id="start-here"
        className="bg-white py-12 sm:py-14 lg:py-16"
        aria-labelledby="start-here-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">START HERE</p>
            <h2
              id="start-here-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
            >
              What Do You Need Today?
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
              Choose where you want to start.
            </p>
          </div>

          {/* Civic Navigation Board — unified 3x2 grid with internal dividers */}
          <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-gray-200 bg-gray-200 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                num: '01',
                title: 'Find a Service',
                description:
                  'Procedures, requirements, fees, processing times, and responsible offices.',
                cta: 'Browse Services',
                href: '/services',
              },
              {
                num: '02',
                title: 'Check a Project',
                description:
                  'Published infrastructure projects, contracts, and municipal evidence records.',
                cta: 'Explore Projects',
                href: '/projects',
              },
              {
                num: '03',
                title: 'Contact the City',
                description:
                  'Verified telephone lines, emergency hotlines, and office directories.',
                cta: 'Find Contacts',
                href: '/government/contact',
              },
              {
                num: '04',
                title: 'Find Your Barangay',
                description:
                  'Population metrics, classification, and project attribution across 35 barangays.',
                cta: 'Browse Barangays',
                href: '/barangays',
              },
              {
                num: '05',
                title: 'Browse Public Records',
                description:
                  'Full Disclosure reports, data sources, and provenance verification links.',
                cta: 'Explore Records',
                href: '/transparency/sources',
              },
              {
                num: '06',
                title: 'Explore Statistics',
                description:
                  'Authoritative 2024 POPCEN demographics, city profile, and civic metrics.',
                cta: 'View Statistics',
                href: '/statistics',
              },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col justify-between bg-white p-5 sm:p-6 lg:p-7 transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066EB]"
              >
                <div>
                  <span className="font-mono text-xs font-bold tracking-wider text-[#0066EB]">
                    {item.num}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-gray-950 transition-colors group-hover:text-[#0066EB] sm:text-[17px]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                    {item.description}
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-[#0066EB]">
                  <span>{item.cta}</span>
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

      {/* ========================================================================= */}
      {/* 4. CITY SERVICES — FIND A SERVICE                                         */}
      {/* ========================================================================= */}
      <section
        id="services"
        className="bg-white py-12 sm:py-16"
        aria-labelledby="services-heading"
      >
        <div className="container mx-auto px-4">
          {/* Top Area: Single Coherent Vertical Discovery Layout */}
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">CITY SERVICES</p>
            <h2
              id="services-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
            >
              Find a Service
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
              Find requirements, fees, processing times, and responsible offices
              for currently published City services.
            </p>

            {/* Wide Search Field (24–32px gap) */}
            <div className="mt-6 sm:mt-8 w-full">
              <HomeServiceSearch />
            </div>

            {/* Quick Searches — Compact Editorial Text Links (12–16px gap) */}
            <div className="mt-3.5 sm:mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5 text-xs">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-gray-400 shrink-0">
                Quick searches:
              </span>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                {quickSearches.map(item => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="font-medium text-gray-600 transition-colors hover:text-[#0066EB] hover:underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0066EB]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Category Grid — 3 columns desktop, 2 columns tablet, 1 column mobile */}
          <div className="mt-10 sm:mt-12">
            <div className="pb-3">
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-gray-950">
                Service Categories
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topCategories.map(cat => {
                const count = categoryCounts.get(cat.slug) ?? 0;
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.slug}
                    href={cat.href}
                    className="group flex flex-col justify-between rounded-sm border border-gray-200/90 bg-white p-5 transition-colors hover:border-[#0066EB] hover:bg-[#F3F6FB] focus:outline-none focus:ring-2 focus:ring-[#0066EB]/20"
                  >
                    <div>
                      {/* Top Row: Icon + Title on left, Count on top-right */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className="h-[18px] w-[18px] shrink-0 text-[#0066EB] transition-colors"
                            aria-hidden="true"
                          />
                          <h3 className="text-sm font-bold text-gray-950 transition-colors group-hover:text-[#0066EB] sm:text-base truncate">
                            {cat.name}
                          </h3>
                        </div>
                        <span className="shrink-0 font-mono text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                          {count} SERVICES
                        </span>
                      </div>

                      {/* Middle: Short Description */}
                      <p className="mt-3 text-xs leading-relaxed text-gray-600 sm:text-[13px]">
                        {cat.description}
                      </p>
                    </div>

                    {/* Bottom: Browse Category CTA */}
                    <div className="mt-5 flex items-center gap-1.5 border-t border-gray-100 pt-3 text-xs font-semibold text-[#0066EB]">
                      <span>Browse Category</span>
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Service Coverage Area */}
          <div className="mt-12 sm:mt-14 lg:mt-16">
            {/* Layer 1: Coverage Summary */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  SERVICE COVERAGE
                </p>
                <div className="mt-1.5 flex flex-wrap items-baseline gap-2.5 sm:gap-3">
                  <span className="text-3xl font-extrabold tracking-tight tabular-nums text-gray-950 sm:text-4xl">
                    {services.length}
                  </span>
                  <span className="text-base font-bold text-gray-900 sm:text-lg">
                    Resident-Facing Services
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm">
                  Published procedures organized from current City Government
                  sources.
                </p>
              </div>

              <div className="shrink-0 sm:pb-0.5">
                <Link
                  href="/services"
                  className="group inline-flex items-center gap-1.5 text-xs font-bold text-[#0066EB] transition-colors hover:text-[#0052BC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0066EB] sm:text-sm"
                >
                  <span>Browse All Services</span>
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>

            {/* Layer 2: What a Service Record Contains */}
            <div className="mt-7 rounded-sm bg-[#F3F6FB] p-6 sm:mt-8 sm:p-7 lg:p-8">
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-gray-400">
                WHAT A SERVICE RECORD CAN TELL YOU
              </p>
              <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-950 sm:text-sm">
                    Procedures
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                    Steps and requirements
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-950 sm:text-sm">
                    Processing
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                    Published processing durations and schedules
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-950 sm:text-sm">
                    Fees
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                    Applicable fees and payment procedures
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-950 sm:text-sm">
                    Offices
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                    Responsible departments and office locations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. EXPLORE THE CITY — PROJECT MAP                                        */}
      {/* ========================================================================= */}
      <section
        id="project-map-section"
        className="bg-white py-12 sm:py-16"
        aria-labelledby="map-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">EXPLORE THE CITY</p>
            <h2
              id="map-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
            >
              See Projects Across San Fernando
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
              Discover how published municipal project records are distributed
              across San Fernando&rsquo;s 35 barangays.
            </p>
          </div>

          <div className="mt-8">
            <HomeProjectMapSection
              boundaries={boundaries}
              cityBoundary={cityBoundary}
              summaries={distribution.barangays}
              totalProjects={distribution.totalProjects}
              attributedProjects={distribution.attributedProjects}
              unattributedProjects={distribution.unattributedProjects}
            />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. PROJECTS & PROCUREMENT                                                 */}
      {/* ========================================================================= */}
      <section
        id="projects-evidence"
        className="bg-[#F3F6FB]/50 py-12 sm:py-16"
        aria-labelledby="projects-heading"
      >
        <div className="container mx-auto px-4">
          {/* Section Intro */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-eyebrow text-[#0066EB]">PUBLIC PROJECTS</p>
            <h2
              id="projects-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
            >
              Follow Projects From Record to Evidence
            </h2>
            <p className="mx-auto mt-2.5 max-w-xl text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
              BetterSanFernando connects published project records with
              available documentary evidence. Evidence types remain distinct and
              may not exist for every project.
            </p>
          </div>

          {/* Coverage Metrics Rail */}
          <div className="mx-auto mt-8 max-w-2xl border-y border-gray-200/80 py-4 sm:py-5">
            <div className="grid grid-cols-3 divide-x divide-gray-200/80 text-center">
              <div className="px-2 sm:px-4">
                <p className="text-2xl font-extrabold tabular-nums text-gray-950 sm:text-3xl">
                  {summary.projects.total}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-gray-600 sm:text-sm">
                  Published records
                </p>
              </div>
              <div className="px-2 sm:px-4">
                <p className="text-2xl font-extrabold tabular-nums text-gray-950 sm:text-3xl">
                  {summary.projects.evidence}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-gray-600 sm:text-sm">
                  Source documents
                </p>
              </div>
              <div className="px-2 sm:px-4">
                <p className="text-2xl font-extrabold tabular-nums text-gray-950 sm:text-3xl">
                  {summary.projects.bidResults}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-gray-600 sm:text-sm">
                  Procurement notices
                </p>
              </div>
            </div>
          </div>

          {/* Relationship Diagram / Evidence Map */}
          <div className="mt-8 rounded-sm border border-gray-200/90 bg-white p-6 sm:p-8 lg:p-10">
            <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[42fr_48px_58fr] lg:gap-0">
              {/* Anchor: Project Record (Left) */}
              <div className="relative rounded-sm border border-[#0066EB]/30 bg-[#F8FAFC] p-6 sm:p-7">
                <span className="inline-flex items-center rounded-xs bg-[#EBF3FC] px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-[#0066EB]">
                  Anchor
                </span>
                <h3 className="mt-3 text-lg font-bold text-gray-950 sm:text-xl">
                  Project Record
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                  Published project identity, barangay context, type, year, and
                  currently supported fields.
                </p>

                {/* Connector stem from Anchor to central trunk on desktop */}
                <div
                  className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 w-6 h-px bg-gray-300"
                  aria-hidden="true"
                />
              </div>

              {/* Connector Trunk (Center on desktop) */}
              <div
                className="hidden lg:flex relative h-full w-12 items-center justify-center"
                aria-hidden="true"
              >
                {/* Vertical bus line connecting the 3 branches */}
                <div className="absolute top-[16%] bottom-[16%] left-1/2 -translate-x-1/2 w-px bg-gray-300" />
                {/* Central connection node */}
                <div className="relative z-10 h-2 w-2 rounded-full border-2 border-[#0066EB] bg-white" />
              </div>

              {/* Connected Evidence Families (Right) */}
              <div className="space-y-3.5 sm:space-y-4">
                {/* 1. Procurement */}
                <div className="relative rounded-sm border border-gray-200 bg-white p-4.5 sm:p-5 transition-colors hover:border-gray-300">
                  <div
                    className="hidden lg:block absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-px bg-gray-300"
                    aria-hidden="true"
                  />
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-950 sm:text-base">
                      Procurement
                    </h4>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Evidence Family
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                    Procurement notices, BID_RESULTS records, and related
                    procurement references.
                  </p>
                </div>

                {/* 2. Contract & Award */}
                <div className="relative rounded-sm border border-gray-200 bg-white p-4.5 sm:p-5 transition-colors hover:border-gray-300">
                  <div
                    className="hidden lg:block absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-px bg-gray-300"
                    aria-hidden="true"
                  />
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-950 sm:text-base">
                      Contract &amp; Award
                    </h4>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Evidence Family
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                    Award or contract-related evidence where published and
                    linked.
                  </p>
                </div>

                {/* 3. Cost & Utilization */}
                <div className="relative rounded-sm border border-gray-200 bg-white p-4.5 sm:p-5 transition-colors hover:border-gray-300">
                  <div
                    className="hidden lg:block absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-px bg-gray-300"
                    aria-hidden="true"
                  />
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-950 sm:text-base">
                      Cost &amp; Utilization
                    </h4>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      Evidence Family
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                    Separate financial observations where official records
                    support them.
                  </p>
                </div>
              </div>
            </div>

            {/* Evidence Disclaimer / Scope Note */}
            <div className="mt-6 rounded-sm border border-gray-200/80 bg-[#F8FAFC] px-4 py-3 sm:px-5 sm:py-3.5">
              <p className="text-xs leading-relaxed text-gray-600 sm:text-[13px]">
                <span className="font-semibold text-gray-900">Note:</span>{' '}
                Evidence availability varies by project. A missing evidence type
                does not mean the event never occurred, and documentary stages
                are not interchangeable.
              </p>
            </div>
          </div>

          {/* Inspect the Records (2x2 Grid) */}
          <div className="mt-10 sm:mt-12">
            <div className="border-b border-gray-200/80 pb-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-gray-950">
                Inspect the Records
              </h3>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {[
                {
                  title: 'Browse Project Directory',
                  description: 'Browse published project records and details.',
                  href: '/projects',
                },
                {
                  title: 'View Project Map',
                  description:
                    'Explore project-record distribution by barangay.',
                  href: '/projects/map',
                },
                {
                  title: 'Inspect Evidence Sources',
                  description: 'Review documentary sources and provenance.',
                  href: '/projects/sources',
                },
                {
                  title: 'Procurement & Bid Results',
                  description:
                    'Review procurement records, bid results, and awards.',
                  href: '/procurement',
                },
              ].map(tile => (
                <Link
                  key={tile.href}
                  href={tile.href}
                  className="group flex flex-col justify-between rounded-sm border border-gray-200 bg-white p-4.5 transition-all hover:border-[#0066EB] hover:bg-[#F8FAFC] sm:p-5"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-950 transition-colors group-hover:text-[#0066EB] sm:text-[15px]">
                        {tile.title}
                      </h4>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#0066EB]"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                      {tile.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. GOVERNMENT CONTACT ROUTER                                              */}
      {/* ========================================================================= */}
      <section
        id="government-router"
        className="bg-white py-12 sm:py-16"
        aria-labelledby="government-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">CITY GOVERNMENT</p>
            <h2
              id="government-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
            >
              Find the Right Government Contact
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
              Connect with responsible City Hall departments, barangay
              officials, emergency services, and official municipal portals.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Building2,
                title: 'City Offices',
                desc: 'Find office phone numbers, email addresses, and locations across 44 published records.',
                href: '/government/offices',
                action: 'Browse City Offices',
              },
              {
                icon: MapPin,
                title: 'Barangay Contacts',
                desc: 'Find verified contact details and official communications for San Fernando’s 35 barangays.',
                href: '/government/barangay-contacts',
                action: 'Browse Barangays',
              },
              {
                icon: PhoneCall,
                title: 'Hotlines & Emergency',
                desc: 'Review verified emergency numbers, CDRRMO command lines, police, and fire dispatch.',
                href: '/government/hotlines',
                action: 'View Hotlines',
              },
              {
                icon: Globe,
                title: 'Official Portals',
                desc: 'Access verified government URLs, social accounts, and official department pages.',
                href: '/government/links',
                action: 'View Official Links',
              },
            ].map(router => {
              const Icon = router.icon;
              return (
                <Link
                  key={router.href}
                  href={router.href}
                  className="group flex flex-col justify-between rounded-sm border border-gray-200 p-5 transition-colors hover:border-[#0066EB] hover:bg-[#F3F6FB]/30"
                >
                  <div>
                    <Icon
                      className="h-6 w-6 text-[#0066EB]"
                      aria-hidden="true"
                    />
                    <h3 className="mt-3 text-base font-bold text-gray-950 group-hover:text-[#0066EB]">
                      {router.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm">
                      {router.desc}
                    </p>
                  </div>
                  <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-[#0066EB]">
                    <span>{router.action}</span>
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Secondary Navigation — More Government Information */}
          <div className="mt-7 sm:mt-8">
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-gray-400">
              MORE GOVERNMENT INFORMATION
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-3.5 sm:grid-cols-2 sm:gap-4">
              <Link
                href="/government"
                className="group grid grid-cols-[1fr_auto] items-center gap-4 rounded-sm border border-gray-200/80 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-[#F3F6FB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0066EB] sm:p-5"
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-950 transition-colors group-hover:text-[#0066EB] sm:text-base">
                    Government Overview
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm">
                    See the broader City Government directory, offices,
                    structure, and published institutional information.
                  </p>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-[#0066EB]"
                  aria-hidden="true"
                />
              </Link>

              <Link
                href="/government/contact"
                className="group grid grid-cols-[1fr_auto] items-center gap-4 rounded-sm border border-gray-200/80 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-[#F3F6FB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0066EB] sm:p-5"
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-950 transition-colors group-hover:text-[#0066EB] sm:text-base">
                    Contact Directory
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm">
                    Use the complete contact-routing page for offices,
                    barangays, hotlines, and official channels.
                  </p>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-[#0066EB]"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. PEOPLE & BARANGAYS                                                     */}
      {/* ========================================================================= */}
      <section
        id="population"
        className="bg-white py-12 sm:py-16"
        aria-labelledby="people-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">
              PEOPLE &amp; BARANGAYS
            </p>
            <h2
              id="people-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
            >
              Understand the City Beyond the Total Population
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
              Official 2024 POPCEN census findings for the City of San Fernando,
              Pampanga, comparing population distributions across communities.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[58fr_42fr] lg:gap-10 xl:gap-12">
            {/* Left: Population Absolute Scale Comparison */}
            <div className="flex h-auto flex-col rounded-sm border border-gray-200 bg-white p-6 sm:p-7 lg:h-full">
              {/* Chart Heading */}
              <div className="flex items-baseline justify-between">
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-gray-950">
                  Top 5 Most Populous Barangays
                </p>
                <span className="font-mono text-xs text-gray-500">
                  Scale: 0 to 35,000
                </span>
              </div>

              {/* Chart Rows Area: evenly distributed across available vertical space */}
              <div className="mt-6 flex-1 grid grid-rows-5 gap-3.5 sm:gap-4">
                {top5Barangays.map(barangay => {
                  const barWidthPercent =
                    (barangay.population / maxPopulationScale) * 100;
                  return (
                    <div
                      key={barangay.psgc_code}
                      className="flex flex-col justify-center space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-bold text-gray-950">
                          {barangay.rank}. {barangay.name}
                        </span>
                        <span className="font-mono font-bold text-[#0066EB]">
                          {numberFormatter.format(barangay.population)}
                        </span>
                      </div>
                      {/* Absolute Population Scale Bar */}
                      <div className="h-3 w-full rounded-sm bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-[#0066EB] rounded-sm transition-all"
                          style={{ width: `${barWidthPercent}%` }}
                          role="progressbar"
                          aria-valuenow={barangay.population}
                          aria-valuemin={0}
                          aria-valuemax={maxPopulationScale}
                          aria-label={`${barangay.name} population`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Axis Ticks: sits naturally at the bottom */}
              <div className="mt-6 flex justify-between border-t border-gray-100/80 pt-3 font-mono text-[10px] text-gray-400 sm:text-[11px]">
                <span>0</span>
                <span>10,000</span>
                <span>20,000</span>
                <span>30,000</span>
                <span>35,000</span>
              </div>
            </div>

            {/* Right: Population Context Panel */}
            <div className="flex h-auto flex-col rounded-sm border border-gray-200 bg-white p-6 sm:p-7 lg:h-full">
              {/* Panel Header */}
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-gray-950">
                Population Context
              </p>

              <div className="mt-5 flex-1 space-y-6 sm:mt-6 sm:space-y-7">
                {/* Top Metrics: 2 Equal Columns */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      Total Residents
                    </p>
                    <p className="mt-1 text-2xl font-extrabold tabular-nums text-gray-950 sm:text-3xl">
                      {numberFormatter.format(populationStats.totalPopulation)}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">2024 POPCEN</p>
                  </div>
                  <div>
                    <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      Barangays
                    </p>
                    <p className="mt-1 text-2xl font-extrabold tabular-nums text-gray-950 sm:text-3xl">
                      {populationStats.barangayCount}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Complete published set
                    </p>
                  </div>
                </div>

                {/* Dedicated Barangay Classification Row */}
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Barangay Classification
                  </p>
                  <div className="mt-2.5 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xl font-bold tabular-nums text-gray-950 sm:text-2xl">
                        {populationStats.urbanBarangayCount}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-gray-700">
                        Urban
                      </p>
                    </div>
                    <div>
                      <p className="text-xl font-bold tabular-nums text-gray-950 sm:text-2xl">
                        {populationStats.ruralBarangayCount}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-gray-700">
                        Rural
                      </p>
                    </div>
                  </div>
                </div>

                {/* What This Tells Us Block */}
                <div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-gray-950">
                    What This Tells Us
                  </p>
                  <div className="mt-2 space-y-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                    <p>
                      34 of San Fernando&rsquo;s 35 barangays are classified
                      Urban under the published 2024 POPCEN baseline.
                    </p>
                    <p>
                      <strong className="font-semibold text-gray-900">
                        Lourdes is the sole Rural barangay
                      </strong>
                      , with{' '}
                      {numberFormatter.format(
                        populationStats.ruralBarangays[0]?.population ?? 5166
                      )}{' '}
                      residents.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-2 sm:mt-7">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-6">
                  <Link
                    href="/statistics/population"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0066EB] transition-colors hover:text-[#0052BC] sm:text-sm"
                  >
                    <span>Explore Population Statistics</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/barangays"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 transition-colors hover:text-[#0066EB] sm:text-sm"
                  >
                    <span>Browse All Barangays</span>
                    <ArrowRight
                      className="h-3.5 w-3.5 text-gray-400"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. PUBLIC MONEY & TRANSPARENCY                                          */}
      {/* ========================================================================= */}
      <section
        id="transparency"
        className="bg-white py-12 sm:py-16"
        aria-labelledby="transparency-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">
              PUBLIC MONEY &amp; RECORDS
            </p>
            <h2
              id="transparency-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
            >
              Follow the Records Behind Public Spending
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
              Review official financial documentation, disclosure policies, and
              procurement datasets published for public inspection.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Gateway 1: City Finances */}
            <div className="flex flex-col justify-between rounded-sm border border-gray-200 p-5 sm:p-6 transition-colors hover:border-[#0066EB]">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                  City Finances
                </p>
                <h3 className="mt-2 text-base font-bold text-gray-950 sm:text-lg">
                  Financial Reports &amp; Statements
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                  Aggregate official finance reports and carefully comparable
                  observations across {financeReports.length} published records,
                  covering budgets, cash flows, and fund authorizations.
                </p>
              </div>
              <div className="mt-6 border-t border-gray-100 pt-4">
                <Link
                  href="/statistics"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
                >
                  <span>Explore City Finances</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Gateway 2: Full Disclosure Reports */}
            <div className="flex flex-col justify-between rounded-sm border border-gray-200 p-5 sm:p-6 transition-colors hover:border-[#0066EB]">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                  Full Disclosure
                </p>
                <h3 className="mt-2 text-base font-bold text-gray-950 sm:text-lg">
                  Full Disclosure Policy Filings
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                  Published Full Disclosure Policy records and official
                  attachments ({fdpRecords.length} records), including
                  procurement plans, monitoring reports, and trust fund reports.
                </p>
              </div>
              <div className="mt-6 border-t border-gray-100 pt-4">
                <Link
                  href="/transparency"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
                >
                  <span>Browse Full Disclosure</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Gateway 3: Procurement */}
            <div className="flex flex-col justify-between rounded-sm border border-gray-200 p-5 sm:p-6 transition-colors hover:border-[#0066EB]">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                  Procurement
                </p>
                <h3 className="mt-2 text-base font-bold text-gray-950 sm:text-lg">
                  Bids, Awards &amp; Contracts
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                  PhilGEPS postings, {summary.projects.bidResults} BID_RESULTS
                  records, award details, and supporting documents connecting
                  public spending to project records.
                </p>
              </div>
              <div className="mt-6 border-t border-gray-100 pt-4">
                <Link
                  href="/procurement"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
                >
                  <span>View Procurement</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. PUBLIC RECORDS & LEGISLATION                                          */}
      {/* ========================================================================= */}
      <section
        id="legislation-records"
        className="bg-white py-14 sm:py-16 lg:py-20"
        aria-labelledby="records-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-[#0066EB]">PUBLIC RECORDS</p>
            <h2
              id="records-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
            >
              Browse Verified Documents and Legislation
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
              Official public issuances, city legislation, and institutional
              datasets made accessible and verified against primary sources.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 items-stretch gap-6 sm:mt-12 sm:gap-8 lg:grid-cols-2 lg:gap-8 xl:gap-10">
            {/* Left: City Legislation */}
            <div className="flex h-full flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-6 lg:p-7">
              <div>
                {/* Header without harsh divider */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <FileText
                      className="h-4 w-4 text-[#0066EB]"
                      aria-hidden="true"
                    />
                    <h3 className="text-base font-bold text-gray-950 sm:text-lg">
                      City Legislation
                    </h3>
                  </div>
                  <span className="font-mono text-[11px] font-medium tracking-wide text-gray-400">
                    Bounded Archive
                  </span>
                </div>

                {/* Editorial Navigation Rows */}
                <div className="mt-6 space-y-2 sm:space-y-2.5">
                  <Link
                    href="/legislation/executive-orders"
                    className="group flex items-center justify-between rounded-sm p-3 transition-colors hover:bg-[#F3F6FB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0066EB] sm:p-3.5"
                  >
                    <div className="min-w-0 pr-3 sm:pr-4">
                      <h4 className="text-xs font-bold text-gray-900 transition-colors group-hover:text-[#0066EB] sm:text-sm">
                        Executive Orders
                      </h4>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Published Executive Order records with verified source
                        links.
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
                      <span className="font-mono text-xs text-gray-500 tabular-nums">
                        {legislationSummary.executiveOrders.total} records
                      </span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:text-[#0066EB]"
                        aria-hidden="true"
                      />
                    </div>
                  </Link>

                  <Link
                    href="/legislation/ordinances"
                    className="group flex items-center justify-between rounded-sm p-3 transition-colors hover:bg-[#F3F6FB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0066EB] sm:p-3.5"
                  >
                    <div className="min-w-0 pr-3 sm:pr-4">
                      <h4 className="text-xs font-bold text-gray-900 transition-colors group-hover:text-[#0066EB] sm:text-sm">
                        Ordinances
                      </h4>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Published ordinance records with available official
                        references.
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
                      <span className="font-mono text-xs text-gray-500 tabular-nums">
                        {legislationSummary.ordinances.total} records
                      </span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:text-[#0066EB]"
                        aria-hidden="true"
                      />
                    </div>
                  </Link>

                  <Link
                    href="/legislation/resolutions"
                    className="group flex items-center justify-between rounded-sm p-3 transition-colors hover:bg-[#F3F6FB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0066EB] sm:p-3.5"
                  >
                    <div className="min-w-0 pr-3 sm:pr-4">
                      <h4 className="text-xs font-bold text-gray-900 transition-colors group-hover:text-[#0066EB] sm:text-sm">
                        Resolutions
                      </h4>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Currently verified resolution records.
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
                      <span className="font-mono text-xs text-gray-500 tabular-nums">
                        {legislationSummary.resolutions.total} records
                      </span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:text-[#0066EB]"
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Public Record Collections */}
            <div className="flex h-full flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 sm:p-6 lg:p-7">
              <div>
                {/* Header without harsh divider */}
                <div className="flex items-center gap-2.5">
                  <Database
                    className="h-4 w-4 text-[#0066EB]"
                    aria-hidden="true"
                  />
                  <h3 className="text-base font-bold text-gray-950 sm:text-lg">
                    Public Record Collections
                  </h3>
                </div>

                {/* Collection Items with refined hierarchy and soft hover affordance, no hard divide-y */}
                <div className="mt-6 space-y-2 sm:space-y-2.5">
                  <Link
                    href="/transparency"
                    className="group flex items-center justify-between rounded-sm p-3 transition-colors hover:bg-[#F3F6FB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0066EB] sm:p-3.5"
                  >
                    <div className="min-w-0 pr-4">
                      <h4 className="text-xs font-bold text-gray-900 transition-colors group-hover:text-[#0066EB] sm:text-sm">
                        Official Documents
                      </h4>
                      <p className="mt-0.5 text-xs text-gray-500">
                        City Charter issuances, policies, and procedural guides.
                      </p>
                    </div>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:text-[#0066EB]"
                      aria-hidden="true"
                    />
                  </Link>

                  <Link
                    href="/transparency"
                    className="group flex items-center justify-between rounded-sm p-3 transition-colors hover:bg-[#F3F6FB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0066EB] sm:p-3.5"
                  >
                    <div className="min-w-0 pr-4">
                      <h4 className="text-xs font-bold text-gray-900 transition-colors group-hover:text-[#0066EB] sm:text-sm">
                        Full Disclosure Reports
                      </h4>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Procurement plans, monitoring reports, and utilization
                        filings.
                      </p>
                    </div>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:text-[#0066EB]"
                      aria-hidden="true"
                    />
                  </Link>

                  <Link
                    href="/transparency/sources"
                    className="group flex items-center justify-between rounded-sm p-3 transition-colors hover:bg-[#F3F6FB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0066EB] sm:p-3.5"
                  >
                    <div className="min-w-0 pr-4">
                      <h4 className="text-xs font-bold text-gray-900 transition-colors group-hover:text-[#0066EB] sm:text-sm">
                        Data Sources &amp; Provenance
                      </h4>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Inspect the source agency, publisher, and URL for every
                        dataset.
                      </p>
                    </div>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:text-[#0066EB]"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 12. VISIBLE TRUST PATH                                                    */}
      {/* ========================================================================= */}
      <section
        id="trust-path"
        className="bg-[#002EAC] py-12 text-white sm:py-14 lg:py-16"
        aria-labelledby="trust-path-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-blue-200">
              VERIFY THE INFORMATION
            </p>
            <h2
              id="trust-path-heading"
              className="mt-2 text-2xl font-bold tracking-[-0.02em] text-white sm:text-3xl"
            >
              A Visible Path Back to the Source
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-blue-100 sm:text-sm">
              BetterSanFernando establishes clear provenance for published
              facts. Every record links directly back to its original public
              document.
            </p>
          </div>

          {/* Provenance Panels — Equal Height & Width in 1 Row on Desktop */}
          <div className="mt-7 grid grid-cols-1 items-stretch gap-4 sm:mt-8 sm:grid-cols-3 sm:gap-5 lg:gap-6">
            <div className="flex h-full flex-col rounded-sm border border-white/15 bg-white/[0.07] p-5 sm:p-6">
              <FileCheck2
                className="h-5 w-5 text-blue-200/90"
                aria-hidden="true"
              />
              <p className="mt-3 font-mono text-[11px] font-medium tracking-wider text-blue-200/80 uppercase sm:text-xs">
                01 · FACT
              </p>
              <h3 className="mt-1 text-base font-bold text-white sm:text-lg">
                Verified Claim
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-blue-100/90 sm:text-sm">
                A claim supported by an established, published public record.
              </p>
            </div>

            <div className="flex h-full flex-col rounded-sm border border-white/15 bg-white/[0.07] p-5 sm:p-6">
              <Link2 className="h-5 w-5 text-blue-200/90" aria-hidden="true" />
              <p className="mt-3 font-mono text-[11px] font-medium tracking-wider text-blue-200/80 uppercase sm:text-xs">
                02 · SOURCE
              </p>
              <h3 className="mt-1 text-base font-bold text-white sm:text-lg">
                Known Provenance
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-blue-100/90 sm:text-sm">
                The attributable government agency, edition, and source
                document.
              </p>
            </div>

            <div className="flex h-full flex-col rounded-sm border border-white/15 bg-white/[0.07] p-5 sm:p-6">
              <ExternalLink
                className="h-5 w-5 text-blue-200/90"
                aria-hidden="true"
              />
              <p className="mt-3 font-mono text-[11px] font-medium tracking-wider text-blue-200/80 uppercase sm:text-xs">
                03 · OFFICIAL LINK
              </p>
              <h3 className="mt-1 text-base font-bold text-white sm:text-lg">
                Public Inspection
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-blue-100/90 sm:text-sm">
                A public path to inspect the original source directly when
                available.
              </p>
            </div>
          </div>

          {/* Coordinated CTA Pair — Same Height, Consistent Alignment & Arrows */}
          <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/transparency/sources"
              className="group inline-flex items-center justify-center gap-2 rounded-sm bg-white px-5 py-2.5 text-xs font-semibold text-[#002EAC] transition-colors hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 sm:px-6 sm:py-3 sm:text-sm"
            >
              <span>Browse Data Sources</span>
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/transparency/methodology"
              className="group inline-flex items-center justify-center gap-2 rounded-sm border border-white/40 bg-transparent px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 sm:px-6 sm:py-3 sm:text-sm"
            >
              <span>How We Publish Data</span>
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 13. BETTERSANFERNANDO × BETTERGOV                                          */}
      {/* ========================================================================= */}
      <section
        id="community-section"
        className="bg-white py-10 sm:py-12"
        aria-labelledby="community-heading"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 items-center justify-between gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="max-w-2xl">
              <p className="text-eyebrow text-[#0066EB]">
                INDEPENDENT CIVIC INFORMATION
              </p>
              <h2
                id="community-heading"
                className="mt-1 text-xl font-bold tracking-[-0.02em] text-gray-950 sm:text-2xl"
              >
                Part of a Wider Civic-Information Community
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                BetterSanFernando is independent and community-run. It is not
                the official City Government website. It is part of the
                BetterGov.ph community of independent civic-information
                projects.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 rounded-sm border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-900 transition-colors hover:border-gray-300 hover:bg-gray-50 sm:text-sm"
              >
                <span>About BetterSanFernando</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <a
                href="https://bettergov.ph"
                target="_blank"
                rel="noopener noreferrer"
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

      {/* ========================================================================= */}
      {/* 14. KEEP EXPLORING                                                        */}
      {/* ========================================================================= */}
      <section
        id="keep-exploring"
        className="bg-white py-12 pb-24 sm:py-16 sm:pb-28"
        aria-labelledby="explore-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h2
              id="explore-heading"
              className="text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
            >
              Keep Exploring San Fernando
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
              Discover verified municipal datasets and civic directories.
            </p>
          </div>

          {/* Primary Destinations — 3 Equal Cards */}
          <div className="mt-7 grid grid-cols-1 items-stretch gap-4 sm:mt-8 sm:grid-cols-3 sm:gap-5">
            {[
              {
                title: 'Services',
                desc: 'Browse City service guidance by need, from business permits to health assistance.',
                href: '/services',
              },
              {
                title: 'Projects',
                desc: 'Browse published infrastructure and procurement records with supporting evidence.',
                href: '/projects',
              },
              {
                title: 'Government',
                desc: 'Find published office records, institutional contacts, and legislative collections.',
                href: '/government',
              },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex h-full flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 transition-colors hover:border-[#0066EB] hover:bg-[#F8FAFC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0066EB] sm:p-6"
              >
                <div>
                  <h3 className="text-base font-bold text-gray-950 transition-colors group-hover:text-[#0066EB] sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-[#0066EB] sm:text-sm">
                  <span>Enter Directory</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </div>

          {/* Secondary Navigation — More to Explore */}
          <div className="mt-8 sm:mt-10">
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-gray-400">
              MORE TO EXPLORE
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:mt-3.5 sm:grid-cols-6 sm:gap-3 lg:grid-cols-5">
              {[
                {
                  label: 'Statistics',
                  href: '/statistics',
                  tabletSpan: 'sm:col-span-2',
                },
                {
                  label: 'Transparency',
                  href: '/transparency',
                  tabletSpan: 'sm:col-span-2',
                },
                {
                  label: 'Legislation',
                  href: '/legislation',
                  tabletSpan: 'sm:col-span-2',
                },
                {
                  label: 'Barangays',
                  href: '/barangays',
                  tabletSpan: 'sm:col-span-3',
                },
                {
                  label: 'Search',
                  href: '/search',
                  tabletSpan: 'sm:col-span-3',
                },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between rounded-sm border border-gray-200/80 bg-white px-3.5 py-3 transition-colors hover:border-gray-300 hover:bg-[#F3F6FB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0066EB] sm:px-4 sm:py-3.5 ${item.tabletSpan} lg:col-span-1`}
                >
                  <span className="text-xs font-semibold text-gray-900 transition-colors group-hover:text-[#0066EB] sm:text-sm">
                    {item.label}
                  </span>
                  <ArrowRight
                    className="h-3.5 w-3.5 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-[#0066EB]"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
