/**
 * News API route handlers.
 * Provides endpoints for feed, story details, search, and filters.
 *
 * Architecture (optimized for serverless):
 * - /feed reads from Supabase DB (fast, ~200ms)
 * - /refresh fetches from external APIs and saves to DB (slow, called by cron/manual)
 */

import { Router } from 'express';
import { fetchAllPunjabNews } from '../services/newsApi.js';
import { filterArticles } from '../services/keywordFilter.js';
import { deduplicateArticles } from '../services/deduplicator.js';
import { getArticlesFromDb } from '../services/db.js';
import { CATEGORIES } from '../config/keywords.js';
import cache from '../services/cache.js';

const router = Router();

/**
 * Get processed stories — fast path for /feed.
 * Reads from Supabase DB (fast), only calls external APIs as last resort.
 */
export async function getProcessedStories() {
  const cacheKey = 'processed_stories';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  let articles = [];

  // Step 1: Try loading from Supabase DB (fast, ~200ms)
  try {
    const dbArticles = await getArticlesFromDb(150);
    if (dbArticles && dbArticles.length > 0) {
      console.log(`[Feed] Loaded ${dbArticles.length} articles from Supabase DB`);
      articles = dbArticles;
    }
  } catch (err) {
    console.error('[Feed] Failed to load from DB:', err.message);
  }

  // Step 2: If DB is empty, fetch from external APIs as fallback
  if (articles.length === 0) {
    console.log('[Feed] DB empty, fetching from external APIs...');
    const result = await fetchAllPunjabNews();
    articles = result.articles || [];
  }

  // Step 3: Filter by relevance
  const filtered = filterArticles(articles);

  // Step 4: Deduplicate into stories
  const stories = deduplicateArticles(filtered);

  // Cache processed stories for 30 minutes (helps locally, not on serverless)
  cache.set(cacheKey, stories, 30 * 60 * 1000);

  return stories;
}

/**
 * Pre-warm: Force fetch from external APIs, save to DB.
 * Called by /refresh endpoint and cron job.
 */
export async function preWarmCache() {
  console.log(`[Scheduler] Starting scheduled news fetch at ${new Date().toISOString()}...`);
  try {
    // Clear cache keys to force a fresh fetch
    cache.delete('processed_stories');
    cache.delete('punjab_news__');
    cache.delete('raw_articles');
    
    // Fetch from external APIs (this saves to Supabase automatically)
    await fetchAllPunjabNews();
    console.log('[Scheduler] News feed pre-warmed successfully.');
  } catch (err) {
    console.error('[Scheduler] Error pre-warming news feed:', err.message);
  }
}

/**
 * GET /api/news/feed
 * Returns paginated, filterable story feed
 *
 * Query params:
 *  - category: filter by category (election, governance, etc.)
 *  - sort: 'latest' | 'trending' | 'importance' (default: latest)
 *  - importance: 'high' | 'medium' | 'low'
 *  - page: page number (default: 1)
 *  - limit: items per page (default: 20)
 *  - from: start date (YYYY-MM-DD)
 *  - to: end date (YYYY-MM-DD)
 */
router.get('/feed', async (req, res) => {
  try {
    let stories = await getProcessedStories();

    const {
      category,
      sort = 'latest',
      importance,
      page = 1,
      limit = 20,
      from,
      to,
    } = req.query;

    // Apply category filter
    if (category && category !== 'all') {
      stories = stories.filter((s) => s.category === category);
    }

    // Apply importance filter
    if (importance) {
      stories = stories.filter((s) => s.importance === importance);
    }

    // Apply date range filter
    if (from) {
      const fromDate = new Date(from);
      stories = stories.filter((s) => new Date(s.publishedAt) >= fromDate);
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      stories = stories.filter((s) => new Date(s.publishedAt) <= toDate);
    }

    // Sort
    switch (sort) {
      case 'trending':
        stories.sort((a, b) => b.coverageCount - a.coverageCount);
        break;
      case 'importance':
        const importanceOrder = { high: 3, medium: 2, low: 1 };
        stories.sort(
          (a, b) =>
            (importanceOrder[b.importance] || 0) -
            (importanceOrder[a.importance] || 0)
        );
        break;
      case 'latest':
      default:
        stories.sort(
          (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
        );
    }

    // Paginate
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIdx = (pageNum - 1) * limitNum;
    const paginatedStories = stories.slice(startIdx, startIdx + limitNum);

    res.json({
      stories: paginatedStories,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: stories.length,
        totalPages: Math.ceil(stories.length / limitNum),
        hasMore: startIdx + limitNum < stories.length,
      },
      meta: {
        cachedAt: new Date().toISOString(),
        apiStats: cache.getStats(),
      },
    });
  } catch (err) {
    console.error('[Feed] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch news feed', details: err.message });
  }
});

/**
 * GET /api/news/story/:id
 * Returns a single story with full details
 */
router.get('/story/:id', async (req, res) => {
  try {
    const stories = await getProcessedStories();
    const story = stories.find((s) => s.id === req.params.id);

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    res.json({ story });
  } catch (err) {
    console.error('[Story] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch story', details: err.message });
  }
});

/**
 * GET /api/news/search?q=query
 * Full-text search across cached stories
 */
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const stories = await getProcessedStories();
    const query = q.toLowerCase().trim();
    const queryWords = query.split(/\s+/);

    // Search across multiple fields
    const results = stories
      .map((story) => {
        let searchScore = 0;
        const searchableText = [
          story.headline,
          story.summary,
          story.source,
          ...Object.values(story.entities).flat(),
          ...story.relatedCoverage.map((r) => r.headline),
        ]
          .join(' ')
          .toLowerCase();

        for (const word of queryWords) {
          if (searchableText.includes(word)) {
            searchScore++;
          }
        }

        // Boost headline matches
        if (story.headline?.toLowerCase().includes(query)) {
          searchScore += 5;
        }

        return { ...story, searchScore };
      })
      .filter((s) => s.searchScore > 0)
      .sort((a, b) => b.searchScore - a.searchScore);

    // Paginate
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIdx = (pageNum - 1) * limitNum;

    res.json({
      query: q,
      stories: results.slice(startIdx, startIdx + limitNum),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: results.length,
        totalPages: Math.ceil(results.length / limitNum),
        hasMore: startIdx + limitNum < results.length,
      },
    });
  } catch (err) {
    console.error('[Search] Error:', err.message);
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
});

/**
 * GET /api/news/filters
 * Returns available filter categories with counts
 */
router.get('/filters', async (req, res) => {
  try {
    const stories = await getProcessedStories();

    // Count stories per category
    const categoryCounts = {};
    for (const story of stories) {
      const cat = story.category || 'general';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    // Count stories per importance
    const importanceCounts = { high: 0, medium: 0, low: 0 };
    for (const story of stories) {
      const imp = story.importance || 'low';
      importanceCounts[imp] = (importanceCounts[imp] || 0) + 1;
    }

    // Collect all entities across stories for tag filters
    const entityCounts = {};
    for (const story of stories) {
      const allEntities = Object.values(story.entities).flat();
      for (const entity of allEntities) {
        entityCounts[entity] = (entityCounts[entity] || 0) + 1;
      }
    }

    // Sort entities by frequency, return top 30
    const topEntities = Object.entries(entityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([name, count]) => ({ name, count }));

    res.json({
      categories: Object.entries(CATEGORIES).map(([key, meta]) => ({
        key,
        ...meta,
        count: categoryCounts[key] || 0,
      })),
      importance: importanceCounts,
      entities: topEntities,
      totalStories: stories.length,
    });
  } catch (err) {
    console.error('[Filters] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch filters', details: err.message });
  }
});

/**
 * POST/GET /api/news/refresh
 * Clears cache and triggers a manual refresh of the news feed
 */
router.route('/refresh')
  .get(async (req, res) => {
    try {
      await preWarmCache();
      res.json({ success: true });
    } catch (err) {
      console.error('[Refresh] Error:', err.message);
      res.status(500).json({ error: 'Failed to refresh news feed', details: err.message });
    }
  })
  .post(async (req, res) => {
    try {
      await preWarmCache();
      res.json({ success: true });
    } catch (err) {
      console.error('[Refresh] Error:', err.message);
      res.status(500).json({ error: 'Failed to refresh news feed', details: err.message });
    }
  });

export default router;
