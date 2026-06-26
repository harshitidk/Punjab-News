/**
 * Database client wrapper.
 * Connects to Supabase if configured, falls back to in-memory cache if not.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://mwistxcpgvssqrhlnxke.supabase.co';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY;

let supabase = null;

if (supabaseKey && supabaseKey !== 'your-anon-key-here') {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('🟢 Connected to Supabase Database successfully.');
  } catch (err) {
    console.error('❌ Failed to initialize Supabase client:', err.message);
  }
} else {
  console.warn('⚠️ Supabase key is missing or set to placeholder in backend/.env. Using memory caching fallback.');
}

/**
 * Save new articles to the database (ON CONFLICT DO NOTHING)
 */
export async function saveArticlesToDb(articles) {
  if (!supabase) return;

  const dbRows = articles.map((article) => ({
    url: article.url,
    title: article.title,
    description: article.description || null,
    content: article.content || null,
    url_to_image: article.urlToImage || null,
    published_at: article.publishedAt,
    source_name: article.source?.name || 'Unknown',
    source_id: article.source?.id || null,
    source_api: article.source_api || 'newsdata',
  }));

  try {
    const { error } = await supabase
      .from('articles')
      .upsert(dbRows, { onConflict: 'url', ignoreDuplicates: true });

    if (error) {
      console.error('[DB] Upsert error:', error.message);
    } else {
      console.log(`[DB] Successfully synced ${dbRows.length} articles with Supabase database.`);
    }
  } catch (err) {
    console.error('[DB] Upsert failed:', err.message);
  }
}

/**
 * Retrieve articles from the database
 */
export async function getArticlesFromDb(limit = 150) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[DB] Select error:', error.message);
      return null;
    }

    // Map back to our internal article format
    return (data || []).map((row) => ({
      source: { id: row.source_id, name: row.source_name },
      title: row.title,
      description: row.description,
      url: row.url,
      urlToImage: row.url_to_image,
      publishedAt: row.published_at,
      content: row.content,
      keywords: [],
      categories: [],
      creator: [],
      country: ['india'],
      language: 'english',
    }));
  } catch (err) {
    console.error('[DB] Select failed:', err.message);
    return null;
  }
}
