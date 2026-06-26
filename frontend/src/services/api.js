/**
 * Frontend API client
 * Communicates with the Express backend via Vite proxy
 */

const BASE = '/api/news';

/**
 * Generic fetch wrapper with error handling
 */
async function request(endpoint, options = {}) {
  const url = `${BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error(`[API] ${endpoint} failed:`, err.message);
    throw err;
  }
}

/**
 * Fetch the news feed with optional filters
 */
export async function fetchFeed(filters = {}) {
  const params = new URLSearchParams();

  if (filters.category) params.set('category', filters.category);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.importance) params.set('importance', filters.importance);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);

  const query = params.toString();
  return request(`/feed${query ? `?${query}` : ''}`);
}

/**
 * Fetch a single story by ID
 */
export async function fetchStory(id) {
  return request(`/story/${id}`);
}

/**
 * Search stories
 */
export async function searchStories(query, page = 1) {
  const params = new URLSearchParams({ q: query, page: String(page) });
  return request(`/search?${params}`);
}

/**
 * Fetch available filters and counts
 */
export async function fetchFilters() {
  return request('/filters');
}

/**
 * Trigger manual backend cache clear and news refresh
 */
export async function refreshFeed() {
  return request('/refresh', { method: 'POST' });
}
