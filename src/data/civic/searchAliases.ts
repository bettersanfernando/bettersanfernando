// Deterministic alias/synonym table for search.ts. Maps a lowercase anchor
// — an office acronym, a published service-category slug, or another
// stable term that actually appears in BetterSanFernando's data — to
// alternate phrases a resident might type instead. No runtime AI/LLM
// expansion: every entry here is a fixed, testable lookup.
//
// Anchors are drawn from real repository terminology: office acronyms are
// the literal `office.acronym` values in services.ts's schema, and category
// anchors are the literal category slugs in src/app/services/categories.ts.
// Extend this table as new offices/categories are published — never
// duplicate an alias mechanism elsewhere.
const ALIAS_TABLE: Readonly<Record<string, readonly string[]>> = {
  // Office acronyms (see the acronym literals in src/data/civic/services.ts)
  blpd: [
    'business permit',
    'business license',
    "mayor's permit",
    'mayors permit',
  ],
  cdrrmo: ['disaster', 'emergency', 'disaster risk reduction', 'rescue'],
  cswdo: ['social welfare', 'welfare assistance'],
  cho: ['city health office', 'health office', 'health services'],
  cippeso: ['employment office', 'jobs', 'job referral', 'peso'],
  cavo: ['veterans office', 'veterans affairs'],
  ccsfp: ['city college', 'scholarship'],
  cenro: ['environment office', 'environment and natural resources'],
  ccro: [
    'civil registry',
    'civil registrar',
    'birth certificate',
    'marriage certificate',
    'death certificate',
  ],
  osca: ['senior citizen affairs', 'senior citizens', 'senior citizen id'],
  cadmino: ['city administrator', "administrator's office"],
  ocbo: ['building office', 'building permit office', 'housing office'],
  csfwd: ['water district', 'water utility', 'water billing'],
  casso: ['agriculture office', 'agriculture and fisheries'],
  cto: ['treasurer', "treasurer's office", 'real property tax', 'amilyar'],

  // Published service-category slugs (see src/app/services/categories.ts)
  'civil-registry': [
    'birth certificate',
    'marriage certificate',
    'death certificate',
    'civil registrar',
  ],
  'pwd-services': ['persons with disability', 'pwd id', 'disability services'],
  'senior-citizens': ['senior citizen', 'osca id', 'elderly services'],
  'social-welfare': ['welfare assistance', 'cswdo'],
  'assistance-programs': ['financial assistance', 'aid programs'],
  'property-taxes': ['real property tax', 'amilyar', 'tax declaration'],
  business: ['business permit', "mayor's permit", 'business license'],
  'disaster-preparedness': ['disaster', 'emergency', 'rescue', 'cdrrmo'],
  'utilities-water': ['water district', 'water billing', 'csfwd'],
  'infrastructure-public-works': ['public works', 'roads', 'drainage'],
  'housing-land-use': ['zoning', 'building permit', 'land use'],
} satisfies Record<string, readonly string[]>;

/**
 * Collects every alias phrase matching any of the given anchors (case-
 * insensitive), de-duplicated and space-joined for indexing. An anchor is
 * typically an office acronym or a service-category slug; unknown or
 * missing anchors simply contribute nothing.
 */
export function aliasesFor(
  ...anchors: readonly (string | undefined)[]
): string {
  const matches = new Set<string>();
  for (const anchor of anchors) {
    if (!anchor) continue;
    const aliases = ALIAS_TABLE[anchor.toLocaleLowerCase('en-PH')];
    if (aliases) for (const alias of aliases) matches.add(alias);
  }
  return [...matches].join(' ');
}
