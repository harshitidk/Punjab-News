/**
 * In-memory cache with TTL support.
 * Respects NewsAPI's 100 req/day limit by caching processed stories.
 */

class Cache {
  constructor() {
    this.store = new Map();
    this.apiCallCount = 0;
    this.apiCallDate = new Date().toDateString();
  }

  /**
   * Get a cached value if it exists and hasn't expired
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set a value with TTL (in milliseconds)
   */
  set(key, value, ttlMs = 30 * 60 * 1000) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
      createdAt: Date.now(),
    });
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific key
   */
  delete(key) {
    this.store.delete(key);
  }

  /**
   * Clear all cached data
   */
  clear() {
    this.store.clear();
  }

  /**
   * Track API calls to stay within daily limits
   */
  trackApiCall() {
    const today = new Date().toDateString();
    if (today !== this.apiCallDate) {
      this.apiCallCount = 0;
      this.apiCallDate = today;
    }
    this.apiCallCount++;
    return this.apiCallCount;
  }

  /**
   * Check if we can make more API calls today
   */
  canMakeApiCall(maxPerDay = 80) {
    const today = new Date().toDateString();
    if (today !== this.apiCallDate) {
      return true;
    }
    return this.apiCallCount < maxPerDay;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      entries: this.store.size,
      apiCallsToday: this.apiCallCount,
      apiCallDate: this.apiCallDate,
    };
  }
}

// Singleton instance
const cache = new Cache();
export default cache;
