// Deterministic query normalization for search.ts. BetterSanFernando is
// keyword civic search, not conversational search — a query like "please
// find CHO" or "this is a test" should search on its meaningful terms
// ("CHO", "test"), not on the filler words around them. Without this, every
// filler word becomes its own MiniSearch AND-term, and a short/common word
// (especially a single letter) prefix-matches enough of the corpus that the
// AND across several filler terms still finds coincidental intersections —
// see the investigation notes in search.ts.
//
// Deliberately small and conservative: articles, a handful of prepositions/
// conjunctions, first/second-person pronouns, and the explicit "please/
// show/find/search" style request-verbs from real query examples. Nothing
// here collides with a real office acronym, document-number pattern, or
// project identifier — all of those are multi-letter codes or contain
// digits, never a bare grammatical word.
const STOP_WORDS: ReadonlySet<string> = new Set([
  'a',
  'an',
  'the',
  'this',
  'that',
  'these',
  'those',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'of',
  'to',
  'for',
  'in',
  'on',
  'and',
  'or',
  'me',
  'my',
  'i',
  'you',
  'your',
  'please',
  'show',
  'find',
  'give',
  'get',
  'want',
  'need',
  'looking',
  'search',
  'searching',
]);

/**
 * Strips stop words from a query, term by term, so "this is a test" becomes
 * "test" before it ever reaches the search index. Falls back to the
 * original (trimmed) query when every term is a stop word — e.g. a query
 * that is only filler carries no informative signal to strip toward, so
 * there is nothing more useful to fall back to than what was actually
 * typed.
 */
export function stripStopWords(query: string): string {
  const terms = query.split(/\s+/).filter(Boolean);
  const meaningful = terms.filter(
    term => !STOP_WORDS.has(term.toLocaleLowerCase('en-PH'))
  );
  return meaningful.length > 0 ? meaningful.join(' ') : query;
}
