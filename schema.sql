-- ==============================================================================
-- DELSU ABRAKA BLOG (DELSU ABRAKA UPDATE BLOG TV)
-- Complete Production Database Schema Blueprint
-- Architecture: Clerk (Auth & Users) + Supabase (Postgres & Storage) + Resend (Email)
-- ==============================================================================

-- 0. ENABLE REQUIRED EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. ENUMS & CUSTOM TYPES
-- ==============================================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'editor', 'reporter', 'reader');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE post_status AS ENUM ('draft', 'published', 'scheduled', 'archived');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE subscriber_status AS ENUM ('active', 'unsubscribed', 'bounced', 'complained');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE comment_status AS ENUM ('pending', 'approved', 'flagged', 'spam');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ==============================================================================
-- 2. HELPER FUNCTION: AUTOMATIC updated_at TIMESTAMP
-- ==============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 3. PROFILES TABLE (Synced from Clerk via Webhook)
-- Clerk User ID (e.g. 'user_2bXyZ...') is stored as primary key TEXT
-- ==============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY, -- Clerk User ID (user_*)
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN first_name || ' ' || last_name
      ELSE COALESCE(first_name, last_name, 'DELSU Staff')
    END
  ) STORED,
  username TEXT UNIQUE,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'reader',
  bio TEXT,
  title_or_role TEXT DEFAULT 'DELSU Campus Correspondent', -- e.g. "DELSU Campus Editor & SUG Bureau Lead"
  accreditation TEXT DEFAULT 'DELSU Press Council Accredited',
  phone_number TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  custom_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- ==============================================================================
-- 4. CATEGORIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(100) NOT NULL,
  description TEXT,
  accent_color VARCHAR(100) DEFAULT 'bg-red-600 text-white',
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(display_order ASC);

-- ==============================================================================
-- 5. POSTS (ARTICLES) TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Category linkage
  category_slug VARCHAR(100) NOT NULL REFERENCES categories(slug) ON UPDATE CASCADE ON DELETE RESTRICT,
  
  -- Media
  cover_image TEXT NOT NULL,
  cover_image_caption TEXT,
  
  -- Author: Linked to Clerk user profile (nullable to accommodate guest/legacy author entries)
  author_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  author_name VARCHAR(150) NOT NULL DEFAULT 'Blessing Onome Okonjo',
  author_avatar TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  author_role VARCHAR(150) NOT NULL DEFAULT 'DELSU Campus Editor & SUG Bureau Lead',
  
  -- Article Flags & Read Time
  reading_time VARCHAR(50) NOT NULL DEFAULT '3 min read',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_trending BOOLEAN NOT NULL DEFAULT FALSE,
  is_breaking BOOLEAN NOT NULL DEFAULT FALSE,
  is_sponsored BOOLEAN NOT NULL DEFAULT FALSE,
  sponsored_by VARCHAR(200),
  
  -- Engagement Metrics
  views_count INT NOT NULL DEFAULT 0,
  likes_count INT NOT NULL DEFAULT 0,
  comments_count INT NOT NULL DEFAULT 0,
  shares_count INT NOT NULL DEFAULT 0,
  
  -- Publication Lifecycle
  status post_status NOT NULL DEFAULT 'published',
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- SEO & Open Graph
  meta_title VARCHAR(255),
  meta_description TEXT,
  canonical_url TEXT,
  
  -- Full-Text Search Vector (English / Nigerian editorial content)
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'C')
  ) STORED
);

CREATE TRIGGER trigger_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_slug);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_status_published ON posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_posts_trending ON posts(is_trending) WHERE is_trending = TRUE;
CREATE INDEX IF NOT EXISTS idx_posts_breaking ON posts(is_breaking) WHERE is_breaking = TRUE;
CREATE INDEX IF NOT EXISTS idx_posts_search ON posts USING GIN(search_vector);

-- ==============================================================================
-- 6. COMMENTS TABLE (Threaded / Nested guest & authenticated comments)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  post_slug VARCHAR(255) NOT NULL REFERENCES posts(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- Author identity (Clerk user if logged in, or guest details)
  user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  author_name VARCHAR(150) NOT NULL,
  author_email VARCHAR(255),
  author_avatar TEXT,
  
  -- Content & Moderation
  content TEXT NOT NULL,
  status comment_status NOT NULL DEFAULT 'approved',
  likes_count INT NOT NULL DEFAULT 0,
  ip_hash TEXT, -- Hashed IP to prevent spam flood
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_slug ON comments(post_slug);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at ASC);

-- Trigger to increment post comments_count automatically
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
    UPDATE posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
      UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
      UPDATE posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = NEW.post_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_comment_count
  AFTER INSERT OR UPDATE OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_count();

-- ==============================================================================
-- 7. NEWSLETTER SUBSCRIBERS TABLE (Resend Integration)
-- Synchronized with Resend Audience / Contacts API
-- ==============================================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  status subscriber_status NOT NULL DEFAULT 'active',
  
  -- Resend specific identifier
  resend_contact_id TEXT UNIQUE, -- ID returned by Resend Contacts API
  
  -- Attribution & Preferences
  source TEXT NOT NULL DEFAULT 'website_footer', -- 'header_ticker', 'article_cta', 'whatsapp_banner'
  topics_subscribed TEXT[] DEFAULT ARRAY['breaking_news', 'campus_gist', 'tech_jobs', 'sports'],
  is_verified BOOLEAN NOT NULL DEFAULT TRUE,
  
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_subscribers_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_resend_id ON newsletter_subscribers(resend_contact_id);

-- ==============================================================================
-- 8. RESEND EMAIL BROADCAST & TRANSACTIONAL LOGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resend_email_id TEXT UNIQUE, -- id returned from Resend API (e.g. "re_123...")
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL, -- 'newsletter_weekly', 'breaking_alert', 'welcome', 'comment_reply', 'contact_reply'
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'delivered', 'bounced', 'complained', 'opened', 'clicked'
  metadata JSONB DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_resend_id ON email_logs(resend_email_id);

-- ==============================================================================
-- 9. USER BOOKMARKS & POST LIKES (Reader Engagement for Clerk users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Clerk User ID
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post ON bookmarks(post_id);

CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL, -- Nullable for anonymous likes
  client_ip_hash TEXT, -- To prevent abuse from non-logged in users
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_likes_user_unique ON post_likes(post_id, user_id) WHERE user_id IS NOT NULL;

-- Trigger to increment/decrement post likes_count automatically
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_likes_count
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

-- ==============================================================================
-- 10. CONTACT / ADVERTISING INQUIRIES (DELSU Desk)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50),
  category TEXT NOT NULL DEFAULT 'general', -- 'editorial_tip', 'advertisement', 'press_release', 'general'
  subject VARCHAR(300) NOT NULL,
  message TEXT NOT NULL,
  is_responded BOOLEAN NOT NULL DEFAULT FALSE,
  resend_notification_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_email ON contact_inquiries(email);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_category ON contact_inquiries(category);

-- ==============================================================================
-- 11. RPC HELPER FUNCTIONS (Safe atomic operations)
-- ==============================================================================

-- Increment view count without race conditions
CREATE OR REPLACE FUNCTION increment_post_views(target_slug VARCHAR(255))
RETURNS INT AS $$
DECLARE
  new_views INT;
BEGIN
  UPDATE posts
  SET views_count = views_count + 1
  WHERE slug = target_slug
  RETURNING views_count INTO new_views;
  
  RETURN new_views;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- Configured for Clerk JWT or Next.js Supabase Service Role Key
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

-- 12.1 PROFILES POLICIES
-- Anyone can view author profiles publicly
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

-- User can update their own profile (matching Clerk user ID from JWT sub claim)
CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (
    id = coalesce(auth.jwt() ->> 'sub', current_setting('request.jwt.claims', true)::json ->> 'sub')
  );

-- 12.2 CATEGORIES POLICIES
CREATE POLICY "Categories are readable by everyone" 
  ON categories FOR SELECT USING (true);

-- 12.3 POSTS POLICIES
-- Published posts are public; drafts visible only to editors/admins or service role
CREATE POLICY "Public can view published posts" 
  ON posts FOR SELECT 
  USING (status = 'published');

-- 12.4 COMMENTS POLICIES
CREATE POLICY "Public can view approved comments" 
  ON comments FOR SELECT 
  USING (status = 'approved');

CREATE POLICY "Anyone can submit a comment" 
  ON comments FOR INSERT 
  WITH CHECK (true);

-- 12.5 NEWSLETTER SUBSCRIBERS POLICIES
CREATE POLICY "Public can subscribe to newsletter" 
  ON newsletter_subscribers FOR INSERT 
  WITH CHECK (true);

-- 12.6 BOOKMARKS POLICIES
CREATE POLICY "Users can view their own bookmarks" 
  ON bookmarks FOR SELECT 
  USING (
    user_id = coalesce(auth.jwt() ->> 'sub', current_setting('request.jwt.claims', true)::json ->> 'sub')
  );

CREATE POLICY "Users can create their own bookmarks" 
  ON bookmarks FOR INSERT 
  WITH CHECK (
    user_id = coalesce(auth.jwt() ->> 'sub', current_setting('request.jwt.claims', true)::json ->> 'sub')
  );

CREATE POLICY "Users can delete their own bookmarks" 
  ON bookmarks FOR DELETE 
  USING (
    user_id = coalesce(auth.jwt() ->> 'sub', current_setting('request.jwt.claims', true)::json ->> 'sub')
  );

-- 12.7 POST LIKES POLICIES
CREATE POLICY "Public can view likes" 
  ON post_likes FOR SELECT USING (true);

CREATE POLICY "Public can insert likes" 
  ON post_likes FOR INSERT WITH CHECK (true);

-- 12.8 CONTACT INQUIRIES POLICIES
CREATE POLICY "Public can submit contact inquiries" 
  ON contact_inquiries FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- 13. SUPABASE STORAGE BUCKETS SETUP
-- ==============================================================================
-- Run these storage bucket inserts in Supabase SQL editor:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-covers', 'post-covers', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('staff-avatars', 'staff-avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('media-uploads', 'media-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for storage objects in post-covers, staff-avatars, media-uploads
CREATE POLICY "Public Access for Covers" 
  ON storage.objects FOR SELECT 
  USING (bucket_id IN ('post-covers', 'staff-avatars', 'media-uploads'));

CREATE POLICY "Service Role and Authenticated Upload Access" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id IN ('post-covers', 'staff-avatars', 'media-uploads'));
