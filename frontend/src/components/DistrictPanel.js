import { createElement, icons, escapeHtml } from '../utils/dom.js';
import { openModal } from './StoryModal.js';

let panelEl = null;
let backdropEl = null;
let activeStories = [];

/**
 * Initialize the district panel (call once)
 */
export function initDistrictPanel(container) {
  // Backdrop
  backdropEl = createElement('div', { className: 'district-panel-backdrop', id: 'districtPanelBackdrop' });
  backdropEl.addEventListener('click', closeDistrictPanel);
  container.appendChild(backdropEl);

  // Panel
  panelEl = createElement('aside', { className: 'district-panel', id: 'districtPanel' });
  
  // Setup click delegator for opening story modals
  panelEl.addEventListener('click', (e) => {
    // If click is on the close button, ignore here (handled by direct ID listener)
    if (e.target.closest('#districtPanelClose')) return;
    
    const card = e.target.closest('.district-story-card');
    if (card) {
      const storyId = card.dataset.storyId;
      const story = activeStories.find(s => String(s.id) === String(storyId));
      if (story) {
        openModal(story);
      }
    }
  });

  container.appendChild(panelEl);
}

/**
 * Open the district panel with stories
 */
export function openDistrictPanel(district, stories) {
  if (!panelEl) return;

  activeStories = stories || [];
  const hasStories = activeStories.length > 0;

  panelEl.innerHTML = `
    <div class="district-panel-header">
      <div class="district-panel-title-row">
        <div>
          <h3 class="district-panel-name">${escapeHtml(district.name)}</h3>
          <span class="district-panel-count">${activeStories.length} ${activeStories.length === 1 ? 'story' : 'stories'}</span>
        </div>
        <button class="district-panel-close" id="districtPanelClose" title="Close">
          ${icons.close}
        </button>
      </div>
    </div>
    <div class="district-panel-body">
      ${hasStories ? activeStories.map(story => renderCompactCard(story)).join('') : renderNoStories(district.name)}
    </div>
  `;

  // Close button handler
  panelEl.querySelector('#districtPanelClose')?.addEventListener('click', closeDistrictPanel);

  // Open with animation
  requestAnimationFrame(() => {
    backdropEl?.classList.add('visible');
    panelEl.classList.add('open');
  });
}

/**
 * Close the district panel
 */
export function closeDistrictPanel() {
  if (panelEl) panelEl.classList.remove('open');
  if (backdropEl) backdropEl.classList.remove('visible');
}

/**
 * Render a compact story card for the panel
 */
function renderCompactCard(story) {
  const timeAgo = getTimeAgo(story.publishedAt);
  const categoryColor = getCategoryColor(story.category);

  return `
    <div class="district-story-card" data-story-id="${escapeHtml(String(story.id))}">
      ${story.image ? `<div class="district-story-img" style="background-image: url('${escapeHtml(story.image)}')"></div>` : ''}
      <div class="district-story-content">
        <div class="district-story-meta">
          <span class="district-story-category" style="--cat-color: ${categoryColor}">${escapeHtml(story.category || 'general')}</span>
          <span class="district-story-time">${timeAgo}</span>
        </div>
        <h4 class="district-story-headline">${escapeHtml(story.headline)}</h4>
        <p class="district-story-summary">${escapeHtml(truncate(story.summary, 120))}</p>
        <div class="district-story-source">
          ${escapeHtml(story.source || 'Unknown')}
        </div>
      </div>
    </div>
  `;
}

/**
 * Render empty state
 */
function renderNoStories(districtName) {
  return `
    <div class="district-no-stories">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="no-stories-icon">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
      <h4>No stories found</h4>
      <p>No news articles currently mention ${escapeHtml(districtName)}. Check back later as new stories are published.</p>
    </div>
  `;
}

/**
 * Utility: time ago string
 */
function getTimeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/**
 * Get category color
 */
function getCategoryColor(category) {
  const colors = {
    election: '#ef4444',
    governance: '#3b82f6',
    recruitment: '#10b981',
    policy: '#8b5cf6',
    law_order: '#f59e0b',
    infrastructure: '#06b6d4',
    education: '#ec4899',
    health: '#14b8a6',
    agriculture: '#84cc16',
    political_party: '#f97316',
    general: '#6b7280',
  };
  return colors[category] || colors.general;
}

/**
 * Truncate string
 */
function truncate(str, maxLen) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}
