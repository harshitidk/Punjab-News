/**
 * Story deduplication service.
 * Groups articles covering the same event into unified "Story" objects.
 * Uses Jaccard similarity on word tokens for headline comparison.
 */

import { extractEntities, mergeEntities } from './entityExtractor.js';

let storyIdCounter = 0;

/**
 * Group articles into deduplicated stories.
 * Articles with similar headlines are merged into a single story.
 */
export function deduplicateArticles(articles, similarityThreshold = 0.35) {
  if (!articles || articles.length === 0) return [];

  const stories = [];
  const assigned = new Set();

  // Sort by publish date (newest first)
  const sorted = [...articles].sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
  );

  for (let i = 0; i < sorted.length; i++) {
    if (assigned.has(i)) continue;

    const primary = sorted[i];
    const relatedArticles = [primary];
    assigned.add(i);

    // Find similar articles
    for (let j = i + 1; j < sorted.length; j++) {
      if (assigned.has(j)) continue;

      const candidate = sorted[j];
      const similarity = calculateSimilarity(
        primary.title || '',
        candidate.title || ''
      );

      if (similarity >= similarityThreshold) {
        relatedArticles.push(candidate);
        assigned.add(j);
      }
    }

    // Create story from grouped articles
    const story = createStory(relatedArticles);
    stories.push(story);
  }

  return stories;
}

/**
 * Create a Story object from a group of related articles
 */
function createStory(articles) {
  storyIdCounter++;

  // Primary article is the one with the best content
  const primary = articles.reduce((best, current) => {
    const bestScore = getArticleQuality(best);
    const currentScore = getArticleQuality(current);
    return currentScore > bestScore ? current : best;
  }, articles[0]);

  // Extract entities from all articles
  const entitiesList = articles.map((a) => extractEntities(a));
  const mergedEntities = mergeEntities(entitiesList);

  // Build timeline
  const timeline = articles
    .map((a) => ({
      time: a.publishedAt,
      source: a.source?.name || 'Unknown',
      title: a.title,
      url: a.url,
    }))
    .sort((a, b) => new Date(a.time) - new Date(b.time));

  // Generate summary from primary article
  const summary = generateSummary(primary);

  return {
    id: `story_${storyIdCounter}`,
    headline: primary.title,
    summary,
    image: primary.urlToImage,
    source: primary.source?.name || 'Unknown',
    sourceUrl: primary.url,
    publishedAt: primary.publishedAt,
    category: primary.primaryCategory || 'general',
    importance: primary.importance || 'medium',
    relevanceScore: primary.relevanceScore || 0,
    entities: mergedEntities,
    relatedCoverage: articles.map((a) => ({
      source: a.source?.name || 'Unknown',
      headline: a.title,
      publishedAt: a.publishedAt,
      url: a.url,
      image: a.urlToImage,
    })),
    timeline,
    coverageCount: articles.length,
    lastUpdated: articles.reduce((latest, a) => {
      const d = new Date(a.publishedAt);
      return d > latest ? d : latest;
    }, new Date(0)).toISOString(),
  };
}

/**
 * Calculate Jaccard similarity between two strings
 */
function calculateSimilarity(str1, str2) {
  const words1 = tokenize(str1);
  const words2 = tokenize(str2);

  if (words1.size === 0 && words2.size === 0) return 1;
  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Tokenize a string into a set of meaningful words
 */
function tokenize(str) {
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'shall', 'in', 'on', 'at', 'to',
    'for', 'of', 'with', 'by', 'from', 'as', 'into', 'through', 'during',
    'before', 'after', 'and', 'but', 'or', 'not', 'no', 'nor', 'so',
    'yet', 'both', 'either', 'neither', 'this', 'that', 'these', 'those',
    'it', 'its', 'he', 'she', 'his', 'her', 'they', 'their', 'them',
    'we', 'our', 'us', 'i', 'my', 'me', 'you', 'your',
  ]);

  return new Set(
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word))
  );
}

/**
 * Score article quality based on available content
 */
function getArticleQuality(article) {
  let score = 0;
  if (article.title) score += 3;
  if (article.description) score += 2;
  if (article.content) score += 2;
  if (article.urlToImage) score += 1;
  if (article.relevanceScore) score += article.relevanceScore;
  return score;
}

/**
 * Generate a summary from the article's description/content
 */
function generateSummary(article) {
  // Use description if available, otherwise extract from content
  let text = article.description || '';

  if (!text && article.content) {
    // Remove the "[+XXXX chars]" suffix NewsAPI adds
    text = article.content.replace(/\[\+\d+ chars\]$/, '').trim();
  }

  if (!text) {
    return 'No summary available for this story.';
  }

  // Get first 2-3 sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sentences.slice(0, 3).join(' ').trim();
}
