import { useMemo } from 'react';
import { Link } from 'react-router';
import { useQueryState } from 'nuqs';
import { Search as SearchIcon } from 'lucide-react';
import Section from '../components/ui/Section';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import SEO from '../components/SEO';
import { Card, CardContent } from '@bettergov/kapwa/card';
import {
  getProjects,
  ProjectLifecycleStatus,
  ProjectCategory,
  type Project,
} from '../data/civic/projects';
import { getBarangays } from '../data/civic/demographics';
import { formatPeso, titleCaseEnum } from '../lib/utils';

const LIFECYCLE_OPTIONS = ProjectLifecycleStatus.options;
const CATEGORY_OPTIONS = ProjectCategory.options;

function matchesQuery(project: Project, query: string): boolean {
  const q = query.toLowerCase();
  return (
    project.project_name.toLowerCase().includes(q) ||
    (project.barangay?.toLowerCase().includes(q) ?? false) ||
    (project.contractor?.toLowerCase().includes(q) ?? false) ||
    (project.identifiers.bid_reference?.toLowerCase().includes(q) ?? false)
  );
}

export default function Projects() {
  const [q, setQ] = useQueryState('q', { defaultValue: '' });
  const [lifecycle, setLifecycle] = useQueryState('status', {
    defaultValue: '',
  });
  const [barangayPsgc, setBarangayPsgc] = useQueryState('barangay', {
    defaultValue: '',
  });
  const [category, setCategory] = useQueryState('category', {
    defaultValue: '',
  });

  const allProjects = getProjects();
  const barangays = getBarangays();

  const filtered = useMemo(() => {
    return allProjects.filter(p => {
      if (q.trim() && !matchesQuery(p, q.trim())) return false;
      if (lifecycle && p.lifecycle_status !== lifecycle) return false;
      if (barangayPsgc && p.barangay_psgc !== barangayPsgc) return false;
      if (category && p.project_category !== category) return false;
      return true;
    });
  }, [allProjects, q, lifecycle, barangayPsgc, category]);

  return (
    <>
      <SEO
        title="City Projects"
        description="Infrastructure and procurement projects of the City of San Fernando, Pampanga, with sourced evidence for every fact."
        keywords="city projects, infrastructure, procurement, bids, contracts, San Fernando Pampanga"
      />
      <Section className="p-3 mb-12">
        <Breadcrumbs className="mb-8" />
        <Heading>City Projects</Heading>
        <Text className="text-gray-600 mb-6 max-w-2xl">
          Infrastructure and procurement projects, sourced from official city
          records. Every project links to the evidence behind it.
        </Text>

        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative flex-1 min-w-[220px]">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              value={q}
              onChange={e => setQ(e.target.value || null)}
              placeholder="Search by name, barangay, contractor, bid reference..."
              aria-label="Search projects"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <label className="sr-only" htmlFor="lifecycle-filter">
            Filter by lifecycle status
          </label>
          <select
            id="lifecycle-filter"
            value={lifecycle}
            onChange={e => setLifecycle(e.target.value || null)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All statuses</option>
            {LIFECYCLE_OPTIONS.map(status => (
              <option key={status} value={status}>
                {titleCaseEnum(status)}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="barangay-filter">
            Filter by barangay
          </label>
          <select
            id="barangay-filter"
            value={barangayPsgc}
            onChange={e => setBarangayPsgc(e.target.value || null)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All barangays</option>
            {barangays.map(b => (
              <option key={b.psgc_code} value={b.psgc_code}>
                {b.name}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="category-filter">
            Filter by category
          </label>
          <select
            id="category-filter"
            value={category}
            onChange={e => setCategory(e.target.value || null)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All categories</option>
            {CATEGORY_OPTIONS.map(c => (
              <option key={c} value={c}>
                {titleCaseEnum(c)}
              </option>
            ))}
          </select>
        </div>

        <Text size="sm" className="text-gray-500 mb-4">
          {filtered.length} of {allProjects.length} project
          {allProjects.length !== 1 ? 's' : ''}
        </Text>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
            No projects match your filters.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(project => (
              <Link key={project.id} to={`/projects/${project.id}`}>
                <Card hoverable className="mb-0">
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
                        {titleCaseEnum(project.lifecycle_status)}
                      </span>
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                        {titleCaseEnum(project.project_type)}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 break-words">
                      {project.project_name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {project.barangay ?? 'Not specified'} · {project.year}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      <span className="text-gray-500">
                        Approved Budget (ABC):{' '}
                        <span className="text-gray-800 font-medium">
                          {formatPeso(project.approved_budget_abc)}
                        </span>
                      </span>
                      <span className="text-gray-500">
                        Contract Amount:{' '}
                        <span className="text-gray-800 font-medium">
                          {formatPeso(project.contract_amount)}
                        </span>
                      </span>
                    </div>
                    {project.contractor && (
                      <p className="mt-2 text-xs text-gray-500 break-words">
                        Contractor: {project.contractor}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
