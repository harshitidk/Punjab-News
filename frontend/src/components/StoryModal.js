/**
 * Story Modal (Drawer) component
 * Expanded view with full summary, related coverage, timeline, and entity tags
 */

import { escapeHtml, icons, $ } from '../utils/dom.js';
import { formatRelativeTime, formatTimelineDate } from '../utils/time.js';
import { renderTimeline } from './Timeline.js';
import { renderEntityTagsGrid } from './EntityTags.js';

let isOpen = false;

const CATEGORY_STYLES = {
  election: { label: 'Election', bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  governance: { label: 'Governance', bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  recruitment: { label: 'Recruitment', bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  policy: { label: 'Policy', bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
  law_order: { label: 'Law & Order', bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  infrastructure: { label: 'Infrastructure', bg: 'rgba(6,182,212,0.15)', color: '#06b6d4' },
  education: { label: 'Education', bg: 'rgba(236,72,153,0.15)', color: '#ec4899' },
  health: { label: 'Health', bg: 'rgba(20,184,166,0.15)', color: '#14b8a6' },
  agriculture: { label: 'Agriculture', bg: 'rgba(132,204,22,0.15)', color: '#84cc16' },
  political_party: { label: 'Parties', bg: 'rgba(249,115,22,0.15)', color: '#f97316' },
  general: { label: 'General', bg: 'rgba(107,114,128,0.15)', color: '#6b7280' },
};

/**
 * Initialize the modal DOM elements (call once)
 */
export function initModal(container) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'modalBackdrop';

  const drawer = document.createElement('div');
  drawer.className = 'modal-drawer';
  drawer.id = 'modalDrawer';

  container.appendChild(backdrop);
  container.appendChild(drawer);

  // Close on backdrop click
  backdrop.addEventListener('click', closeModal);

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeModal();
  });
}

/**
 * Open the modal with story data
 */
export function openModal(story) {
  const backdrop = $('#modalBackdrop');
  const drawer = $('#modalDrawer');
  if (!backdrop || !drawer) return;

  const catStyle = CATEGORY_STYLES[story.category] || CATEGORY_STYLES.general;

  drawer.innerHTML = `
    <div class="modal-header">
      <div class="modal-category">
        <span class="category-badge" style="background:${catStyle.bg};color:${catStyle.color}">
          ${catStyle.label}
        </span>
        <span class="importance-dot ${story.importance || 'low'}"></span>
      </div>
      <button class="modal-close" id="modalClose" title="Close (Esc)">
        ${icons.close}
      </button>
    </div>

    <div class="modal-body">
      ${story.image
        ? `<div class="modal-image">
            <img src="${escapeHtml(story.image)}" alt="" />
          </div>`
        : ''
      }

      <h2 class="modal-headline">${escapeHtml(story.headline)}</h2>

      <div class="modal-meta">
        <span class="modal-meta-item source">
          ${icons.news}
          <span>${escapeHtml(story.source)}</span>
        </span>
        <span class="modal-meta-item">
          ${icons.clock}
          <span>${formatRelativeTime(story.publishedAt)}</span>
        </span>
        ${story.coverageCount > 1
          ? `<span class="modal-meta-item">
              ${icons.sources}
              <span>${story.coverageCount} sources covering this story</span>
            </span>`
          : ''
        }
      </div>

      <!-- Full Summary -->
      <div class="modal-section">
        <h3 class="modal-section-title">
          ${icons.summary}
          <span>Summary</span>
        </h3>
        <p class="modal-summary">${escapeHtml(story.summary)}</p>
        ${story.sourceUrl
          ? `<a href="${escapeHtml(story.sourceUrl)}" target="_blank" rel="noopener noreferrer" 
              style="display:inline-flex;align-items:center;gap:6px;margin-top:12px;font-size:13px;color:var(--accent-blue)">
              Read full article ${icons.externalLink}
            </a>`
          : ''
        }
      </div>

      <!-- Related Coverage -->
      ${story.relatedCoverage && story.relatedCoverage.length > 1
        ? `<div class="modal-section">
            <h3 class="modal-section-title">
              ${icons.sources}
              <span>Related Coverage (${story.relatedCoverage.length} sources)</span>
            </h3>
            <div class="coverage-list">
              ${story.relatedCoverage.map((item) => `
                <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="coverage-item">
                  <div class="coverage-item-source">
                    ${getSourceInitials(item.source)}
                  </div>
                  <div class="coverage-item-content">
                    <div class="coverage-item-name">${escapeHtml(item.source)}</div>
                    <div class="coverage-item-headline">${escapeHtml(item.headline)}</div>
                    <div class="coverage-item-time">${formatRelativeTime(item.publishedAt)}</div>
                  </div>
                  <span class="coverage-item-arrow">${icons.arrowRight}</span>
                </a>
              `).join('')}
            </div>
          </div>`
        : ''
      }

      <!-- Timeline -->
      ${story.timeline && story.timeline.length > 1
        ? `<div class="modal-section">
            <h3 class="modal-section-title">
              ${icons.timeline}
              <span>Timeline</span>
            </h3>
            <div id="modalTimeline"></div>
          </div>`
        : ''
      }

      <!-- Related Topics -->
      <div class="modal-section">
        <h3 class="modal-section-title">
          ${icons.tag}
          <span>Related Topics</span>
        </h3>
        <div id="modalEntityTags"></div>
      </div>
    </div>
  `;

  // Render timeline
  if (story.timeline && story.timeline.length > 1) {
    const timelineContainer = $('#modalTimeline');
    if (timelineContainer) {
      renderTimeline(timelineContainer, story.timeline);
    }
  }

  // Render entity tags
  const tagsContainer = $('#modalEntityTags');
  if (tagsContainer && story.entities) {
    renderEntityTagsGrid(tagsContainer, story.entities);
  }

  // Close button
  $('#modalClose')?.addEventListener('click', closeModal);

  // Handle image loading error programmatically
  const img = drawer.querySelector('.modal-image img');
  if (img) {
    img.addEventListener('error', () => {
      const container = drawer.querySelector('.modal-image');
      if (container) {
        container.style.display = 'none';
      }
    });
  }

  // Open
  backdrop.classList.add('active');
  drawer.classList.add('active');
  document.body.classList.add('modal-open');
  isOpen = true;
}

/**
 * Close the modal
 */
export function closeModal() {
  const backdrop = $('#modalBackdrop');
  const drawer = $('#modalDrawer');

  if (backdrop) backdrop.classList.remove('active');
  if (drawer) drawer.classList.remove('active');
  document.body.classList.remove('modal-open');
  isOpen = false;
}

/**
 * Get initials from a source name (for the avatar)
 */
function getSourceInitials(name) {
  if (!name) return '?';
  const words = name.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}
