/**
 * Punjab District Map Component
 * Interactive SVG map of Punjab with all 23 districts.
 * Districts are colored by news density (heat map) and clickable.
 */

import { createElement } from '../utils/dom.js';
import { DISTRICTS, mapStoriesToDistricts, getMaxStoryCount } from '../data/districts.js';

import { DISTRICT_PATHS, LABEL_POSITIONS } from '../data/map_paths.js';


/**
 * Get heat map color based on story count
 */
function getHeatColor(count, maxCount) {
  if (count === 0) return 'rgba(255, 255, 255, 0.04)';
  const intensity = Math.max(0.15, Math.min(1, count / Math.max(maxCount, 1)));
  // Saffron/amber gradient: low = dim amber, high = bright saffron
  const r = Math.round(180 + intensity * 65);
  const g = Math.round(80 + intensity * 78);
  const b = Math.round(0 + intensity * 11);
  return `rgba(${r}, ${g}, ${b}, ${0.25 + intensity * 0.55})`;
}

let currentStories = [];

/**
 * Render the Punjab Map section
 */
export function renderPunjabMap(container, stories = [], onDistrictClick) {
  currentStories = stories;
  const districtMap = mapStoriesToDistricts(stories);
  const maxCount = getMaxStoryCount(districtMap);

  const mapSection = createElement('section', { className: 'map-section', id: 'mapSection' });

  // Map header
  const mapHeader = createElement('div', { className: 'map-header' });
  mapHeader.innerHTML = `
    <div class="map-title-row">
      <h2 class="map-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="map-icon">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        District News Map
      </h2>
      <div class="map-legend">
        <span class="legend-label">Less coverage</span>
        <div class="legend-bar"></div>
        <span class="legend-label">More coverage</span>
      </div>
    </div>
    <p class="map-subtitle">Click any district to view local news coverage</p>
  `;
  mapSection.appendChild(mapHeader);

  // Map container with SVG
  const mapContainer = createElement('div', { className: 'map-container', id: 'punjabMapContainer' });

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 600 700');
  svg.setAttribute('class', 'punjab-map-svg');
  svg.setAttribute('id', 'punjabMapSvg');

  // Defs for glow filter
  const defs = document.createElementNS(svgNS, 'defs');
  defs.innerHTML = `
    <filter id="districtGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="districtHoverGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  `;
  svg.appendChild(defs);

  // Create district group
  const districtGroup = document.createElementNS(svgNS, 'g');
  districtGroup.setAttribute('class', 'districts-group');

  for (const district of DISTRICTS) {
    const pathData = DISTRICT_PATHS[district.id];
    if (!pathData) continue;

    const storyCount = districtMap.get(district.id)?.length || 0;
    const fillColor = getHeatColor(storyCount, maxCount);

    // District group
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('class', `district-group ${storyCount > 0 ? 'has-stories' : 'no-stories'}`);
    g.setAttribute('data-district', district.id);
    g.setAttribute('data-count', storyCount);

    // Path
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('id', `district-${district.id}`);
    path.setAttribute('class', 'district-path');
    path.setAttribute('fill', fillColor);
    path.setAttribute('stroke', 'rgba(245, 158, 11, 0.3)');
    path.setAttribute('stroke-width', '1.2');
    if (storyCount > 0) {
      path.setAttribute('filter', 'url(#districtGlow)');
    }
    g.appendChild(path);

    // Label
    const labelPos = LABEL_POSITIONS[district.id];
    if (labelPos) {
      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', labelPos.x);
      text.setAttribute('y', labelPos.y);
      text.setAttribute('class', 'district-label');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.textContent = district.name;
      g.appendChild(text);

      // Story count badge
      if (storyCount > 0) {
        const badge = document.createElementNS(svgNS, 'text');
        badge.setAttribute('x', labelPos.x);
        badge.setAttribute('y', labelPos.y + 14);
        badge.setAttribute('class', 'district-count');
        badge.setAttribute('text-anchor', 'middle');
        badge.setAttribute('dominant-baseline', 'middle');
        badge.textContent = `${storyCount} ${storyCount === 1 ? 'story' : 'stories'}`;
        g.appendChild(badge);
      }
    }

    // Click handler
    g.addEventListener('click', () => {
      const latestMap = mapStoriesToDistricts(currentStories);
      const districtStories = latestMap.get(district.id) || [];
      onDistrictClick(district, districtStories);
    });

    districtGroup.appendChild(g);
  }

  svg.appendChild(districtGroup);
  mapContainer.appendChild(svg);

  // Tooltip element
  const tooltip = createElement('div', { className: 'map-tooltip', id: 'mapTooltip' });
  tooltip.style.display = 'none';
  mapContainer.appendChild(tooltip);

  mapSection.appendChild(mapContainer);

  // Stats bar
  const statsBar = createElement('div', { className: 'map-stats-bar', id: 'mapStatsBar' });
  mapSection.appendChild(statsBar);
  updateStatsBar(districtMap);

  container.appendChild(mapSection);

  // Set up hover tooltip
  setupTooltip(mapContainer);

  return mapSection;
}

/**
 * Update stats bar content
 */
function updateStatsBar(districtMap) {
  const statsBar = document.getElementById('mapStatsBar');
  if (!statsBar) return;

  const totalMapped = [...districtMap.values()].reduce((sum, arr) => sum + arr.length, 0);
  const districtsWithNews = [...districtMap.values()].filter(arr => arr.length > 0).length;

  statsBar.innerHTML = `
    <div class="map-stat">
      <span class="map-stat-value">${districtsWithNews}</span>
      <span class="map-stat-label">Districts with coverage</span>
    </div>
    <div class="map-stat">
      <span class="map-stat-value">${totalMapped}</span>
      <span class="map-stat-label">District-tagged stories</span>
    </div>
    <div class="map-stat">
      <span class="map-stat-value">${23 - districtsWithNews}</span>
      <span class="map-stat-label">Districts without coverage</span>
    </div>
  `;
}

/**
 * Set up hover tooltip for districts
 */
function setupTooltip(mapContainer) {
  const tooltip = mapContainer.querySelector('#mapTooltip');
  const svg = mapContainer.querySelector('#punjabMapSvg');

  svg.addEventListener('mousemove', (e) => {
    const districtGroup = e.target.closest('.district-group');
    if (!districtGroup) {
      tooltip.style.display = 'none';
      return;
    }

    const districtId = districtGroup.dataset.district;
    const district = DISTRICTS.find(d => d.id === districtId);
    
    // Get latest story count dynamically
    const latestMap = mapStoriesToDistricts(currentStories);
    const count = latestMap.get(districtId)?.length || 0;

    tooltip.innerHTML = `
      <div class="tooltip-name">${district?.name || districtId}</div>
      <div class="tooltip-count">${count} ${count === 1 ? 'story' : 'stories'}</div>
      ${count > 0 ? '<div class="tooltip-hint">Click to view</div>' : '<div class="tooltip-hint dim">No coverage</div>'}
    `;
    tooltip.style.display = 'block';

    // Position tooltip near cursor
    const rect = mapContainer.getBoundingClientRect();
    const x = e.clientX - rect.left + 15;
    const y = e.clientY - rect.top - 10;
    tooltip.style.left = `${Math.min(x, rect.width - 160)}px`;
    tooltip.style.top = `${Math.max(y, 10)}px`;
  });

  svg.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });
}

/**
 * Update map colors and dynamically update layout / stats / tags when stories change
 */
export function updateMapColors(stories) {
  currentStories = stories;
  const districtMap = mapStoriesToDistricts(stories);
  const maxCount = getMaxStoryCount(districtMap);

  for (const district of DISTRICTS) {
    const path = document.getElementById(`district-${district.id}`);
    if (!path) continue;

    const count = districtMap.get(district.id)?.length || 0;
    path.setAttribute('fill', getHeatColor(count, maxCount));
    
    if (count > 0) {
      path.setAttribute('filter', 'url(#districtGlow)');
    } else {
      path.removeAttribute('filter');
    }

    // Update parent group classes & datasets
    const g = path.parentNode;
    if (g) {
      g.setAttribute('class', `district-group ${count > 0 ? 'has-stories' : 'no-stories'}`);
      g.setAttribute('data-count', count);

      // Update or add/remove story count badge text element
      let badge = g.querySelector('.district-count');
      if (count > 0) {
        if (!badge) {
          const svgNS = 'http://www.w3.org/2000/svg';
          badge = document.createElementNS(svgNS, 'text');
          const labelPos = LABEL_POSITIONS[district.id];
          if (labelPos) {
            badge.setAttribute('x', labelPos.x);
            badge.setAttribute('y', labelPos.y + 14);
            badge.setAttribute('class', 'district-count');
            badge.setAttribute('text-anchor', 'middle');
            badge.setAttribute('dominant-baseline', 'middle');
            g.appendChild(badge);
          }
        }
        if (badge) {
          badge.textContent = `${count} ${count === 1 ? 'story' : 'stories'}`;
        }
      } else if (badge) {
        badge.remove();
      }
    }
  }

  // Update bottom stats bar
  updateStatsBar(districtMap);
}
