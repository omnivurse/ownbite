-- Quick fix for the specific profiles table policy error
-- Run this directly in Supabase SQL Editor

-- Drop the existing policy first (safe and idempotent)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Then recreate it with correct logic
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Verify the policy was created
SELECT 
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND policyname = 'Users can insert their own profile';