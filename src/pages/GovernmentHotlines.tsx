import { Link } from 'react-router';
import {
  AlertTriangle,
  Building2,
  ExternalLink,
  Phone,
  ShieldAlert,
  Siren,
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import {
  getGovernmentHotlineGroups,
  getGovernmentHotlinesMetadata,
  type HotlineContact,
} from '../data/civic/governmentHotlines';

const groups = getGovernmentHotlineGroups();
const metadata = getGovernmentHotlinesMetadata();
const totalContacts = groups.reduce(
  (sum, group) => sum + group.contacts.length,
  0
);

function phoneHref(value: string) {
  return `tel:${value.replace(/[^+\d]/g, '')}`;
}

function isPositiveTwentyFourSeven(contact: HotlineContact) {
  return /^24\/7\b/.test(contact.operating_scope);
}

// The reviewed operating_scope always states its 24/7 claim (if any) as the
// clause before the first semicolon, e.g. "24/7 for emergency call reception
// and dispatch only". Deriving the badge text from that clause keeps it
// accurate per contact instead of hardcoding one contact's wording for all.
function twentyFourSevenLabel(contact: HotlineContact) {
  return contact.operating_scope.split(';')[0]?.trim();
}

function ContactTypeBadge({ contact }: { contact: HotlineContact }) {
  if (contact.contact_type === 'EMERGENCY') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-error-100 px-2.5 py-1 text-xs font-bold text-error-800">
        <Siren className="h-3.5 w-3.5" aria-hidden="true" />
        Emergency dispatch
      </span>
    );
  }
  if (contact.contact_type === 'OFFICE_AND_EMERGENCY_LISTED_TOGETHER') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-100 px-2.5 py-1 text-xs font-bold text-warning-900">
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
        Listed with the Command Center's emergency lines
      </span>
    );
  }
  if (contact.contact_type === 'OFFICE_AND_PUBLIC_SAFETY') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-2.5 py-1 text-xs font-bold text-primary-800">
        <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
        Public-safety contact
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
      <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
      Office contact
    </span>
  );
}

function ContactCard({ contact }: { contact: HotlineContact }) {
  const emergency = contact.contact_type === 'EMERGENCY';

  return (
    <article
      className={`rounded-xl border p-5 ${emergency ? 'border-error-200 bg-error-50' : 'border-gray-200 bg-white'}`}
      aria-labelledby={`${contact.id}-title`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            id={`${contact.id}-title`}
            className="text-base font-bold leading-snug text-gray-900"
          >
            {contact.organization}
          </h3>
          {contact.alternate_official_label && (
            <p className="mt-0.5 text-xs italic text-gray-500">
              Also listed as &ldquo;{contact.alternate_official_label}&rdquo;
            </p>
          )}
          <p className="mt-1 text-sm leading-relaxed text-gray-700">
            {contact.public_purpose}
          </p>
        </div>
        <ContactTypeBadge contact={contact} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-lg font-bold underline-offset-4 hover:underline ${emergency ? 'bg-error-100 text-error-900' : 'bg-primary-50 text-primary-800'}`}
          href={phoneHref(contact.number)}
          aria-label={`Call ${contact.organization} at ${contact.number}`}
        >
          <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
          {contact.number}
          {contact.label && (
            <span className="text-sm font-semibold opacity-80">
              ({contact.label})
            </span>
          )}
        </a>
        {contact.extension && (
          <span className="text-sm text-gray-700">{contact.extension}</span>
        )}
        {isPositiveTwentyFourSeven(contact) && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-100 px-2.5 py-1 text-xs font-bold text-success-800">
            {twentyFourSevenLabel(contact)}
          </span>
        )}
      </div>

      {contact.address && (
        <p className="mt-3 text-sm text-gray-700">{contact.address}</p>
      )}

      <p className="mt-3 text-sm leading-relaxed text-gray-700">
        <span className="font-semibold text-gray-900">Operating scope: </span>
        {contact.operating_scope}
      </p>

      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        Officially listed; not independently call-tested by BetterSanFernando.
      </p>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-gray-200 pt-3 text-xs">
        {contact.sources.map(source => (
          <a
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
          >
            {source.label}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        ))}
      </div>
    </article>
  );
}

export default function GovernmentHotlines() {
  return (
    <>
      <SEO
        title="Government Hotlines"
        description="Find the bounded set of institutional and emergency contact numbers currently reviewed and published by BetterSanFernando for the City of San Fernando, Pampanga."
        keywords="San Fernando Pampanga hotlines, CDRRMO emergency number, government hotlines"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/government/hotlines`}
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
                { label: 'Government Hotlines' },
              ]}
            />
            <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="max-w-3xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-error-700 text-white">
                  <ShieldAlert className="h-6 w-6" aria-hidden="true" />
                </div>
                <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                  Government Hotlines
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
                  A reviewed, bounded set of emergency and institutional contact
                  numbers for the City of San Fernando, Pampanga.
                </p>
              </div>
              <aside className="rounded-xl bg-primary-50 p-5 text-sm leading-relaxed text-primary-900">
                <p className="font-semibold">Independent civic directory</p>
                <p className="mt-1">
                  BetterSanFernando is community-run and not the official City
                  Government website. In a life-threatening emergency, call 911
                  or the numbers below directly.
                </p>
              </aside>
            </div>

            <dl className="mt-9 grid border-y border-gray-200 sm:grid-cols-3">
              {groups.map((group, index) => (
                <div
                  key={group.groupId}
                  className={`p-5 ${index > 0 ? 'border-t border-gray-200 sm:border-l sm:border-t-0' : ''}`}
                >
                  <dt className="text-sm leading-5 text-gray-600">
                    {group.label}
                  </dt>
                  <dd className="mt-1 text-3xl font-bold tabular-nums text-gray-900">
                    {group.contacts.length}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs leading-5 text-gray-600">
              {totalContacts} published contact
              {totalContacts === 1 ? '' : 's'} across {groups.length} groups.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8 md:py-10">
          <div
            className="flex items-start gap-3 rounded-xl bg-warning-50 p-5 text-sm leading-6 text-warning-900"
            role="note"
            aria-labelledby="hotlines-limitation-heading"
          >
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p id="hotlines-limitation-heading" className="font-semibold">
                Before you rely on these numbers
              </p>
              <p className="mt-1">{metadata.overallPublicLimitation}</p>
            </div>
          </div>
        </section>

        {groups.map(group => (
          <section
            key={group.groupId}
            className="container mx-auto px-4 pb-8 md:pb-10"
            aria-labelledby={`${group.groupId}-heading`}
          >
            <h2
              id={`${group.groupId}-heading`}
              className="mb-4 text-2xl font-bold text-gray-900"
            >
              {group.label}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {group.contacts.map(contact => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
            </div>
          </section>
        ))}

        <section className="border-y border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-12">
            <h2 className="text-2xl font-bold text-gray-900">
              About this page's coverage
            </h2>
            <div className="mt-3 max-w-3xl space-y-3 text-sm leading-6 text-gray-700">
              <p>
                This is a bounded, publication-reviewed subset of emergency and
                institutional hotlines, not a complete citywide directory of
                every City office's contact number. Some additional numbers
                remain held pending further verification, such as an unresolved
                landline conflict and a mobile contact that is currently
                confirmed by only one official publisher.
              </p>
              <p>
                Barangay-level, personal, and other not-yet-reviewed City office
                contacts are intentionally not included here. Browse the{' '}
                <Link
                  to="/government/contact"
                  className="font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                >
                  Government Contact Directory
                </Link>{' '}
                for the broader set of published institutional office contacts.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 md:py-12">
          <h2 className="text-2xl font-bold text-gray-900">
            Related information
          </h2>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
            {[
              ['/government/contact', 'Government Contact Directory'],
              ['/government/barangay-contacts', 'Barangay Contacts'],
              ['/government/offices', 'City Offices'],
              ['/services/disaster-preparedness', 'Disaster Preparedness'],
              ['/transparency/sources', 'Published Data Sources'],
            ].map(([href, label]) => (
              <Link
                key={href}
                to={href}
                className="text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
