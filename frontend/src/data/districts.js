/**
 * Punjab Districts Data
 * Maps district IDs to names and alternate spellings for matching stories.
 */

export const DISTRICTS = [
  { id: 'amritsar',        name: 'Amritsar',        aliases: ['amritsar'], region: 'majha' },
  { id: 'barnala',         name: 'Barnala',         aliases: ['barnala'], region: 'malwa' },
  { id: 'bathinda',        name: 'Bathinda',        aliases: ['bathinda', 'bhatinda'], region: 'malwa' },
  { id: 'faridkot',        name: 'Faridkot',        aliases: ['faridkot'], region: 'malwa' },
  { id: 'fatehgarh-sahib', name: 'Fatehgarh Sahib', aliases: ['fatehgarh sahib', 'fatehgarh'], region: 'malwa' },
  { id: 'fazilka',         name: 'Fazilka',         aliases: ['fazilka'], region: 'malwa' },
  { id: 'ferozepur',       name: 'Ferozepur',       aliases: ['ferozepur', 'firozpur'], region: 'malwa' },
  { id: 'gurdaspur',       name: 'Gurdaspur',       aliases: ['gurdaspur'], region: 'majha' },
  { id: 'hoshiarpur',      name: 'Hoshiarpur',      aliases: ['hoshiarpur'], region: 'doaba' },
  { id: 'jalandhar',       name: 'Jalandhar',       aliases: ['jalandhar', 'jullundur'], region: 'doaba' },
  { id: 'kapurthala',      name: 'Kapurthala',      aliases: ['kapurthala'], region: 'doaba' },
  { id: 'ludhiana',        name: 'Ludhiana',        aliases: ['ludhiana'], region: 'malwa' },
  { id: 'malerkotla',      name: 'Malerkotla',      aliases: ['malerkotla'], region: 'malwa' },
  { id: 'mansa',           name: 'Mansa',           aliases: ['mansa'], region: 'malwa' },
  { id: 'moga',            name: 'Moga',            aliases: ['moga'], region: 'malwa' },
  { id: 'mohali',          name: 'Mohali',          aliases: ['mohali', 'sas nagar', 'sahibzada ajit singh nagar'], region: 'malwa' },
  { id: 'muktsar',         name: 'Sri Muktsar Sahib', aliases: ['muktsar', 'sri muktsar sahib'], region: 'malwa' },
  { id: 'nawanshahr',      name: 'Nawanshahr',      aliases: ['nawanshahr', 'shaheed bhagat singh nagar', 'sbs nagar'], region: 'doaba' },
  { id: 'pathankot',       name: 'Pathankot',       aliases: ['pathankot'], region: 'majha' },
  { id: 'patiala',         name: 'Patiala',         aliases: ['patiala'], region: 'malwa' },
  { id: 'rupnagar',        name: 'Rupnagar',        aliases: ['rupnagar', 'ropar', 'roopnagar'], region: 'malwa' },
  { id: 'sangrur',         name: 'Sangrur',         aliases: ['sangrur'], region: 'malwa' },
  { id: 'tarn-taran',      name: 'Tarn Taran',      aliases: ['tarn taran'], region: 'majha' },
];

/**
 * Punjab Regions Configuration
 */
export const REGIONS = {
  majha: {
    id: 'majha',
    name: 'Majha Region',
    districts: ['pathankot', 'gurdaspur', 'amritsar', 'tarn-taran'],
    color: '#10b981', // Emerald Green
    description: 'The historical heartland lying between the Beas and Ravi rivers.'
  },
  doaba: {
    id: 'doaba',
    name: 'Doaba Region',
    districts: ['hoshiarpur', 'kapurthala', 'jalandhar', 'nawanshahr'],
    color: '#3b82f6', // Royal Blue
    description: 'The fertile region lying between the Beas and Sutlej rivers.'
  },
  malwa: {
    id: 'malwa',
    name: 'Malwa Region',
    districts: [
      'ludhiana', 'rupnagar', 'mohali', 'fatehgarh-sahib', 'patiala',
      'sangrur', 'barnala', 'malerkotla', 'mansa', 'bathinda',
      'muktsar', 'faridkot', 'moga', 'ferozepur', 'fazilka'
    ],
    color: '#f97316', // Deep Saffron / Orange
    description: 'The largest region in Punjab lying south of the Sutlej river.'
  }
};

/**
 * Map stories to districts based on entities.districts field.
 * Returns a Map of districtId -> [stories]
 */
export function mapStoriesToDistricts(stories) {
  const districtMap = new Map();

  // Initialize all districts with empty arrays
  for (const d of DISTRICTS) {
    districtMap.set(d.id, []);
  }

  for (const story of stories) {
    const storyDistricts = story.entities?.districts || [];
    const storyText = `${story.headline || ''} ${story.summary || ''}`.toLowerCase();

    for (const district of DISTRICTS) {
      let matched = false;

      // Check entity-extracted districts
      for (const entityDistrict of storyDistricts) {
        const entityLower = entityDistrict.toLowerCase();
        for (const alias of district.aliases) {
          if (entityLower.includes(alias) || alias.includes(entityLower)) {
            matched = true;
            break;
          }
        }
        if (matched) break;
      }

      // Fallback: Check headline/summary text directly
      if (!matched) {
        for (const alias of district.aliases) {
          if (storyText.includes(alias)) {
            matched = true;
            break;
          }
        }
      }

      if (matched) {
        districtMap.get(district.id).push(story);
      }
    }
  }

  return districtMap;
}

/**
 * Get the maximum story count across all districts (for heat map scaling)
 */
export function getMaxStoryCount(districtMap) {
  let max = 0;
  for (const stories of districtMap.values()) {
    if (stories.length > max) max = stories.length;
  }
  return max;
}

/**
 * Get aggregated, unique stories for an entire region sorted chronologically
 */
export function getRegionStories(regionId, stories) {
  const regionConfig = REGIONS[regionId];
  if (!regionConfig) return [];

  const districtMap = mapStoriesToDistricts(stories);
  const regionStories = [];
  const seenIds = new Set();

  for (const distId of regionConfig.districts) {
    const distStories = districtMap.get(distId) || [];
    for (const story of distStories) {
      const idStr = String(story.id);
      if (!seenIds.has(idStr)) {
        seenIds.add(idStr);
        regionStories.push(story);
      }
    }
  }

  return regionStories.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}
