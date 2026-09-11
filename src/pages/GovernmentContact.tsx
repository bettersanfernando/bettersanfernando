import { Link } from 'react-router';
import {
  Building2,
  FileText,
  MapPin,
  Phone,
  ShieldAlert,
  Siren,
  Users,
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import {
  getGovernmentHotlines,
  getGovernmentHotlinesMetadata,
  type HotlineContact,
} from '../data/civic/governmentHotlines';
import { getCityOfficeById, type CityOffice } from '../data/civic/government';

// Stable dataset IDs, not hardcoded numbers — resolved against the reviewed
// government/hotlines.json export so this panel never drifts from it.
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

function twentyFourSevenLabel(contact: HotlineContact) {
  return contact.operating_scope.split(';')[0]?.trim();
}

function EmergencyCard({ contact }: { contact: HotlineContact }) {
  const displayName = contact.alternate_official_label ?? contact.organization;

  return (
    <article className="rounded-xl border border-error-200 bg-error-50 p-5">
      <h3 className="text-sm font-bold leading-snug text-gray-900">
        {displayName}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-gray-700">
        {contact.public_purpose}
      </p>
      <a
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-error-100 px-3 py-2 text-lg font-bold text-error-900 underline-offset-4 hover:underline"
        href={phoneHref(contact.number)}
        aria-label={`Call ${displayName} at ${contact.number}`}
      >
        <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
        {contact.number}
      </a>
      {isPositiveTwentyFourSeven(contact) && (
        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success-100 px-2.5 py-1 text-xs font-bold text-success-800">
          {twentyFourSevenLabel(contact)}
        </span>
      )}
    </article>
  );
}

function GeneralOfficeCard({
  building,
  office,
}: {
  building: string;
  office: CityOffice;
}) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-primary-700">
        {building}
      </p>
      <h3 className="mt-1 text-base font-bold text-gray-900">
        {office.office_name}
      </h3>
      {office.physical_address && (
        <div className="mt-2 flex items-start gap-2 text-sm text-gray-700">
          <MapPin
            className="mt-0.5 h-4 w-4 shrink-0 text-gray-500"
            aria-hidden="true"
          />
          <span>{office.physical_address}</span>
        </div>
      )}
      {office.primary_phone && (
        <a
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 text-base font-semibold text-primary-800 underline-offset-4 hover:underline"
          href={phoneHref(office.primary_phone)}
          aria-label={`Call ${office.office_name} at ${office.primary_phone}`}
        >
          <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
          {office.primary_phone}
          {office.phone_extensions && office.phone_extensions.length > 0 && (
            <span className="text-sm font-normal opacity-80">
              ext. {office.phone_extensions.join(', ')}
            </span>
          )}
        </a>
      )}
    </article>
  );
}

const relatedDestinations = [
  {
    href: '/government/hotlines',
    icon: ShieldAlert,
    label: 'Government Hotlines',
    description: 'All 11 verified emergency and institutional hotlines.',
  },
  {
    href: '/government/barangay-contacts',
    icon: Users,
    label: 'Barangay Contacts',
    description: 'Barangay Secretary and BHERT contacts by barangay.',
  },
  {
    href: '/government/links',
    icon: FileText,
    label: 'Official Government Links',
    description: 'Verified official websites, e-services, and Facebook pages.',
  },
  {
    href: '/services',
    icon: Building2,
    label: 'City Services',
    description: 'Browse published city services by category.',
  },
] as const;

export default function GovernmentContact() {
  return (
    <>
      <SEO
        title="Government Contact"
        description="Quickly find the right verified City Government of San Fernando, Pampanga contact channel — emergency hotlines, general offices, and related directories."
        keywords="San Fernando Pampanga government contact, city hall phone, heroes hall phone, emergency hotline"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/government/contact`}
        siteName="BetterSanFernando"
      />
      <main className="flex-grow bg-gray-50">
        <section className="border-b border-primary-100 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <Breadcrumbs
              className="mb-8"
              items={[
                { label: 'Home', href: '/' },
                { label: 'Government', href: '/government' },
                { label: 'Contact' },
              ]}
            />
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="max-w-3xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
                  <Phone className="h-6 w-6" aria-hidden="true" />
                </div>
                <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                  Government Contact
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
                  A quick, verified starting point for reaching the right City
                  Government office — emergencies, general offices, and where to
                  find more.
                </p>
              </div>
              <aside className="rounded-xl bg-primary-50 p-5 text-sm leading-relaxed text-primary-900">
                <p className="font-semibold">Independent civic portal</p>
                <p className="mt-1">
                  BetterSanFernando is community-run and not the official City
                  Government website. This page lists official City Government
                  contact channels; BetterSanFernando does not receive or
                  forward messages sent to them.
                </p>
              </aside>
            </div>
          </div>
        </section>

        <section
          className="container mx-auto px-4 py-8 md:py-10"
          aria-labelledby="emergency-heading"
        >
          <h2
            id="emergency-heading"
            className="flex items-center gap-2 text-2xl font-bold text-gray-900"
          >
            <Siren className="h-6 w-6 text-error-700" aria-hidden="true" />
            Emergency contacts
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-700">
            In a life-threatening emergency, call 911 or the numbers below
            directly.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {emergencyContacts.map(contact => (
              <EmergencyCard key={contact.id} contact={contact} />
            ))}
          </div>
          <p className="mt-4 max-w-3xl text-xs leading-relaxed text-gray-600">
            {hotlinesMetadata.overallPublicLimitation}
          </p>
          <p className="mt-3 text-sm">
            <Link
              to="/government/hotlines"
              className="font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
            >
              View all 11 verified hotlines
            </Link>
          </p>
        </section>

        <section
          className="border-y border-gray-200 bg-white"
          aria-labelledby="general-offices-heading"
        >
          <div className="container mx-auto px-4 py-8 md:py-10">
            <h2
              id="general-offices-heading"
              className="flex items-center gap-2 text-2xl font-bold text-gray-900"
            >
              <Building2
                className="h-6 w-6 text-primary-700"
                aria-hidden="true"
              />
              General government contacts
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-700">
              General trunk lines for the City's two main office buildings.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {generalOffices.map(({ building, office }) => (
                <GeneralOfficeCard
                  key={office.office_id}
                  building={building}
                  office={office}
                />
              ))}
            </div>
          </div>
        </section>

        <section
          className="container mx-auto px-4 py-8 md:py-10"
          aria-labelledby="find-contact-heading"
        >
          <h2
            id="find-contact-heading"
            className="text-2xl font-bold text-gray-900"
          >
            Find the right contact
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-700">
            Looking for something more specific? These directories cover the
            full published detail for each category.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedDestinations.map(destination => (
              <Link
                key={destination.href}
                to={destination.href}
                className="block rounded-xl border border-gray-200 bg-white p-5 transition hover:border-primary-300 hover:shadow-[0_8px_28px_rgba(0,41,94,0.08)]"
              >
                <destination.icon
                  className="h-6 w-6 text-primary-700"
                  aria-hidden="true"
                />
                <p className="mt-3 text-sm font-bold text-gray-900">
                  {destination.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">
                  {destination.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-8 md:py-10">
            <h2 className="text-lg font-bold text-gray-900">
              Verification and coverage
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700">
              Numbers on this page are officially listed by the City Government
              but have not been independently call-tested by BetterSanFernando.
              This is a concise starting point, not a complete office directory
              —{' '}
              <Link
                to="/government/offices"
                className="font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
              >
                browse the full City Offices directory
              </Link>{' '}
              for every published office record.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
