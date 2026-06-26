/**
 * Header component
 */

import { createElement, icons } from '../utils/dom.js';

export function renderHeader(container, stats = {}, onViewChange) {
  const header = createElement('header', { className: 'app-header' });

  header.innerHTML = `
    <div class="header-inner">
      <div class="header-brand">
        <div class="header-logo">
          ${icons.news}
        </div>
        <h1 class="header-title">Punjab Political Pulse</h1>
      </div>
      <div class="header-center">
        <div class="view-toggle" id="viewToggle">
          <button class="view-toggle-btn active" data-view="feed" id="viewFeedBtn" title="News Feed">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
            </svg>
            <span>Feed</span>
          </button>
          <button class="view-toggle-btn" data-view="map" id="viewMapBtn" title="District Map">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>Map</span>
          </button>
        </div>
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

  // Set up view toggle handlers
  if (onViewChange) {
    header.querySelector('#viewFeedBtn')?.addEventListener('click', () => {
      setActiveView('feed');
      onViewChange('feed');
    });
    header.querySelector('#viewMapBtn')?.addEventListener('click', () => {
      setActiveView('map');
      onViewChange('map');
    });
  }

  return header;
}

/**
 * Update the active view toggle button
 */
export function setActiveView(view) {
  const feedBtn = document.getElementById('viewFeedBtn');
  const mapBtn = document.getElementById('viewMapBtn');
  if (feedBtn) feedBtn.classList.toggle('active', view === 'feed');
  if (mapBtn) mapBtn.classList.toggle('active', view === 'map');
}

export function updateHeaderStats(total) {
  const statsEl = document.getElementById('headerStats');
  if (statsEl) {
    statsEl.textContent = total > 0 ? `${total} stories` : '';
  }
}
