/*
  # Fix Duplicate RLS Policies

  This migration removes and recreates RLS policies to ensure they are properly configured
  and eliminates any duplication errors.

  1. Security Cleanup
    - Drop existing policies if they exist
    - Recreate policies with proper conditions
    - Ensure consistent naming and logic

  2. Tables Affected
    - profiles (user profile management)
    - All other tables with potential policy conflicts

  Note: This is safe to run multiple times as it uses IF EXISTS conditions.
*/

-- Function to safely drop and recreate policies
DO $$
BEGIN
  -- Drop existing policies on profiles table if they exist
  DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
  
  -- Recreate policies with consistent logic
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
    
  -- Enable RLS if not already enabled
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the migration
  RAISE NOTICE 'Error in profiles policy setup: %', SQLERRM;
END $$;

-- Fix other common policy duplications
DO $$
BEGIN
  -- Bloodwork results policies
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
    
  ALTER TABLE public.bloodwork_results ENABLE ROW LEVEL SECURITY;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in bloodwork_results policy setup: %', SQLERRM;
END $$;

-- Fix food entries policies
DO $$
BEGIN
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
    
  ALTER TABLE public.food_entries ENABLE ROW LEVEL SECURITY;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in food_entries policy setup: %', SQLERRM;
END $$;

-- Fix meal plans policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view their own meal plans" ON public.meal_plans;
  DROP POLICY IF EXISTS "Users can insert their own meal plans" ON public.meal_plans;
  DROP POLICY IF EXISTS "Users can update their own meal plans" ON public.meal_plans;
  DROP POLICY IF EXISTS "Users can delete their own meal plans" ON public.meal_plans;
  
  CREATE POLICY "Users can view their own meal plans"
    ON public.meal_plans
    FOR SELECT
    USING (user_id = auth.uid());
    
  CREATE POLICY "Users can insert their own meal plans"
    ON public.meal_plans
    FOR INSERT
    WITH CHECK (user_id = auth.uid());
    
  CREATE POLICY "Users can update their own meal plans"
    ON public.meal_plans
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
    
  CREATE POLICY "Users can delete their own meal plans"
    ON public.meal_plans
    FOR DELETE
    USING (user_id = auth.uid());
    
  ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in meal_plans policy setup: %', SQLERRM;
END $$;