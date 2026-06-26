/**
 * Header component
 */

import { createElement, icons } from '../utils/dom.js';

export function renderHeader(container, stats = {}) {
  const header = createElement('header', { className: 'app-header' });

  header.innerHTML = `
    <div class="header-inner">
      <div class="header-brand">
        <div class="header-logo">
          ${icons.news}
        </div>
        <h1 class="header-title">Punjab Political Pulse</h1>
      </div>
      <div class="header-meta">
        <button class="header-refresh-btn" id="headerRefreshBtn" title="Sync Latest News">
          ${icons.refresh}
          <span>Sync</span>
        </button>
        <div class="header-live">
          <span class="live-dot"></span>
          <span>Live Feed</span>
        </div>
        <div class="header-stats" id="headerStats">
          ${stats.total ? `${stats.total} stories` : ''}
        </div>
      </div>
    </div>
  `;

  container.appendChild(header);
  return header;
}

export function updateHeaderStats(total) {
  const statsEl = document.getElementById('headerStats');
  if (statsEl) {
    statsEl.textContent = total > 0 ? `${total} stories` : '';
  }
}
