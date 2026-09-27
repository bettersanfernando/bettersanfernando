import { ExternalLink, FileText, Link2 } from 'lucide-react';
import type { ProjectEvidence } from '../../data/civic/projects';
import { getEvidenceSourceUrl, hasAttachment } from '../../data/civic/sources';
import { getServerT } from '../../i18n/server';

export default async function EvidenceSourceLinks({
  evidence,
}: {
  evidence: ProjectEvidence;
}) {
  const { t } = await getServerT();
  const sourceUrl = getEvidenceSourceUrl(evidence);
  const identifier = evidence.source_identifier;

  if (!sourceUrl) {
    return (
      <span className="text-sm text-gray-600">{t('evidenceLinks.none')}</span>
    );
  }

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-semibold text-primary-700 underline decoration-primary-200 underline-offset-4 hover:text-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        aria-label={t(
          hasAttachment(evidence)
            ? 'evidenceLinks.openDocumentLabel'
            : 'evidenceLinks.openSourcePageLabel',
          { identifier }
        )}
      >
        {hasAttachment(evidence) ? (
          <FileText className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        )}
        {t(
          hasAttachment(evidence)
            ? 'evidenceLinks.openDocument'
            : 'evidenceLinks.openSourcePage'
        )}
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
      {hasAttachment(evidence) && evidence.page_url && (
        <a
          href={evidence.page_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-gray-700 underline decoration-gray-300 underline-offset-4 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          aria-label={t('evidenceLinks.sourcePageLabel', { identifier })}
        >
          <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
          {t('evidenceLinks.sourcePage')}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
