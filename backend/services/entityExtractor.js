/**
 * Entity extraction service.
 * Uses regex + dictionary-based matching to extract structured entities from articles.
 * No external NLP dependency — lightweight for MVP.
 */

import { KEYWORDS } from '../config/keywords.js';

/**
 * Extract entities from an article
 */
export function extractEntities(article) {
  const text = `${article.title || ''} ${article.description || ''} ${article.content || ''}`;

  return {
    politicians: extractPoliticians(text),
    parties: extractParties(text),
    departments: extractDepartments(text),
    districts: extractDistricts(text),
    locations: extractLocations(text),
    dates: extractDates(text),
    numbers: extractNumbers(text),
    schemes: extractSchemes(text),
    organizations: extractOrganizations(text),
  };
}

/**
 * Extract politician names from text
 */
function extractPoliticians(text) {
  const found = new Set();
  const politicianNames = [
    'Bhagwant Mann',
    'Bhagwant Singh Mann',
    'Charanjit Singh Channi',
    'Sukhbir Singh Badal',
    'Parkash Singh Badal',
    'Navjot Singh Sidhu',
    'Captain Amarinder Singh',
    'Amarinder Singh',
    'Raja Warring',
    'Partap Singh Bajwa',
    'Bikram Singh Majithia',
    'Harsimrat Kaur Badal',
    'Raghav Chadha',
    'Anmol Gagan Mann',
    'Arvind Kejriwal',
    'Rahul Gandhi',
    'Narendra Modi',
    'Amit Shah',
  ];

  for (const name of politicianNames) {
    if (text.toLowerCase().includes(name.toLowerCase())) {
      found.add(name);
    }
  }

  // Also match generic titles
  const titlePatterns = [
    /(?:Chief Minister|CM)\s+(?:of\s+)?Punjab/gi,
    /Punjab\s+(?:Chief Minister|CM)/gi,
    /(?:Governor|DGP|AG)\s+(?:of\s+)?Punjab/gi,
    /MLA\s+[A-Z][a-z]+\s+[A-Z][a-z]+/g,
    /MP\s+[A-Z][a-z]+\s+[A-Z][a-z]+/g,
  ];

  for (const pattern of titlePatterns) {
    const matches = text.match(pattern);
    if (matches) matches.forEach((m) => found.add(m.trim()));
  }

  return [...found];
}

/**
 * Extract political party names
 */
function extractParties(text) {
  const found = new Set();
  const partyNames = [
    { full: 'Aam Aadmi Party', short: 'AAP' },
    { full: 'Indian National Congress', short: 'Congress' },
    { full: 'Bharatiya Janata Party', short: 'BJP' },
    { full: 'Shiromani Akali Dal', short: 'SAD' },
    { full: 'Bahujan Samaj Party', short: 'BSP' },
    { full: 'Punjab Lok Congress', short: 'PLC' },
  ];

  for (const party of partyNames) {
    if (text.toLowerCase().includes(party.full.toLowerCase())) {
      found.add(party.full);
    } else if (new RegExp(`\\b${party.short}\\b`).test(text)) {
      found.add(party.full);
    }
  }

  return [...found];
}

/**
 * Extract government departments
 */
function extractDepartments(text) {
  const found = new Set();
  const depts = KEYWORDS.departments;

  for (const dept of depts) {
    if (text.toLowerCase().includes(dept.toLowerCase())) {
      found.add(formatEntityName(dept));
    }
  }

  return [...found];
}

/**
 * Extract district names
 */
function extractDistricts(text) {
  const found = new Set();
  const districts = KEYWORDS.geography.filter(
    (g) => !['punjab', 'chandigarh', 'punjab government', 'punjab assembly', 'punjab vidhan sabha'].includes(g)
  );

  for (const district of districts) {
    if (text.toLowerCase().includes(district.toLowerCase())) {
      found.add(formatEntityName(district));
    }
  }

  return [...found];
}

/**
 * Extract general location references
 */
function extractLocations(text) {
  const found = new Set();
  const locations = ['Punjab', 'Chandigarh', 'New Delhi', 'Delhi', 'India'];

  for (const loc of locations) {
    if (text.includes(loc)) {
      found.add(loc);
    }
  }

  return [...found];
}

/**
 * Extract dates from text
 */
function extractDates(text) {
  const found = new Set();
  const datePatterns = [
    /\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/gi,
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
  ];

  for (const pattern of datePatterns) {
    const matches = text.match(pattern);
    if (matches) matches.forEach((m) => found.add(m.trim()));
  }

  return [...found];
}

/**
 * Extract significant numbers (budgets, amounts, counts)
 */
function extractNumbers(text) {
  const found = new Set();
  const numberPatterns = [
    /(?:Rs\.?|₹|INR)\s*[\d,]+(?:\.\d+)?\s*(?:crore|lakh|million|billion)?/gi,
    /\b\d{1,3}(?:,\d{3})*\s+(?:crore|lakh|million|billion)\b/gi,
    /\b\d+\s*(?:percent|%)\b/gi,
  ];

  for (const pattern of numberPatterns) {
    const matches = text.match(pattern);
    if (matches) matches.forEach((m) => found.add(m.trim()));
  }

  return [...found];
}

/**
 * Extract government schemes
 */
function extractSchemes(text) {
  const found = new Set();
  const schemePatterns = [
    /\b[A-Z][a-z]+\s+(?:Yojana|Scheme|Mission|Abhiyan|Programme|Program)\b/g,
    /\bPM\s+[A-Z][a-z]+\s+[A-Z][a-z]+/g,
    /\b(?:Ayushman|MGNREGA|Swachh|Smart\s+City|Digital\s+India)\b/gi,
  ];

  for (const pattern of schemePatterns) {
    const matches = text.match(pattern);
    if (matches) matches.forEach((m) => found.add(m.trim()));
  }

  return [...found];
}

/**
 * Extract organization names
 */
function extractOrganizations(text) {
  const found = new Set();
  const orgs = [
    'Election Commission',
    'Supreme Court',
    'High Court',
    'Punjab and Haryana High Court',
    'SGPC',
    'DSGMC',
    'Punjab University',
    'Punjabi University',
    'GNDU',
    'IIT Ropar',
    'NIT Jalandhar',
  ];

  for (const org of orgs) {
    if (text.toLowerCase().includes(org.toLowerCase())) {
      found.add(org);
    }
  }

  return [...found];
}

/**
 * Format entity name (capitalize each word)
 */
function formatEntityName(name) {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Merge entities from multiple articles
 */
export function mergeEntities(entitiesList) {
  const merged = {
    politicians: new Set(),
    parties: new Set(),
    departments: new Set(),
    districts: new Set(),
    locations: new Set(),
    dates: new Set(),
    numbers: new Set(),
    schemes: new Set(),
    organizations: new Set(),
  };

  for (const entities of entitiesList) {
    for (const [key, values] of Object.entries(entities)) {
      if (merged[key]) {
        values.forEach((v) => merged[key].add(v));
      }
    }
  }

  // Convert sets back to arrays
  const result = {};
  for (const [key, valueSet] of Object.entries(merged)) {
    result[key] = [...valueSet];
  }

  return result;
}
