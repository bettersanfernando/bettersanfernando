import { useParams, Link } from 'react-router';
import Section from '../components/ui/Section';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import EvidenceSourceLinks from '../components/projects/EvidenceSourceLinks';
import { Banner } from '@bettergov/kapwa/banner';
import { Card, CardContent } from '@bettergov/kapwa/card';
import {
  getProjectById,
  getProjectEvidence,
  type ProjectEvidence,
} from '../data/civic/projects';
import {
  getEvidenceSourceLabel,
  isPrimaryOfficialSource,
} from '../data/civic/sources';
import { formatPeso, formatIsoDate, titleCaseEnum } from '../lib/utils';

const IDENTIFIER_LABELS: Record<string, string> = {
  bid_reference: 'Bid Reference',
  contract_number: 'Contract Number',
  philgeps_reference: 'PhilGEPS Reference',
  app_code: 'APP Code',
};

function EvidenceCard({ evidence }: { evidence: ProjectEvidence }) {
  const officialLabel = isPrimaryOfficialSource(evidence)
    ? 'Official source'
    : evidence.source_authority;

  return (
    <Card>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
            {titleCaseEnum(evidence.stage)}
          </span>
          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
            {officialLabel}
          </span>
          <span className="text-xs text-gray-500">
            {getEvidenceSourceLabel(evidence)}
          </span>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-700 mb-3">
          <div>
            <dt className="text-gray-500 inline">Source identifier: </dt>
            <dd className="inline break-words">{evidence.source_identifier}</dd>
          </div>
          <div>
            <dt className="text-gray-500 inline">Document date: </dt>
            <dd className="inline">{formatIsoDate(evidence.document_date)}</dd>
          </div>
        </dl>

        {evidence.fields_established.length > 0 && (
          <p className="text-xs text-gray-500 mb-3">
            Establishes:{' '}
            {evidence.fields_established.map(titleCaseEnum).join(', ')}
          </p>
        )}

        <EvidenceSourceLinks evidence={evidence} />
      </CardContent>
    </Card>
  );
}

export default function ProjectDetail() {
  const { projectId } = useParams();
  const project = projectId ? getProjectById(projectId) : undefined;

  if (!project) {
    return (
      <Section className="p-3 mb-12">
        <Breadcrumbs className="mb-8" />
        <Banner
          type="error"
          title="Project not found"
          description="The project you are looking for does not exist."
          icon
        />
      </Section>
    );
  }

  const evidence = getProjectEvidence(project.id);
  const identifiers = Object.entries(project.identifiers).filter(
    ([, value]) => value !== null
  ) as [keyof typeof IDENTIFIER_LABELS, string][];

  return (
    <>
      <SEO
        title={project.project_name}
        description={`${titleCaseEnum(project.project_type)} project in ${project.barangay ?? 'the City of San Fernando'} — ${titleCaseEnum(project.lifecycle_status)}.`}
        keywords={`${project.project_name}, city projects, ${project.barangay ?? ''}, procurement`}
      />
      <Section className="p-3 mb-12">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'City Projects', href: '/projects' },
            { label: project.project_name },
          ]}
          className="mb-8"
        />

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
            {titleCaseEnum(project.lifecycle_status)}
          </span>
          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
            {titleCaseEnum(project.project_type)}
          </span>
          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
            {titleCaseEnum(project.project_category)}
          </span>
        </div>

        <Heading>{project.project_name}</Heading>
        <Text className="text-gray-600 mb-6">
          {project.barangay ?? 'Not specified'} · {project.year} · Status as of{' '}
          {formatIsoDate(project.status_as_of)}
        </Text>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Budget &amp; Contract
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Approved Budget (ABC)</dt>
                  <dd className="text-gray-900 font-medium text-right">
                    {formatPeso(project.approved_budget_abc)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Winning Bid Amount</dt>
                  <dd className="text-gray-900 font-medium text-right">
                    {formatPeso(project.winning_bid_amount)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Contract Amount</dt>
                  <dd className="text-gray-900 font-medium text-right">
                    {formatPeso(project.contract_amount)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Funding Source</dt>
                  <dd className="text-gray-900 text-right break-words">
                    {project.funding_source ?? 'Not available'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Procurement Mode</dt>
                  <dd className="text-gray-900 text-right break-words">
                    {project.procurement_mode ?? 'Not available'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Contractor</dt>
                  <dd className="text-gray-900 text-right break-words">
                    {project.contractor ?? 'Not available'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Timeline
              </h3>
              <dl className="space-y-2 text-sm mb-4">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Award Date</dt>
                  <dd className="text-gray-900 text-right">
                    {formatIsoDate(project.award_date)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Contract Effectivity</dt>
                  <dd className="text-gray-900 text-right">
                    {formatIsoDate(project.contract_effectivity_date)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Contract End</dt>
                  <dd className="text-gray-900 text-right">
                    {formatIsoDate(project.contract_end_date)}
                  </dd>
                </div>
              </dl>

              {identifiers.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Identifiers
                  </h3>
                  <dl className="space-y-2 text-sm">
                    {identifiers.map(([key, value]) => (
                      <div key={key} className="flex justify-between gap-4">
                        <dt className="text-gray-500">
                          {IDENTIFIER_LABELS[key] ?? key}
                        </dt>
                        <dd className="text-gray-900 text-right break-all">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Heading level={3}>Evidence &amp; Sources</Heading>
        {evidence.length === 0 ? (
          <Text className="text-gray-500">
            No evidence records are available for this project yet.
          </Text>
        ) : (
          <div className="space-y-4">
            {evidence.map(e => (
              <EvidenceCard key={e.id} evidence={e} />
            ))}
          </div>
        )}

        <Link
          to="/projects"
          className="inline-block mt-8 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          ← Back to all projects
        </Link>
      </Section>
    </>
  );
}
