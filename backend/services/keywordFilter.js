/**
 * Keyword filtering engine.
 * Scores articles against the keyword library and assigns categories + importance.
 */

import { KEYWORDS, KEYWORD_CATEGORY_MAP } from '../config/keywords.js';

/**
 * Filter and score a list of articles for Punjab political relevance.
 * Returns only articles that meet the relevance threshold.
 */
export function filterArticles(articles, threshold = 1) {
  return articles
    .map((article) => scoreArticle(article))
    .filter((scored) => scored.relevanceScore >= threshold)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Score a single article against the keyword library.
 */
function scoreArticle(article) {
  const text = `${article.title || ''} ${article.description || ''} ${article.content || ''}`.toLowerCase();

  let totalScore = 0;
  const matchedKeywords = [];
  const categoryScores = {};

  // Score against each keyword category
  for (const [category, keywords] of Object.entries(KEYWORDS)) {
    for (const keyword of keywords) {
      const kw = keyword.toLowerCase();
      // Count occurrences
      const regex = new RegExp(escapeRegex(kw), 'gi');
      const matches = text.match(regex);

      if (matches) {
        const count = matches.length;
        // Longer keywords get higher scores (more specific)
        const weight = kw.split(' ').length;
        const score = count * weight;

        totalScore += score;
        matchedKeywords.push({ keyword, category, count, score });

        if (!categoryScores[category]) categoryScores[category] = 0;
        categoryScores[category] += score;
      }
    }
  }

  // Determine primary category
  const primaryCategory = determinePrimaryCategory(matchedKeywords);

  // Determine importance level
  const importance = determineImportance(totalScore, matchedKeywords);

  return {
    ...article,
    relevanceScore: totalScore,
    matchedKeywords,
    categoryScores,
    primaryCategory,
    importance,
  };
}

/**
 * Determine the primary category based on matched keywords
 */
function determinePrimaryCategory(matchedKeywords) {
  if (matchedKeywords.length === 0) return 'general';

  // Check against category map
  const categoryCounts = {};

  for (const { keyword } of matchedKeywords) {
    for (const [category, categoryKeywords] of Object.entries(KEYWORD_CATEGORY_MAP)) {
      if (categoryKeywords.some((ck) => keyword.toLowerCase().includes(ck.toLowerCase()))) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    }
  }

  // Return category with most matches
  const entries = Object.entries(categoryCounts);
  if (entries.length === 0) return 'general';

  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

/**
 * Determine importance level based on score and keyword diversity
 */
function determineImportance(score, matchedKeywords) {
  const uniqueCategories = new Set(matchedKeywords.map((k) => k.category)).size;

  // High importance: high score + multiple keyword categories
  if (score >= 8 && uniqueCategories >= 3) return 'high';
  if (score >= 5 || uniqueCategories >= 2) return 'medium';
  return 'low';
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
