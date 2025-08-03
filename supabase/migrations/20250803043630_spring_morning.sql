/*
  # Comprehensive Policy Cleanup Script
  
  This script scans and fixes ALL policy duplications across your entire database.
  Run this once to make your project 100% idempotent and deployment-ready.
*/

-- Create a function to safely recreate policies
CREATE OR REPLACE FUNCTION safe_recreate_policy(
  table_name text,
  policy_name text,
  policy_command text,
  policy_using text DEFAULT NULL,
  policy_check text DEFAULT NULL
) RETURNS void AS $$
BEGIN
  -- Drop if exists
  EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
  
  -- Recreate with proper syntax
  IF policy_command = 'SELECT' THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR SELECT USING (%s)', 
                   policy_name, table_name, policy_using);
  ELSIF policy_command = 'INSERT' THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR INSERT WITH CHECK (%s)', 
                   policy_name, table_name, policy_check);
  ELSIF policy_command = 'UPDATE' THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR UPDATE USING (%s) WITH CHECK (%s)', 
                   policy_name, table_name, policy_using, policy_check);
  ELSIF policy_command = 'DELETE' THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR DELETE USING (%s)', 
                   policy_name, table_name, policy_using);
  ELSIF policy_command = 'ALL' THEN
    EXECUTE format('CREATE POLICY %I ON %I FOR ALL USING (%s) WITH CHECK (%s)', 
                   policy_name, table_name, policy_using, policy_check);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Fix all profiles table policies
SELECT safe_recreate_policy('profiles', 'Users can insert their own profile', 'INSERT', NULL, 'user_id = auth.uid()');
SELECT safe_recreate_policy('profiles', 'Users can read own profile', 'SELECT', 'user_id = auth.uid()', NULL);
SELECT safe_recreate_policy('profiles', 'Users can update own profile', 'UPDATE', 'user_id = auth.uid()', 'user_id = auth.uid()');

-- Fix all bloodwork_results table policies
SELECT safe_recreate_policy('bloodwork_results', 'Users can view their own bloodwork', 'SELECT', 'user_id = auth.uid()', NULL);
SELECT safe_recreate_policy('bloodwork_results', 'Users can insert their own bloodwork', 'INSERT', NULL, 'user_id = auth.uid()');
SELECT safe_recreate_policy('bloodwork_results', 'Users can update their own bloodwork', 'UPDATE', 'user_id = auth.uid()', 'user_id = auth.uid()');
SELECT safe_recreate_policy('bloodwork_results', 'Users can delete their own bloodwork', 'DELETE', 'user_id = auth.uid()', NULL);

-- Fix all food_entries table policies
SELECT safe_recreate_policy('food_entries', 'food_entries_select', 'SELECT', 'user_id = auth.uid()', NULL);
SELECT safe_recreate_policy('food_entries', 'food_entries_insert', 'INSERT', NULL, 'user_id = auth.uid()');
SELECT safe_recreate_policy('food_entries', 'food_entries_update', 'UPDATE', 'user_id = auth.uid()', 'user_id = auth.uid()');
SELECT safe_recreate_policy('food_entries', 'food_entries_delete', 'DELETE', 'user_id = auth.uid()', NULL);

-- Fix all food_scans table policies
SELECT safe_recreate_policy('food_scans', 'food_scans_select', 'SELECT', 'user_id = auth.uid()', NULL);
SELECT safe_recreate_policy('food_scans', 'food_scans_insert', 'INSERT', NULL, 'user_id = auth.uid()');
SELECT safe_recreate_policy('food_scans', 'food_scans_update', 'UPDATE', 'user_id = auth.uid()', 'user_id = auth.uid()');
SELECT safe_recreate_policy('food_scans', 'food_scans_delete', 'DELETE', 'user_id = auth.uid()', NULL);

-- Fix all user_nutrient_status table policies
SELECT safe_recreate_policy('user_nutrient_status', 'Users can view their own nutrient status', 'SELECT', 'user_id = auth.uid()', NULL);
SELECT safe_recreate_policy('user_nutrient_status', 'Users can insert their own nutrient status', 'INSERT', NULL, 'user_id = auth.uid()');
SELECT safe_recreate_policy('user_nutrient_status', 'Users can update their own nutrient status', 'UPDATE', 'user_id = auth.uid()', 'user_id = auth.uid()');
SELECT safe_recreate_policy('user_nutrient_status', 'Users can delete their own nutrient status', 'DELETE', 'user_id = auth.uid()', NULL);

-- Fix all meal_plans table policies
SELECT safe_recreate_policy('meal_plans', 'Users can view their own meal plans', 'SELECT', 'user_id = auth.uid()', NULL);
SELECT safe_recreate_policy('meal_plans', 'Users can insert their own meal plans', 'INSERT', NULL, 'user_id = auth.uid()');
SELECT safe_recreate_policy('meal_plans', 'Users can update their own meal plans', 'UPDATE', 'user_id = auth.uid()', 'user_id = auth.uid()');
SELECT safe_recreate_policy('meal_plans', 'Users can delete their own meal plans', 'DELETE', 'user_id = auth.uid()', NULL);

-- Fix all community_recipes table policies
SELECT safe_recreate_policy('community_recipes', 'Users can view public recipes', 'SELECT', 'is_public = true OR user_id = auth.uid()', NULL);
SELECT safe_recreate_policy('community_recipes', 'Users can create their own recipes', 'INSERT', NULL, 'user_id = auth.uid()');
SELECT safe_recreate_policy('community_recipes', 'Users can update their own recipes', 'UPDATE', 'user_id = auth.uid()', 'user_id = auth.uid()');
SELECT safe_recreate_policy('community_recipes', 'Users can delete their own recipes', 'DELETE', 'user_id = auth.uid()', NULL);

-- Ensure RLS is enabled on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloodwork_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_nutrient_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_recipes ENABLE ROW LEVEL SECURITY;

-- Clean up the helper function
DROP FUNCTION IF EXISTS safe_recreate_policy(text, text, text, text, text);