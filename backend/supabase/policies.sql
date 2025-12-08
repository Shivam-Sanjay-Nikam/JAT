-- ENABLE RLS
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR JOB APPLICATIONS
CREATE POLICY "Users can fully manage their own job applications"
ON job_applications
FOR ALL
USING (auth.uid() = user_id);

-- POLICIES FOR FRIENDS
CREATE POLICY "Users can view their friends"
ON friends
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- POLICIES FOR FRIEND REQUESTS
CREATE POLICY "Users can view outgoing requests"
ON friend_requests
FOR SELECT
USING (auth.uid() = sender_id);

CREATE POLICY "Users can create requests"
ON friend_requests
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Note: Receiver viewing logic is tricky if we only have email. 
-- We'll often handle friend request acceptance via Edge Function to ensure security 
-- or a secure view if the email matches the auth.email() claim.
-- For simplicity in this demo, we allow users to read requests where receiver_email matches their JWT email.
-- IMPORTANT: This requires 'email' to be present in auth.jwt() metadata.

CREATE POLICY "Users can view incoming requests based on email"
ON friend_requests
FOR SELECT
USING (receiver_email = auth.jwt() ->> 'email');

-- POLICIES FOR NOTIFICATIONS
CREATE POLICY "Users can manage their own notifications"
ON notifications
FOR ALL
USING (auth.uid() = user_id);
