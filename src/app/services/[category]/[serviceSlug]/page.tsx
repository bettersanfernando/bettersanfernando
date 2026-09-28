import { notFound, permanentRedirect } from 'next/navigation';
import {
  Building2,
  CalendarClock,
  ExternalLink,
  FileText,
  Info,
  Mail,
  Phone,
  ReceiptText,
  ShieldCheck,
  Siren,
  UserRound,
} from 'lucide-react';
import Breadcrumbs from '../../../../components/ui/Breadcrumbs';
import EligibilityText from '../../../../components/ui/EligibilityText';
import { PageMessages } from '../../../../components/i18n/PageMessages';
import {
  getServiceBySlug,
  getServiceCategory,
  getServiceHref,
  getServices,
  type Service,
} from '../../../../data/civic/services';
import { getCategoryDisplay } from '../../categories';
import { localizeHref } from '../../../../i18n/locale';
import { getLocale, getPageT } from '../../../../i18n/server';
import type { PageT } from '../../../../i18n/page-t';
import { buildPageMetadata } from '../../../../lib/metadata';

// Canonical service-detail route.
// The legacy one-segment /services/{slug} shape is handled entirely by the
// [category] dispatcher (page.tsx one level up) — this route never
// renders it and is not included in that dispatcher's generateStaticParams.

const externalLinkClass =
  'inline-flex items-center gap-1.5 font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600';

// BetterSanFernando-authored display labels for the canonical infrastructure
// complaint-intake topic slugs — the slugs themselves are source-derived and
// stay untouched; only their rendered label is translated here.
function topicLabel(topic: string, t: PageT): string {
  switch (topic) {
    case 'roads':
      return t('Roads');
    case 'bridges':
      return t('Bridges');
    case 'drainage-flooding':
      return t('Drainage / Flooding');
    case 'streetlights-public-lighting':
      return t('Streetlights / Public Lighting');
    case 'public-buildings-facilities':
      return t('Public Buildings & Facilities');
    case 'other-city-infrastructure':
      return t('Other City Infrastructure');
    default:
      return topic;
  }
}

function Requirements({ service, t }: { service: Service; t: PageT }) {
  return (
    <section id="requirements" aria-labelledby="requirements-heading">
      <p className="text-eyebrow text-[#0066EB]">{t('Before You Apply')}</p>
      <h2
        id="requirements-heading"
        className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
      >
        {t('Requirements')}
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        {t('Prepare these requirements before visiting the office.')}
      </p>
      <ol className="mt-6 space-y-6">
        {service.requirements.map(requirement => (
          <li
            key={`${requirement.ordinal}-${requirement.text}`}
            className="grid gap-2 sm:grid-cols-[4rem_minmax(0,1fr)]"
          >
            {requirement.ordinal ? (
              <span className="text-sm font-bold text-primary-800">
                {requirement.ordinal}
              </span>
            ) : (
              <span className="hidden sm:block" aria-hidden="true" />
            )}
            <div className="min-w-0">
              {requirement.condition && (
                <p className="mb-2 border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold leading-5 text-amber-900">
                  {t('Applies only: {{condition}}', {
                    condition: requirement.condition,
                  })}
                </p>
              )}
              <p className="text-sm leading-6 text-gray-900">
                {requirement.text}
              </p>
              {requirement.where_to_secure && (
                <p className="mt-1.5 text-sm leading-6 text-gray-500">
                  {t('Where to secure: {{whereToSecure}}', {
                    whereToSecure: requirement.where_to_secure,
                  })}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ClientSteps({ service, t }: { service: Service; t: PageT }) {
  return (
    <section
      id="how-to-apply"
      aria-labelledby="steps-heading"
      className="mt-12 border-t border-gray-200 pt-10"
    >
      <p className="text-eyebrow text-[#0066EB]">{t('Steps')}</p>
      <h2
        id="steps-heading"
        className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
      >
        {t('How to apply')}
      </h2>
      <ol className="mt-6 space-y-5">
        {service.client_steps.map((step, index) => (
          <li key={`${step.sequence}-${index}`} className="flex gap-4">
            <span
              className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-sm bg-[#F3F6FB] text-xs font-bold text-[#0066EB]"
              aria-label={
                step.sequence === '*' ? t('Final unnumbered step') : undefined
              }
            >
              {step.sequence}
            </span>
            <p className="pt-0.5 text-sm leading-7 text-gray-800">
              {step.instruction}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Variants({ service, t }: { service: Service; t: PageT }) {
  if (!('variants' in service) || !service.variants) return null;

  return (
    <section
      id="variants"
      aria-labelledby="variants-heading"
      className="mt-12 border-t border-gray-200 pt-10"
    >
      <p className="text-eyebrow text-[#0066EB]">{t('Service Options')}</p>
      <h2
        id="variants-heading"
        className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
      >
        {t('Subtypes and variants')}
      </h2>
      <ol className="mt-6 space-y-6">
        {service.variants.map((variant, index) => {
          const name = 'subtype' in variant ? variant.subtype : variant.label;
          return (
            <li key={`${name}-${index}`}>
              <p className="text-sm font-bold text-gray-900">{name}</p>
              <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                {'fee' in variant && (
                  <div>
                    <dt className="text-xs font-semibold text-gray-700">
                      {t('Fee')}
                    </dt>
                    <dd className="text-sm text-gray-900">{variant.fee}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-semibold text-gray-700">
                    {t('Processing time')}
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {variant.processing_time}
                  </dd>
                </div>
              </dl>
              {'note' in variant && variant.note && (
                <p className="mt-2 text-sm leading-6 text-gray-700">
                  {variant.note}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function generateStaticParams() {
  return getServices().map(service => ({
    category: getServiceCategory(service),
    serviceSlug: service.slug,
  }));
}

// Unknown/mismatched slugs 404 or redirect in the page component itself;
// generateMetadata only needs to handle the one real-record case, since
// neither of those other outcomes ever serves this metadata to a client.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; serviceSlug: string }>;
}) {
  const { category, serviceSlug } = await params;
  const service = getServiceBySlug(serviceSlug);
  if (!service || getServiceCategory(service) !== category) {
    return {};
  }
  const title = getServices().some(
    candidate =>
      candidate.id !== service.id && candidate.title === service.title
  )
    ? `${service.title} (${service.id})`
    : service.title;

  const { locale } = await getPageT('services-detail');
  return buildPageMetadata({
    title,
    // Leads with the page's own (guaranteed-unique) title: several distinct
    // service records share identical `description` text (e.g. multiple
    // Solo Parent ID circumstances issued by the same office under the same
    // explanation), so the raw description alone is not always unique
    // across pages — every page's meta description must be. Both `title`
    // and `service.description` are canonical/source-derived and are never
    // translated, on either locale.
    description: `${title} — ${service.description}`,
    path: getServiceHref(service),
    locale,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ category: string; serviceSlug: string }>;
}) {
  const { category, serviceSlug } = await params;
  const service = getServiceBySlug(serviceSlug);

  if (!service) {
    notFound();
  }

  const realCategory = getServiceCategory(service);
  if (category !== realCategory) {
    permanentRedirect(localizeHref(getServiceHref(service), await getLocale()));
  }

  const { t, messages } = await getPageT('services-detail');
  const categoryName = getCategoryDisplay(category, t).name;

  const hasForms =
    service.forms.length > 0 ||
    service.online_channels.length > 0 ||
    Boolean(service.appointment);
  const hasNotes = service.public_notes.length > 0;

  return (
    <PageMessages messages={messages}>
      <main className="flex-grow bg-white pb-16 md:pb-24">
        <section className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
            <Breadcrumbs
              className="text-xs text-gray-500"
              items={[
                { label: t('Home'), href: '/' },
                { label: t('Services'), href: '/services' },
                {
                  label: categoryName,
                  href: `/services/${category}`,
                },
                { label: service.title },
              ]}
            />
            <div className="mt-6 max-w-4xl">
              <p className="text-eyebrow text-[#0066EB]">{categoryName}</p>
              <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-[-0.02em] text-gray-950 md:text-5xl">
                {service.title}
              </h1>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#0066EB]">
                <Building2 className="h-4 w-4" aria-hidden="true" />
                {service.office.name} ({service.office.acronym})
              </div>
              <p className="mt-5 max-w-3xl text-base leading-7 text-gray-700 md:text-lg">
                {service.description}
              </p>
              {'availability' in service && service.availability && (
                <div className="mt-5 inline-flex items-start gap-2 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                  <Siren
                    className="mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>
                    <strong>{service.availability.status}</strong> —{' '}
                    {service.availability.scope}
                  </span>
                </div>
              )}
              {'topics' in service && service.topics.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-gray-900">
                    {t('Issue topics covered by this procedure')}
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {service.topics.map(topic => (
                      <li
                        key={topic}
                        className="border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700"
                      >
                        {topicLabel(topic, t)}
                      </li>
                    ))}
                  </ul>
                  {'topic_limitation_note' in service &&
                    service.topic_limitation_note && (
                      <div className="mt-3 inline-flex items-start gap-2 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                        <ShieldCheck
                          className="mt-0.5 h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{service.topic_limitation_note}</span>
                      </div>
                    )}
                </div>
              )}
            </div>

            <div className="mt-8 rounded-sm border border-gray-200 bg-[#F3F6FB] px-5 py-5 sm:px-6">
              <p className="text-eyebrow text-[#0066EB]">
                {t('Service at a Glance')}
              </p>
              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.7fr)]">
                <div>
                  <dt className="flex items-center gap-1.5 text-eyebrow text-gray-500">
                    <UserRound
                      className="h-3.5 w-3.5 text-[#0066EB]"
                      aria-hidden="true"
                    />
                    {t('Who may avail')}
                  </dt>
                  <dd className="mt-1.5">
                    <EligibilityText text={service.who_may_avail} />
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-eyebrow text-gray-500">
                    <CalendarClock
                      className="h-3.5 w-3.5 text-[#0066EB]"
                      aria-hidden="true"
                    />
                    {t('Processing time')}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-6 text-gray-900">
                    {service.processing_time.text ??
                      t("Not stated in the Citizen's Charter")}
                    {service.processing_time.status === 'refer_to_charter' && (
                      <span className="mt-1 block text-xs font-medium text-amber-800">
                        {t('Confirm with the office.')}
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-eyebrow text-gray-500">
                    <ReceiptText
                      className="h-3.5 w-3.5 text-[#0066EB]"
                      aria-hidden="true"
                    />
                    {t('Fee')}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-6 text-gray-900">
                    {service.fee.text ??
                      t("Not stated in the Citizen's Charter")}
                    {service.fee.status === 'refer_to_charter' && (
                      <span className="mt-1 block text-xs font-medium text-amber-800">
                        {t('Confirm with the office.')}
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-eyebrow text-gray-500">
                    <Building2
                      className="h-3.5 w-3.5 text-[#0066EB]"
                      aria-hidden="true"
                    />
                    {t('Office')}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-6 text-gray-900">
                    {service.office.name} ({service.office.acronym})
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </section>

        <nav
          aria-label={t('Service sections')}
          className="border-b border-gray-200 bg-white"
        >
          <div className="container mx-auto flex min-w-max items-center gap-6 overflow-x-auto px-4 py-3 text-sm font-semibold text-gray-600">
            <a
              href="#requirements"
              className="hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
            >
              {t('Requirements')}
            </a>
            <a
              href="#how-to-apply"
              className="hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
            >
              {t('How to apply')}
            </a>
            {'variants' in service && service.variants && (
              <a
                href="#variants"
                className="hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                {t('Variants')}
              </a>
            )}
            {(service.forms.length > 0 ||
              service.online_channels.length > 0 ||
              service.appointment) && (
              <a
                href="#forms"
                className="hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                {t('Resources')}
              </a>
            )}
            {service.public_notes.length > 0 && (
              <a
                href="#notes"
                className="hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
              >
                {t('Important notes')}
              </a>
            )}
            <a
              href="#office-contact"
              className="hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
            >
              {t('Contact')}
            </a>
            <a
              href="#official-source"
              className="hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
            >
              {t('Official source')}
            </a>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start lg:gap-14">
            <div className="min-w-0">
              <Requirements service={service} t={t} />
              <ClientSteps service={service} t={t} />
              <Variants service={service} t={t} />

              {(hasForms || hasNotes) && (
                <div className="mt-12 border-t border-gray-200 pt-10">
                  <div
                    className={
                      hasForms && hasNotes
                        ? 'grid gap-10 md:grid-cols-2 md:gap-12'
                        : undefined
                    }
                  >
                    {hasForms && (
                      <section id="forms" aria-labelledby="forms-heading">
                        <p className="text-eyebrow text-[#0066EB]">
                          {t('Resources')}
                        </p>
                        <h2
                          id="forms-heading"
                          className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
                        >
                          {t('Forms and digital channels')}
                        </h2>
                        <div className="mt-6 space-y-5 text-sm leading-6 text-gray-700">
                          {service.forms.map(form => (
                            <div key={`${form.scope}-${form.url}`}>
                              <a
                                href={form.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={externalLinkClass}
                                aria-label={t(
                                  '{{label}} (opens in a new tab)',
                                  { label: form.label }
                                )}
                              >
                                <FileText
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                                {form.label}
                                <ExternalLink
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              </a>
                              <p className="mt-1">
                                {t('Scope: {{scope}}', {
                                  scope: form.scope.replaceAll('_', ' '),
                                })}
                                {form.version && ` · ${form.version}`}
                              </p>
                            </div>
                          ))}
                          {service.online_channels.map(channel => (
                            <div key={channel.url}>
                              <a
                                href={channel.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={externalLinkClass}
                                aria-label={t(
                                  '{{label}} (opens in a new tab)',
                                  { label: channel.label }
                                )}
                              >
                                {channel.label}
                                <ExternalLink
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              </a>
                              <p className="mt-1">
                                {channel.availability_note}
                              </p>
                            </div>
                          ))}
                          {service.appointment && (
                            <div className="border border-amber-200 bg-amber-50 p-4 text-amber-950">
                              <p className="font-semibold">
                                {t('Appointment coverage not confirmed')}
                              </p>
                              <p className="mt-1">{service.appointment.note}</p>
                            </div>
                          )}
                        </div>
                      </section>
                    )}

                    {hasNotes && (
                      <section id="notes" aria-labelledby="notes-heading">
                        <p className="text-eyebrow text-[#0066EB]">
                          {t('Important')}
                        </p>
                        <h2
                          id="notes-heading"
                          className="mt-2 text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
                        >
                          {t('Important notes')}
                        </h2>
                        <ul className="mt-6 space-y-4 text-sm leading-6 text-gray-800">
                          {service.public_notes.map(note => (
                            <li key={note} className="flex gap-3">
                              <Info
                                className="mt-1 h-4 w-4 shrink-0 text-[#0066EB]"
                                aria-hidden="true"
                              />
                              <span>{note}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                  </div>
                </div>
              )}
            </div>

            <aside
              id="office-contact"
              className="space-y-6 rounded-sm border border-gray-200 bg-[#F3F6FB] p-5 lg:p-6"
            >
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {t('Office contact')}
                </h2>
                <p className="mt-2 text-sm text-gray-700">
                  {service.office.name}
                </p>
                {'address' in service.office_contact && (
                  <p className="mt-1 text-sm text-gray-700">
                    {service.office_contact.address}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-6">
                {service.office_contact.phone && (
                  <a
                    href={`tel:${service.office_contact.phone.replace(/[^+\d]/g, '')}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-[#0066EB] px-3 text-sm font-semibold text-white hover:bg-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                  >
                    <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                    {t('Call office')}
                  </a>
                )}
                {service.office_contact.emails[0] && (
                  <a
                    href={`mailto:${service.office_contact.emails[0]}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-900 hover:border-[#0066EB] hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                  >
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                    {t('Email office')}
                  </a>
                )}
              </div>
              {service.office_contact.phone && (
                <div className="flex items-start gap-3 text-sm leading-6">
                  <Phone
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary-700"
                    aria-hidden="true"
                  />
                  <div>
                    <a
                      className={externalLinkClass}
                      href={`tel:${service.office_contact.phone.replace(/[^+\d]/g, '')}`}
                    >
                      {service.office_contact.phone}
                    </a>
                    {'extensions' in service.office_contact && (
                      <p className="mt-1 text-gray-700">
                        {t('Extensions {{extensions}}', {
                          extensions:
                            service.office_contact.extensions.join(', '),
                        })}
                        {'extension_office_extension' in
                          service.office_contact &&
                          t('; Extension Office {{extension}}', {
                            extension:
                              service.office_contact.extension_office_extension,
                          })}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {'emergency_contacts' in service &&
                service.emergency_contacts.map(contact => (
                  <div
                    key={`${contact.label}-${contact.phone}`}
                    className="flex items-start gap-3 text-sm leading-6"
                  >
                    <Siren
                      className="mt-0.5 h-4 w-4 shrink-0 text-error-700"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {t('{{label}} emergency contact', {
                          label: contact.label,
                        })}
                      </p>
                      <a
                        className={externalLinkClass}
                        href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`}
                      >
                        {contact.phone}
                      </a>
                      <p className="mt-1 text-gray-700">{contact.scope}</p>
                    </div>
                  </div>
                ))}
              {service.office_contact.emails.length > 0 && (
                <div className="flex items-start gap-3 text-sm leading-6">
                  <Mail
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary-700"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <ul className="space-y-1">
                      {service.office_contact.emails.map(email => (
                        <li key={email}>
                          <a
                            className={`${externalLinkClass} break-all`}
                            href={`mailto:${email}`}
                          >
                            {email}
                          </a>
                        </li>
                      ))}
                    </ul>
                    {'email_use' in service.office_contact &&
                      service.office_contact.email_use ===
                        'INQUIRIES_ONLY_NOT_AN_APPLICATION_CHANNEL' && (
                        <p className="mt-1 text-xs text-gray-700">
                          {t(
                            'Inquiries only — not an application-submission channel.'
                          )}
                        </p>
                      )}
                  </div>
                </div>
              )}
              {service.office_hours && (
                <div className="flex items-start gap-3 text-sm leading-6 text-gray-700">
                  <CalendarClock
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary-700"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {t('Office hours')}
                    </p>
                    <p>{service.office_hours.schedule}</p>
                    <p className="mt-1 text-xs">{service.office_hours.scope}</p>
                  </div>
                </div>
              )}
            </aside>
          </div>

          <section
            id="official-source"
            aria-labelledby="source-heading"
            className="mt-16 rounded-sm border border-gray-200 bg-[#F3F6FB] p-6 sm:p-8"
          >
            <div className="mx-auto max-w-2xl text-center">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck
                  className="h-5 w-5 text-success-700"
                  aria-hidden="true"
                />
                <h2
                  id="source-heading"
                  className="text-2xl font-bold text-section-title text-gray-950 md:text-3xl"
                >
                  {t('Official source and verification')}
                </h2>
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-700">
                {t(
                  'This service record was reviewed on {{lastVerified}} from {{sourceLabel}}. BetterSanFernando is independent and is not the official City Government website. Confirm current requirements with the official source or office before applying.',
                  {
                    lastVerified: service.last_verified,
                    sourceLabel: service.canonical_source.label,
                  }
                )}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
                <a
                  href={service.canonical_source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-1.5 rounded-sm border border-gray-400 bg-white px-4 font-semibold text-gray-900 hover:border-[#0066EB] hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                  aria-label={t("Open Citizen's Charter (opens in a new tab)")}
                >
                  {t("Open Citizen's Charter")}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
                <a
                  href={service.canonical_source.landing_page_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-1.5 rounded-sm border border-gray-300 bg-white/60 px-4 font-medium text-gray-700 hover:border-[#0066EB] hover:text-[#0066EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
                  aria-label={t(
                    "Open Citizen's Charter page (opens in a new tab)"
                  )}
                >
                  {t("Citizen's Charter page")}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </PageMessages>
  );
}
