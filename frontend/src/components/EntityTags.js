/**
 * Entity Tags component
 */

import { escapeHtml } from '../utils/dom.js';

const TYPE_LABELS = {
  politicians: 'Politician',
  parties: 'Party',
  departments: 'Department',
  districts: 'District',
  locations: 'Location',
  schemes: 'Scheme',
  organizations: 'Organization',
  dates: 'Date',
  numbers: 'Number',
};

const TYPE_COLORS = {
  politicians: 'var(--accent-blue)',
  parties: 'var(--accent-green)',
  departments: 'var(--accent-purple)',
  districts: 'var(--accent-cyan)',
  locations: 'var(--accent-orange)',
  schemes: 'var(--accent-pink)',
  organizations: 'var(--accent-amber)',
};

export function renderEntityTagsGrid(container, entities) {
  if (!entities) return;

  const grid = document.createElement('div');
  grid.className = 'entity-tags-grid';

  // Priority order for display
  const typeOrder = ['politicians', 'parties', 'departments', 'districts', 'schemes', 'organizations', 'locations'];

  for (const type of typeOrder) {
    const values = entities[type];
    if (!values || values.length === 0) continue;

    for (const value of values) {
      const tag = document.createElement('span');
      tag.className = 'entity-tag-lg';
      const color = TYPE_COLORS[type] || 'var(--text-muted)';
      tag.style.borderColor = color.replace('var(', '').replace(')', '');
      
      tag.innerHTML = `
        <span style="color:${color}">${escapeHtml(value)}</span>
        <span class="tag-type">${TYPE_LABELS[type] || type}</span>
      `;

      grid.appendChild(tag);
    }
  }

  if (grid.children.length === 0) {
    grid.innerHTML = '<span style="color:var(--text-muted);font-size:13px">No entities extracted</span>';
  }

  container.appendChild(grid);
}
