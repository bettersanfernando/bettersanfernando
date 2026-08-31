import type { ProjectEvidence } from './projects.ts';

/**
 * Source-link helpers. Keep semantics honest — never upgrade a
 * SECONDARY_OFFICIAL/citing record to "official" just because a page_url
 * exists, and never fabricate a label the data doesn't support.
 */

/** The best available public link for a piece of evidence, preferring the
 * attachment (the actual document) over the landing page, or null if
 * neither was recovered. */
export function getEvidenceSourceUrl(evidence: ProjectEvidence): string | null {
  return evidence.attachment_url ?? evidence.page_url ?? null;
}

export function hasAttachment(evidence: ProjectEvidence): boolean {
  return evidence.attachment_url !== null;
}

export function isPrimaryOfficialSource(evidence: ProjectEvidence): boolean {
  return (
    evidence.source_authority === 'PRIMARY_OFFICIAL' ||
    evidence.source_authority === 'PRIMARY_OFFICIAL_CSFP'
  );
}

/** Human-readable label reflecting exactly what retrieval_status says — does
 * not imply verification beyond what was actually recorded. */
export function getEvidenceSourceLabel(evidence: ProjectEvidence): string {
  switch (evidence.retrieval_status) {
    case 'INSPECTED':
    case 'ARCHIVED_SIGNATURE_VERIFIED':
      return 'Document verified';
    case 'ATTACHMENT_LINK_RECOVERED':
      return 'Document link recovered';
    case 'PAGE_ONLY':
    case 'PAGE_ONLY_RESEARCH_VERIFIED':
      return 'Source page only';
    case 'URL_RECORDED_NOT_DOWNLOADED':
      return 'Source URL recorded';
    default:
      return evidence.retrieval_status;
  }
}
