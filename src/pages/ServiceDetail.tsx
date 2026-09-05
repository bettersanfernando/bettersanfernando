import {
  Building2,
  CalendarClock,
  ExternalLink,
  FileText,
  Mail,
  Phone,
  ShieldCheck,
  Siren,
} from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router';
import { Banner } from '@bettergov/kapwa/banner';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import {
  getServiceBySlug,
  getServiceCategory,
  getServiceHref,
  type Service,
} from '../data/civic/services';

const externalLinkClass =
  'inline-flex items-center gap-1.5 font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600';

function StatusValue({
  label,
  value,
  isReference,
}: {
  label: string;
  value: string | null;
  isReference: boolean;
}) {
  return (
    <div>
      <dt className="text-sm font-semibold text-gray-900">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-gray-700">
        {value ?? "Not stated in the Citizen's Charter"}
        {isReference && (
          <span className="mt-1 block text-xs font-medium text-amber-800">
            Confirm the current details in the Citizen&apos;s Charter or with
            the office.
          </span>
        )}
      </dd>
    </div>
  );
}

function Requirements({ service }: { service: Service }) {
  return (
    <section aria-labelledby="requirements-heading">
      <h2
        id="requirements-heading"
        className="text-2xl font-bold text-gray-900"
      >
        Requirements
      </h2>
      <ol className="mt-5 divide-y divide-gray-200 border-y border-gray-200">
        {service.requirements.map(requirement => (
          <li
            key={`${requirement.ordinal}-${requirement.text}`}
            className="grid gap-3 py-5 sm:grid-cols-[4rem_minmax(0,1fr)]"
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
                <p className="mb-2 inline-block rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold leading-5 text-amber-900">
                  Applies only: {requirement.condition}
                </p>
              )}
              <p className="text-sm leading-6 text-gray-900">
                {requirement.text}
              </p>
              {requirement.where_to_secure && (
                <p className="mt-2 text-sm leading-6 text-gray-700">
                  <span className="font-semibold text-gray-900">
                    Where to secure:
                  </span>{' '}
                  {requirement.where_to_secure}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ClientSteps({ service }: { service: Service }) {
  return (
    <section aria-labelledby="steps-heading">
      <h2 id="steps-heading" className="text-2xl font-bold text-gray-900">
        How to apply
      </h2>
      <ol className="mt-5 space-y-5">
        {service.client_steps.map((step, index) => (
          <li key={`${step.sequence}-${index}`} className="flex gap-4">
            <span
              className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 px-2 text-sm font-bold text-primary-800"
              aria-label={
                step.sequence === '*' ? 'Final unnumbered step' : undefined
              }
            >
              {step.sequence}
            </span>
            <p className="pt-1 text-sm leading-7 text-gray-800">
              {step.instruction}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function ServiceDetail() {
  const { category, serviceSlug, slug } = useParams();
  const service = getServiceBySlug(serviceSlug ?? slug ?? '');

  if (service && slug) {
    return <Navigate to={getServiceHref(service)} replace />;
  }

  if (service && category !== getServiceCategory(service)) {
    return <Navigate to={getServiceHref(service)} replace />;
  }

  if (!service) {
    return (
      <main className="container mx-auto flex-grow px-4 py-10">
        <Breadcrumbs
          className="mb-8"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Services', href: '/services' },
            { label: 'Service not found' },
          ]}
        />
        <Banner
          type="error"
          title="Service not found"
          description="The requested service is not in the currently published reviewed collection."
          icon
        />
        <Link
          to="/services"
          className="mt-6 inline-flex font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4"
        >
          Browse published services
        </Link>
      </main>
    );
  }

  const categoryNames = {
    business: 'Business Services',
    'disaster-preparedness': 'Disaster Preparedness',
    'assistance-programs': 'Assistance Programs',
    'social-welfare': 'Social Welfare',
    'pwd-services': 'PWD Services',
    'health-services': 'Health Services',
  } as const;
  const categoryName =
    categoryNames[category as keyof typeof categoryNames] ?? category;

  return (
    <>
      <SEO
        title={service.title}
        description={service.description}
        keywords={`${service.title}, ${service.office.acronym}, San Fernando Pampanga service`}
      />
      <main className="flex-grow bg-gray-50">
        <section className="border-b border-primary-100 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <Breadcrumbs
              className="mb-8"
              items={[
                { label: 'Home', href: '/' },
                { label: 'Services', href: '/services' },
                {
                  label: categoryName,
                  href: `/services/${category}`,
                },
                { label: service.title },
              ]}
            />
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary-800">
                <Building2 className="h-5 w-5" aria-hidden="true" />
                {service.office.name} ({service.office.acronym})
              </div>
              <h1 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                {service.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-gray-700 md:text-lg">
                {service.description}
              </p>
              {'availability' in service && service.availability && (
                <div className="mt-5 inline-flex items-start gap-2 rounded-xl bg-error-50 px-4 py-3 text-sm text-error-900">
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
            </div>
            <dl className="mt-9 grid gap-5 border-y border-gray-200 py-6 sm:grid-cols-3">
              <div>
                <dt className="text-sm font-semibold text-gray-900">
                  Who may avail
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700">
                  {service.who_may_avail}
                </dd>
              </div>
              <StatusValue
                label="Processing time"
                value={service.processing_time.text}
                isReference={
                  service.processing_time.status === 'refer_to_charter'
                }
              />
              <StatusValue
                label="Fees"
                value={service.fee.text}
                isReference={service.fee.status === 'refer_to_charter'}
              />
            </dl>
          </div>
        </section>

        <div className="container mx-auto grid gap-12 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start md:py-14">
          <div className="min-w-0 space-y-12">
            <Requirements service={service} />
            <ClientSteps service={service} />

            {(service.forms.length > 0 ||
              service.online_channels.length > 0 ||
              service.appointment) && (
              <section aria-labelledby="forms-heading">
                <h2
                  id="forms-heading"
                  className="text-2xl font-bold text-gray-900"
                >
                  Forms and digital channels
                </h2>
                <div className="mt-5 space-y-5 text-sm leading-6 text-gray-700">
                  {service.forms.map(form => (
                    <div key={`${form.scope}-${form.url}`}>
                      <a
                        href={form.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={externalLinkClass}
                        aria-label={`${form.label} (opens in a new tab)`}
                      >
                        <FileText className="h-4 w-4" aria-hidden="true" />
                        {form.label}
                        <ExternalLink
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </a>
                      <p className="mt-1">
                        Scope: {form.scope.replaceAll('_', ' ')}
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
                        aria-label={`${channel.label} (opens in a new tab)`}
                      >
                        {channel.label}
                        <ExternalLink
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </a>
                      <p className="mt-1">{channel.availability_note}</p>
                    </div>
                  ))}
                  {service.appointment && (
                    <div className="rounded-xl bg-amber-50 p-4 text-amber-950">
                      <p className="font-semibold">
                        Appointment coverage not confirmed
                      </p>
                      <p className="mt-1">{service.appointment.note}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {service.public_notes.length > 0 && (
              <section aria-labelledby="notes-heading">
                <h2
                  id="notes-heading"
                  className="text-2xl font-bold text-gray-900"
                >
                  Important notes
                </h2>
                <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-6 text-gray-800 marker:text-primary-700">
                  {service.public_notes.map(note => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </section>
            )}

            <section
              aria-labelledby="source-heading"
              className="border-t border-gray-200 pt-8"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className="h-5 w-5 text-success-700"
                  aria-hidden="true"
                />
                <h2
                  id="source-heading"
                  className="text-2xl font-bold text-gray-900"
                >
                  Official source and verification
                </h2>
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-700">
                This service record was reviewed on {service.last_verified} from{' '}
                {service.canonical_source.label}. BetterSanFernando is
                independent and is not the official City Government website.
                Confirm current requirements with the official source or office
                before applying.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm">
                <a
                  href={service.canonical_source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={externalLinkClass}
                  aria-label="Open Citizen's Charter (opens in a new tab)"
                >
                  Open Citizen&apos;s Charter
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
                <a
                  href={service.canonical_source.landing_page_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={externalLinkClass}
                  aria-label="Open Citizen's Charter page (opens in a new tab)"
                >
                  Citizen&apos;s Charter page
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </section>
          </div>

          <aside className="space-y-6 rounded-xl bg-white p-5 shadow-[0_8px_28px_rgba(0,41,94,0.08)] lg:sticky lg:top-24">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Office contact
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
                    Extensions {service.office_contact.extensions.join(', ')}
                    {'extension_office_extension' in service.office_contact &&
                      `; Extension Office ${service.office_contact.extension_office_extension}`}
                  </p>
                )}
              </div>
            </div>
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
                      {contact.label} emergency contact
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
            <div className="flex items-start gap-3 text-sm leading-6">
              <Mail
                className="mt-0.5 h-4 w-4 shrink-0 text-primary-700"
                aria-hidden="true"
              />
              <ul className="min-w-0 space-y-1">
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
            </div>
            <div className="flex items-start gap-3 text-sm leading-6 text-gray-700">
              <CalendarClock
                className="mt-0.5 h-4 w-4 shrink-0 text-primary-700"
                aria-hidden="true"
              />
              <div>
                <p className="font-semibold text-gray-900">Office hours</p>
                <p>{service.office_hours.schedule}</p>
                <p className="mt-1 text-xs">{service.office_hours.scope}</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
