/**
 * Punjab Political News Feed — Express Server
 * Entry point for the backend API.
 */

import express from 'express';
import cors from 'cors';
import newsRoutes, { preWarmCache } from './routes/news.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

// Routes
app.use('/api/news', newsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server (only if not on Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🟢 Punjab News Feed API running on http://localhost:${PORT}`);
    console.log(`   Feed:    http://localhost:${PORT}/api/news/feed`);
    console.log(`   Search:  http://localhost:${PORT}/api/news/search?q=bhagwant+mann`);
    console.log(`   Filters: http://localhost:${PORT}/api/news/filters`);
    console.log(`   Health:  http://localhost:${PORT}/api/health\n`);

    // Pre-warm the cache immediately
    preWarmCache();

    // Schedule to fetch news every 30 minutes
    const INTERVAL_30_MIN = 30 * 60 * 1000;
    setInterval(preWarmCache, INTERVAL_30_MIN);
  });
}

export default app;
