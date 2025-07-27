/*
  # Fix duplicate policy error for social_shares table

  1. Security Policy Fix
    - Remove duplicate "Users can view their own social shares" policy if it exists
    - Ensure only one instance of each policy exists

  2. Changes
    - Drop existing policy if it exists before recreating
    - This prevents the 42710 error (policy already exists)
*/

-- Drop the policy if it exists to prevent duplicate error
DROP POLICY IF EXISTS "Users can view their own social shares" ON social_shares;

-- Recreate the policy with proper conditions
CREATE POLICY "Users can view their own social shares"
  ON social_shares
  FOR SELECT
  TO authenticated
  USING (user_id = ( SELECT uid() AS uid));

-- Also ensure other policies are properly set up without duplicates
DROP POLICY IF EXISTS "Users can delete their own social shares" ON social_shares;
CREATE POLICY "Users can delete their own social shares"
  ON social_shares
  FOR DELETE
  TO authenticated
  USING (user_id = ( SELECT uid() AS uid));

DROP POLICY IF EXISTS "Users can insert their own social shares" ON social_shares;
CREATE POLICY "Users can insert their own social shares"
  ON social_shares
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = ( SELECT uid() AS uid));

DROP POLICY IF EXISTS "Users can update their own social shares" ON social_shares;
CREATE POLICY "Users can update their own social shares"
  ON social_shares
  FOR UPDATE
  TO authenticated
  USING (user_id = ( SELECT uid() AS uid))
  WITH CHECK (user_id = ( SELECT uid() AS uid));