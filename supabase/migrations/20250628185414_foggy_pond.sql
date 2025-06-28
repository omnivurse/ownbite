-- This migration addresses the "policy already exists" error for the social_shares table.
-- It ensures that existing policies are dropped before attempting to recreate them.

-- Drop existing policies for social_shares to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own social shares" ON social_shares;
DROP POLICY IF EXISTS "Users can insert their own social shares" ON social_shares;
DROP POLICY IF EXISTS "Users can update their own social shares" ON social_shares;
DROP POLICY IF EXISTS "Users can delete their own social shares" ON social_shares;

-- Create policies for social_shares
CREATE POLICY "Users can view their own social shares"
  ON social_shares
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own social shares"
  ON social_shares
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own social shares"
  ON social_shares
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own social shares"
  ON social_shares
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));