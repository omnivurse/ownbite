-- Script to check existing RLS policies before running migrations
-- Run this to see what policies already exist

-- Check all policies in the database
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as command,
  qual as using_clause,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check specifically for profiles table policies
SELECT 
  policyname,
  cmd as command,
  qual as using_clause,
  with_check,
  roles
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- Check for other common tables that might have duplicate policies
SELECT 
  tablename,
  COUNT(*) as policy_count,
  array_agg(policyname) as policy_names
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'bloodwork_results', 'food_entries', 'meal_plans', 'user_rewards')
GROUP BY tablename
ORDER BY tablename;