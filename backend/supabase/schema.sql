-- ENUMS
CREATE TYPE application_status AS ENUM ('APPLIED', 'OA', 'INTERVIEW', 'REJECTED', 'OFFER');

-- JOB APPLICATIONS TABLE
CREATE TABLE job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  job_link TEXT,
  application_status application_status DEFAULT 'APPLIED'::application_status,
  resume_url TEXT,
  email_used TEXT,
  password_used TEXT, -- Stored encrypted
  location TEXT,
  referral TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FRIENDS TABLE (Adjacency List)
CREATE TABLE friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  friend_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- FRIEND REQUESTS TABLE
CREATE TABLE friend_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users NOT NULL,
  receiver_email TEXT NOT NULL, -- We might not know the UUID yet if we search by email
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS TABLE
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL, -- e.g., 'FRIEND_REQUEST', 'FRIEND_JOB_UPDATE'
  message TEXT NOT NULL,
  data JSONB, -- Optional extra data
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friend_requests_receiver_email ON friend_requests(receiver_email);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON job_applications
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
