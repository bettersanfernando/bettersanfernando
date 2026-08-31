import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useQueryState } from 'nuqs';
import { Search as SearchIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Heading } from '../components/ui/Heading';
import Section from '../components/ui/Section';
import { Text } from '../components/ui/Text';
import SEO from '../components/SEO';
import {
  isMeilisearchEnabled,
  searchClient,
  SEARCH_INDEX,
} from '../lib/meilisearch';
import type { SearchHit } from '../lib/meilisearch';

export default function Search() {
  if (!isMeilisearchEnabled || !searchClient) return <UnavailableSearch />;

  return <ConfiguredSearch client={searchClient} />;
}

function UnavailableSearch() {
  const { t } = useTranslation('common');
  const title = t('search.unavailableTitle');
  const description = t('search.unavailableDescription');

  return (
    <>
      <SEO title={title} description={description} />
      <main className="flex-grow">
        <Section className="p-3 mb-12">
          <Breadcrumbs
            className="mb-8"
            items={[
              { label: t('navigation.topLevel.home'), href: '/' },
              { label: t('navigation.search') },
            ]}
          />
          <div className="max-w-3xl">
            <Heading>{title}</Heading>
            <Text className="max-w-2xl text-gray-700 mb-8">{description}</Text>
            <div className="rounded-xl bg-primary-50 p-6 text-primary-900">
              <div className="flex items-start gap-3">
                <SearchIcon
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary-700"
                  aria-hidden="true"
                />
                <div>
                  <Heading level={2} className="text-lg mb-2 leading-snug">
                    {t('search.unavailableStatus')}
                  </Heading>
                  <Text className="max-w-2xl mb-0 text-primary-900">
                    {t('search.unavailableGuidance')}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </main>
    </>
  );
}

function ConfiguredSearch({
  client,
}: {
  client: NonNullable<typeof searchClient>;
}) {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [results, setResults] = useState<SearchHit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const index = client.index(SEARCH_INDEX);
        const res = await index.search<SearchHit>(query, { limit: 20 });
        setResults(res.hits);
        setHasSearched(true);
      } catch {
        setError('Search is unavailable. Please try again later.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [client, query]);

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Search</h1>

      <div className="relative mb-8">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value || null)}
          placeholder="Search services, departments, guides..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          autoFocus
        />
      </div>

      {error && (
        <div className="text-center py-12 text-red-500 text-sm">{error}</div>
      )}

      {!error && isLoading && (
        <div className="text-center py-12 text-gray-500 text-sm">
          Searching...
        </div>
      )}

      {!error && !isLoading && hasSearched && results.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No results for{' '}
          <span className="font-medium">&ldquo;{query}&rdquo;</span>
        </div>
      )}

      {!error && !isLoading && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 mb-4">
            {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;
            {query}&rdquo;
          </p>
          {results.map(hit => (
            <Link key={hit.id} to={hit.url} className="block group">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      hit.type === 'service'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {hit.category}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-gray-900 group-hover:text-primary-700">
                  {hit.title}
                </h2>
                {hit.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {hit.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {!hasSearched && !isLoading && !error && (
        <div className="text-center py-12 text-gray-400 text-sm">
          Start typing to search across services and government information
        </div>
      )}
    </main>
  );
}
