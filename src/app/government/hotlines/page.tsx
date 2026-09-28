import Link from '../../../components/i18n/LocaleLink';
import {
  Building2,
  ChevronRight,
  ExternalLink,
  Flame,
  Info,
  Phone,
  Shield,
  Siren,
} from 'lucide-react';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import {
  getGovernmentHotlineGroups,
  getGovernmentHotlines,
  getGovernmentHotlinesMetadata,
  type HotlineContact,
  type HotlineGroup,
} from '../../../data/civic/governmentHotlines';
import { buildPageMetadata } from '../../../lib/metadata';
import type { PageT } from '../../../i18n/page-t';
import { getPageT } from '../../../i18n/server';
import { INTL_LOCALES } from '../../../i18n/locale';
import type { LanguageType } from '../../../types';

export async function generateMetadata() {
  const { t, locale } = await getPageT('government-hotlines');
  return buildPageMetadata({
    title: t('Emergency Hotlines'),
    description: t(
      'Review published emergency, disaster-response, public-safety, and related institutional contact numbers for the City of San Fernando, Pampanga.'
    ),
    path: '/government/hotlines',
    locale,
  });
}

const eyebrowTracking = { letterSpacing: '0.08em' };
const contacts = getGovernmentHotlines();
const groups = getGovernmentHotlineGroups();
const metadata = getGovernmentHotlinesMetadata();

const QUICK_CONTACT_IDS = [
  'national-911',
  'cdrrmo-command-center-help-line',
  'cdrrmo-safru-mobile-hotline',
  'san-fernando-police-station-primary-hotline',
  'san-fernando-fire-station-hotline',
] as const;

const QUICK_CONTACT_LABELS = (
  t: PageT
): Record<(typeof QUICK_CONTACT_IDS)[number], string> => ({
  'national-911': '911 National',
  'cdrrmo-command-center-help-line': t('CDRRMO Command Center'),
  'cdrrmo-safru-mobile-hotline': 'SAFRU',
  'san-fernando-police-station-primary-hotline': t('San Fernando Police'),
  'san-fernando-fire-station-hotline': t('San Fernando Fire'),
});

function phoneHref(value: string) {
  return `tel:${value.replace(/[^+\d]/g, '')}`;
}

function formatDate(value: string, locale: LanguageType) {
  return new Intl.DateTimeFormat(INTL_LOCALES[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

function groupById(groupId: HotlineGroup['groupId']) {
  const group = groups.find(candidate => candidate.groupId === groupId);
  if (!group) throw new Error(`Missing hotline group: ${groupId}`);
  return group;
}

function contactById(id: string) {
  const contact = contacts.find(candidate => candidate.id === id);
  if (!contact) throw new Error(`Missing hotline contact: ${id}`);
  return contact;
}

function contactTypeLabel(contact: HotlineContact, t: PageT) {
  switch (contact.contact_type) {
    case 'EMERGENCY':
      return t('Emergency dispatch');
    case 'OFFICE_AND_PUBLIC_SAFETY':
      return t('Public-safety contact');
    case 'OFFICE_AND_EMERGENCY_LISTED_TOGETHER':
      return t('Listed with Command Center contacts');
    default:
      return t('Office contact');
  }
}

async function SourceLinks({ contact }: { contact: HotlineContact }) {
  const { t } = await getPageT('government-hotlines');
  return (
    <div className="text-xs text-gray-500">
      <p>
        {contact.sources.length === 1
          ? t('Official source')
          : `${contact.sources.length} official sources`}
      </p>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
        {contact.sources.map(source => (
          <a
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 underline decoration-gray-300 underline-offset-4 hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
          >
            {contact.sources.length === 1 ? t('Open source') : source.label}
            <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
          </a>
        ))}
      </div>
    </div>
  );
}

async function QuickContact({
  contact,
  label,
  icon: Icon,
  national = false,
}: {
  contact: HotlineContact;
  label: string;
  icon: typeof Siren;
  national?: boolean;
}) {
  const { t } = await getPageT('government-hotlines');
  return (
    <article
      className={
        national
          ? 'flex h-full flex-col p-5 sm:p-6'
          : 'flex h-full flex-col p-5'
      }
    >
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-800">
        <Icon className="h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
        {label}
      </div>
      <a
        href={phoneHref(contact.number)}
        aria-label={t('Call {{organization}} at {{number}}', {
          organization: contact.organization,
          number: contact.number,
        })}
        className="mt-3 inline-block text-3xl font-bold tabular-nums tracking-[-0.02em] text-gray-950 hover:text-red-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
      >
        {contact.number}
      </a>
      <p className="mt-1 text-sm leading-relaxed text-gray-700">
        {contact.public_purpose}
      </p>
      <p className="mt-3 text-xs leading-relaxed text-gray-600">
        {contact.operating_scope}
      </p>
    </article>
  );
}

async function CommandCenterContact({ contact }: { contact: HotlineContact }) {
  const { t } = await getPageT('government-hotlines');
  return (
    <article className="flex h-full flex-col p-5 sm:p-6">
      <a
        href={phoneHref(contact.number)}
        aria-label={t('Call {{organization}} at {{number}}', {
          organization: contact.organization,
          number: contact.number,
        })}
        className="inline-flex items-center gap-2 text-2xl font-bold tabular-nums tracking-[-0.02em] text-gray-950 hover:text-[#0066EB] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
      >
        <Phone className="h-4 w-4 shrink-0 text-[#0066EB]" aria-hidden="true" />
        {contact.number}
      </a>
      {(contact.label || contact.extension) && (
        <p className="mt-1 text-xs text-gray-500">
          {[contact.label, contact.extension].filter(Boolean).join(' · ')}
        </p>
      )}
      <p className="mt-3 text-sm leading-relaxed text-gray-700">
        {contact.public_purpose}
      </p>
      {contact.address && (
        <p className="mt-3 text-xs leading-relaxed text-gray-500">
          {contact.address}
        </p>
      )}
      <p className="mt-3 text-xs leading-relaxed text-gray-600">
        {contact.operating_scope}
      </p>
      <div className="mt-auto pt-5">
        <SourceLinks contact={contact} />
      </div>
    </article>
  );
}

async function RelatedContact({ contact }: { contact: HotlineContact }) {
  const { t } = await getPageT('government-hotlines');
  const Icon =
    contact.contact_type === 'EMERGENCY'
      ? Siren
      : contact.contact_type === 'OFFICE_AND_PUBLIC_SAFETY'
        ? Shield
        : Building2;

  return (
    <article className="p-5 sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,.9fr)_12rem] lg:items-start lg:gap-6">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            <Icon
              className="h-4 w-4 shrink-0 text-[#0066EB]"
              aria-hidden="true"
            />
            {contactTypeLabel(contact, t)}
          </p>
          <h3 className="mt-2 text-base font-semibold text-gray-950">
            {contact.organization}
          </h3>
          {contact.alternate_official_label && (
            <p className="mt-1 text-xs italic text-gray-500">
              {t('Also listed as “{{alternate_official_label}}”', {
                alternate_official_label: contact.alternate_official_label,
              })}
            </p>
          )}
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {contact.public_purpose}
          </p>
        </div>
        <div className="text-xs leading-relaxed text-gray-600">
          {contact.operating_scope}
        </div>
        <div>
          <a
            href={phoneHref(contact.number)}
            aria-label={t('Call {{organization}} at {{number}}', {
              organization: contact.organization,
              number: contact.number,
            })}
            className="inline-flex items-center gap-2 text-xl font-bold tabular-nums tracking-[-0.02em] text-gray-950 hover:text-[#0066EB] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
          >
            <Phone
              className="h-4 w-4 shrink-0 text-[#0066EB]"
              aria-hidden="true"
            />
            {contact.number}
          </a>
          {(contact.label || contact.extension) && (
            <p className="mt-1 text-xs text-gray-500">
              {[contact.label, contact.extension].filter(Boolean).join(' · ')}
            </p>
          )}
          {contact.address && (
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              {contact.address}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4">
        <SourceLinks contact={contact} />
      </div>
    </article>
  );
}

export default async function GovernmentHotlines() {
  const { t, locale } = await getPageT('government-hotlines');
  const commandCenterGroup = groupById('CDRRMO_COMMAND_CENTER_CONTACTS');
  const relatedGroup = groupById('RELATED_EMERGENCY_SERVICE_OFFICE_CONTACTS');
  const quickContacts = QUICK_CONTACT_IDS.map(contactById);
  const [national911, ...localEmergencyContacts] = quickContacts;

  return (
    <main className="bg-white text-gray-900">
      <section className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
          <Breadcrumbs
            items={[
              { label: t('Home'), href: '/' },
              { label: t('Government'), href: '/government' },
              { label: t('Government Hotlines') },
            ]}
          />
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
            <div>
              <p
                className="text-eyebrow text-[#0066EB]"
                style={eyebrowTracking}
              >
                {t('GOVERNMENT HOTLINES')}
              </p>
              <h1 className="mt-1.5 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl lg:text-4xl">
                {t('Emergency and institutional contact numbers')}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base sm:leading-7">
                {t(
                  'Review published emergency, disaster-response, public-safety, and related institutional contact numbers for the City of San Fernando, Pampanga.'
                )}
              </p>
            </div>
            <aside className="rounded-sm border border-gray-200 bg-[#F3F6FB] p-4 sm:p-5">
              <p className="text-eyebrow text-gray-500" style={eyebrowTracking}>
                {t('ABOUT THIS DIRECTORY')}
              </p>
              <h2 className="mt-1 text-sm font-semibold text-gray-950">
                {t('Reviewed public contact subset')}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                {t(
                  'These numbers come from official public sources reviewed by BetterSanFernando. This directory is bounded and does not represent every City Government contact number.'
                )}
              </p>
              <p className="mt-3 border-t border-gray-200 pt-2 text-xs leading-relaxed text-gray-500">
                {t(
                  'BetterSanFernando does not operate these lines and does not independently guarantee that every listed number is continuously staffed or reachable.'
                )}
              </p>
            </aside>
          </div>
          <dl className="mt-8 grid border-y border-gray-200 sm:grid-cols-3">
            {[
              [t('Reviewed contacts'), contacts.length],
              [t('Contact groups'), groups.length],
              [t('Last verified'), formatDate(metadata.lastVerified, locale)],
            ].map(([label, value], index) => (
              <div
                key={String(label)}
                className={`p-4 sm:p-5 ${index > 0 ? 'border-t border-gray-200 sm:border-l sm:border-t-0' : ''}`}
              >
                <dt className="text-xs font-medium text-gray-600 sm:text-sm">
                  {label}
                </dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums tracking-[-0.02em] text-gray-950 sm:text-3xl">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="container mx-auto space-y-12 px-4 py-10 pb-16 sm:space-y-16 sm:pb-20">
        <section aria-labelledby="emergency-heading">
          <p className="text-eyebrow text-red-700" style={eyebrowTracking}>
            {t('NEED HELP NOW?')}
          </p>
          <h2
            id="emergency-heading"
            className="mt-1.5 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
          >
            {t('Emergency contacts')}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
            {t(
              'For an immediate emergency, call 911 or the appropriate local response number directly.'
            )}
          </p>
          <div className="mt-5 overflow-hidden rounded-sm border border-gray-200 bg-white">
            <QuickContact
              contact={national911}
              label={QUICK_CONTACT_LABELS(t)['national-911']}
              icon={Siren}
              national
            />
            <div className="border-t border-gray-200 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-red-800 sm:px-6">
              {t('Local emergency response')}
            </div>
            <div className="grid divide-y divide-gray-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              {localEmergencyContacts.map(contact => {
                const Icon =
                  contact.id === 'san-fernando-police-station-primary-hotline'
                    ? Shield
                    : contact.id === 'san-fernando-fire-station-hotline'
                      ? Flame
                      : Siren;
                return (
                  <QuickContact
                    key={contact.id}
                    contact={contact}
                    label={
                      QUICK_CONTACT_LABELS(t)[
                        contact.id as (typeof QUICK_CONTACT_IDS)[number]
                      ]
                    }
                    icon={Icon}
                  />
                );
              })}
            </div>
          </div>
        </section>

        <section aria-labelledby="difference-heading">
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            {t('HOW THESE CONTACTS DIFFER')}
          </p>
          <h2
            id="difference-heading"
            className="mt-1.5 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
          >
            {t('Not every number serves the same purpose')}
          </h2>
          <div className="mt-5 overflow-hidden rounded-sm border border-gray-200 bg-[#F3F6FB] sm:grid sm:grid-cols-3 sm:divide-x sm:divide-gray-200">
            {[
              [
                t('Emergency dispatch'),
                t(
                  'Numbers explicitly published for emergency response, rescue, police, fire, or dispatch.'
                ),
              ],
              [
                t('Command Center contacts'),
                t(
                  'Additional numbers published with the CDRRMO Command Center. These should not automatically be treated as equivalent to the primary emergency-dispatch line.'
                ),
              ],
              [
                t('Related institutional contacts'),
                t(
                  'Office and public-safety contacts connected to emergency response, health, police, fire, or public safety, but not necessarily documented as primary emergency lines.'
                ),
              ],
            ].map(([heading, copy], index) => (
              <div
                key={heading}
                className={`p-5 ${index > 0 ? 'border-t border-gray-200 sm:border-t-0' : ''}`}
              >
                <h3 className="text-sm font-semibold text-gray-950">
                  {heading}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {copy}
                </p>
              </div>
            ))}
          </div>
        </section>

        <aside
          className="flex items-start gap-3 rounded-sm border border-gray-200 bg-[#F3F6FB] px-4 py-3"
          role="note"
          aria-labelledby="before-you-call-heading"
        >
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-[#0066EB]"
            aria-hidden="true"
          />
          <div>
            <h2
              id="before-you-call-heading"
              className="text-sm font-semibold text-gray-950"
            >
              {t('Before you call')}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-700">
              {metadata.overallPublicLimitation}
            </p>
          </div>
        </aside>

        <section aria-labelledby="command-center-heading">
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            {t('CDRRMO COMMAND CENTER')}
          </p>
          <h2
            id="command-center-heading"
            className="mt-1.5 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
          >
            {t('Additional Command Center contacts')}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
            {t(
              "These numbers are published with the Command Center's contact information. Their role should be read separately from the primary emergency-dispatch number."
            )}
          </p>
          <div className="mt-5 overflow-hidden rounded-sm border border-gray-200 bg-white lg:grid lg:grid-cols-2 lg:items-stretch lg:divide-x lg:divide-y-0 divide-y divide-gray-200">
            {commandCenterGroup.contacts.map(contact => (
              <CommandCenterContact key={contact.id} contact={contact} />
            ))}
          </div>
        </section>

        <section aria-labelledby="related-contacts-heading">
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            {t('RELATED PUBLIC-SAFETY CONTACTS')}
          </p>
          <h2
            id="related-contacts-heading"
            className="mt-1.5 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
          >
            {t('Other institutional contacts')}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
            {t(
              'These contacts are connected to emergency response, health, police, fire, or public safety, but they are not all documented as primary emergency-dispatch lines.'
            )}
          </p>
          <div className="mt-5 divide-y divide-gray-200 overflow-hidden rounded-sm border border-gray-200 bg-white">
            {relatedGroup.contacts.map(contact => (
              <RelatedContact key={contact.id} contact={contact} />
            ))}
          </div>
        </section>

        <section aria-labelledby="coverage-heading">
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            {t('ABOUT THESE CONTACTS')}
          </p>
          <h2
            id="coverage-heading"
            className="mt-1.5 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
          >
            {t('What this directory includes')}
          </h2>
          <div className="mt-5 grid gap-6 md:grid-cols-2 md:divide-x md:divide-gray-200">
            <div className="md:pr-6">
              <h3 className="text-sm font-semibold text-gray-950">
                {t('Included')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t(
                  'Publication-reviewed emergency, disaster-response, public-safety, and related institutional contacts included in the current Government Hotlines dataset.'
                )}
              </p>
            </div>
            <div className="border-t border-gray-200 pt-6 md:border-t-0 md:pt-0 md:pl-6">
              <h3 className="text-sm font-semibold text-gray-950">
                {t('Not necessarily included')}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t(
                  'Every City office number, barangay contact, person-level contact, or candidate number that has not completed publication review. Held unresolved contacts and single-source candidates remain out of this directory.'
                )}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-gray-500">
                {t(
                  'A missing number does not prove that a contact does not exist.'
                )}
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="explore-heading">
          <p className="text-eyebrow text-[#0066EB]" style={eyebrowTracking}>
            {t('KEEP EXPLORING')}
          </p>
          <h2
            id="explore-heading"
            className="mt-1.5 text-2xl font-bold tracking-[-0.02em] text-gray-950 sm:text-3xl"
          >
            {t('Find the right government contact')}
          </h2>
          <div className="mt-5 overflow-hidden rounded-sm border border-gray-200 bg-[#F3F6FB] sm:grid sm:grid-cols-2 sm:divide-x sm:divide-gray-200">
            {[
              [
                '/government/contact',
                t('Contact the City'),
                t(
                  'Start with the quickest routes for emergency, general City Government, office, barangay, and official online contacts.'
                ),
                t('Contact the City'),
              ],
              [
                '/government/offices',
                t('City Offices'),
                t(
                  'Find office-specific phone numbers, email addresses, locations, and official pages.'
                ),
                t('Browse City Offices'),
              ],
            ].map(([href, title, description, cta], index) => (
              <Link
                key={href}
                href={href}
                className={`group block p-5 hover:bg-white ${index > 0 ? 'border-t border-gray-200 sm:border-t-0' : ''}`}
              >
                <h3 className="text-base font-semibold text-gray-950 group-hover:text-[#0066EB]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {description}
                </p>
                <p className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#0066EB]">
                  {cta}{' '}
                  <ChevronRight
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                </p>
              </Link>
            ))}
          </div>
          <p
            className="mt-8 text-eyebrow text-gray-500"
            style={eyebrowTracking}
          >
            {t('RELATED RESOURCES')}
          </p>
          <div className="mt-3 divide-y divide-gray-200 overflow-hidden rounded-sm border border-gray-200 bg-white">
            {[
              [
                '/government/barangay-contacts',
                t('Barangay Contacts'),
                t(
                  "Find published contact information for San Fernando's barangays."
                ),
              ],
              [
                '/government/links',
                t('Official Government Links'),
                t(
                  'Open verified City Government websites, portals, and public channels.'
                ),
              ],
              [
                '/services/disaster-preparedness',
                t('Disaster Preparedness Services'),
                t(
                  'Browse published disaster-preparedness and response-related City services.'
                ),
              ],
            ].map(([href, title, description]) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center justify-between gap-4 p-4 hover:bg-[#F3F6FB]"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-950 group-hover:text-[#0066EB]">
                    {title}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-gray-600 sm:text-sm">
                    {description}
                  </span>
                </span>
                <ChevronRight
                  className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-[#0066EB]"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
