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
    'kalamidad',
    'emerhensiya',
  ],
  cswdo: [
    'social welfare',
    'welfare assistance',
    'solo parent',
    'aics',
    'tulong panlipunan',
    'saup',
  ],
  cho: [
    'city health office',
    'health office',
    'health services',
    'kalusugan',
    'panulu',
  ],
  cippeso: [
    'employment office',
    'cpeso',
    'jobs',
    'job referral',
    'peso',
    'trabaho',
    'obra',
  ],
  cpeso: [
    'employment office',
    'cippeso',
    'jobs',
    'job referral',
    'peso',
    'trabaho',
    'obra',
  ],
  cavo: [
    'agriculture office',
    'veterinary office',
    'agriculture and veterinary',
    'agriculture and fisheries',
    'livestock',
    'seedlings',
    'pagsasaka',
    'beterinaryo',
  ],
  ccsfp: ['city college', 'college admission', 'kolehiyo'],
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
  'office-for-senior-citizens-affairs': [
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
    'pagpapatayo',
  ],
  csfwd: [
    'water district',
    'water utility',
    'water billing',
    'water connection',
    'water reconnection',
    'tubig',
    'danum',
  ],
  casso: [
    'city assessor',
    "assessor's office",
    'assessors office',
    'tax declaration',
    'property assessment',
    'real property assessment',
    'tax map',
  ],
  cto: [
    'treasurer',
    "treasurer's office",
    'real property tax',
    'tax payment',
    'bayad buwis',
    'amilyar',
  ],
  ctipo: ['tourism office', 'investment promotion', 'city tourism', 'turismo'],
  'city-treasurers-office': ['cedula', 'sedula', 'community tax certificate'],
  'business-license-permit-division': [
    'boss',
    'business one stop shop',
    'ebpls',
  ],
  'city-health-office': ['health certificate', 'sanitary permit', 'bakuna'],
  'city-agriculture-veterinary': [
    'animal bite',
    'anti-rabies',
    'rabies vaccination',
  ],
  'securing-community-tax-certificate-individual': [
    'cedula',
    'sedula',
    'community tax certificate',
  ],
  'request-for-animal-vaccination-and-treatment': [
    'animal bite',
    'anti-rabies',
    'rabies vaccination',
    'bakuna',
  ],
  'basic-immunization-services': ['bakuna', 'vaccination'],
  'availment-of-post-exposure-prophylaxis-anti-rabies-vaccine': ['bakuna'],
  'mayors-permit-for-business-new-business': [
    'boss',
    'business one stop shop',
    'ebpls',
    'permit sa negosyo',
    'lisensya sa negosyo',
  ],
  'mayors-permit-for-business-renewal': [
    'boss',
    'business one stop shop',
    'ebpls',
    'permit sa negosyo',
    'lisensya sa negosyo',
  ],
  'mayors-permit-for-business-special-permit': [
    'permit sa negosyo',
    'lisensya sa negosyo',
  ],
  'permit-to-operate-temporary-permit': [
    'permit sa negosyo',
    'lisensya sa negosyo',
  ],
  'availment-of-medicines': ['gamot'],
  'receiving-of-emergency-call': ['baha', 'albug', 'flood', 'emerhensiya'],
  'response-for-emergency-call': [
    'baha',
    'albug',
    'flood',
    'emerhensiya',
    'safru',
  ],
  'respond-to-emergency-cases': ['emerhensiya'],
  'requesting-certified-copy-of-birth-death-marriage-and-other-civil-registry-documents':
    [
      'birth certificate',
      'marriage certificate',
      'death certificate',
      'sertipiko ng kapanganakan',
      'sertipiko ng kasal',
      'sertipiko ng kamatayan',
    ],
  'registration-of-live-birth-for-marital-legitimate-and-non-marital-illegitimate-child-delayed':
    ['late registration'],
  'acceptance-of-water-bill-payments': ['water billing', 'bayarin sa tubig'],
  'new-service-application': ['water connection'],
  'reconnection-of-accounts-disconnected-within-twenty-four-24-hours': [
    'water reconnection',
  ],
  'reconnection-of-accounts-disconnected-after-twenty-four-24-hours': [
    'water reconnection',
  ],
  'payment-of-real-property-tax-or-amilyar': ['buwis sa ari-arian'],
  cmo: ['mayor', "mayor's office", 'city mayor', 'alkalde', 'munisipyu'],
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
  'rhu i': [
    'rural health unit',
    'rhu 1',
    'health center',
    'dolores health center',
    'klinika',
    'bakuna',
  ],
  'rhu-i-dolores': [
    'rhu i',
    'rhu 1',
    'rural health unit',
    'dolores health center',
    'klinika',
    'bakuna',
  ],
  'rhu ii': [
    'rural health unit',
    'rhu 2',
    'health center',
    'sindalan health center',
    'klinika',
    'bakuna',
  ],
  'rhu-ii-sindalan': [
    'rhu ii',
    'rhu 2',
    'rural health unit',
    'sindalan health center',
    'klinika',
    'bakuna',
  ],
  'rhu iii': [
    'rural health unit',
    'rhu 3',
    'health center',
    'san nicolas health center',
    'klinika',
    'bakuna',
  ],
  'rhu-iii-san-nicolas': [
    'rhu iii',
    'rhu 3',
    'rural health unit',
    'san nicolas health center',
    'klinika',
    'bakuna',
  ],
  'rhu iv': [
    'rural health unit',
    'rhu 4',
    'health center',
    'san agustin health center',
    'klinika',
    'bakuna',
  ],
  'rhu-iv-san-agustin': [
    'rhu iv',
    'rhu 4',
    'rural health unit',
    'san agustin health center',
    'klinika',
    'bakuna',
  ],
  'rhu v': [
    'rural health unit',
    'rhu 5',
    'health center',
    'calulut health center',
    'northville health center',
    'klinika',
    'bakuna',
  ],
  'rhu-v-northville-calulut': [
    'rhu v',
    'rhu 5',
    'rural health unit',
    'calulut health center',
    'northville health center',
    'klinika',
    'bakuna',
  ],
  'rhu vi': [
    'super health center',
    'rhu 6',
    'rural health unit',
    'san isidro health center',
    'fernandino infirmary',
    'civic health',
    'dialysis',
    'hemodialysis',
    'klinika',
    'bakuna',
  ],
  'san-fernando-super-health-center': [
    'super health center',
    'rhu vi',
    'rhu 6',
    'rural health unit',
    'san isidro health center',
    'fernandino infirmary',
    'civic health',
    'dialysis',
    'hemodialysis',
    'klinika',
    'bakuna',
  ],

  // Published service-category slugs (see src/app/[locale]/services/categories.ts)
  'civil-registry': ['civil registry', 'civil registrar'],
  'health-services': [
    'city health office',
    'health office',
    'health services',
    'kalusugan',
    'panulu',
  ],
  'pwd-services': [
    'persons with disability',
    'pwd id',
    'disability services',
    'serbisyo para sa pwd',
  ],
  'senior-citizens': [
    'senior citizen',
    'senior citizen id',
    'osca id',
    'elderly services',
    'serbisyo para sa nakatatanda',
    'nakatatanda',
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
    'tulong pinansyal',
  ],
  business: ['negosyo'],
  employment: [
    'public employment',
    'peso',
    'cpeso',
    'cippeso',
    'career',
    'trabaho',
    'jobs',
    'obra',
  ],
  education: ['city college', 'ccsfp', 'edukasyon', 'kolehiyo'],
  'agriculture-fisheries': [
    'agriculture office',
    'veterinary office',
    'cavo',
    'pagsasaka',
  ],
  'disaster-preparedness': ['disaster', 'cdrrmo', 'sakuna', 'kalamidad'],
  'utilities-water': [
    'water district',
    'water utility',
    'csfwd',
    'tubig',
    'danum',
  ],
  'infrastructure-public-works': [
    'public works',
    'roads',
    'drainage',
    'kalsada',
    'dalan',
    'tete',
    'kanal',
    'tulay',
  ],
  environment: [
    'cenro',
    'solid waste',
    'waste management',
    'compost',
    'basura',
    'kapaligiran',
  ],
} satisfies Record<string, readonly string[]>;

/**
 * Collects every alias phrase matching any of the given anchors (case-
 * insensitive), de-duplicated and space-joined for indexing. An anchor is
 * typically an office acronym, service-category slug, or stable record ID;
 * composite slash-separated acronyms (e.g. "CIPPESO / CPESO") also resolve
 * each part. CTO is ambiguous in the Tourism composite and must not inherit
 * the Treasurer's aliases.
 */
export function aliasesFor(
  ...anchors: readonly (string | undefined)[]
): string {
  const matches = new Set<string>();
  for (const anchor of anchors) {
    if (!anchor) continue;
    const normalized = anchor.trim().toLocaleLowerCase('en-PH');
    const candidates =
      normalized === 'cto / ctipo'
        ? ['ctipo']
        : normalized.includes('/')
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
