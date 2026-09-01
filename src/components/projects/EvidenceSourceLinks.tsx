import { ExternalLink, FileText } from 'lucide-react';
import type { ProjectEvidence } from '../../data/civic/projects';
import { getEvidenceSourceUrl, hasAttachment } from '../../data/civic/sources';

export default function EvidenceSourceLinks({
  evidence,
}: {
  evidence: ProjectEvidence;
}) {
  const sourceUrl = getEvidenceSourceUrl(evidence);

  if (!sourceUrl) {
    return (
      <span className="text-sm text-gray-600">
        No public link recorded for this record
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-semibold text-primary-700 underline decoration-primary-200 underline-offset-4 hover:text-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        aria-label={`${hasAttachment(evidence) ? 'Open official document' : 'Open official source page'} for ${evidence.source_identifier} (opens in a new tab)`}
      >
        {hasAttachment(evidence) ? (
          <FileText className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        )}
        {hasAttachment(evidence) ? 'Open document' : 'Open source page'}
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
      {hasAttachment(evidence) && evidence.page_url && (
        <a
          href={evidence.page_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 underline decoration-gray-300 underline-offset-4 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          aria-label={`Open source page for ${evidence.source_identifier} (opens in a new tab)`}
        >
          Source page
        </a>
      )}
    </div>
  );
}
