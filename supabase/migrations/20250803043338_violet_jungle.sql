/*
  # Fix Profiles Table RLS Policy Duplication

  This migration safely recreates all RLS policies for the profiles table
  by dropping existing policies first, ensuring no duplication errors.

  ## Changes Made:
  1. Drop existing policies if they exist
  2. Recreate policies with correct logic
  3. Ensure RLS is enabled
*/

-- Ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies safely (no error if they don't exist)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- Recreate all policies with correct logic
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Optional: Add delete policy if needed
CREATE POLICY "Users can delete own profile"
  ON public.profiles
  FOR DELETE
  USING (user_id = auth.uid());