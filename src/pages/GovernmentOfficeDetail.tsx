import { Link, useParams } from 'react-router';
import {
  Building2,
  CalendarCheck2,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Siren,
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import {
  getChildOffices,
  getCityOfficeById,
  getCityOfficesMetadata,
  getParentOffice,
} from '../data/civic/government';

const metadata = getCityOfficesMetadata();

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

function phoneHref(value: string) {
  return `tel:${value.replace(/[^+\d]/g, '')}`;
}

export default function GovernmentOfficeDetail() {
  const { officeId = '' } = useParams();
  const office = getCityOfficeById(officeId);

  if (!office) {
    return (
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <Breadcrumbs
            className="mb-8"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Government', href: '/government' },
              { label: 'City Offices', href: '/government/offices' },
              { label: 'Office not found' },
            ]}
          />
          <div className="rounded-xl bg-white p-6 shadow-[0_8px_28px_rgba(0,41,94,0.08)] md:p-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Office not found
            </h1>
            <p className="mt-2 text-gray-700">
              This office is not in the current published directory.
            </p>
            <Link
              className="mt-5 inline-flex font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
              to="/government/offices"
            >
              Browse published offices
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const parent = getParentOffice(office);
  const children = getChildOffices(office);
  const emails = Array.from(
    new Set(
      [
        office.institutional_email,
        office.operational_email,
        ...(office.additional_emails ?? []),
      ].filter((email): email is string => Boolean(email))
    )
  );

  return (
    <>
      <SEO
        title={office.office_name}
        description={`Published office directory record for ${office.office_name} in the City of San Fernando, Pampanga.`}
        keywords={`${office.office_name}, ${office.acronym ?? ''}, San Fernando Pampanga government office`}
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/government/offices/${office.office_id}`}
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
                { label: 'City Offices', href: '/government/offices' },
                { label: office.office_name },
              ]}
            />
            <div className="max-w-4xl">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
                <Building2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="flex flex-wrap items-start gap-3">
                <h1 className="min-w-0 break-words text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
                  {office.office_name}
                </h1>
                {office.acronym && (
                  <span className="mt-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-800">
                    {office.acronym}
                  </span>
                )}
              </div>
              {office.alternate_names?.length ? (
                <p className="mt-4 text-sm leading-6 text-gray-700">
                  Also published as: {office.alternate_names.join(', ')}
                </p>
              ) : null}
              {office.name_status && (
                <p className="mt-3 text-sm leading-6 text-gray-700">
                  Naming status: Alternate current usage
                </p>
              )}
              {office.organization_status && (
                <p className="mt-3 text-sm leading-6 text-gray-700">
                  Organization status: Possible reorganization
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="container mx-auto grid gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)] md:py-12">
          <div className="space-y-8">
            {(parent || children.length > 0) && (
              <section className="rounded-xl bg-white p-5 shadow-[0_8px_28px_rgba(0,41,94,0.08)] md:p-7">
                <h2 className="text-2xl font-bold text-gray-900">
                  Verified office relationships
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-700">
                  Only relationships published in the current directory are
                  shown.
                </p>
                {parent && (
                  <div className="mt-5">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Parent office
                    </h3>
                    <Link
                      className="mt-1 inline-flex text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                      to={`/government/offices/${parent.office_id}`}
                    >
                      {parent.office_name}
                    </Link>
                  </div>
                )}
                {children.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Verified subunits
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {children.map(child => (
                        <li key={child.office_id}>
                          <Link
                            className="text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                            to={`/government/offices/${child.office_id}`}
                          >
                            {child.office_name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {(office.physical_address ||
              office.primary_phone ||
              emails.length > 0 ||
              office.emergency_hotlines?.length) && (
              <section className="rounded-xl bg-white p-5 shadow-[0_8px_28px_rgba(0,41,94,0.08)] md:p-7">
                <h2 className="text-2xl font-bold text-gray-900">
                  Location and contact
                </h2>
                <div className="mt-5 grid gap-6 sm:grid-cols-2">
                  {office.physical_address && (
                    <div className="flex min-w-0 items-start gap-3 text-sm leading-6">
                      <MapPin
                        className="mt-0.5 h-5 w-5 shrink-0 text-primary-700"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Location</p>
                        <p className="text-gray-700">
                          {office.physical_address}
                        </p>
                      </div>
                    </div>
                  )}
                  {office.primary_phone && (
                    <div className="flex min-w-0 items-start gap-3 text-sm leading-6">
                      <Phone
                        className="mt-0.5 h-5 w-5 shrink-0 text-primary-700"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">
                          Office phone
                        </p>
                        <a
                          className="text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                          href={phoneHref(office.primary_phone)}
                        >
                          {office.primary_phone}
                        </a>
                        {office.phone_extensions?.length ? (
                          <p className="mt-1 text-gray-700">
                            Extension
                            {office.phone_extensions.length > 1
                              ? 's'
                              : ''}: {office.phone_extensions.join(', ')}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  )}
                  {emails.length > 0 && (
                    <div className="flex min-w-0 items-start gap-3 text-sm leading-6">
                      <Mail
                        className="mt-0.5 h-5 w-5 shrink-0 text-primary-700"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">
                          Office email
                        </p>
                        <ul className="space-y-1">
                          {emails.map(email => (
                            <li key={email}>
                              <a
                                className="break-all text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                                href={`mailto:${email}`}
                              >
                                {email}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  {office.emergency_hotlines?.length ? (
                    <div className="flex min-w-0 items-start gap-3 text-sm leading-6">
                      <Siren
                        className="mt-0.5 h-5 w-5 shrink-0 text-error-700"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">
                          Institutional hotline
                        </p>
                        <ul className="space-y-1">
                          {office.emergency_hotlines.map(hotline => (
                            <li key={hotline}>
                              <a
                                className="text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                                href={phoneHref(hotline)}
                              >
                                {hotline}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            )}

            {(office.social_accounts.length > 0 ||
              office.official_page_url) && (
              <section className="rounded-xl bg-white p-5 shadow-[0_8px_28px_rgba(0,41,94,0.08)] md:p-7">
                <h2 className="text-2xl font-bold text-gray-900">
                  Institutional links
                </h2>
                <ul className="mt-4 space-y-3">
                  {office.social_accounts.map(account => (
                    <li key={account.url}>
                      <a
                        className="inline-flex items-center gap-2 font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                        href={account.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {account.platform}
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                  {office.official_page_url && (
                    <li>
                      <a
                        className="inline-flex items-center gap-2 font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-900"
                        href={office.official_page_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Official office page
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </li>
                  )}
                </ul>
              </section>
            )}
          </div>

          <aside className="h-fit rounded-xl bg-primary-50 p-5 text-sm leading-6 text-primary-900">
            <p className="font-semibold">Independent civic directory</p>
            <p className="mt-1">
              BetterSanFernando is not the official City Government website. Use
              the published sources below to confirm information with the City.
            </p>
            <div className="mt-5 flex items-start gap-2">
              <ShieldCheck
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span>Verified record</span>
            </div>
            <div className="mt-2 flex items-start gap-2">
              <CalendarCheck2
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span>
                Checked{' '}
                {formatDate(office.last_verified_at ?? metadata.lastVerified)}
              </span>
            </div>
            <h2 className="mt-6 font-semibold">Sources</h2>
            <ul className="mt-2 space-y-3">
              {office.source_urls.map((url, index) => (
                <li key={url}>
                  <a
                    className="inline-flex items-start gap-2 font-semibold underline decoration-primary-300 underline-offset-4 hover:text-primary-800"
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>Official source {index + 1}</span>
                    <ExternalLink
                      className="mt-1 h-3.5 w-3.5 shrink-0"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </main>
    </>
  );
}
