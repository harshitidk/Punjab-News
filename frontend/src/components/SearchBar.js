/**
 * Search bar component with debounced input
 */

import { createElement, icons, debounce } from '../utils/dom.js';

export function renderSearchBar(container, onSearch) {
  const searchContainer = createElement('div', { className: 'search-container' });

  searchContainer.innerHTML = `
    <div class="search-wrapper">
      <span class="search-icon">${icons.search}</span>
      <input
        type="text"
        id="searchInput"
        class="search-input"
        placeholder="Search headlines, politicians, parties, departments..."
        autocomplete="off"
        spellcheck="false"
      />
      <span class="search-results-count" id="searchResultsCount"></span>
      <button class="search-clear" id="searchClear" title="Clear search">
        ${icons.close}
      </button>
    </div>
  `;

  container.appendChild(searchContainer);

  // Set up event listeners
  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('searchClear');
  const resultsCount = document.getElementById('searchResultsCount');

  const debouncedSearch = debounce((query) => {
    onSearch(query);
  }, 350);

  input.addEventListener('input', () => {
    const query = input.value.trim();
    clearBtn.classList.toggle('visible', query.length > 0);
    
    if (query.length === 0) {
      resultsCount.classList.remove('visible');
      onSearch('');
    } else if (query.length >= 2) {
      debouncedSearch(query);
    }
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.classList.remove('visible');
    resultsCount.classList.remove('visible');
    input.focus();
    onSearch('');
  });

  // ESC to clear
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      clearBtn.classList.remove('visible');
      resultsCount.classList.remove('visible');
      input.blur();
      onSearch('');
    }
  });

  return searchContainer;
}

export function updateSearchResultsCount(count) {
  const el = document.getElementById('searchResultsCount');
  if (el) {
    el.textContent = count !== null ? `${count} results` : '';
    el.classList.toggle('visible', count !== null);
  }
}
