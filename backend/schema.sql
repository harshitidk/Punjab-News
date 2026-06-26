-- Schema for Punjab Political News Feed
-- Create the articles table to store unique news articles historically

create table if not exists articles (
  id uuid default gen_random_uuid() primary key,
  url text unique not null,
  title text not null,
  description text,
  content text,
  url_to_image text,
  published_at timestamptz not null,
  source_name text not null,
  source_id text,
  source_api text not null, -- 'newsdata' or 'gnews'
  created_at timestamptz default now() not null
);

-- Index for chronological feed retrieval
create index if not exists idx_articles_published_at on articles (published_at desc);
