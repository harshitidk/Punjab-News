/**
 * Story Card component
 */

import { escapeHtml, icons } from '../utils/dom.js';
import { formatRelativeTime } from '../utils/time.js';

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

export function renderStoryCard(story) {
  const card = document.createElement('article');
  card.className = 'story-card';
  card.dataset.storyId = story.id;

  const catStyle = CATEGORY_STYLES[story.category] || CATEGORY_STYLES.general;

  // Get up to 3 entity tags
  const entityTags = getEntityTags(story.entities, 3);

  card.innerHTML = `
    ${story.image
      ? `<div class="story-card-image">
          <img src="${escapeHtml(story.image)}" alt="" loading="lazy" />
          <div class="story-card-image-overlay"></div>
        </div>`
      : `<div class="story-card-no-image">${icons.news}</div>`
    }
    
    <div class="story-card-badge">
      <span class="category-badge" style="background:${catStyle.bg};color:${catStyle.color}">
        ${catStyle.label}
      </span>
    </div>
    
    <span class="importance-dot ${story.importance || 'low'}" title="${(story.importance || 'low')} importance"></span>

    <div class="story-card-body">
      <div class="story-card-source">
        <span class="story-card-source-name">${escapeHtml(story.source)}</span>
        <span class="story-card-time">${formatRelativeTime(story.publishedAt)}</span>
      </div>
      
      <h2 class="story-card-headline">${escapeHtml(story.headline)}</h2>
      
      <p class="story-card-summary">${escapeHtml(story.summary)}</p>
    </div>

    <div class="story-card-footer">
      <div class="story-card-tags">
        ${entityTags.map((tag) => `
          <span class="entity-tag ${tag.type}">${escapeHtml(tag.name)}</span>
        `).join('')}
      </div>
      
      ${story.coverageCount > 1
        ? `<span class="story-card-coverage">
            ${icons.sources}
            <span>${story.coverageCount} sources</span>
          </span>`
        : ''
      }
    </div>
  `;

  // Attach image error handler programmatically to avoid HTML injection/quoting bugs
  const img = card.querySelector('.story-card-image img');
  if (img) {
    img.addEventListener('error', () => {
      const container = card.querySelector('.story-card-image');
      if (container) {
        container.outerHTML = `<div class="story-card-no-image">${icons.news}</div>`;
      }
    });
  }

  return card;
}

/**
 * Get entity tags for display, prioritizing by type
 */
function getEntityTags(entities, max = 3) {
  if (!entities) return [];

  const tags = [];
  const typePriority = ['politicians', 'parties', 'departments', 'districts', 'schemes'];

  for (const type of typePriority) {
    if (tags.length >= max) break;
    const values = entities[type] || [];
    for (const name of values) {
      if (tags.length >= max) break;
      tags.push({ name, type: type.replace(/s$/, '') }); // politician, party, etc.
    }
  }

  return tags;
}
