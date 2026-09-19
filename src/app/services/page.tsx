import Link from 'next/link';
import {
  Accessibility,
  ArrowRight,
  BriefcaseBusiness,
  Briefcase,
  ClipboardList,
  Clock3,
  Construction,
  Droplets,
  FileBadge,
  GraduationCap,
  HandHelping,
  HeartHandshake,
  HeartPulse,
  House,
  Leaf,
  ListChecks,
  ReceiptText,
  ShieldAlert,
  Sprout,
  UserRoundCheck,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { getServiceCategory, getServices } from '../../data/civic/services';
import { buildPageMetadata } from '../../lib/metadata';
import { categories } from './categories';
import ServiceSearchInput, {
  MobileSearchResults,
  ServiceSearchProvider,
} from './service-search';

export const metadata = buildPageMetadata({
  title: 'Services',
  description:
    "Browse BetterSanFernando's progressively published City service guidance by need.",
  path: '/services',
});

const services = getServices();

const categoryCounts = new Map<string, number>();
for (const service of services) {
  const slug = getServiceCategory(service);
  categoryCounts.set(slug, (categoryCounts.get(slug) ?? 0) + 1);
}

const categoryIcons: Record<string, LucideIcon> = {
  business: BriefcaseBusiness,
  employment: Briefcase,
  'health-services': HeartPulse,
  education: GraduationCap,
  'assistance-programs': HandHelping,
  'social-welfare': HeartHandshake,
  'senior-citizens': UserRoundCheck,
  'pwd-services': Accessibility,
  'civil-registry': FileBadge,
  'infrastructure-public-works': Construction,
  'housing-land-use': House,
  'utilities-water': Droplets,
  'property-taxes': ReceiptText,
  'agriculture-fisheries': Sprout,
  environment: Leaf,
  'disaster-preparedness': ShieldAlert,
};

const halfway = Math.ceil(categories.length / 2);
const categoryColumns = [
  categories.slice(0, halfway),
  categories.slice(halfway),
] as const;

const whatYoullFind = [
  {
    icon: ListChecks,
    title: 'Requirements',
    description: 'Exactly what to bring or submit.',
  },
  {
    icon: Clock3,
    title: 'Processing time',
    description: 'How long the transaction typically takes.',
  },
  {
    icon: Wallet,
    title: 'Fees',
    description: 'Published charges, where they apply.',
  },
  {
    icon: ClipboardList,
    title: 'Step-by-step guidance',
    description: 'The client steps for the transaction.',
  },
];

export default function ServicesHubPage() {
  return (
    <main className="flex-grow bg-[#f7f8fa]">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs
            className="text-xs text-gray-500"
            items={[{ label: 'Home', href: '/' }, { label: 'Services' }]}
          />
        </div>
      </div>

      <ServiceSearchProvider>
        {/* Hero */}
        <section className="bg-[#002EAC] text-white">
          <div className="container mx-auto px-4 py-12 md:py-14">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_30rem] lg:items-start lg:gap-12">
              <div className="max-w-2xl">
                <p className="text-eyebrow text-blue-100">Services</p>

                <h1 className="mt-3 text-4xl font-extrabold text-display text-white sm:text-5xl">
                  Find the City service you need
                </h1>

                <p className="mt-4 text-base leading-7 text-blue-100 md:text-[17px]">
                  Browse reviewed guidance for permits, health, records,
                  assistance, taxes, utilities, and other local services.
                  BetterSanFernando progressively publishes reviewed guidance
                  and does not yet represent every service the City offers.
                </p>

                <div className="mt-5 flex flex-wrap items-center divide-x divide-white/20 text-sm font-medium text-blue-100">
                  <span className="pr-3">
                    {services.length} reviewed services
                  </span>
                  <span className="px-3">{categories.length} categories</span>
                  <span className="pl-3">Official-source guidance</span>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 md:p-6">
                <h2
                  id="service-finder-heading"
                  className="text-lg font-bold text-gray-950"
                >
                  Find a service
                </h2>

                <div className="mt-4">
                  <ServiceSearchInput />
                </div>
              </div>
            </div>
          </div>
        </section>

        <MobileSearchResults />
      </ServiceSearchProvider>

      <div className="container mx-auto space-y-16 px-4 py-12 md:py-16">
        {/* Browse by need */}
        <section id="categories" aria-labelledby="categories-heading">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-[#0066EB]">Browse By Need</p>

            <h2
              id="categories-heading"
              className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
            >
              Explore Service Categories
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Each category groups publication-reviewed service guidance by the
              office that provides it.
            </p>
          </div>

          <div className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-white lg:grid lg:grid-cols-2 lg:divide-x lg:divide-gray-200">
            {categoryColumns.map((column, columnIndex) => (
              <div
                key={columnIndex}
                className={
                  columnIndex === 0
                    ? 'divide-y divide-gray-200'
                    : 'divide-y divide-gray-200 border-t border-gray-200 lg:border-t-0'
                }
              >
                {column.map(([name, slug, description]) => {
                  const Icon = categoryIcons[slug] ?? BriefcaseBusiness;
                  const count = categoryCounts.get(slug) ?? 0;

                  return (
                    <Link
                      key={slug}
                      href={`/services/${slug}`}
                      className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066EB] md:p-5"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E6F0FD] text-[#0066EB]">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>

                      <span className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-950">{name}</h3>
                        <p className="mt-0.5 truncate text-sm text-gray-600">
                          {description}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {count} {count === 1 ? 'service' : 'services'}
                        </p>
                      </span>

                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-gray-400"
                        aria-hidden="true"
                      />
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        {/* What you'll find */}
        <section aria-labelledby="what-youll-find-heading">
          <h2
            id="what-youll-find-heading"
            className="text-xl font-bold text-section-title text-gray-950"
          >
            What You&rsquo;ll Find
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Every reviewed service page follows the same structure, drawn
            directly from the official service record.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 sm:grid-cols-4">
            {whatYoullFind.map(item => (
              <div
                key={item.title}
                className="flex flex-col items-start gap-2 bg-white p-5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E6F0FD] text-[#0066EB]">
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="font-semibold text-gray-950">{item.title}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Coverage / provenance */}
        <section
          aria-labelledby="coverage-heading"
          className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8"
        >
          <p className="text-eyebrow text-[#0066EB]">Data Provenance</p>

          <h2
            id="coverage-heading"
            className="mt-1 text-xl font-bold text-section-title text-gray-950 md:text-2xl"
          >
            About This Service Directory
          </h2>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-600">
            BetterSanFernando is an independent civic transparency portal, not
            an official City Government website. Each service record here is
            reviewed from official City or agency sources and organized by
            category so residents can find the right office faster. Coverage is
            progressively published — this directory is not yet a complete
            inventory of every service the City offers.
          </p>

          <Link
            href="/transparency/methodology"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] hover:text-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] focus-visible:ring-offset-2"
          >
            Read our data methodology
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </main>
  );
}
