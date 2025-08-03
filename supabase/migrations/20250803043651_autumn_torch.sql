-- Emergency Policy Cleanup - Run this in Supabase SQL Editor
-- This will immediately fix the duplicate policy error

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Recreate it correctly
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Verify it worked
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
AND policyname = 'Users can insert their own profile';