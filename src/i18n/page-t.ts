export type PageT = (
  key: string,
  values?: Record<string, string | number>
) => string;

/**
 * Translator for BetterSanFernando-authored page copy. The English source
 * text is the key, so a missing entry (or English) renders the source text,
 * with `{{name}}` placeholders filled from `values`.
 */
export function createPageT(messages: Readonly<Record<string, string>>): PageT {
  return (key, values) =>
    (messages[key] ?? key).replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
      values && name in values ? String(values[name]) : match
    );
}
