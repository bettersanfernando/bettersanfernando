import Link from 'next/link';
import {
  Accessibility,
  ArrowUpRight,
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
    <main className="flex-grow bg-white pb-16 md:pb-24">
      <ServiceSearchProvider>
        <section className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-14">
            <Breadcrumbs
              className="text-xs text-gray-500"
              items={[{ label: 'Home', href: '/' }, { label: 'Services' }]}
            />

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_32rem] lg:items-start lg:gap-12">
              <div className="max-w-2xl">
                <p className="text-eyebrow text-[#0066EB]">Services</p>

                <h1 className="mt-3 text-3xl font-extrabold text-display text-gray-950 sm:text-4xl lg:text-5xl">
                  Find the City service you need.
                </h1>

                <p className="mt-4 text-lg font-medium leading-7 text-gray-800 sm:text-xl">
                  Browse reviewed guidance for permits, health, records,
                  assistance, taxes, utilities, and other local services.
                </p>

                <p className="mt-3 text-base leading-7 text-gray-600 md:text-[17px]">
                  BetterSanFernando progressively publishes reviewed guidance
                  and does not yet represent every City service.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-600">
                  <span>{services.length} reviewed services</span>
                  <span>{categories.length} categories</span>
                  <span>Official-source guidance</span>
                </div>
              </div>

              <div className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
                <h2
                  id="service-finder-heading"
                  className="text-sm font-bold text-gray-950"
                >
                  Find a service
                </h2>

                <div className="mt-3">
                  <ServiceSearchInput />
                </div>
              </div>
            </div>
          </div>
        </section>

        <MobileSearchResults />
      </ServiceSearchProvider>

      <div className="container mx-auto space-y-8 px-4 py-8 sm:space-y-12 sm:py-12 lg:space-y-20 lg:py-20">
        <section id="categories" aria-labelledby="categories-heading">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-[#0066EB]">Browse by Need</p>

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

          <div className="mt-7 grid border-l border-t border-gray-200 sm:grid-cols-2">
            {categories.map(([name, slug, description]) => {
              const Icon = categoryIcons[slug] ?? BriefcaseBusiness;
              const count = categoryCounts.get(slug) ?? 0;

              return (
                <Link
                  key={slug}
                  href={`/services/${slug}`}
                  className="group flex min-w-0 items-start gap-3 border-b border-r border-gray-200 p-4 transition-colors hover:bg-[#F3F6FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0066EB] md:p-5"
                >
                  <Icon
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#0066EB]"
                    aria-hidden="true"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-gray-950">
                      {name}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-gray-600">
                      {description}
                    </span>
                    <span className="mt-2 block text-xs text-gray-500">
                      {count} {count === 1 ? 'service' : 'services'}
                    </span>
                  </span>

                  <ArrowUpRight
                    className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0066EB] group-focus-visible:text-[#0066EB]"
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>
        </section>

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

          <div className="mt-6 grid grid-cols-2 border-y border-gray-200 sm:grid-cols-4">
            {whatYoullFind.map(item => (
              <div
                key={item.title}
                className="border-b border-gray-200 px-4 py-5 odd:border-r [&:nth-child(n+3)]:border-b-0 sm:border-b-0 sm:px-5 sm:[&:not(:last-child)]:border-r"
              >
                <item.icon
                  className="h-4 w-4 text-[#0066EB]"
                  aria-hidden="true"
                />
                <p className="mt-3 font-semibold text-gray-950">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="coverage-heading"
          className="border-t border-gray-200 pt-8 sm:pt-9 lg:pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]">Data Provenance</p>

          <h2
            id="coverage-heading"
            className="mt-1 text-xl font-bold text-section-title text-gray-950 md:text-2xl"
          >
            About This Service Directory
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
            BetterSanFernando is an independent civic transparency portal, not
            an official City Government website. Each service record here is
            reviewed from official City or agency sources and organized by
            category so residents can find the right office faster. Coverage is
            progressively published — this directory is not yet a complete
            inventory of every service the City offers.
          </p>

          <Link
            href="/transparency/methodology"
            className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066EB] hover:text-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB] focus-visible:ring-offset-2"
          >
            Read our data methodology
            <ArrowUpRight
              className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </section>
      </div>
    </main>
  );
}
