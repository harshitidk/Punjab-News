/**
 * News Fetching Service supporting multiple API providers.
 * Randomly balances traffic between NewsData.io and GNews APIs.
 * Automatically accumulates, deduplicates, and stores articles in a rolling cache window and Supabase DB.
 */

import cache from './cache.js';
import { SAMPLE_ARTICLES } from '../data/sampleData.js';
import { saveArticlesToDb, getArticlesFromDb } from './db.js';

// API Configuration
const NEWSDATA_KEY = 'pub_caa5dc1c03f44523a04554427c291a58';
const GNEWS_KEY = 'f6319948b17599201f3f36e43c966e45';

const NEWSDATA_BASE = 'https://newsdata.io/api/1';
const GNEWS_BASE = 'https://gnews.io/api/v4';

const QUERY = 'punjab AND (govt OR CM OR mann OR assembly OR election OR police OR AAP OR BJP OR SAD OR budget)';

/**
 * Fetch articles from NewsData.io
 */
async function fetchNewsDataArticles(query, page = null) {
  const params = new URLSearchParams({
    apikey: NEWSDATA_KEY,
    q: query,
    language: 'en',
    country: 'in',
  });

  if (page) {
    params.set('page', page);
  }

  const url = `${NEWSDATA_BASE}/latest?${params}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.status === 'error') {
    throw new Error(`NewsData.io error: ${data.results?.message || JSON.stringify(data.results) || 'Unknown error'}`);
  }

  // Normalize NewsData.io response to standard format
  const articles = (data.results || []).map((item) => ({
    source: { id: item.source_id || null, name: item.source_name || item.source_id || 'Unknown' },
    title: item.title || '',
    description: item.description || '',
    url: item.link || '',
    urlToImage: item.image_url || null,
    publishedAt: item.pubDate || new Date().toISOString(),
    content: item.content || item.description || '',
    keywords: item.keywords || [],
    categories: item.category || [],
    creator: item.creator || [],
    country: item.country || [],
    language: item.language || 'english',
    source_api: 'newsdata',
  }));

  return {
    articles,
    nextPage: data.nextPage || null,
  };
}

/**
 * Fetch articles from GNews
 */
async function fetchGNewsArticles(query, page = 1) {
  const params = new URLSearchParams({
    apikey: GNEWS_KEY,
    q: query,
    lang: 'en',
    country: 'in',
    max: '10',
    page: String(page),
    sortby: 'publishedAt',
  });

  const url = `${GNEWS_BASE}/search?${params}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.errors || data.message) {
    const errMsg = data.errors ? JSON.stringify(data.errors) : (data.message || 'Unknown error');
    throw new Error(`GNews error: ${errMsg}`);
  }

  // Normalize GNews response to standard format
  const articles = (data.articles || []).map((item) => ({
    source: { id: null, name: item.source?.name || 'Unknown' },
    title: item.title || '',
    description: item.description || '',
    url: item.url || '',
    urlToImage: item.image || null,
    publishedAt: item.publishedAt || new Date().toISOString(),
    content: item.content || item.description || '',
    keywords: [],
    categories: [],
    creator: [],
    country: ['india'],
    language: 'english',
    source_api: 'gnews',
  }));

  return {
    articles,
    nextPage: (data.articles && data.articles.length === 10) ? page + 1 : null,
  };
}

/**
 * Fetch all Punjab political news using keyword queries.
 * Randomly chooses one API key/provider and merges results with cached history
 * to accumulate articles and remove duplicates.
 */
export async function fetchAllPunjabNews(options = {}) {
  const cacheKey = `punjab_news_${options.from || ''}_${options.to || ''}`;

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log('[NewsService] Returning cached results');
    return cached;
  }

  // Retrieve previously cached raw articles to accumulate and prevent duplicates
  const rawArticlesCacheKey = 'raw_articles';
  let previousArticles = cache.get(rawArticlesCacheKey);

  // If cache is empty (e.g. server restarted), attempt to fetch from Supabase database
  if (!previousArticles) {
    console.log('[NewsService] Memory cache cold, retrieving news history from Supabase...');
    try {
      previousArticles = await getArticlesFromDb(150);
    } catch (dbErr) {
      console.error('[NewsService] Failed to load from database:', dbErr.message);
    }
  }

  if (!previousArticles) {
    previousArticles = [];
  }

  const allArticles = [...previousArticles];
  const seenUrls = new Set(allArticles.map((a) => a.url));
  const newArticles = [];
  let fetchCount = 0;
  let apiFailed = false;

  // Choose source randomly: 50% NewsData.io, 50% GNews
  const chosenSource = Math.random() < 0.5 ? 'newsdata' : 'gnews';
  console.log(`[NewsService] Randomly selected source: ${chosenSource.toUpperCase()}`);

  if (chosenSource === 'newsdata') {
    // Fetch from NewsData.io (up to 4 pages)
    let nextPageToken = null;
    const PAGES_TO_FETCH = 4;

    for (let pageNum = 0; pageNum < PAGES_TO_FETCH; pageNum++) {
      try {
        console.log(`[NewsData] Fetching page ${pageNum + 1}...`);
        const { articles, nextPage } = await fetchNewsDataArticles(QUERY, nextPageToken);
        cache.trackApiCall();
        fetchCount++;

        for (const article of articles) {
          if (article.url && !seenUrls.has(article.url)) {
            seenUrls.add(article.url);
            allArticles.push(article);
            newArticles.push(article);
          }
        }

        nextPageToken = nextPage;
        if (!nextPageToken) break;

        await sleep(1500); // 1.5s delay to satisfy API rate limits
      } catch (err) {
        console.error(`[NewsData] Fetch page ${pageNum + 1} failed:`, err.message);
        if (pageNum === 0) apiFailed = true;
        break;
      }
    }
  } else {
    // Fetch from GNews (up to 3 pages)
    let pageNum = 1;
    const PAGES_TO_FETCH = 3;

    for (let i = 0; i < PAGES_TO_FETCH; i++) {
      try {
        console.log(`[GNews] Fetching page ${pageNum}...`);
        const { articles, nextPage } = await fetchGNewsArticles(QUERY, pageNum);
        cache.trackApiCall();
        fetchCount++;

        for (const article of articles) {
          if (article.url && !seenUrls.has(article.url)) {
            seenUrls.add(article.url);
            allArticles.push(article);
            newArticles.push(article);
          }
        }

        if (!nextPage) break;
        pageNum = nextPage;

        await sleep(1500); // 1.5s delay to satisfy API rate limits
      } catch (err) {
        console.error(`[GNews] Fetch page ${pageNum} failed:`, err.message);
        if (i === 0) apiFailed = true;
        break;
      }
    }
  }

  // If the chosen API completely failed and we have no accumulated articles
  if (allArticles.length === 0 && apiFailed) {
    console.log('[NewsService] Selected API failed, falling back to sample data');
    return useSampleData(cacheKey);
  }

  // Sort accumulated articles by publish date (newest first)
  allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  // Cap size of historical raw articles archive to latest 150 to keep processing fast
  const maxArchiveSize = 150;
  const prunedArticles = allArticles.slice(0, maxArchiveSize);

  // Save raw articles to cache for accumulation in next fetches
  cache.set(rawArticlesCacheKey, prunedArticles, 7 * 24 * 60 * 60 * 1000); // 7 days TTL

  // Save to Supabase Database to build historical archive (only newly fetched ones)
  if (newArticles.length > 0) {
    await saveArticlesToDb(newArticles);
  }

  const result = {
    articles: prunedArticles,
    totalResults: prunedArticles.length,
    fetchedAt: new Date().toISOString(),
    source: chosenSource,
  };

  // Cache for 30 minutes
  cache.set(cacheKey, result, 30 * 60 * 1000);

  console.log(`[NewsService] Total accumulated unique articles: ${prunedArticles.length} (New fetched from ${chosenSource.toUpperCase()})`);
  return result;
}

/**
 * Use sample data as fallback
 */
async function useSampleData(cacheKey) {
  const result = {
    articles: SAMPLE_ARTICLES,
    totalResults: SAMPLE_ARTICLES.length,
    fetchedAt: new Date().toISOString(),
    source: 'sample',
  };

  cache.set(cacheKey, result, 30 * 60 * 1000);
  console.log(`[NewsService] Using ${SAMPLE_ARTICLES.length} sample articles`);
  
  // Save to database as well
  await saveArticlesToDb(SAMPLE_ARTICLES);
  return result;
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
