-- ============================================
-- Supabase Database Setup for Nanda Portfolio
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================
-- Profiles Table
-- ==================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT DEFAULT '',
  title TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  resume_url TEXT DEFAULT '',
  email TEXT DEFAULT '',
  github_url TEXT DEFAULT '',
  linkedin_url TEXT DEFAULT '',
  instagram_url TEXT DEFAULT '',
  youtube_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================
-- Projects Table
-- ==================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  long_description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  live_url TEXT DEFAULT '',
  github_url TEXT DEFAULT '',
  tech_stack TEXT[] DEFAULT '{}',
  category TEXT DEFAULT '',
  featured BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================
-- Skills Table
-- ==================
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT '',
  icon_url TEXT DEFAULT '',
  category TEXT DEFAULT 'Frontend',
  proficiency INTEGER DEFAULT 50 CHECK (proficiency >= 0 AND proficiency <= 100),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================
-- Experiences Table
-- ==================
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL DEFAULT '',
  company TEXT DEFAULT '',
  description TEXT DEFAULT '',
  start_date DATE,
  end_date DATE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================
-- Messages Table (Contact Form)
-- ==================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  subject TEXT DEFAULT '',
  message TEXT DEFAULT '',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================
-- Row Level Security (RLS)
-- ==================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Public read access for portfolio display
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public read published projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Public read experiences" ON experiences FOR SELECT USING (true);

-- Allow insert for contact messages from anyone
CREATE POLICY "Public insert messages" ON messages FOR INSERT WITH CHECK (true);

-- Allow all operations for authenticated users (admin)
-- For the simple auth approach, we use anon key with permissive policies
CREATE POLICY "Allow all profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all skills" ON skills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all experiences" ON experiences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all messages" ON messages FOR ALL USING (true) WITH CHECK (true);

-- ==================
-- Insert default profile
-- ==================
INSERT INTO profiles (name, title, bio, email) VALUES (
  'I Wayan Trijata Ananda Putra',
  'Full Stack Developer',
  'A passionate developer, designer, and dreamer. I build digital experiences that blend logic with creativity. Specializing in modern web applications with clean code and intuitive user experiences.',
  'nanda@example.com'
) ON CONFLICT DO NOTHING;
