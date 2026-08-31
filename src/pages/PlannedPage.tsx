import { Clock3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Heading } from '../components/ui/Heading';
import Section from '../components/ui/Section';
import { Text } from '../components/ui/Text';
import SEO from '../components/SEO';
import { getPlannedPage, type PlannedPageId } from '../data/plannedPages';

interface PlannedPageProps {
  pageId: PlannedPageId;
}

export default function PlannedPage({ pageId }: PlannedPageProps) {
  const { t } = useTranslation('common');
  const page = getPlannedPage(pageId);
  const title = t(page.titleKey);
  const description = t(page.descriptionKey);

  return (
    <>
      <SEO title={title} description={description} />
      <main className="flex-grow">
        <Section className="p-3 mb-12">
          <Breadcrumbs
            className="mb-8"
            items={[
              { label: t('navigation.topLevel.home'), href: '/' },
              { label: title },
            ]}
          />
          <div className="max-w-3xl">
            <Heading>{title}</Heading>
            <Text className="max-w-2xl text-gray-700 mb-8">{description}</Text>

            <div className="rounded-xl bg-primary-50 p-6 text-primary-900">
              <div className="flex items-start gap-3">
                <Clock3
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary-700"
                  aria-hidden="true"
                />
                <div>
                  <Heading level={2} className="text-lg mb-2 leading-snug">
                    {t('plannedPages.status')}
                  </Heading>
                  <Text className="max-w-2xl mb-0 text-primary-900">
                    {t('plannedPages.statusDescription')}
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
