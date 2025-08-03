# Migration Troubleshooting Guide

## Common RLS Policy Issues

### 1. Policy Already Exists Error
```
policy "Users can insert their own profile" for table "profiles" already exists
```

**Solution:**
```sql
-- Use the helper function to recreate policies safely
SELECT recreate_policy(
  'profiles',
  'Users can insert their own profile',
  'INSERT',
  NULL,
  'user_id = auth.uid()'
);
```

### 2. Check Existing Policies
```sql
-- List all policies for a specific table
SELECT * FROM list_table_policies('profiles');

-- List all policies in the database
SELECT * FROM list_table_policies();
```

### 3. Manual Policy Cleanup
```sql
-- Drop all policies on a table
DROP POLICY IF EXISTS "policy_name" ON table_name;

-- Recreate with correct logic
CREATE POLICY "policy_name" ON table_name
  FOR SELECT
  USING (user_id = auth.uid());
```

## Migration Best Practices

### 1. Always Use IF EXISTS/IF NOT EXISTS
```sql
-- Good: Won't fail if already exists
DROP POLICY IF EXISTS "policy_name" ON table_name;
CREATE TABLE IF NOT EXISTS table_name (...);

-- Bad: Will fail if already exists
DROP POLICY "policy_name" ON table_name;
CREATE TABLE table_name (...);
```

### 2. Use Helper Functions
```sql
-- Use the safe_create_policy function
SELECT safe_create_policy(
  'table_name',
  'policy_name', 
  'SELECT',
  'user_id = auth.uid()'
);
```

### 3. Test Locally First
- Always test migrations in local Supabase instance
- Use `supabase db reset` to test from clean state
- Verify policies work as expected

## Troubleshooting Commands

### Check RLS Status
```sql
SELECT * FROM rls_status;
```

### Check Auth Function
```sql
SELECT auth.uid(); -- Should return current user ID or NULL
```

### Fix Common Issues
```sql
-- Run the cleanup migration
\i supabase/migrations/fix_duplicate_policies.sql

-- Or use individual helper functions
SELECT recreate_policy('table_name', 'policy_name', 'SELECT', 'user_id = auth.uid()');
```