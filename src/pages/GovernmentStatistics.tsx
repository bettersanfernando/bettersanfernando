import { AlertTriangle, ArrowRight, Building2, Landmark } from 'lucide-react';
import { Link } from 'react-router';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import {
  getGovernmentEntities,
  getGovernmentStructureMetadata,
  getVerifiedRelationships,
} from '../data/civic/governmentStructureSummary';
import { titleCaseEnum } from '../lib/utils';

const numberFormatter = new Intl.NumberFormat('en-PH');

const metadata = getGovernmentStructureMetadata();
const entities = getGovernmentEntities();
const relationships = getVerifiedRelationships();

const facilitiesAndServiceUnits = entities.filter(
  entity =>
    entity.entity_type === 'facility' || entity.entity_type === 'service_unit'
);

const relatedLinks = [
  { label: 'Government Overview', href: '/government' },
  { label: 'City Offices', href: '/government/offices' },
  { label: 'Hotlines & Contacts', href: '/government/hotlines' },
  { label: 'Barangay Contacts', href: '/government/barangay-contacts' },
  { label: 'Official Government Links', href: '/government/links' },
] as const;

export default function GovernmentStatistics() {
  return (
    <>
      <SEO
        title="Government Statistics"
        description="A verified, partial summary of City Government of San Fernando organizational entities, official directory matches, and explicitly verified relationships — not a complete organizational chart."
        keywords="San Fernando Pampanga government structure, city offices directory, verified relationships"
        url={`${import.meta.env.VITE_WEBSITE_URL || ''}/statistics/government`}
        siteName="BetterSanFernando"
      />
      <main className="flex-grow bg-gray-50">
        <section className="border-b border-primary-100 bg-white">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <Breadcrumbs
              className="mb-8"
              items={[
                { label: 'Home', href: '/' },
                { label: 'Statistics', href: '/statistics' },
                { label: 'Government Statistics' },
              ]}
            />
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-white">
              <Landmark className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-gray-900 md:text-5xl">
              Government Statistics
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-700 md:text-lg">
              A verified, partial directory and relationship summary for the
              City Government of San Fernando, Pampanga &mdash; not a complete
              legal organizational chart or staffing roster.
            </p>

            <div className="mt-6 rounded-xl bg-amber-50 p-5 text-sm leading-6 text-amber-900">
              <div className="flex items-start gap-2">
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0"
                  aria-hidden="true"
                />
                <p>{metadata.permanentLimitation}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto space-y-12 px-4 py-10 md:py-14">
          <section aria-labelledby="counts-heading">
            <h2
              id="counts-heading"
              className="text-2xl font-bold tracking-[-0.02em] text-gray-900 md:text-3xl"
            >
              What this summary covers
            </h2>
            <dl className="mt-6 grid gap-x-8 gap-y-5 rounded-xl border border-gray-200 bg-white p-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-sm text-gray-600">
                  Reconciled entities in this directory
                </dt>
                <dd className="mt-1 text-4xl font-bold tabular-nums text-gray-900">
                  {numberFormatter.format(
                    metadata.betterSanFernandoDirectoryRecordCount
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">
                  Matched against the official Departments directory
                </dt>
                <dd className="mt-1 text-4xl font-bold tabular-nums text-gray-900">
                  {numberFormatter.format(
                    metadata.officialDepartmentDirectoryCount
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">
                  Verified public facilities/service units
                </dt>
                <dd className="mt-1 text-4xl font-bold tabular-nums text-gray-900">
                  {facilitiesAndServiceUnits.length}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">
                  Verified relationships
                </dt>
                <dd className="mt-1 text-4xl font-bold tabular-nums text-gray-900">
                  {relationships.length}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-sm leading-6 text-gray-700">
              Of the {metadata.officialDepartmentDirectoryCount} official
              directory matches, {metadata.officialDepartmentTopLevelCount} are
              top-level entries and {metadata.officialDepartmentNestedCount} are
              explicitly nested under a top-level entry, per the{' '}
              <a
                href={metadata.officialDepartmentDirectoryUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-primary-700 underline underline-offset-4 hover:text-primary-900"
              >
                current official Departments directory
              </a>
              .
            </p>
          </section>

          <section aria-labelledby="breakdown-heading">
            <h2
              id="breakdown-heading"
              className="text-2xl font-bold tracking-[-0.02em] text-gray-900 md:text-3xl"
            >
              Entity type breakdown
            </h2>
            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[24rem] border-collapse text-left text-sm">
                  <caption className="sr-only">
                    Reconciled entity counts by entity type
                  </caption>
                  <thead className="bg-gray-100 text-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Entity type
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-right font-semibold"
                      >
                        Count
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(metadata.entityTypeBreakdown).map(
                      ([type, count]) => (
                        <tr key={type}>
                          <th
                            scope="row"
                            className="px-4 py-2.5 font-medium text-gray-900"
                          >
                            {titleCaseEnum(type)}
                          </th>
                          <td className="px-4 py-2.5 text-right tabular-nums text-gray-800">
                            {count}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section aria-labelledby="relationships-heading">
            <div className="max-w-3xl">
              <h2
                id="relationships-heading"
                className="text-2xl font-bold tracking-[-0.02em] text-gray-900 md:text-3xl"
              >
                Verified relationships
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-700">
                These {relationships.length} parent-child links are shown only
                because the export explicitly verifies them. Entities with an
                unresolved or held classification are excluded here and are not
                shown as part of any hierarchy.
              </p>
            </div>
            <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                  <caption className="sr-only">
                    Verified relationships between City Government entities
                  </caption>
                  <thead className="bg-gray-100 text-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Child
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Relationship
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Parent
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {relationships.map(relationship => {
                      const child = entities.find(
                        e => e.id === relationship.child_id
                      );
                      const parent = entities.find(
                        e => e.id === relationship.parent_id
                      );
                      return (
                        <tr
                          key={`${relationship.child_id}-${relationship.parent_id}`}
                        >
                          <th
                            scope="row"
                            className="px-4 py-2.5 font-medium text-gray-900"
                          >
                            {child?.name ?? 'Not available'}
                          </th>
                          <td className="px-4 py-2.5 text-gray-700">
                            {titleCaseEnum(relationship.relationship_type)}
                          </td>
                          <td className="px-4 py-2.5 text-gray-700">
                            {parent?.name ?? 'Not available'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="facilities-heading"
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="flex items-center gap-3">
              <Building2
                className="h-6 w-6 text-primary-700"
                aria-hidden="true"
              />
              <h2
                id="facilities-heading"
                className="text-2xl font-bold tracking-[-0.02em] text-gray-900"
              >
                Verified public facilities and service units
              </h2>
            </div>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {facilitiesAndServiceUnits.map(entity => (
                <li
                  key={entity.id}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800"
                >
                  {entity.name}
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="prohibited-heading"
            className="rounded-xl bg-primary-900 p-6 text-white md:p-8"
          >
            <h2 id="prohibited-heading" className="text-xl font-bold">
              What this summary does not claim
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-primary-100">
              {metadata.prohibitedClaimsAcknowledged.map(claim => (
                <li key={claim}>{claim}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="related-heading">
            <h2
              id="related-heading"
              className="text-xl font-bold tracking-[-0.02em] text-gray-900"
            >
              Related pages
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {relatedLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-primary-700 hover:border-primary-300 hover:text-primary-900"
                >
                  {link.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
