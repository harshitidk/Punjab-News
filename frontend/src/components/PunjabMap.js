/**
 * Punjab District Map Component
 * Interactive SVG map of Punjab with all 23 districts.
 * Districts are colored by news density (heat map) and clickable.
 */

import { createElement } from '../utils/dom.js';
import { DISTRICTS, mapStoriesToDistricts, getMaxStoryCount } from '../data/districts.js';

/**
 * SVG path data for each district (simplified boundaries, correct relative positions)
 * ViewBox: 0 0 500 720
 */
const DISTRICT_PATHS = {
  'pathankot':       'M 245,5 L 290,5 320,20 335,55 310,85 265,90 230,75 225,40 Z',
  'gurdaspur':       'M 135,55 L 225,40 230,75 265,90 310,85 290,145 250,190 195,195 140,175 100,140 105,95 Z',
  'hoshiarpur':      'M 310,85 L 335,55 380,35 430,40 460,70 465,130 450,195 410,240 360,240 305,215 280,175 290,145 Z',
  'amritsar':        'M 30,145 L 100,140 140,175 195,195 190,240 170,280 120,305 60,300 25,265 15,210 Z',
  'tarn-taran':      'M 15,305 L 60,300 120,305 130,345 110,385 60,395 20,375 10,340 Z',
  'kapurthala':      'M 170,280 L 190,240 195,195 250,190 265,225 255,270 220,295 185,305 Z',
  'jalandhar':       'M 250,190 L 305,215 360,240 350,275 320,300 270,300 255,270 265,225 Z',
  'nawanshahr':      'M 360,240 L 410,240 440,260 445,305 415,330 370,320 335,300 350,275 Z',
  'rupnagar':        'M 415,330 L 445,305 475,310 490,350 480,400 445,415 410,395 390,360 Z',
  'ferozepur':       'M 5,375 L 20,375 60,395 80,430 75,480 55,510 20,520 5,490 Z',
  'moga':            'M 60,395 L 110,385 160,390 185,420 175,465 140,485 90,480 75,480 80,430 Z',
  'ludhiana':        'M 185,305 L 220,295 255,270 270,300 320,300 335,300 370,320 375,360 350,400 300,415 250,410 210,390 185,365 Z',
  'fatehgarh-sahib': 'M 370,320 L 390,360 410,395 400,430 365,440 335,420 350,400 375,360 Z',
  'mohali':          'M 410,395 L 445,415 470,440 465,490 430,510 395,485 375,450 400,430 Z',
  'fazilka':         'M 5,520 L 20,520 55,510 70,550 60,600 40,630 15,630 5,590 Z',
  'faridkot':        'M 55,510 L 75,480 90,480 130,490 135,530 115,560 70,555 Z',
  'muktsar':         'M 70,555 L 115,560 135,530 155,555 150,600 115,630 70,630 55,610 60,600 70,550 Z',
  'barnala':         'M 175,465 L 210,455 250,410 260,445 240,480 200,490 Z',
  'malerkotla':      'M 250,410 L 300,415 310,440 285,465 260,445 Z',
  'sangrur':         'M 200,490 L 240,480 260,445 285,465 310,440 335,420 365,440 360,480 330,520 280,535 235,530 210,510 Z',
  'bathinda':        'M 115,630 L 150,600 155,555 190,545 230,560 230,610 200,650 155,665 120,660 Z',
  'mansa':           'M 230,560 L 280,535 330,520 345,555 335,600 295,625 250,630 230,610 Z',
  'patiala':         'M 330,520 L 360,480 365,440 400,430 375,450 395,485 430,510 440,555 420,600 380,630 340,630 335,600 345,555 Z',
};

/**
 * Label positions for each district (x, y coordinates for text placement)
 */
const LABEL_POSITIONS = {
  'pathankot':       { x: 275, y: 48 },
  'gurdaspur':       { x: 195, y: 130 },
  'hoshiarpur':      { x: 385, y: 155 },
  'amritsar':        { x: 100, y: 225 },
  'tarn-taran':      { x: 70, y: 350 },
  'kapurthala':      { x: 215, y: 250 },
  'jalandhar':       { x: 300, y: 250 },
  'nawanshahr':      { x: 400, y: 285 },
  'rupnagar':        { x: 450, y: 370 },
  'ferozepur':       { x: 40, y: 450 },
  'moga':            { x: 125, y: 440 },
  'ludhiana':        { x: 280, y: 355 },
  'fatehgarh-sahib': { x: 375, y: 400 },
  'mohali':          { x: 430, y: 460 },
  'fazilka':         { x: 35, y: 575 },
  'faridkot':        { x: 95, y: 525 },
  'muktsar':         { x: 105, y: 595 },
  'barnala':         { x: 220, y: 475 },
  'malerkotla':      { x: 280, y: 445 },
  'sangrur':         { x: 280, y: 505 },
  'bathinda':        { x: 170, y: 625 },
  'mansa':           { x: 290, y: 575 },
  'patiala':         { x: 385, y: 545 },
};

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
 * Render the Punjab Map section
 */
export function renderPunjabMap(container, stories = [], onDistrictClick) {
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
  svg.setAttribute('viewBox', '0 0 500 720');
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
      const districtStories = districtMap.get(district.id) || [];
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
  const statsBar = createElement('div', { className: 'map-stats-bar' });
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
  mapSection.appendChild(statsBar);

  container.appendChild(mapSection);

  // Set up hover tooltip
  setupTooltip(mapContainer, districtMap);

  return mapSection;
}

/**
 * Set up hover tooltip for districts
 */
function setupTooltip(mapContainer, districtMap) {
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
    const count = districtMap.get(districtId)?.length || 0;

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
 * Update map colors when stories change
 */
export function updateMapColors(stories) {
  const districtMap = mapStoriesToDistricts(stories);
  const maxCount = getMaxStoryCount(districtMap);

  for (const district of DISTRICTS) {
    const path = document.getElementById(`district-${district.id}`);
    if (!path) continue;

    const count = districtMap.get(district.id)?.length || 0;
    path.setAttribute('fill', getHeatColor(count, maxCount));
  }
}
