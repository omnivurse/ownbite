/*
  # Fix Profile Access and RLS Issues

  1. Simplify RLS policies to prevent hanging
  2. Ensure profile creation works properly
  3. Add better error handling for missing profiles
  4. Optimize auth.uid() calls
*/

-- =====================================================
-- PROFILES TABLE - SIMPLIFIED POLICIES
-- =====================================================

-- Drop all existing profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Profile access policy" ON profiles;
DROP POLICY IF EXISTS "Profile update policy" ON profiles;

-- Create simplified, fast policies
CREATE POLICY "profiles_select_policy"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR 
    EXISTS (
      SELECT 1 FROM profiles admin_check 
      WHERE admin_check.user_id = (select auth.uid()) 
      AND admin_check.role = 'admin'
    )
  );

CREATE POLICY "profiles_insert_policy"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "profiles_update_policy"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR 
    EXISTS (
      SELECT 1 FROM profiles admin_check 
      WHERE admin_check.user_id = (select auth.uid()) 
      AND admin_check.role = 'admin'
    )
  )
  WITH CHECK (
    user_id = (select auth.uid())
    OR 
    EXISTS (
      SELECT 1 FROM profiles admin_check 
      WHERE admin_check.user_id = (select auth.uid()) 
      AND admin_check.role = 'admin'
    )
  );

-- =====================================================
-- ENSURE HANDLE_NEW_USER FUNCTION EXISTS AND WORKS
-- =====================================================

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    'member',
    now(),
    now()
  );
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =====================================================
-- CREATE FUNCTION TO ENSURE PROFILE EXISTS
-- =====================================================

CREATE OR REPLACE FUNCTION public.ensure_profile_exists(user_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, created_at, updated_at)
  VALUES (user_id, 'member', now(), now())
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.ensure_profile_exists(uuid) TO authenticated;

-- =====================================================
-- OPTIMIZE OTHER TABLES FOR FASTER ACCESS
-- =====================================================

-- Ensure all other policies use optimized auth.uid() calls
-- Food entries - simplified policies
DROP POLICY IF EXISTS "Users can view their own entries" ON food_entries;
DROP POLICY IF EXISTS "Users can create their own entries" ON food_entries;
DROP POLICY IF EXISTS "Users can update their own entries" ON food_entries;
DROP POLICY IF EXISTS "Users can delete their own entries" ON food_entries;

CREATE POLICY "food_entries_select" ON food_entries FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE POLICY "food_entries_insert" ON food_entries FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "food_entries_update" ON food_entries FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "food_entries_delete" ON food_entries FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- Food scans - simplified policies
DROP POLICY IF EXISTS "Users can view their own scans" ON food_scans;
DROP POLICY IF EXISTS "Users can create their own scans" ON food_scans;
DROP POLICY IF EXISTS "Users can update their own scans" ON food_scans;
DROP POLICY IF EXISTS "Users can delete their own scans" ON food_scans;

CREATE POLICY "food_scans_select" ON food_scans FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE POLICY "food_scans_insert" ON food_scans FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "food_scans_update" ON food_scans FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "food_scans_delete" ON food_scans FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

-- =====================================================
-- ADD INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Add index on profiles.user_id if it doesn't exist
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- Add indexes on other user_id columns
CREATE INDEX IF NOT EXISTS food_entries_user_id_idx ON food_entries(user_id);
CREATE INDEX IF NOT EXISTS food_scans_user_id_idx ON food_scans(user_id);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Add comment to track this migration
COMMENT ON SCHEMA public IS 'Fixed profile access issues and optimized RLS policies for better performance';