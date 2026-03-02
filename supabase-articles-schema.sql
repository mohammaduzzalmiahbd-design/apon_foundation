-- আপন ফাউন্ডেশন - আর্টিকেল টেবিল স্কিমা
-- এই SQL কোডটি Supabase SQL Editor-এ রান করুন

-- আর্টিকেল টেবিল তৈরি করুন
CREATE TABLE IF NOT EXISTS articles (
  id VARCHAR(255) PRIMARY KEY,
  url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  category VARCHAR(100) DEFAULT 'সাধারণ',
  date DATE DEFAULT CURRENT_DATE,
  title TEXT,
  content TEXT,
  author VARCHAR(255),
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security চালু করুন
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- সবাই পাবলিশ করা আর্টিকেল দেখতে পারবে
CREATE POLICY "Anyone can view published articles" ON articles
  FOR SELECT USING (is_published = true);

-- ইনসার্ট পলিসি (anon key দিয়ে)
CREATE POLICY "Anyone can insert articles" ON articles
  FOR INSERT WITH CHECK (true);

-- আপডেট পলিসি
CREATE POLICY "Anyone can update articles" ON articles
  FOR UPDATE USING (true);

-- ইনডেক্স তৈরি করুন (দ্রুত সার্চের জন্য)
CREATE INDEX IF NOT EXISTS idx_articles_date ON articles(date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published);

-- কনফার্মেশন মেসেজ
SELECT 'Articles table created successfully! ✅' as status;
