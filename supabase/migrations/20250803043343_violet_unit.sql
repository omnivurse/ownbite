/*
  # Fix All RLS Policy Duplications

  This migration safely recreates all RLS policies across all tables
  by dropping existing policies first to prevent duplication errors.

  ## Tables Updated:
  1. profiles
  2. bloodwork_results
  3. food_entries
  4. food_scans
  5. meal_plans
  6. user_nutrient_status
  7. All other tables with RLS policies
*/

-- Fix profiles table policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

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

-- Fix bloodwork_results table policies
ALTER TABLE public.bloodwork_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own bloodwork" ON public.bloodwork_results;
DROP POLICY IF EXISTS "Users can insert their own bloodwork" ON public.bloodwork_results;
DROP POLICY IF EXISTS "Users can update their own bloodwork" ON public.bloodwork_results;
DROP POLICY IF EXISTS "Users can delete their own bloodwork" ON public.bloodwork_results;

CREATE POLICY "Users can view their own bloodwork"
  ON public.bloodwork_results
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own bloodwork"
  ON public.bloodwork_results
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own bloodwork"
  ON public.bloodwork_results
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own bloodwork"
  ON public.bloodwork_results
  FOR DELETE
  USING (user_id = auth.uid());

-- Fix food_entries table policies
ALTER TABLE public.food_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "food_entries_select" ON public.food_entries;
DROP POLICY IF EXISTS "food_entries_insert" ON public.food_entries;
DROP POLICY IF EXISTS "food_entries_update" ON public.food_entries;
DROP POLICY IF EXISTS "food_entries_delete" ON public.food_entries;

CREATE POLICY "food_entries_select"
  ON public.food_entries
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "food_entries_insert"
  ON public.food_entries
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "food_entries_update"
  ON public.food_entries
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "food_entries_delete"
  ON public.food_entries
  FOR DELETE
  USING (user_id = auth.uid());

-- Fix food_scans table policies
ALTER TABLE public.food_scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "food_scans_select" ON public.food_scans;
DROP POLICY IF EXISTS "food_scans_insert" ON public.food_scans;
DROP POLICY IF EXISTS "food_scans_update" ON public.food_scans;
DROP POLICY IF EXISTS "food_scans_delete" ON public.food_scans;

CREATE POLICY "food_scans_select"
  ON public.food_scans
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "food_scans_insert"
  ON public.food_scans
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "food_scans_update"
  ON public.food_scans
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "food_scans_delete"
  ON public.food_scans
  FOR DELETE
  USING (user_id = auth.uid());

-- Fix user_nutrient_status table policies
ALTER TABLE public.user_nutrient_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own nutrient status" ON public.user_nutrient_status;
DROP POLICY IF EXISTS "Users can insert their own nutrient status" ON public.user_nutrient_status;
DROP POLICY IF EXISTS "Users can update their own nutrient status" ON public.user_nutrient_status;
DROP POLICY IF EXISTS "Users can delete their own nutrient status" ON public.user_nutrient_status;

CREATE POLICY "Users can view their own nutrient status"
  ON public.user_nutrient_status
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own nutrient status"
  ON public.user_nutrient_status
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own nutrient status"
  ON public.user_nutrient_status
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own nutrient status"
  ON public.user_nutrient_status
  FOR DELETE
  USING (user_id = auth.uid());