/**
 * Punjab District Map Component
 * Interactive SVG map of Punjab with all 23 districts.
 * Districts are colored by news density (heat map) or region and clickable.
 */

import { createElement } from '../utils/dom.js';
import { DISTRICTS, mapStoriesToDistricts, getMaxStoryCount, REGIONS, getRegionStories } from '../data/districts.js';
import { DISTRICT_PATHS, LABEL_POSITIONS } from '../data/map_paths.js';

let currentStories = [];
let currentMode = 'heatmap'; // 'heatmap' or 'regions'

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

/**
 * Get region color based on region ID and story activity
 */
function getRegionColor(regionId, count) {
  const colors = {
    majha: { r: 16, g: 185, b: 129 },   // Emerald Green
    doaba: { r: 59, g: 130, b: 246 },   // Royal Blue
    malwa: { r: 249, g: 115, b: 22 }    // Deep Orange/Saffron
  };

  const base = colors[regionId] || colors.malwa;
  if (count === 0) {
    return `rgba(${base.r}, ${base.g}, ${base.b}, 0.08)`;
  }
  return `rgba(${base.r}, ${base.g}, ${base.b}, 0.45)`;
}

/**
 * Render the Punjab Map section
 */
export function renderPunjabMap(container, stories = [], onDistrictClick) {
  currentStories = stories;
  const districtMap = mapStoriesToDistricts(stories);

  const mapSection = createElement('section', { className: 'map-section', id: 'mapSection' });

  // Map header
  const mapHeader = createElement('div', { className: 'map-header' });
  mapHeader.innerHTML = `
    <div class="map-title-row">
      <div class="map-title-left">
        <h2 class="map-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="map-icon">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Punjab News Map
        </h2>
        <p class="map-subtitle">Click a district or region to view localized political stories</p>
      </div>
      
      <div class="map-controls">
        <div class="map-mode-toggle">
          <button class="map-toggle-btn active" id="modeHeatmapBtn" data-mode="heatmap">Heatmap</button>
          <button class="map-toggle-btn" id="modeRegionsBtn" data-mode="regions">Regions</button>
        </div>
      </div>
    </div>
    
    <div class="map-legend-row">
      <!-- Heatmap legend -->
      <div class="map-legend" id="heatmapLegend">
        <span class="legend-label">Less coverage</span>
        <div class="legend-bar"></div>
        <span class="legend-label">More coverage</span>
      </div>
      
      <!-- Regions legend (hidden by default) -->
      <div class="map-regions-legend" id="regionsLegend" style="display: none;">
        <button class="region-legend-card" data-region="majha" style="--region-color: #10b981;">
          <span class="region-legend-dot"></span>
          <span class="region-legend-name">Majha</span>
          <span class="region-legend-count" id="regionCount_majha">0 stories</span>
        </button>
        <button class="region-legend-card" data-region="doaba" style="--region-color: #3b82f6;">
          <span class="region-legend-dot"></span>
          <span class="region-legend-name">Doaba</span>
          <span class="region-legend-count" id="regionCount_doaba">0 stories</span>
        </button>
        <button class="region-legend-card" data-region="malwa" style="--region-color: #f97316;">
          <span class="region-legend-dot"></span>
          <span class="region-legend-name">Malwa</span>
          <span class="region-legend-count" id="regionCount_malwa">0 stories</span>
        </button>
      </div>
    </div>
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

    // District group
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('class', 'district-group');
    g.setAttribute('data-district', district.id);

    // Path
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('id', `district-${district.id}`);
    path.setAttribute('class', 'district-path');
    path.setAttribute('stroke-width', '1.2');
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

  container.appendChild(mapSection);

  // Initialize view mode event listeners
  const heatmapBtn = mapHeader.querySelector('#modeHeatmapBtn');
  const regionsBtn = mapHeader.querySelector('#modeRegionsBtn');
  const heatmapLegend = mapHeader.querySelector('#heatmapLegend');
  const regionsLegend = mapHeader.querySelector('#regionsLegend');

  heatmapBtn?.addEventListener('click', () => {
    if (currentMode === 'heatmap') return;
    currentMode = 'heatmap';
    heatmapBtn.classList.add('active');
    regionsBtn.classList.remove('active');
    heatmapLegend.style.display = '';
    regionsLegend.style.display = 'none';
    updateMapColors(currentStories);
  });

  regionsBtn?.addEventListener('click', () => {
    if (currentMode === 'regions') return;
    currentMode = 'regions';
    regionsBtn.classList.add('active');
    heatmapBtn.classList.remove('active');
    heatmapLegend.style.display = 'none';
    regionsLegend.style.display = '';
    updateMapColors(currentStories);
  });

  // Set up hover tooltip
  setupTooltip(mapContainer);

  // Set up region legend selection & mouse interactions
  setupLegendInteractions(regionsLegend, svg, onDistrictClick);

  // Draw initial colors
  updateMapColors(stories);

  return mapSection;
}

/**
 * Set up hover highlight matching and drawer triggering on region legend cards
 */
function setupLegendInteractions(regionsLegend, svg, onDistrictClick) {
  if (!regionsLegend) return;
  const cards = regionsLegend.querySelectorAll('.region-legend-card');
  
  cards.forEach(card => {
    const regionId = card.dataset.region;
    
    // Highlight matching region on hover
    card.addEventListener('mouseenter', () => {
      svg.classList.add(`highlight-${regionId}`);
    });
    
    card.addEventListener('mouseleave', () => {
      svg.classList.remove(`highlight-${regionId}`);
    });

    // Click on legend card to open panel with all region stories
    card.addEventListener('click', () => {
      const regionConfig = REGIONS[regionId];
      if (!regionConfig) return;

      const regionStories = getRegionStories(regionId, currentStories);
      const regionObj = {
        id: regionId,
        name: regionConfig.name,
        isRegion: true,
        districtsList: regionConfig.districts.map(id => DISTRICTS.find(d => d.id === id)?.name).join(', ')
      };

      onDistrictClick(regionObj, regionStories);
    });
  });
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

    const regionName = district ? (REGIONS[district.region]?.name || district.region) : '';

    tooltip.innerHTML = `
      <div class="tooltip-name">${district?.name || districtId}</div>
      ${regionName ? `<div class="tooltip-region" style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px; font-weight: var(--weight-medium);">${regionName} Region</div>` : ''}
      <div class="tooltip-count" style="margin-top: 4px;">${count} ${count === 1 ? 'story' : 'stories'}</div>
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
 * Update region legend counts inside HTML elements
 */
function updateRegionLegendCounts(stories) {
  for (const regionId of ['majha', 'doaba', 'malwa']) {
    const el = document.getElementById(`regionCount_${regionId}`);
    if (el) {
      const regionStories = getRegionStories(regionId, stories);
      el.textContent = `${regionStories.length} ${regionStories.length === 1 ? 'story' : 'stories'}`;
    }
  }
}

/**
 * Update map colors and dynamically update layout / stats / tags when stories change
 */
export function updateMapColors(stories) {
  currentStories = stories;
  const districtMap = mapStoriesToDistricts(stories);
  const maxCount = getMaxStoryCount(districtMap);

  // Update regions legend numbers dynamically
  updateRegionLegendCounts(stories);

  for (const district of DISTRICTS) {
    const path = document.getElementById(`district-${district.id}`);
    if (!path) continue;

    const count = districtMap.get(district.id)?.length || 0;

    let fillColor;
    if (currentMode === 'heatmap') {
      fillColor = getHeatColor(count, maxCount);
      path.setAttribute('stroke', 'rgba(245, 158, 11, 0.3)');
    } else {
      fillColor = getRegionColor(district.region, count);
      path.setAttribute('stroke', 'rgba(255, 255, 255, 0.15)');
    }

    path.setAttribute('fill', fillColor);
    
    if (count > 0) {
      path.setAttribute('filter', 'url(#districtGlow)');
    } else {
      path.removeAttribute('filter');
    }

    // Update parent group classes & datasets
    const g = path.parentNode;
    if (g) {
      g.setAttribute('class', `district-group ${count > 0 ? 'has-stories' : 'no-stories'} region-${district.region}`);
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

