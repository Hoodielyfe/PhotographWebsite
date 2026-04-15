-- Photography website database schema

-- Categories table for organizing photos
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  width INT,
  height INT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  taken_at TIMESTAMPTZ,
  location TEXT,
  camera_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site settings table (for about page content, etc.)
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for categories and photos (for the public site)
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);
CREATE POLICY "photos_public_read" ON photos FOR SELECT USING (is_published = true);
CREATE POLICY "site_settings_public_read" ON site_settings FOR SELECT USING (true);

-- Anyone can insert contact messages (public contact form)
CREATE POLICY "contact_messages_public_insert" ON contact_messages FOR INSERT WITH CHECK (true);

-- Authenticated users (admin) can do everything
CREATE POLICY "categories_admin_all" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "photos_admin_all" ON photos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "contact_messages_admin_all" ON contact_messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "site_settings_admin_all" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- Insert default categories
INSERT INTO categories (name, slug, description, display_order) VALUES
  ('Landscape', 'landscape', 'Breathtaking natural landscapes and scenery', 1),
  ('Portrait', 'portrait', 'Capturing human emotion and personality', 2),
  ('Street', 'street', 'Candid moments of urban life', 3),
  ('Nature', 'nature', 'Wildlife and natural wonders', 4),
  ('Architecture', 'architecture', 'Buildings and structural beauty', 5)
ON CONFLICT (slug) DO NOTHING;

-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES
  ('site_title', 'Photography Portfolio'),
  ('photographer_name', 'John Smith'),
  ('about_bio', 'A passionate photographer capturing moments that tell stories. With over 10 years of experience, I specialize in landscape and portrait photography.'),
  ('about_image', ''),
  ('contact_email', 'hello@example.com'),
  ('instagram_url', ''),
  ('twitter_url', ''),
  ('location', 'New York, USA')
ON CONFLICT (key) DO NOTHING;
