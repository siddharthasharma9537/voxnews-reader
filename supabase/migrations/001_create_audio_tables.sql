-- Create audio_cache table for TTS results
CREATE TABLE IF NOT EXISTS audio_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_hash TEXT UNIQUE NOT NULL,
  headline TEXT NOT NULL,
  language TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days'
);

-- Create articles_processed table for tracking
CREATE TABLE IF NOT EXISTS articles_processed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pdf_name TEXT NOT NULL,
  article_index INTEGER NOT NULL,
  headline TEXT NOT NULL,
  language TEXT NOT NULL,
  processing_time_ms INTEGER,
  tts_service TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create tts_usage table for cost tracking
CREATE TABLE IF NOT EXISTS tts_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id TEXT NOT NULL,
  characters_processed INTEGER NOT NULL,
  tts_service TEXT NOT NULL,
  cost_cents DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_audio_cache_hash ON audio_cache(content_hash);
CREATE INDEX idx_audio_cache_expires ON audio_cache(expires_at);
CREATE INDEX idx_articles_pdf_name ON articles_processed(pdf_name);
CREATE INDEX idx_tts_usage_date ON tts_usage(created_at);

-- Enable Row Level Security
ALTER TABLE audio_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles_processed ENABLE ROW LEVEL SECURITY;
ALTER TABLE tts_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for anon access (read-only to cache)
CREATE POLICY "Allow read audio_cache" ON audio_cache
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert audio_cache via functions" ON audio_cache
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow read articles_processed" ON articles_processed
  FOR SELECT
  USING (true);

CREATE POLICY "Allow read tts_usage" ON tts_usage
  FOR SELECT
  USING (true);
