/*
  # Fix infinite recursion in profiles RLS policy

  1. Problem
    - The current SELECT policy for profiles table creates infinite recursion
    - Policy tries to check admin role by querying profiles table within the policy itself
    - This causes "infinite recursion detected in policy for relation profiles" error

  2. Solution
    - Replace the recursive policy with a simple user-based policy
    - Users can only access their own profile data
    - Admin access will be handled at the application level after profile is loaded
    - This eliminates the circular dependency

  3. Changes
    - Drop existing problematic SELECT policy
    - Create new simple SELECT policy that only checks user_id = auth.uid()
    - Keep other policies (INSERT, UPDATE) as they don't have recursion issues
*/

-- Drop the problematic SELECT policy that causes infinite recursion
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;

-- Create a simple, non-recursive SELECT policy
-- Users can only read their own profile data
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Update the UPDATE policy to also be non-recursive
-- Only allow users to update their own profiles
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());