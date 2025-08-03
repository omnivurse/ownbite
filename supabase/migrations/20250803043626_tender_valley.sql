/*
  # Fix Purple Gate Migration Policy Duplication

  This migration specifically addresses the duplicate policy issue in
  20250524201658_purple_gate.sql at line 133.

  ## What it does:
  1. Safely drops the existing "Users can insert their own profile" policy
  2. Recreates it with proper logic
  3. Ensures no conflicts with the original migration
*/

-- Fix the specific policy causing the duplication error
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Also fix other common profiles policies that might be duplicated
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;