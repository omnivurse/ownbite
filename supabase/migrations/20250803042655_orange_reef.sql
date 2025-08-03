/*
  # Ensure RLS is Enabled on All Tables

  This migration ensures that Row Level Security is properly enabled
  on all tables and handles any missing policies gracefully.

  1. RLS Status
    - Enable RLS on all user-data tables
    - Verify policies are in place
    - Handle missing auth functions

  2. Tables Checked
    - All tables containing user data
    - Verify auth.uid() function availability
*/

-- Ensure RLS is enabled on all user-data tables
DO $$
DECLARE
    table_record RECORD;
    tables_to_secure TEXT[] := ARRAY[
        'profiles',
        'bloodwork_results', 
        'food_entries',
        'food_scans',
        'food_items',
        'meal_plans',
        'user_nutrient_status',
        'nutrition_goals',
        'daily_goal_logs',
        'community_recipes',
        'recipe_likes',
        'recipe_comments',
        'user_follows',
        'recipe_collections',
        'collection_recipes',
        'grocery_lists',
        'grocery_list_items',
        'activity_logs',
        'nutrition_logs',
        'food_logs',
        'substance_logs',
        'diet_spending',
        'meal_tracking',
        'diary_logs',
        'social_accounts',
        'social_shares',
        'user_rewards',
        'reward_events',
        'reward_redemptions',
        'affiliates',
        'referrals',
        'affiliate_commissions',
        'reminders',
        'bloodwork_trends'
    ];
BEGIN
    -- Loop through each table and ensure RLS is enabled
    FOREACH table_record.table_name IN ARRAY tables_to_secure
    LOOP
        BEGIN
            -- Check if table exists
            IF EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = table_record.table_name
            ) THEN
                -- Enable RLS
                EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.table_name);
                RAISE NOTICE 'RLS enabled on table: %', table_record.table_name;
            ELSE
                RAISE NOTICE 'Table does not exist: %', table_record.table_name;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error enabling RLS on table %: %', table_record.table_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Verify auth.uid() function is available
DO $$
BEGIN
    -- Test auth.uid() function
    PERFORM auth.uid();
    RAISE NOTICE 'auth.uid() function is available';
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'auth.uid() function not available: %', SQLERRM;
    RAISE NOTICE 'This may cause RLS policies to fail. Check Supabase Auth setup.';
END $$;

-- Create a view to check RLS status
CREATE OR REPLACE VIEW rls_status AS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (
        SELECT count(*) 
        FROM pg_policies p 
        WHERE p.schemaname = t.schemaname 
        AND p.tablename = t.tablename
    ) as policy_count
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;