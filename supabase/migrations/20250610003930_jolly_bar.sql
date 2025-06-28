/*
  # RLS Performance Optimization - Complete Fix

  1. Performance Optimizations
    - Replace all `auth.uid()` with `(select auth.uid())` for better performance
    - Remove duplicate policies to eliminate multiple permissive policy warnings
    - Combine similar policies where appropriate

  2. Security
    - Maintain all existing security constraints
    - Ensure proper admin access controls
    - Keep audit logging functional

  3. Function Fixes
    - Properly drop and recreate is_admin functions
    - Fix parameter reference issues
    - Add performance monitoring capabilities
*/

-- =====================================================
-- FOOD_SCANS TABLE CLEANUP AND OPTIMIZATION
-- =====================================================

-- Drop all existing food_scans policies
DROP POLICY IF EXISTS "Users can view their own scans" ON food_scans;
DROP POLICY IF EXISTS "Users can create their own scans" ON food_scans;
DROP POLICY IF EXISTS "Users can update their own scans" ON food_scans;
DROP POLICY IF EXISTS "Users can delete their own scans" ON food_scans;
DROP POLICY IF EXISTS "Users can view their own food scans" ON food_scans;
DROP POLICY IF EXISTS "Users can insert their own food scans" ON food_scans;
DROP POLICY IF EXISTS "Users can update their own food scans" ON food_scans;
DROP POLICY IF EXISTS "Users can delete their own food scans" ON food_scans;

-- Create optimized food_scans policies (single policy per action)
CREATE POLICY "Users can view their own scans"
  ON food_scans
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own scans"
  ON food_scans
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own scans"
  ON food_scans
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own scans"
  ON food_scans
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- FOOD_ITEMS TABLE CLEANUP AND OPTIMIZATION
-- =====================================================

-- Drop all existing food_items policies
DROP POLICY IF EXISTS "Users can view items from their scans" ON food_items;
DROP POLICY IF EXISTS "Users can create items for their scans" ON food_items;
DROP POLICY IF EXISTS "Users can update items from their scans" ON food_items;
DROP POLICY IF EXISTS "Users can delete items from their scans" ON food_items;
DROP POLICY IF EXISTS "Users can view food items from their scans" ON food_items;
DROP POLICY IF EXISTS "Users can insert food items to their scans" ON food_items;
DROP POLICY IF EXISTS "Users can update food items from their scans" ON food_items;
DROP POLICY IF EXISTS "Users can delete food items from their scans" ON food_items;

-- Create optimized food_items policies (single policy per action)
CREATE POLICY "Users can view items from their scans"
  ON food_items
  FOR SELECT
  TO authenticated
  USING (
    scan_id IN (
      SELECT id FROM food_scans WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create items for their scans"
  ON food_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    scan_id IN (
      SELECT id FROM food_scans WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update items from their scans"
  ON food_items
  FOR UPDATE
  TO authenticated
  USING (
    scan_id IN (
      SELECT id FROM food_scans WHERE user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    scan_id IN (
      SELECT id FROM food_scans WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete items from their scans"
  ON food_items
  FOR DELETE
  TO authenticated
  USING (
    scan_id IN (
      SELECT id FROM food_scans WHERE user_id = (select auth.uid())
    )
  );

-- =====================================================
-- FOOD_ENTRIES TABLE CLEANUP AND OPTIMIZATION
-- =====================================================

-- Drop all existing food_entries policies
DROP POLICY IF EXISTS "Users can view their own entries" ON food_entries;
DROP POLICY IF EXISTS "Users can create their own entries" ON food_entries;
DROP POLICY IF EXISTS "Users can update their own entries" ON food_entries;
DROP POLICY IF EXISTS "Users can delete their own entries" ON food_entries;
DROP POLICY IF EXISTS "Users can view their own food entries" ON food_entries;
DROP POLICY IF EXISTS "Users can insert their own food entries" ON food_entries;
DROP POLICY IF EXISTS "Users can update their own food entries" ON food_entries;
DROP POLICY IF EXISTS "Users can delete their own food entries" ON food_entries;

-- Create optimized food_entries policies (single policy per action)
CREATE POLICY "Users can view their own entries"
  ON food_entries
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own entries"
  ON food_entries
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own entries"
  ON food_entries
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own entries"
  ON food_entries
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- PROFILES TABLE CLEANUP AND OPTIMIZATION
-- =====================================================

-- Drop all existing profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Profile access policy" ON profiles;
DROP POLICY IF EXISTS "Profile update policy" ON profiles;

-- Create optimized profiles policies
-- Combined policy for viewing profiles (users see own, admins see all)
CREATE POLICY "Profile access policy"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = user_id 
    OR 
    (select auth.uid()) IN (
      SELECT user_id FROM profiles WHERE role = 'admin'
    )
  );

-- Users can update their own profile, admins can update any profile
CREATE POLICY "Profile update policy"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) = user_id 
    OR 
    (select auth.uid()) IN (
      SELECT user_id FROM profiles WHERE role = 'admin'
    )
  )
  WITH CHECK (
    (select auth.uid()) = user_id 
    OR 
    (select auth.uid()) IN (
      SELECT user_id FROM profiles WHERE role = 'admin'
    )
  );

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- AUDIT_LOG TABLE CLEANUP AND OPTIMIZATION
-- =====================================================

-- Drop all existing audit_log policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_log;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_log;

-- Create optimized audit_log policies
CREATE POLICY "Admins can view audit logs"
  ON audit_log
  FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) IN (
      SELECT user_id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- RECIPES TABLE OPTIMIZATION
-- =====================================================

-- Drop existing recipes policies if any
DROP POLICY IF EXISTS "Anyone can view recipes" ON recipes;

-- Create optimized recipes policy
CREATE POLICY "Anyone can view recipes"
  ON recipes
  FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- HELPER FUNCTIONS - COMPLETE CLEANUP AND RECREATION
-- =====================================================

-- Drop ALL existing function variations to avoid conflicts
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.check_rls_performance();

-- Create admin check function with proper parameter handling
CREATE FUNCTION public.is_admin(input_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  check_user_id uuid;
BEGIN
  -- Use provided user_id or fall back to current user
  check_user_id := COALESCE(input_user_id, (select auth.uid()));
  
  -- Return true if user is admin
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = check_user_id 
    AND role = 'admin'
  );
END;
$$;

-- Performance monitoring function
CREATE FUNCTION public.check_rls_performance()
RETURNS TABLE(
  table_name text,
  policy_name text,
  policy_definition text,
  performance_optimized boolean,
  has_duplicates boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH policy_analysis AS (
    SELECT 
      schemaname::text || '.' || tablename::text as table_name,
      policyname::text as policy_name,
      definition::text as policy_definition,
      NOT (definition LIKE '%auth.uid()%' AND definition NOT LIKE '%(select auth.uid())%') as performance_optimized,
      tablename,
      cmd,
      roles
    FROM pg_policies 
    WHERE schemaname = 'public'
  ),
  duplicate_check AS (
    SELECT 
      tablename,
      cmd,
      roles,
      COUNT(*) > 1 as has_duplicates
    FROM policy_analysis
    GROUP BY tablename, cmd, roles
  )
  SELECT 
    pa.table_name,
    pa.policy_name,
    pa.policy_definition,
    pa.performance_optimized,
    COALESCE(dc.has_duplicates, false) as has_duplicates
  FROM policy_analysis pa
  LEFT JOIN duplicate_check dc ON pa.tablename = dc.tablename 
    AND pa.cmd = dc.cmd 
    AND pa.roles = dc.roles
  ORDER BY pa.table_name, pa.policy_name;
END;
$$;

-- =====================================================
-- VERIFICATION AND CLEANUP
-- =====================================================

-- Add a comment to track this migration
COMMENT ON SCHEMA public IS 'RLS policies optimized for performance - no duplicate policies, all auth.uid() calls wrapped in SELECT, functions properly recreated';

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_rls_performance() TO authenticated;