/**
 * Loader / Skeleton component
 */

import { icons } from '../utils/dom.js';

/**
 * Render skeleton loading cards
 */
export function renderSkeletonCards(container, count = 6) {
  const grid = document.createElement('div');
  grid.className = 'feed-grid';
  grid.id = 'skeletonGrid';

  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'skeleton-card';
    card.innerHTML = `
      <div class="skeleton skeleton-image"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-line w-40"></div>
        <div class="skeleton skeleton-line h-lg w-80"></div>
        <div class="skeleton skeleton-line w-full"></div>
        <div class="skeleton skeleton-line w-60"></div>
        <div class="skeleton-tags">
          <div class="skeleton skeleton-tag"></div>
          <div class="skeleton skeleton-tag"></div>
          <div class="skeleton skeleton-tag"></div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  }

  container.appendChild(grid);
  return grid;
}

/**
 * Remove skeleton loader
 */
export function removeSkeletonCards() {
  const skeleton = document.getElementById('skeletonGrid');
  if (skeleton) {
    skeleton.style.opacity = '0';
    skeleton.style.transition = 'opacity 300ms ease';
    setTimeout(() => skeleton.remove(), 300);
  }
}

/**
 * Render inline spinner
 */
export function renderSpinner() {
  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  spinner.style.margin = '0 auto';
  return spinner;
}

/**
 * Render error state
 */
export function renderErrorState(container, message, onRetry) {
  const error = document.createElement('div');
  error.className = 'error-state';
  error.id = 'errorState';

  error.innerHTML = `
    <div class="error-icon">${icons.alertCircle}</div>
    <h2 class="error-title">Something went wrong</h2>
    <p class="error-message">${message || 'Failed to load the news feed. Please try again.'}</p>
    <button class="retry-btn" id="retryBtn">
      ${icons.refresh}
      <span>Try Again</span>
    </button>
  `;

  if (onRetry) {
    error.querySelector('#retryBtn')?.addEventListener('click', onRetry);
  }

  container.appendChild(error);
  return error;
}

/**
 * Render empty state
 */
export function renderEmptyState(container, message) {
  const empty = document.createElement('div');
  empty.className = 'feed-empty';

  empty.innerHTML = `
    <div class="feed-empty-icon">${icons.emptyBox}</div>
    <h2 class="feed-empty-title">No stories found</h2>
    <p class="feed-empty-text">${message || 'Try adjusting your filters or search query.'}</p>
  `;

  container.appendChild(empty);
  return empty;
}
