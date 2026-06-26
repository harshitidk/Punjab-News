/**
 * Filter bar component with scrollable pills
 */

import { createElement, icons } from '../utils/dom.js';

const FILTER_CONFIG = [
  { key: 'all', label: 'All Stories', color: null },
  { key: 'latest', label: 'Latest', color: null, isSort: true },
  { key: 'trending', label: 'Trending', color: null, isSort: true },
  { key: 'divider1', isDivider: true },
  { key: 'election', label: 'Elections', color: '#ef4444' },
  { key: 'governance', label: 'Governance', color: '#3b82f6' },
  { key: 'recruitment', label: 'Recruitment', color: '#10b981' },
  { key: 'policy', label: 'Policy', color: '#8b5cf6' },
  { key: 'law_order', label: 'Law & Order', color: '#f59e0b' },
  { key: 'political_party', label: 'Parties', color: '#f97316' },
  { key: 'education', label: 'Education', color: '#ec4899' },
  { key: 'health', label: 'Health', color: '#14b8a6' },
  { key: 'agriculture', label: 'Agriculture', color: '#84cc16' },
];

export function renderFilterBar(container, onFilterChange, initialFilter = 'all') {
  const filterContainer = createElement('div', { className: 'filter-container' });
  const scrollContainer = createElement('div', { className: 'filter-scroll', id: 'filterScroll' });

  for (const config of FILTER_CONFIG) {
    if (config.isDivider) {
      scrollContainer.appendChild(createElement('div', { className: 'filter-divider' }));
      continue;
    }

    const pill = createElement('button', {
      className: `filter-pill${config.key === initialFilter ? ' active' : ''}`,
      dataset: { filter: config.key, sort: config.isSort ? 'true' : '' },
    });

    let inner = '';
    if (config.color) {
      inner += `<span class="filter-pill-dot" style="background:${config.color}"></span>`;
    }
    inner += `<span>${config.label}</span>`;
    inner += `<span class="filter-pill-count" id="filterCount_${config.key}"></span>`;
    pill.innerHTML = inner;

    pill.addEventListener('click', () => {
      // Update active state
      document.querySelectorAll('.filter-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');

      if (config.isSort) {
        onFilterChange({ sort: config.key === 'latest' ? 'latest' : 'trending', category: null });
      } else if (config.key === 'all') {
        onFilterChange({ category: null, sort: 'latest' });
      } else {
        onFilterChange({ category: config.key });
      }
    });

    scrollContainer.appendChild(pill);
  }

  filterContainer.appendChild(scrollContainer);
  container.appendChild(filterContainer);

  return filterContainer;
}

export function updateFilterCounts(categoryCounts) {
  if (!categoryCounts) return;

  for (const [key, count] of Object.entries(categoryCounts)) {
    const el = document.getElementById(`filterCount_${key}`);
    if (el) {
      el.textContent = count > 0 ? count : '';
    }
  }
}
