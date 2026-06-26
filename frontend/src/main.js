/**
 * Punjab Political Pulse — Main Application
 * Initializes all components and manages application state
 */

import { $, $$ } from './utils/dom.js';
import { fetchFeed, searchStories, fetchFilters, refreshFeed } from './services/api.js';
import { renderHeader, updateHeaderStats } from './components/Header.js';
import { renderSearchBar, updateSearchResultsCount } from './components/SearchBar.js';
import { renderFilterBar, updateFilterCounts } from './components/FilterBar.js';
import { renderStoryCard } from './components/StoryCard.js';
import { initModal, openModal } from './components/StoryModal.js';
import {
  renderSkeletonCards,
  removeSkeletonCards,
  renderErrorState,
  renderEmptyState,
} from './components/Loader.js';
import { renderPunjabMap, updateMapColors } from './components/PunjabMap.js';
import { initDistrictPanel, openDistrictPanel, closeDistrictPanel } from './components/DistrictPanel.js';

// ═══════════════════════════════════════════════
// Application State
// ═══════════════════════════════════════════════

const state = {
  stories: [],
  filteredStories: [],
  filters: {
    category: null,
    sort: 'latest',
    page: 1,
    limit: 20,
  },
  searchQuery: '',
  isLoading: false,
  hasMore: false,
  totalStories: 0,
  filterMeta: null,
  activeView: 'feed',
};

// ═══════════════════════════════════════════════
// DOM References
// ═══════════════════════════════════════════════

let feedContainer;
let feedGrid;

// ═══════════════════════════════════════════════
// Initialization
// ═══════════════════════════════════════════════

async function init() {
  const app = $('#app');

  // Clear any existing content to prevent duplication on retry
  app.innerHTML = '';

  // Build the app shell
  renderHeader(app, { total: state.totalStories }, handleViewChange);
  $('#headerRefreshBtn')?.addEventListener('click', handleManualRefresh);
  renderSearchBar(app, handleSearch);
  renderFilterBar(app, handleFilterChange);

  // Feed container
  feedContainer = document.createElement('main');
  feedContainer.className = 'feed-container';
  feedContainer.id = 'feedContainer';
  app.appendChild(feedContainer);

  // Render the map and hide by default
  renderPunjabMap(app, state.stories, handleDistrictClick);
  const mapSec = $('#mapSection');
  if (mapSec) mapSec.style.display = 'none';

  // Initialize district panel
  initDistrictPanel(app);

  // Initialize modal
  initModal(app);

  // Show skeleton while loading
  renderSkeletonCards(feedContainer);

  // Fetch initial data
  try {
    const [feedData, filtersData] = await Promise.all([
      fetchFeed(state.filters),
      fetchFilters().catch(() => null),
    ]);

    // Process feed data
    handleFeedData(feedData);

    // Update filter counts
    if (filtersData) {
      state.filterMeta = filtersData;
      const counts = {};
      for (const cat of filtersData.categories) {
        counts[cat.key] = cat.count;
      }
      counts.all = filtersData.totalStories;
      updateFilterCounts(counts);
    }
  } catch (err) {
    console.error('[Init] Failed to load:', err);

    removeSkeletonCards();
    renderErrorState(feedContainer, err.message, () => {
      feedContainer.innerHTML = '';
      init();
    });
  }
}

// ═══════════════════════════════════════════════
// Data Handling
// ═══════════════════════════════════════════════

function handleFeedData(data) {
  removeSkeletonCards();

  if (!data || !data.stories) {
    renderEmptyState(feedContainer, 'Unable to load stories. The news feed will refresh automatically.');
    return;
  }

  state.stories = data.stories;
  state.hasMore = data.pagination?.hasMore || false;
  state.totalStories = data.pagination?.total || data.stories.length;

  updateHeaderStats(state.totalStories);
  renderFeed(state.stories);
  updateMapColors(state.stories);
}

// ═══════════════════════════════════════════════
// Feed Rendering
// ═══════════════════════════════════════════════

function renderFeed(stories) {
  // Clear existing feed
  feedContainer.innerHTML = '';

  if (!stories || stories.length === 0) {
    renderEmptyState(
      feedContainer,
      state.searchQuery
        ? `No stories found for "${state.searchQuery}". Try a different search term.`
        : 'No stories match your current filters. Try broadening your selection.'
    );
    return;
  }

  feedGrid = document.createElement('div');
  feedGrid.className = 'feed-grid';
  feedGrid.id = 'feedGrid';

  for (const story of stories) {
    const card = renderStoryCard(story);
    card.addEventListener('click', (e) => {
      // Don't open modal if clicking on an entity tag
      if (e.target.closest('.entity-tag')) return;
      openModal(story);
    });
    feedGrid.appendChild(card);
  }

  feedContainer.appendChild(feedGrid);

  // Load more button
  if (state.hasMore) {
    const loadMoreDiv = document.createElement('div');
    loadMoreDiv.className = 'feed-load-more';
    loadMoreDiv.innerHTML = `
      <button class="load-more-btn" id="loadMoreBtn">
        <span>Load More Stories</span>
      </button>
    `;
    feedGrid.appendChild(loadMoreDiv);

    $('#loadMoreBtn')?.addEventListener('click', loadMore);
  }
}

// ═══════════════════════════════════════════════
// Event Handlers
// ═══════════════════════════════════════════════

async function handleSearch(query) {
  state.searchQuery = query;

  if (!query) {
    // Reset to normal feed
    updateSearchResultsCount(null);
    state.filters.page = 1;
    await loadFeed();
    return;
  }

  state.isLoading = true;
  feedContainer.innerHTML = '';
  renderSkeletonCards(feedContainer, 3);

  try {
    const data = await searchStories(query);
    removeSkeletonCards();

    state.stories = data.stories || [];
    state.hasMore = data.pagination?.hasMore || false;
    state.totalStories = data.pagination?.total || 0;

    updateSearchResultsCount(state.totalStories);
    updateHeaderStats(state.totalStories);
    renderFeed(state.stories);
    updateMapColors(state.stories);
  } catch (err) {
    removeSkeletonCards();
    renderErrorState(feedContainer, err.message, () => handleSearch(query));
  } finally {
    state.isLoading = false;
  }
}

async function handleFilterChange({ category, sort }) {
  // Clear search when changing filters
  const searchInput = $('#searchInput');
  if (searchInput) {
    searchInput.value = '';
    state.searchQuery = '';
    updateSearchResultsCount(null);
    $('#searchClear')?.classList.remove('visible');
  }

  if (category !== undefined) state.filters.category = category;
  if (sort !== undefined) state.filters.sort = sort;
  state.filters.page = 1;

  await loadFeed();
}

async function loadFeed() {
  state.isLoading = true;
  feedContainer.innerHTML = '';
  renderSkeletonCards(feedContainer);

  try {
    const data = await fetchFeed(state.filters);
    handleFeedData(data);
  } catch (err) {
    removeSkeletonCards();
    renderErrorState(feedContainer, err.message, loadFeed);
  } finally {
    state.isLoading = false;
  }
}

async function loadMore() {
  const btn = $('#loadMoreBtn');
  if (btn) {
    btn.innerHTML = '<div class="spinner"></div>';
    btn.disabled = true;
  }

  state.filters.page++;

  try {
    const data = state.searchQuery
      ? await searchStories(state.searchQuery, state.filters.page)
      : await fetchFeed(state.filters);

    if (data.stories && data.stories.length > 0) {
      state.stories.push(...data.stories);
      state.hasMore = data.pagination?.hasMore || false;

      // Remove load more button
      const loadMoreDiv = feedGrid?.querySelector('.feed-load-more');
      if (loadMoreDiv) loadMoreDiv.remove();

      // Append new cards
      for (const story of data.stories) {
        const card = renderStoryCard(story);
        card.addEventListener('click', (e) => {
          if (e.target.closest('.entity-tag')) return;
          openModal(story);
        });
        feedGrid?.appendChild(card);
      }

      // Add new load more if needed
      if (state.hasMore && feedGrid) {
        const loadMoreDiv = document.createElement('div');
        loadMoreDiv.className = 'feed-load-more';
        loadMoreDiv.innerHTML = `
          <button class="load-more-btn" id="loadMoreBtn">
            <span>Load More Stories</span>
          </button>
        `;
        feedGrid.appendChild(loadMoreDiv);
        $('#loadMoreBtn')?.addEventListener('click', loadMore);
      }
    }
  } catch (err) {
    console.error('[LoadMore] Failed:', err);
    if (btn) {
      btn.innerHTML = '<span>Retry</span>';
      btn.disabled = false;
    }
  }
}

async function handleManualRefresh() {
  const refreshBtn = $('#headerRefreshBtn');
  if (!refreshBtn || state.isLoading) return;

  state.isLoading = true;
  refreshBtn.classList.add('loading');
  refreshBtn.disabled = true;

  // Clear feed container and show skeleton cards
  feedContainer.innerHTML = '';
  renderSkeletonCards(feedContainer);

  try {
    // 1. Request backend to clear cache and query NewsData.io
    await refreshFeed();

    // 2. Fetch fresh feed & filters from backend
    const [feedData, filtersData] = await Promise.all([
      fetchFeed(state.filters),
      fetchFilters().catch(() => null),
    ]);

    // 3. Process fresh data
    handleFeedData(feedData);

    // 4. Update filter counts
    if (filtersData) {
      state.filterMeta = filtersData;
      const counts = {};
      for (const cat of filtersData.categories) {
        counts[cat.key] = cat.count;
      }
      counts.all = filtersData.totalStories;
      updateFilterCounts(counts);
    }
  } catch (err) {
    console.error('[Refresh] Failed:', err);
    removeSkeletonCards();
    renderErrorState(feedContainer, 'Failed to refresh latest news. Please try again.', handleManualRefresh);
  } finally {
    state.isLoading = false;
    refreshBtn.classList.remove('loading');
    refreshBtn.disabled = false;
  }
}

function handleViewChange(view) {
  state.activeView = view;
  const searchContainer = $('.search-container');
  const filterContainer = $('.filter-container');
  const feedContainer = $('#feedContainer');
  const mapSection = $('#mapSection');

  if (view === 'feed') {
    if (searchContainer) searchContainer.style.display = '';
    if (filterContainer) filterContainer.style.display = '';
    if (feedContainer) feedContainer.style.display = '';
    if (mapSection) mapSection.style.display = 'none';
    closeDistrictPanel();
  } else if (view === 'map') {
    if (searchContainer) searchContainer.style.display = 'none';
    if (filterContainer) filterContainer.style.display = 'none';
    if (feedContainer) feedContainer.style.display = 'none';
    if (mapSection) mapSection.style.display = '';
    
    // Update map colors with current stories
    updateMapColors(state.stories);
  }
}

function handleDistrictClick(district, districtStories) {
  openDistrictPanel(district, districtStories);
}

// ═══════════════════════════════════════════════
// Bootstrap
// ═══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', init);
