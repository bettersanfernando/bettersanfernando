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
  // Office acronyms (see the acronym literals in src/data/civic/services.ts
  // and src/data/generated/civic/city-offices.json)
  blpd: [
    'business permit',
    'business license',
    "mayor's permit",
    'mayors permit',
    'working permit',
    'permit sa negosyo',
    'lisensya sa negosyo',
  ],
  cdrrmo: [
    'disaster',
    'emergency',
    'disaster risk reduction',
    'rescue',
    'safru',
    'sakuna',
    'emerhensiya',
  ],
  cswdo: [
    'social welfare',
    'welfare assistance',
    'solo parent',
    'aics',
    'tulong panlipunan',
  ],
  cho: [
    'city health office',
    'health office',
    'health services',
    'health certificate',
    'sanitary permit',
    'bakuna',
    'kalusugan',
  ],
  cippeso: [
    'employment office',
    'cpeso',
    'jobs',
    'job referral',
    'peso',
    'trabaho',
  ],
  cpeso: [
    'employment office',
    'cippeso',
    'jobs',
    'job referral',
    'peso',
    'trabaho',
  ],
  cavo: [
    'agriculture office',
    'veterinary office',
    'agriculture and veterinary',
    'agriculture and fisheries',
    'animal bite',
    'anti-rabies',
    'rabies vaccination',
    'livestock',
    'seedlings',
    'pagsasaka',
    'beterinaryo',
  ],
  ccsfp: ['city college', 'scholarship', 'college admission', 'kolehiyo'],
  cenro: [
    'environment office',
    'environment and natural resources',
    'solid waste',
    'waste management',
    'tree cutting',
    'compost',
    'basura',
    'kapaligiran',
  ],
  ccro: [
    'civil registry',
    'civil registrar',
    'birth certificate',
    'marriage certificate',
    'death certificate',
    'late registration',
    'sertipiko ng kapanganakan',
    'sertipiko ng kasal',
    'sertipiko ng kamatayan',
  ],
  osca: [
    'senior citizen affairs',
    'senior citizens',
    'senior citizen id',
    'elderly affairs',
    'nakatatanda',
  ],
  cadmino: ['city administrator', "administrator's office"],
  ocbo: [
    'building office',
    'building official',
    'building permit',
    'building permit office',
    'occupancy permit',
    'electrical permit',
    'housing office',
  ],
  csfwd: [
    'water district',
    'water utility',
    'water billing',
    'water connection',
    'water reconnection',
    'tubig',
  ],
  casso: [
    'city assessor',
    "assessor's office",
    'assessors office',
    'tax declaration',
    'property assessment',
    'real property assessment',
    'tax map',
    'amilyar',
  ],
  cto: [
    'treasurer',
    "treasurer's office",
    'real property tax',
    'tax payment',
    'cedula',
    'sedula',
    'community tax certificate',
    'amilyar',
  ],
  ctipo: ['tourism office', 'investment promotion', 'city tourism', 'turismo'],
  cmo: ['mayor', "mayor's office", 'city mayor', 'alkalde'],
  ocvm: ['vice mayor', "vice mayor's office", 'bise alkalde'],
  osp: [
    'sangguniang panlungsod',
    'city council',
    'legislative',
    'ordinance',
    'resolution',
    'ordinansa',
  ],
  cio: ['information office', 'public information', 'city information'],
  cposco: [
    'public order',
    'safety coordinating',
    'traffic',
    'traffic enforcement',
    'parking',
    'trapiko',
  ],
  cpdco: [
    'planning and development',
    'zoning',
    'locational clearance',
    'land use',
  ],
  ceo: ['engineering office', 'city engineer', 'public works', 'inhinyero'],
  cicto: ['information and communications technology', 'ict office'],
  cydo: ['youth development', 'youth office', 'kabataan'],
  chrmo: ['human resource', 'hr office', 'city hall jobs'],
  cbo: ['budget office', 'city budget'],
  cacco: ['accounting office', 'city accountant'],
  cgso: ['general services office', 'procurement', 'supply'],
  clo: ['legal office', 'city legal', 'legal assistance'],
  'rhu i': ['rural health unit', 'health center', 'klinika', 'bakuna'],
  'rhu ii': ['rural health unit', 'health center', 'klinika', 'bakuna'],
  'rhu iii': ['rural health unit', 'health center', 'klinika', 'bakuna'],
  'rhu iv': ['rural health unit', 'health center', 'klinika', 'bakuna'],

  // Published service-category slugs (see src/app/[locale]/services/categories.ts)
  'civil-registry': [
    'birth certificate',
    'marriage certificate',
    'death certificate',
    'civil registrar',
  ],
  'health-services': [
    'city health office',
    'rural health unit',
    'medical consultation',
    'vaccination',
    'dental',
    'laboratory',
    'bakuna',
    'kalusugan',
  ],
  'pwd-services': [
    'persons with disability',
    'pwd id',
    'disability services',
    'serbisyo para sa pwd',
  ],
  'senior-citizens': [
    'senior citizen',
    'osca id',
    'elderly services',
    'serbisyo para sa nakatatanda',
  ],
  'social-welfare': [
    'welfare assistance',
    'cswdo',
    'solo parent',
    'tulong panlipunan',
  ],
  'assistance-programs': [
    'financial assistance',
    'aid programs',
    'aics',
    'medical assistance',
    'burial assistance',
    'tulong pinansyal',
  ],
  'property-taxes': [
    'real property tax',
    'amilyar',
    'tax declaration',
    'city assessor',
    'cedula',
    'sedula',
    'buwis sa ari-arian',
  ],
  business: [
    'business permit',
    "mayor's permit",
    'business license',
    'working permit',
    'permit sa negosyo',
  ],
  employment: [
    'job referral',
    'public employment',
    'peso',
    'cpeso',
    'cippeso',
    'career',
    'trabaho',
  ],
  education: [
    'scholarship',
    'educational assistance',
    'city college',
    'ccsfp',
    'edukasyon',
  ],
  'agriculture-fisheries': [
    'agriculture office',
    'veterinary office',
    'cavo',
    'seedlings',
    'livestock',
    'anti-rabies',
    'animal bite',
    'pagsasaka',
  ],
  'disaster-preparedness': [
    'disaster',
    'emergency',
    'rescue',
    'cdrrmo',
    'safru',
    'sakuna',
  ],
  'utilities-water': [
    'water district',
    'water billing',
    'water connection',
    'csfwd',
    'tubig',
    'bayarin sa tubig',
  ],
  'infrastructure-public-works': [
    'public works',
    'roads',
    'drainage',
    'kalsada',
    'kanal',
  ],
  'housing-land-use': [
    'zoning',
    'building permit',
    'occupancy permit',
    'land use',
    'pagpapatayo',
  ],
  environment: [
    'cenro',
    'solid waste',
    'waste management',
    'tree cutting',
    'compost',
    'basura',
    'kapaligiran',
  ],
} satisfies Record<string, readonly string[]>;

/**
 * Collects every alias phrase matching any of the given anchors (case-
 * insensitive), de-duplicated and space-joined for indexing. An anchor is
 * typically an office acronym or a service-category slug; composite slash-
 * separated acronyms (e.g. "CIPPESO / CPESO") also resolve each part.
 */
export function aliasesFor(
  ...anchors: readonly (string | undefined)[]
): string {
  const matches = new Set<string>();
  for (const anchor of anchors) {
    if (!anchor) continue;
    const normalized = anchor.trim().toLocaleLowerCase('en-PH');
    const candidates = normalized.includes('/')
      ? [
          normalized,
          ...normalized
            .split('/')
            .map(part => part.trim())
            .filter(Boolean),
        ]
      : [normalized];
    for (const key of candidates) {
      const aliases = ALIAS_TABLE[key];
      if (aliases) for (const alias of aliases) matches.add(alias);
    }
  }
  return [...matches].join(' ');
}
