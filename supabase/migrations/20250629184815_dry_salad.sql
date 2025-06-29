/*
  # Fix profiles table RLS policies

  1. Security
    - Update INSERT policy for profiles table to allow authenticated users to create their own profile
    - Ensure proper RLS policies are in place for profile creation
*/

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;

-- Create new INSERT policy that allows authenticated users to create their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Ensure SELECT policy exists for users to read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Ensure UPDATE policy exists for users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());