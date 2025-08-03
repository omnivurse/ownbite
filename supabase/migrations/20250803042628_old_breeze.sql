/*
  # Idempotent Policy Management Helper

  This migration creates helper functions to manage RLS policies safely
  and avoid duplication errors in future migrations.

  1. Helper Functions
    - safe_create_policy: Creates a policy only if it doesn't exist
    - safe_drop_policy: Drops a policy only if it exists
    - recreate_policy: Drops and recreates a policy safely

  2. Usage Examples
    - SELECT safe_create_policy('table_name', 'policy_name', 'SELECT', 'auth.uid() = user_id');
    - SELECT recreate_policy('table_name', 'policy_name', 'SELECT', 'auth.uid() = user_id');
*/

-- Function to safely create a policy only if it doesn't exist
CREATE OR REPLACE FUNCTION safe_create_policy(
  table_name TEXT,
  policy_name TEXT,
  command TEXT,
  using_expression TEXT DEFAULT NULL,
  with_check_expression TEXT DEFAULT NULL,
  roles TEXT[] DEFAULT ARRAY['authenticated']
) RETURNS BOOLEAN AS $$
DECLARE
  policy_exists BOOLEAN;
  create_sql TEXT;
BEGIN
  -- Check if policy already exists
  SELECT EXISTS(
    SELECT 1 FROM pg_policies 
    WHERE tablename = table_name 
    AND policyname = policy_name
  ) INTO policy_exists;
  
  -- If policy doesn't exist, create it
  IF NOT policy_exists THEN
    create_sql := format('CREATE POLICY %I ON %I FOR %s', 
                        policy_name, table_name, command);
    
    -- Add TO clause for roles
    IF array_length(roles, 1) > 0 THEN
      create_sql := create_sql || ' TO ' || array_to_string(roles, ', ');
    END IF;
    
    -- Add USING clause if provided
    IF using_expression IS NOT NULL THEN
      create_sql := create_sql || ' USING (' || using_expression || ')';
    END IF;
    
    -- Add WITH CHECK clause if provided
    IF with_check_expression IS NOT NULL THEN
      create_sql := create_sql || ' WITH CHECK (' || with_check_expression || ')';
    END IF;
    
    -- Execute the policy creation
    EXECUTE create_sql;
    
    RAISE NOTICE 'Created policy: % on table: %', policy_name, table_name;
    RETURN TRUE;
  ELSE
    RAISE NOTICE 'Policy already exists: % on table: %', policy_name, table_name;
    RETURN FALSE;
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error creating policy % on table %: %', policy_name, table_name, SQLERRM;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to safely drop a policy only if it exists
CREATE OR REPLACE FUNCTION safe_drop_policy(
  table_name TEXT,
  policy_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  policy_exists BOOLEAN;
BEGIN
  -- Check if policy exists
  SELECT EXISTS(
    SELECT 1 FROM pg_policies 
    WHERE tablename = table_name 
    AND policyname = policy_name
  ) INTO policy_exists;
  
  -- If policy exists, drop it
  IF policy_exists THEN
    EXECUTE format('DROP POLICY %I ON %I', policy_name, table_name);
    RAISE NOTICE 'Dropped policy: % on table: %', policy_name, table_name;
    RETURN TRUE;
  ELSE
    RAISE NOTICE 'Policy does not exist: % on table: %', policy_name, table_name;
    RETURN FALSE;
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error dropping policy % on table %: %', policy_name, table_name, SQLERRM;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to recreate a policy (drop if exists, then create)
CREATE OR REPLACE FUNCTION recreate_policy(
  table_name TEXT,
  policy_name TEXT,
  command TEXT,
  using_expression TEXT DEFAULT NULL,
  with_check_expression TEXT DEFAULT NULL,
  roles TEXT[] DEFAULT ARRAY['authenticated']
) RETURNS BOOLEAN AS $$
BEGIN
  -- Drop policy if it exists
  PERFORM safe_drop_policy(table_name, policy_name);
  
  -- Create the policy
  RETURN safe_create_policy(table_name, policy_name, command, using_expression, with_check_expression, roles);
END;
$$ LANGUAGE plpgsql;

-- Function to check and list all existing policies for debugging
CREATE OR REPLACE FUNCTION list_table_policies(table_name TEXT DEFAULT NULL)
RETURNS TABLE(
  table_name TEXT,
  policy_name TEXT,
  command TEXT,
  roles TEXT[],
  qual TEXT,
  with_check TEXT
) AS $$
BEGIN
  IF table_name IS NULL THEN
    -- Return all policies
    RETURN QUERY
    SELECT 
      p.tablename::TEXT,
      p.policyname::TEXT,
      p.cmd::TEXT,
      p.roles::TEXT[],
      p.qual::TEXT,
      p.with_check::TEXT
    FROM pg_policies p
    ORDER BY p.tablename, p.policyname;
  ELSE
    -- Return policies for specific table
    RETURN QUERY
    SELECT 
      p.tablename::TEXT,
      p.policyname::TEXT,
      p.cmd::TEXT,
      p.roles::TEXT[],
      p.qual::TEXT,
      p.with_check::TEXT
    FROM pg_policies p
    WHERE p.tablename = list_table_policies.table_name
    ORDER BY p.policyname;
  END IF;
END;
$$ LANGUAGE plpgsql;