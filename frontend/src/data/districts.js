/**
 * Punjab Districts Data
 * Maps district IDs to names and alternate spellings for matching stories.
 */

export const DISTRICTS = [
  { id: 'amritsar',        name: 'Amritsar',        aliases: ['amritsar'] },
  { id: 'barnala',         name: 'Barnala',         aliases: ['barnala'] },
  { id: 'bathinda',        name: 'Bathinda',        aliases: ['bathinda', 'bhatinda'] },
  { id: 'faridkot',        name: 'Faridkot',        aliases: ['faridkot'] },
  { id: 'fatehgarh-sahib', name: 'Fatehgarh Sahib', aliases: ['fatehgarh sahib', 'fatehgarh'] },
  { id: 'fazilka',         name: 'Fazilka',         aliases: ['fazilka'] },
  { id: 'ferozepur',       name: 'Ferozepur',       aliases: ['ferozepur', 'firozpur'] },
  { id: 'gurdaspur',       name: 'Gurdaspur',       aliases: ['gurdaspur'] },
  { id: 'hoshiarpur',      name: 'Hoshiarpur',      aliases: ['hoshiarpur'] },
  { id: 'jalandhar',       name: 'Jalandhar',       aliases: ['jalandhar', 'jullundur'] },
  { id: 'kapurthala',      name: 'Kapurthala',      aliases: ['kapurthala'] },
  { id: 'ludhiana',        name: 'Ludhiana',        aliases: ['ludhiana'] },
  { id: 'malerkotla',      name: 'Malerkotla',      aliases: ['malerkotla'] },
  { id: 'mansa',           name: 'Mansa',           aliases: ['mansa'] },
  { id: 'moga',            name: 'Moga',            aliases: ['moga'] },
  { id: 'mohali',          name: 'Mohali',          aliases: ['mohali', 'sas nagar', 'sahibzada ajit singh nagar'] },
  { id: 'muktsar',         name: 'Sri Muktsar Sahib', aliases: ['muktsar', 'sri muktsar sahib'] },
  { id: 'nawanshahr',      name: 'Nawanshahr',      aliases: ['nawanshahr', 'shaheed bhagat singh nagar', 'sbs nagar'] },
  { id: 'pathankot',       name: 'Pathankot',       aliases: ['pathankot'] },
  { id: 'patiala',         name: 'Patiala',         aliases: ['patiala'] },
  { id: 'rupnagar',        name: 'Rupnagar',        aliases: ['rupnagar', 'ropar', 'roopnagar'] },
  { id: 'sangrur',         name: 'Sangrur',         aliases: ['sangrur'] },
  { id: 'tarn-taran',      name: 'Tarn Taran',      aliases: ['tarn taran'] },
];

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
