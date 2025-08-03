-- Script to clean up duplicate or problematic RLS policies
-- Run this if you encounter policy duplication errors

-- Use the helper functions to safely recreate policies
BEGIN;

-- Clean up profiles table policies
SELECT recreate_policy(
  'profiles',
  'Users can insert their own profile',
  'INSERT',
  NULL,
  'user_id = auth.uid()'
);

SELECT recreate_policy(
  'profiles',
  'Users can read own profile',
  'SELECT',
  'user_id = auth.uid()'
);

SELECT recreate_policy(
  'profiles',
  'Users can update own profile',
  'UPDATE',
  'user_id = auth.uid()',
  'user_id = auth.uid()'
);

-- Clean up other table policies as needed
SELECT recreate_policy(
  'bloodwork_results',
  'Users can view their own bloodwork',
  'SELECT',
  'user_id = auth.uid()'
);

SELECT recreate_policy(
  'bloodwork_results',
  'Users can insert their own bloodwork',
  'INSERT',
  NULL,
  'user_id = auth.uid()'
);

SELECT recreate_policy(
  'food_entries',
  'food_entries_select',
  'SELECT',
  'user_id = auth.uid()'
);

SELECT recreate_policy(
  'food_entries',
  'food_entries_insert',
  'INSERT',
  NULL,
  'user_id = auth.uid()'
);

-- Commit the changes
COMMIT;

-- Verify the policies were created correctly
SELECT * FROM list_table_policies('profiles');