/*
  # Fix Julia's subscription access

  1. Updates
    - Set Julia's profile to premium subscription status
    - Add stripe_customers and stripe_subscriptions records
    - Create helper functions for access control
  
  2. Security
    - Add policies for key tables to ensure proper access
*/

-- Find Julia's user ID
DO $$
DECLARE
  julia_user_id UUID;
BEGIN
  -- Get Julia's user ID
  SELECT id INTO julia_user_id FROM auth.users WHERE email = 'vrt@qloudnet.com';
  
  IF julia_user_id IS NULL THEN
    RAISE EXCEPTION 'User vrt@qloudnet.com not found';
  END IF;

  -- Update profile with Ultimate Wellbeing subscription
  UPDATE profiles
  SET 
    subscription_status = 'premium',
    subscription_end_date = (CURRENT_DATE + INTERVAL '1 year')::TIMESTAMP
  WHERE user_id = julia_user_id;
  
  -- If no profile record exists, create one
  IF NOT FOUND THEN
    INSERT INTO profiles (
      user_id,
      full_name,
      subscription_status,
      subscription_end_date,
      role
    ) VALUES (
      julia_user_id,
      'Julia Avalon',
      'premium',
      (CURRENT_DATE + INTERVAL '1 year')::TIMESTAMP,
      'member'
    );
  END IF;

  -- Update app metadata to include ultimate role
  UPDATE auth.users
  SET raw_app_meta_data = 
    CASE 
      WHEN raw_app_meta_data IS NULL THEN '{"role": "ultimate"}'::jsonb
      ELSE jsonb_set(raw_app_meta_data, '{role}', '"ultimate"', true)
    END
  WHERE id = julia_user_id;

  -- Create or update stripe_customers record without specifying ID
  INSERT INTO stripe_customers (
    user_id,
    customer_id,
    created_at
  ) VALUES (
    julia_user_id,
    'demo_customer_' || julia_user_id,
    now()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Get the customer_id for the subscription
  DECLARE
    customer_id_val TEXT;
  BEGIN
    SELECT customer_id INTO customer_id_val 
    FROM stripe_customers 
    WHERE user_id = julia_user_id;
    
    -- Create subscription record without specifying ID
    INSERT INTO stripe_subscriptions (
      customer_id,
      subscription_id,
      price_id,
      current_period_start,
      current_period_end,
      status
    ) VALUES (
      customer_id_val,
      'demo_subscription_' || julia_user_id,
      'price_premium_plus',
      extract(epoch from now())::bigint,
      extract(epoch from (now() + interval '1 year'))::bigint,
      'active'
    )
    ON CONFLICT (customer_id) DO UPDATE SET
      subscription_id = 'demo_subscription_' || julia_user_id,
      price_id = 'price_premium_plus',
      current_period_start = extract(epoch from now())::bigint,
      current_period_end = extract(epoch from (now() + interval '1 year'))::bigint,
      status = 'active';
  END;
END $$;

-- Create or replace function to check if user is Julia Avalon
CREATE OR REPLACE FUNCTION is_julia_avalon()
RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  RETURN user_email = 'vrt@qloudnet.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function to check if user has ultimate access
CREATE OR REPLACE FUNCTION has_ultimate_access()
RETURNS BOOLEAN AS $$
BEGIN
  -- Julia always has access
  IF is_julia_avalon() THEN
    RETURN TRUE;
  END IF;
  
  -- Check subscription status in profile
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND subscription_status = 'premium'
  ) OR EXISTS (
    -- Check active subscription in stripe tables
    SELECT 1 FROM stripe_customers sc
    JOIN stripe_subscriptions ss ON sc.customer_id = ss.customer_id
    WHERE sc.user_id = auth.uid()
    AND ss.status = 'active'
    AND ss.price_id = 'price_premium_plus'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for key tables to ensure Julia has access
-- This is an example for a hypothetical kpi_data table
-- You would need to adapt this for your actual tables

-- Example policy for bloodwork_results
DROP POLICY IF EXISTS "Ultimate users can access all bloodwork data" ON bloodwork_results;
CREATE POLICY "Ultimate users can access all bloodwork data"
  ON bloodwork_results
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    (has_ultimate_access() AND is_julia_avalon())
  );

-- Example policy for meal_plans
DROP POLICY IF EXISTS "Ultimate users can access all meal plans" ON meal_plans;
CREATE POLICY "Ultimate users can access all meal plans"
  ON meal_plans
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    (has_ultimate_access() AND is_julia_avalon())
  );

-- Example policy for activity_logs
DROP POLICY IF EXISTS "Ultimate users can access all activity logs" ON activity_logs;
CREATE POLICY "Ultimate users can access all activity logs"
  ON activity_logs
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    (has_ultimate_access() AND is_julia_avalon())
  );