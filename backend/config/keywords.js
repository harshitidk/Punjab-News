/**
 * Punjab Political News Feed — Keyword Library
 *
 * Organized by category for filtering, scoring, and category assignment.
 * This library is the core of the relevance engine.
 */

export const KEYWORDS = {
  geography: [
    'punjab',
    'chandigarh',
    'punjab government',
    'punjab assembly',
    'punjab vidhan sabha',
    'amritsar',
    'ludhiana',
    'jalandhar',
    'patiala',
    'bathinda',
    'mohali',
    'pathankot',
    'hoshiarpur',
    'gurdaspur',
    'ferozepur',
    'moga',
    'sangrur',
    'barnala',
    'kapurthala',
    'faridkot',
    'muktsar',
    'mansa',
    'fatehgarh sahib',
    'rupnagar',
    'nawanshahr',
    'tarn taran',
    'fazilka',
    'malerkotla',
  ],

  parties: [
    'aap punjab',
    'aam aadmi party punjab',
    'congress punjab',
    'indian national congress punjab',
    'bjp punjab',
    'bharatiya janata party punjab',
    'shiromani akali dal',
    'sad',
    'bsp punjab',
    'bahujan samaj party punjab',
    'punjab lok congress',
  ],

  leaders: [
    'bhagwant mann',
    'bhagwant singh mann',
    'charanjit singh channi',
    'sukhbir singh badal',
    'parkash singh badal',
    'navjot singh sidhu',
    'captain amarinder',
    'amarinder singh',
    'raja warring',
    'partap singh bajwa',
    'bikram singh majithia',
    'harsimrat kaur badal',
    'raghav chadha',
    'anmol gagan mann',
    'punjab ministers',
    'punjab mla',
    'punjab mp',
    'punjab chief minister',
    'punjab cm',
  ],

  departments: [
    'punjab police',
    'education department punjab',
    'health department punjab',
    'agriculture department punjab',
    'transport department punjab',
    'ppsc',
    'punjab public service commission',
    'pspcl',
    'punjab state power corporation',
    'puda',
    'punjab urban development authority',
    'punjab revenue department',
    'punjab finance department',
    'punjab home department',
    'punjab excise department',
    'punjab food civil supplies',
    'punjab irrigation department',
    'punjab pwd',
    'dgp punjab',
  ],

  topics: [
    'election',
    'cabinet',
    'budget',
    'ordinance',
    'bill',
    'recruitment',
    'government jobs',
    'sarkari naukri',
    'policy',
    'protest',
    'development',
    'scheme',
    'governance',
    'lok sabha',
    'rajya sabha',
    'assembly session',
    'vote',
    'polling',
    'bypoll',
    'by-election',
    'manifesto',
    'rally',
    'subsidy',
    'reform',
    'welfare',
    'reservation',
    'corruption',
    'scam',
    'investigation',
    'cbi',
    'ed',
    'vigilance',
    'transfer',
    'posting',
    'ias',
    'ips',
    'pcs',
  ],
};

/**
 * Flattened keyword list for quick matching
 */
export const ALL_KEYWORDS = Object.values(KEYWORDS).flat();

/**
 * Category display names and colors for the UI
 */
export const CATEGORIES = {
  election: { label: 'Election', color: '#ef4444' },
  governance: { label: 'Governance', color: '#3b82f6' },
  recruitment: { label: 'Recruitment', color: '#10b981' },
  policy: { label: 'Policy', color: '#8b5cf6' },
  law_order: { label: 'Law & Order', color: '#f59e0b' },
  infrastructure: { label: 'Infrastructure', color: '#06b6d4' },
  education: { label: 'Education', color: '#ec4899' },
  health: { label: 'Health', color: '#14b8a6' },
  agriculture: { label: 'Agriculture', color: '#84cc16' },
  political_party: { label: 'Political Parties', color: '#f97316' },
  general: { label: 'General', color: '#6b7280' },
};

/**
 * Maps keywords to categories for automatic classification
 */
export const KEYWORD_CATEGORY_MAP = {
  election: ['election', 'vote', 'polling', 'bypoll', 'by-election', 'lok sabha', 'rajya sabha', 'manifesto', 'rally', 'assembly session'],
  governance: ['cabinet', 'governance', 'ordinance', 'bill', 'budget', 'reform', 'transfer', 'posting', 'ias', 'ips', 'pcs'],
  recruitment: ['recruitment', 'government jobs', 'sarkari naukri', 'ppsc', 'punjab public service commission'],
  policy: ['policy', 'scheme', 'subsidy', 'welfare', 'reservation', 'development'],
  law_order: ['punjab police', 'dgp punjab', 'vigilance', 'cbi', 'ed', 'corruption', 'scam', 'investigation', 'protest'],
  education: ['education department punjab'],
  health: ['health department punjab'],
  agriculture: ['agriculture department punjab'],
  political_party: [...['aap punjab', 'aam aadmi party punjab', 'congress punjab', 'bjp punjab', 'shiromani akali dal', 'sad', 'punjab lok congress']],
};

/**
 * Query strings optimized for NewsAPI search
 * Groups keywords into OR queries to maximize coverage within API limits
 */
export const API_QUERIES = [
  '"punjab government" OR "bhagwant mann" OR "punjab assembly" OR "punjab cabinet"',
  '"punjab election" OR "punjab police" OR "punjab recruitment" OR "ppsc punjab"',
  '"aap punjab" OR "congress punjab" OR "bjp punjab" OR "shiromani akali dal"',
  '"chandigarh" AND "punjab" OR "punjab budget" OR "punjab policy"',
];
