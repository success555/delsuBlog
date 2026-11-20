-- DELSU ABRAKA BLOG (DELSU ABRAKA UPDATE BLOG TV)
-- Complete Supabase Schema Definition for Production Deployment

-- Drop tables if resetting (optional)
-- DROP TABLE IF EXISTS comments;
-- DROP TABLE IF EXISTS posts;
-- DROP TABLE IF EXISTS categories;

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(100) NOT NULL,
  description TEXT,
  accent_color VARCHAR(100) DEFAULT 'bg-red-600 text-white',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_default BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- 2. POSTS TABLE
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  cover_image TEXT NOT NULL,
  author_name VARCHAR(150) NOT NULL DEFAULT 'Blessing Onome Okonjo',
  author_avatar TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  author_role VARCHAR(150) NOT NULL DEFAULT 'DELSU Campus Editor & SUG Bureau Lead',
  reading_time VARCHAR(50) NOT NULL DEFAULT '4 min read',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_sponsored BOOLEAN NOT NULL DEFAULT FALSE,
  is_trending BOOLEAN NOT NULL DEFAULT FALSE,
  views_count INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  meta_title VARCHAR(255),
  meta_description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'published'
);

-- Indices for rapid querying
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_posts_trending ON posts(is_trending);

-- 3. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug VARCHAR(255) NOT NULL REFERENCES posts(slug) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  author_name VARCHAR(150) NOT NULL,
  author_email VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_approved BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_comments_post_slug ON comments(post_slug);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at ASC);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin full access to categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Posts policies
CREATE POLICY "Public can view published posts" ON posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admin full access to posts" ON posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Comments policies
CREATE POLICY "Public can view approved comments" ON comments FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Guests can insert comments" ON comments FOR INSERT WITH CHECK (true);
