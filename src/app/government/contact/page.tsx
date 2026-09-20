import Link from 'next/link';
import { ChevronRight, Flame, Radio, Shield, Siren } from 'lucide-react';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getGovernmentHotlines,
  getGovernmentHotlinesMetadata,
  type HotlineContact,
} from '../../../data/civic/governmentHotlines';
import {
  getCityOfficeById,
  type CityOffice,
} from '../../../data/civic/government';
import { buildPageMetadata } from '../../../lib/metadata';

export const metadata = buildPageMetadata({
  title: 'Government Contact',
  description:
    'A quick, verified starting point for reaching the right City Government of San Fernando, Pampanga contact channel — emergency hotlines, general offices, and related directories.',
  path: '/government/contact',
});

// Stable dataset IDs resolved against reviewed datasets so contacts never drift
const EMERGENCY_CONTACT_IDS = [
  'national-911',
  'cdrrmo-command-center-help-line',
  'san-fernando-police-station-primary-hotline',
  'san-fernando-fire-station-hotline',
] as const;

const GENERAL_OFFICE_IDS = [
  { building: 'City Hall', officeId: 'city-government-main' },
  { building: 'Heroes Hall', officeId: 'city-mayors-office' },
] as const;

const eyebrowTracking = { letterSpacing: '0.08em' };

const hotlines = getGovernmentHotlines();
const hotlinesMetadata = getGovernmentHotlinesMetadata();

function resolveHotline(id: string): HotlineContact {
  const contact = hotlines.find(candidate => candidate.id === id);
  if (!contact) {
    throw new Error(`Missing required emergency contact in dataset: ${id}`);
  }
  return contact;
}

const emergencyContacts = EMERGENCY_CONTACT_IDS.map(resolveHotline);

function resolveOffice(officeId: string): CityOffice {
  const office = getCityOfficeById(officeId);
  if (!office) {
    throw new Error(`Missing required office record in dataset: ${officeId}`);
  }
  return office;
}

const generalOffices = GENERAL_OFFICE_IDS.map(entry => ({
  building: entry.building,
  office: resolveOffice(entry.officeId),
}));

function phoneHref(value: string) {
  return `tel:${value.replace(/[^+\d]/g, '')}`;
}

function isPositiveTwentyFourSeven(contact: HotlineContact) {
  return /^24\/7\b/.test(contact.operating_scope);
}

const EMERGENCY_ICONS: Record<string, typeof Siren> = {
  'national-911': Siren,
  'cdrrmo-command-center-help-line': Radio,
  'san-fernando-police-station-primary-hotline': Shield,
  'san-fernando-fire-station-hotline': Flame,
};

const CONTACT_ROUTING_ITEMS = [
  {
    title: 'A specific City office',
    description:
      'Find office phone numbers, email addresses, locations, and official pages.',
    cta: 'Browse City Offices →',
    href: '/government/offices',
  },
  {
    title: 'A barangay contact',
    description:
      "Find published contact information for San Fernando's barangays.",
    cta: 'Browse Barangay Contacts →',
    href: '/government/barangay-contacts',
  },
  {
    title: 'Emergency or institutional numbers',
    description:
      'Review the full set of verified emergency and institutional hotlines.',
    cta: 'View Government Hotlines →',
    href: '/government/hotlines',
  },
  {
    title: 'An official website or online channel',
    description:
      'Open verified City Government websites, portals, and official public channels.',
    cta: 'Browse Official Government Links →',
    href: '/government/links',
  },
];

export default function GovernmentContact() {
  return (
    <main className="bg-white text-gray-900">
      {/* 1. Header / Editorial Intro */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Government', href: '/government' },
              { label: 'Contact' },
            ]}
          />

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
            <div>
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                CONTACT THE CITY
              </p>
              <h1 className="mt-1.5 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl lg:text-4xl">
                Find the right City Government contact
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base sm:leading-7">
                Start with emergency numbers, general City Government contacts,
                or the directory that matches what you need.
              </p>
            </div>

            <aside className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
              <p className="text-eyebrow text-gray-500" style={eyebrowTracking}>
                ABOUT THIS PAGE
              </p>
              <h2 className="mt-1 text-sm font-bold text-gray-950">
                A starting point for public contact
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                BetterSanFernando organizes official public contact channels for
                easier access. It does not receive, answer, or forward calls,
                emails, requests, complaints, or emergency messages.
              </p>
              <p className="mt-3 border-t border-gray-200/80 pt-2 text-[11px] text-gray-500">
                Independent and community-run, not the official City Government
                website.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <div className="container mx-auto space-y-12 px-4 pb-16 sm:space-y-16">
        {/* 2. Emergency Contacts */}
        <section id="emergency-contacts" className="scroll-mt-24 pt-8 sm:pt-10">
          <p className="text-eyebrow text-red-600" style={eyebrowTracking}>
            NEED HELP NOW?
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl">
            Emergency contacts
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
            For an immediate emergency, call 911 or the appropriate local
            response number directly.
          </p>

          {/* Coordinated emergency surface */}
          <div className="mt-6 overflow-hidden rounded-sm border border-red-200 bg-red-50/40">
            <div className="grid grid-cols-1 divide-y divide-red-200 sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
              {emergencyContacts.map((contact, idx) => {
                const displayName =
                  contact.alternate_official_label ?? contact.organization;
                const Icon = EMERGENCY_ICONS[contact.id] ?? Siren;

                return (
                  <article
                    key={contact.id}
                    className={`flex flex-col justify-between p-5 ${
                      idx >= 2
                        ? 'sm:border-t sm:border-red-200 lg:border-t-0'
                        : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-red-700">
                          {contact.id === 'national-911'
                            ? '911 National'
                            : contact.id === 'cdrrmo-command-center-help-line'
                              ? 'CDRRMO'
                              : contact.id ===
                                  'san-fernando-police-station-primary-hotline'
                                ? 'Police'
                                : 'Fire'}
                        </p>
                        <Icon
                          className="h-4 w-4 shrink-0 text-red-600"
                          aria-hidden="true"
                        />
                      </div>

                      <h3 className="mt-1.5 text-sm font-bold text-gray-950">
                        {displayName}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-600">
                        {contact.public_purpose}
                      </p>

                      <p className="mt-3 text-2xl font-extrabold tabular-nums tracking-tight text-red-950 sm:text-3xl">
                        {contact.number}
                      </p>

                      {isPositiveTwentyFourSeven(contact) && (
                        <span className="mt-2 inline-block rounded-sm bg-red-100/80 px-1.5 py-0.5 text-[11px] font-semibold text-red-800">
                          24/7 emergency dispatch
                        </span>
                      )}
                    </div>

                    <div className="mt-4 border-t border-red-200/60 pt-3">
                      <a
                        href={phoneHref(contact.number)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-900 sm:text-sm"
                        aria-label={`Call ${displayName} at ${contact.number}`}
                      >
                        Call →
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-gray-500">
              {hotlinesMetadata.overallPublicLimitation}
            </p>
            <Link
              href="/government/hotlines"
              className="shrink-0 text-xs font-bold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
            >
              View all verified hotlines →
            </Link>
          </div>
        </section>

        {/* 3. General City Contacts */}
        <section
          id="general-city-contacts"
          className="scroll-mt-24 border-t border-gray-200 pt-8 sm:pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            GENERAL CITY CONTACTS
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl">
            Start with a main City office
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
            For general City Government inquiries, these two published contacts
            are useful starting points.
          </p>

          {/* Shared two-column white editorial surface */}
          <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white">
            <div className="grid grid-cols-1 divide-y divide-gray-200 md:grid-cols-2 md:divide-x md:divide-y-0">
              {generalOffices.map(({ building, office }) => (
                <article
                  key={office.office_id}
                  className="flex flex-col justify-between p-5 sm:p-6"
                >
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#0066EB]">
                      {building.toUpperCase()}
                    </p>
                    <h3 className="mt-1 text-base font-bold text-gray-950 sm:text-lg">
                      {office.office_name}
                    </h3>

                    {office.physical_address && (
                      <p className="mt-2 text-xs text-gray-600 sm:text-sm">
                        {office.physical_address}
                      </p>
                    )}

                    {office.primary_phone && (
                      <p className="mt-3 text-lg font-bold tabular-nums text-gray-950 sm:text-xl">
                        {office.primary_phone}
                        {office.phone_extensions &&
                          office.phone_extensions.length > 0 && (
                            <span className="text-xs font-normal text-gray-500 sm:text-sm">
                              {' '}
                              · Ext. {office.phone_extensions.join(', ')}
                            </span>
                          )}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                    {office.primary_phone ? (
                      <a
                        href={phoneHref(office.primary_phone)}
                        className="inline-flex items-center text-xs font-bold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
                        aria-label={`Call ${building} at ${office.primary_phone}`}
                      >
                        Call {building} →
                      </a>
                    ) : null}
                    <Link
                      href={`/government/offices/${office.office_id}`}
                      className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-900"
                    >
                      Office details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2 text-xs sm:text-sm">
            <span className="text-gray-600">Need a specific department?</span>
            <Link
              href="/government/offices"
              className="font-bold text-[#0066EB] hover:text-[#0052BC]"
            >
              Browse all City Offices →
            </Link>
          </div>
        </section>

        {/* 4. Find the Right Contact (What are you looking for?) */}
        <section
          id="contact-routing"
          className="scroll-mt-24 border-t border-gray-200 pt-8 sm:pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            FIND THE RIGHT CONTACT
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl">
            What are you looking for?
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-gray-600 sm:text-sm">
            Choose the directory that best matches who or what you need to
            reach.
          </p>

          {/* Unified 2x2 editorial directory */}
          <div className="mt-6 overflow-hidden rounded-sm border border-gray-200 bg-white">
            <div className="grid grid-cols-1 divide-y divide-gray-200 md:grid-cols-2 md:divide-y-0">
              {CONTACT_ROUTING_ITEMS.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between gap-4 p-5 transition-colors hover:bg-[#F3F6FB] sm:p-6 ${
                    index % 2 === 1 ? 'md:border-l md:border-gray-200' : ''
                  } ${index >= 2 ? 'md:border-t md:border-gray-200' : ''}`}
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-gray-950 group-hover:text-[#0066EB] sm:text-base">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm">
                      {item.description}
                    </p>
                    <p className="mt-2 text-xs font-bold text-[#0066EB]">
                      {item.cta}
                    </p>
                  </div>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#0066EB]"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Before You Contact the City */}
        <section
          id="before-you-contact"
          className="scroll-mt-24 border-t border-gray-200 pt-8 sm:pt-10"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            BEFORE YOU CONTACT THE CITY
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl">
            What to know before reaching out
          </h2>

          {/* Coordinated 3-column editorial strip */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-sm border border-gray-200 bg-white p-5">
              <h3 className="text-sm font-bold text-gray-950 sm:text-base">
                Use the direct channel
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                BetterSanFernando does not receive or forward messages sent to
                City offices.
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5">
              <h3 className="text-sm font-bold text-gray-950 sm:text-base">
                Check the office directory
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                For a specific department, verify its currently published phone,
                email, or official page before contacting it.
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5">
              <h3 className="text-sm font-bold text-gray-950 sm:text-base">
                Published details can change
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                Contact information reflects the official sources currently
                available to BetterSanFernando.
              </p>
            </div>
          </div>
        </section>

        {/* 6. About These Contact Details */}
        <section
          id="about-contact-details"
          className="scroll-mt-24 border-t border-gray-200 pt-8 sm:pt-10 pb-8 sm:pb-10 lg:pb-12"
        >
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            ABOUT THESE CONTACT DETAILS
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-section-title text-gray-950 sm:text-3xl">
            What “verified” means here
          </h2>

          {/* Balanced two-column editorial layout */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <h3 className="text-sm font-bold text-gray-950 sm:text-base">
                Verified from official sources
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                The contact number or office information appears in the official
                public sources recorded by BetterSanFernando.
              </p>
            </div>

            <div className="rounded-sm border border-gray-200 bg-white p-5 sm:p-6">
              <h3 className="text-sm font-bold text-gray-950 sm:text-base">
                Not independently call-tested
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-600 sm:text-sm sm:leading-6">
                Numbers on this page are officially listed by the City
                Government but have not been independently call-tested by
                BetterSanFernando. A listing here does not guarantee that a
                given line is presently staffed or reachable at all times.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-start justify-between gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center">
            <p className="text-xs text-gray-600 sm:text-sm">
              This page is a concise starting point. For office-specific
              details, browse the full City Offices directory.
            </p>
            <Link
              href="/government/offices"
              className="shrink-0 text-xs font-bold text-[#0066EB] hover:text-[#0052BC] sm:text-sm"
            >
              Browse City Offices →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
