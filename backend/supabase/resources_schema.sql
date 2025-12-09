-- RESOURCE TYPE ENUM
CREATE TYPE resource_type AS ENUM ('PDF', 'LINK', 'NOTE');

-- RESOURCES TABLE
-- Stores study materials including PDFs, links, and notes
CREATE TABLE resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  type resource_type NOT NULL,
  content TEXT NOT NULL, -- File path for PDF, URL for LINK, text content for NOTE
  description TEXT,
  tags JSONB DEFAULT '[]'::jsonb, -- Array of tags for categorization
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES for performance
CREATE INDEX idx_resources_user_id ON resources(user_id);
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_user_type ON resources(user_id, type);
CREATE INDEX idx_resources_tags ON resources USING GIN(tags);

-- TRIGGER for updated_at
CREATE TRIGGER update_resources_updated_at
BEFORE UPDATE ON resources
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
