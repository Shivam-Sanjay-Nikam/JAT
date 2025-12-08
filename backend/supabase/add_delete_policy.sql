-- Add DELETE policy for friends table
-- This allows users to delete friendships where they are either the user_id or friend_id

CREATE POLICY "Users can delete their friendships"
ON friends
FOR DELETE
USING (auth.uid() = user_id OR auth.uid() = friend_id);
